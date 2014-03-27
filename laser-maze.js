// Moved the end function to the bottom.


/* After refactoring the end function, three new methods are added to Room class.roomSetup(),
 * distanceComputation() and getTypeOfCells().First Method, roomSetup() computes the features of the room like 
 * total number of cells, cells per row and laser position. Second method, distanceComputation() is formed 
 * after refactoring the previous end function. All the computation is done inside this function and user 
 * just needs to call it with an instance of a room class. Third function is getTypeOfCells(). This function
 * returns the object for an encountered symbol in the room from the dictionary of symbols.
 */

// Room constructor
function Room(input) {
	this._cellArray = input.split("");
	this._cellArray[this._cellArray.length] = '\n'; 
	this._rowsInTheRoom = 0;
	this._totalNumberOfCellsInRoom = 0;
	this._cellsPerRow = 0;
	this.room = [];
/*
 * Converted the switch case into a dictionary of key-value pair. Function getTypeOfCells returns the object
 * for the corresponding character in the room array. To solve the problem I previously 
 * went on with the switch case. I accept the fact that as the types of symbol increase 
 * in the room, the switch case would have become much more bulkier to read. 
 * Coming from a C and Java background using switch case was natural for me to solve the problem.
 * But I like using dictionary instead. Makes code easier to maintain. 
 */
	this.roomElements = {
			
		'v' : 	new Prism('v'),
		'^' : 	new Prism('^'),
		'<' :	new Prism('<'),
		'>' :   new Prism('>'),
		'/'	:	new Mirror('/'),
		'\\':	new Mirror('\\'),
		'O'	:	new Mirror('O'),
		'@' : 	new Start('@'),
		'-'	:	new Cell('-')
	};
}


/*I have separated the giant if condition here. So, now computeDistance contains 
 *  three functions roomSetup , newRoom and isNextCellAWall. 
 * 
 */
Room.prototype.isNextCellAWall = function (light) {
	
	if (light.getXLocation() < 0 // Condition when light strikes the wall
			|| light.getXLocation() >= this._rowsInTheRoom
			|| light.getYLocation() < 0
			|| light.getYLocation() >= this._cellsPerRow) {

		return true;
	}else{
		
		return false;
	}
	
};
// Following function contains distance computation logic.
Room.prototype.computeDistance = function() {
	
	var roomElements = this.roomSetup();
	this._rowsInTheRoom = roomElements.rowsInRoom;
	this._totalNumberOfCellsInRoom = roomElements.cellsInTheRoom;
	this._cellsPerRow = this._totalNumberOfCellsInRoom/ this._rowsInTheRoom;

	var room = this.newRoom(this._rowsInTheRoom);	
	
	var currentLocationX = roomElements.laserStartX; // stores position of laser
	var currentLocationY = roomElements.laserStartY; 
	var distance = 1; // As cell containing the laser is counted in the distance.
	
	var light = new Laser();
	light.setLocation(currentLocationX, currentLocationY); 
	
	while (1) {
		room[currentLocationX][currentLocationY].handleLight(light, light
				.getXLocation(), light.getYLocation());
		laserFound = 1;
		if(this.isNextCellAWall(light)){
			
			break;
		}
		currentLocationX = light.getXLocation(); 
		currentLocationY = light.getYLocation(); 
		distance++; 
	}

	return distance; // returns the computed distance
};

/* In the following function I am traversing the single dimensional input array and calculating the size  
 * and breadth of the room in terms of number of cells. This function also returns the position of the 
 * laser. In my previous code I had kept these two logics separate as they did not make sense together to me. 
 * But keeping in mind the efficiency, combining of the code seems sensible. Otherwise, a large room would 
 * be traversed twice for completion of both the operations.
 */


// Calculates the size and breadth of the room as well as returns the position of laser.

/*
 * Rick, I was not sure about which inner block you were talking about. There are two here
 *  if-else and the inner-most if. Another reason,
 *  there are too many dependencies here inside the while loop. If you still want me to change it,  
 * please let me know.
 */

Room.prototype.roomSetup = function() {
	
	var cellCount = 0;
	var rows = 0;
	var cellsWithoutSpace = 0;
	var startLocation_x;
	var startLocation_y;
	var countInOneRow = 0;
	var isLaserFound = 0;
	while (cellCount < this._cellArray.length) {

		//calculateRoomSpecs(this.cellArray,cellCount);
		if (this._cellArray[cellCount] === '\n') {
			rows++;
			countInOneRow = 0;
		} else {
			if(this._cellArray[cellCount] === '@'){
				startLocation_x = rows;
				startLocation_y = countInOneRow; 
				isLaserFound = 1;
			}
			countInOneRow++;
			cellsWithoutSpace++;
		}
		cellCount++;
	}
	if(isLaserFound === 0) {
		
		console.log("laser is not there in the room");
		process.exit();
	}
	return {
		laserStartX : startLocation_x,
		laserStartY : startLocation_y,
		rowsInRoom : rows,
		cellsInTheRoom : cellsWithoutSpace
	};
};

// This method returns value after matching the key in the dictionary of symbols mentioned above.
Room.prototype.getTypeOfCells = function(cellChar ) {
	
	if(this.roomElements[cellChar]) {
		return this.roomElements[cellChar]; 		
	}else{
		console.log("Invalid Input");
		process.exit();
	}
	
};

Room.prototype.makeCellsToObjects = function (cellArray , index1 , index2 , index3) {
	
	while (cellArray[index2] != '\n') {
		if (index1 != cellArray.length) {		
			this.room[index3][index2] = this.getTypeOfCells(cellArray[index1]);
			index2++;
			index1++;
		}
	}
	return index1;
};
	

/*
 * I have split the methods into two. There is a new method that converts char cells
 * into objects i.e. makeCellsToObjects()
 */
// This method creates a two dimensional array of objects found in the room 
Room.prototype.newRoom = function(rowsInRoom) {

	var index1 = 0;
	var index2 = 0;

	for ( var index3 = 0; index3 < rowsInRoom; index3++) {

		this.room[index3] = [];
		index1 = this.makeCellsToObjects(this._cellArray , index1, index2, index3);
		index2 = 0;
		index1++;
	}
	return this.room; // returns the 2 Dimensional array
};


// Laser class contains all the location and direction of the light and methods
// to manipulate them.
function Laser() {

	this._xLocation = 0; // Current Location of light
	this._yLocation = 0;
	this._xDirection = 0; // Current direction of light
	this._yDirection = 0;
	this._track1; // array keeps the cell location and direction that it's
	// being traversed
	this._arrayCount = 0;
	var Set = require('Set/set.js');
	this._track = new Set();
}

Laser.prototype.trackCells = function (row, col) {	
return 	""+row + this._xDirection + ""+col + this._yDirection+""+this._xDirection+""+this._yDirection;
};
	
Laser.prototype.registerInTrack = function(row , col) {
	
	var currentNode = this.trackCells(row , col);
	if(this._track.contains(currentNode)){
		
		return false;
	}else{
		this._track.add(currentNode);
		return true;
	}
};
/* Here I have separated the logic of tracking if the cell and setting the location of the  
 *  light in the room. 
 */

/*
 * I have used a set library to track the visited cells. If the set contains the cell 
 * and is again being traversed in the same direction that implies, it is an infinite loop.
 * This should increase the performance of the program. 
 */
// Function checks if cell has been traversed before in same direction
Laser.prototype.enterInTrack = function(size, row, col) {
		
	var isNewEntry = this.registerInTrack(row, col);

	return isNewEntry;
};
// Class Method : SetLocation for Class: Laser
Laser.prototype.setLocation = function(row, col) {
	
	var isNewEntry = false;
	isNewEntry = this.enterInTrack(this._arrayCount, row, col);

	if(isNewEntry){
	this._xLocation = row + this._xDirection;
	this._yLocation = col + this._yDirection;
	}else{
		
		console.log("-1");
		process.exit();
	}
};

// Class Method : getXLocation for Class: Laser
Laser.prototype.getXLocation = function() {

	return this._xLocation;
};

// Class Method : getYLocation for Class: Laser
Laser.prototype.getYLocation = function() {

	return this._yLocation;
};

// Class Method : SetDirection for Class: Laser
Laser.prototype.setDirection = function(xAxis, yAxis) {

	this._xDirection = xAxis;
	this._yDirection = yAxis;
};

// Class Method : getXDirection for Class: Laser
Laser.prototype.getXDirection = function() {

	return this._xDirection;
};

// Class Method : getYDirection for Class: Laser
Laser.prototype.getYDirection = function() {

	return this._yDirection;
};

// Generic Cell class for symbol '- '
function Cell(cell_char) {

	this.char = cell_char;

}

// Class Method : handleLight for Class : Cell
Cell.prototype.handleLight = function(light, i, j) {

	light.setLocation(i, j);

};

// Start class for symbol '@'
function Start(cell_char) {

	Cell.call(this, cell_char); // calls the parent class constructor
}

Start.prototype = Object.create(Cell.prototype); // Inherits the generic cell
// class
Start.prototype.constructor = Start; // points back to the constructor of
// start class

// Class Method : handleLight override by Start '@' symbol
Start.prototype.handleLight = function(light, i, j) {

	if (laserFound === 0) {

		light.setDirection(0, 1);
		light.setLocation(i, j);

	}

	if (laserFound === 1) {

		light.setLocation(i, j);

	}
};

// Prism class for symbol '<' , '>' , '^' , 'v'
function Prism(cell_char) {

	Cell.call(this, cell_char); // calls the parent class constructor
	
	this.cell = {
			
		'v' : {xD: 1 , yD: 0},
		'^'	: {xD:-1 , yD: 0},
		'<'	: {xD: 0 , yD:-1},
		'>'	: {xD: 0 , yD: 1}
			
	};
}

Prism.prototype = Object.create(Cell.prototype); // Inherits the generic cell
// class

Prism.prototype.constructor = Prism; // points back to the constructor of
// prism class

/*I have used a dictionary data structure to associate the prism char to their
 *  corresponding x and y direction. 
 */
// Overrides the handlelight method of cell class
Prism.prototype.handleLight = function(light, i, j) {

	var direction = this.cell[this.char];
	light.setDirection(direction.xD, direction.yD);
	light.setLocation(i,j);
};

// Mirror Class for symbol '/', '\' , 'O'
function Mirror(cell_char)  {

	Cell.call(this, cell_char); // calls the parent class constructor
}

Mirror.prototype = Object.create(Cell.prototype); // Inherits the generic cell
// class

Mirror.prototype.constructor = Mirror; // points back to the constructor of
// mirror class

// Overrides the handlelight function from cell class
Mirror.prototype.handleLight = function(light, i, j) {

	var xAxis = light.getXDirection();
	var yAxis = light.getYDirection();
	if (this.char === '\\') {

		var tmp = xAxis;
		xAxis = yAxis;
		yAxis = tmp;

	} else if (this.char === '/') {

		var tmp = xAxis;
		xAxis = yAxis;
		yAxis = tmp;

		xAxis = -xAxis;
		yAxis = -yAxis;
	} else if (this.char === 'O') {

		xAxis = -xAxis;
		yAxis = -yAxis;

	}
	light.setDirection(xAxis, yAxis);
	light.setLocation(i, j);

};

process.stdin.resume();
process.stdin.setEncoding("ascii");
var input = "";
process.stdin.on("data", function(chunk) {
	input += chunk;
});

var laserFound = 0; // Global variable, that is 1 once laser is found in the
// array.
/*
 * In the end function,user just needs to create an instance of the room and pass the input string to 
 * form a room. Then, call the computeDistance method to compute distance for the light to travel before 
 * striking the wall. 
 */
process.stdin.on("end", function() {
	var RoomInstance = new Room(input);
	var distance = RoomInstance.computeDistance();
	console.log(distance); // prints the distance traveled.
		
});
