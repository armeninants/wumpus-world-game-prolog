import jQuery from 'jquery/src/jquery.js'
import Grid from './grid.js'
import Hunter from './hunter.js'


/**
 * Pits
 * @constructor
 * @returns {Pits}
 */	
function Pits(gridSize, pitProb) {
	Grid.call(this, gridSize);
	this.pitProb = pitProb;
}

Pits.prototype = Object.create(Grid.prototype);
Pits.prototype.constructor = Pits;

jQuery.extend(Pits.prototype, {
	generate: function() {

		var b = true;
		while (b) {
			for (var x = 0, l = this.size; x < l; x++) {
				for (var y = 0; y < l; y++) {
					this.cells[x][y] = (Math.random() < this.pitProb);
				}
			}
			
			this.cells[0][0] = false;

			if (this.accessGrid([0,0]).getCells(true).length >= this.size) {
				b = false;
			}
		}

		return this;
	},

	fromState: function(state) {
		this.cells = state;
	},		
});


/**
 * Gold
 * @constructor
 * @returns {Gold}
 */	
function Gold(gridSize) {
	this.position = [1,0];
	this.isPicked = false;
}

jQuery.extend(Gold.prototype, {
	pick: function() {
		this.isPicked = true;
	},

	at: function(cell) {
		return !this.isPicked && Grid.sameCells(cell, this.position);
	},

	fromState: function(state) {
		this.position = state.position;
		this.isPicked = state.isPicked;
	},
});

/**
 * Wumpus
 * @constructor
 * @returns {Wumpus}
 */	
function Wumpus(gridSize) {
	this.position = [1,0];
	this.isAlive = true;
}

jQuery.extend(Wumpus.prototype, {
	kill: function() {
		this.isAlive = false;
	},

	at: function(cell) {
		return this.isAlive && Grid.sameCells(cell, this.position);
	},

	isAdjacentTo: function(cell) {
		return (Math.abs(cell[0] - this.position[0]) + Math.abs(cell[1] - this.position[1]) <= 1)
	},

	fromState: function(state) {
		this.position = state.position;
		this.isAlive = state.isAlive;
	},
});


/**
 * Environment
 * @constructor
 * @returns {Environment}
 */	
export default function Environment(gridSize, pitProb) {

	this.grid = new Grid(gridSize);
	this.pitProb = pitProb;

	this.pits = new Pits(this.grid.size, this.pitProb);
	this.wumpus = new Wumpus(this.grid.size);
	this.gold = new Gold(this.grid.size);
	this.hunter = new Hunter(this.grid.size);
}

jQuery.extend(Environment.prototype, {
	generate: function() {
		this.pits.generate();

		var cells = this.pits.accessGrid([0,0]).getCells(true);

		this.wumpus.position = cells[Math.floor(Math.random() * cells.length)];
		this.gold.position = cells[Math.floor(Math.random() * cells.length)];

		return this;
	},

	getPerceptAt: function(cell) {
		return {
			bump: false,
			stench: this.wumpus.isAdjacentTo(cell) && !this.pits.at(cell),
			breeze: this.pits.existAdjacentTo(cell) && !this.wumpus.at(cell) && !this.pits.at(cell),
			glitter: this.gold.at(cell),
			scream: false
		}
	},

	getPercepts: function() {
		var percepts = [];

		for (var x = 0, l = this.grid.size; x < l; x++) {
			var row = percepts[x] = [];
			for (var y = 0; y < l; y++) {
				var cell = [x,y];
				var percept = this.getPerceptAt(cell);
				percept.wumpus = this.wumpus.at(cell);
				percept.pit = this.pits.at(cell);
				row.push(percept);
			}
		}

		return percepts;
	},

	getState: function() {
		return jQuery.extend(true, {}, {
			pits: this.pits.cells,
			wumpus: {
				position: this.wumpus.position,
				isAlive: this.wumpus.isAlive
			},
			gold: {
				position: this.gold.position,
				isPicked: this.gold.isPicked
			},
			hunter: {
				hasArrow: this.hunter.hasArrow,
				position: this.hunter.position,
				orientation: this.hunter.orientation
			}
		});
	},

	fromState: function(state) {
		this.pits.fromState(state.pits);
		this.wumpus.fromState(state.wumpus);
		this.gold.fromState(state.gold);
		this.hunter.fromState(state.hunter);
	},
});