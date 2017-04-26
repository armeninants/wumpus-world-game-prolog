var WampusWorld = WampusWorld || {};

/**
 * WampusWorld.Environment
 */
WampusWorld.Environment = (function(jQuery, Grid) {

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
		generate: function(l) {
			var cells = this.cells = [];

			for (var x = 0, l = this.size; x < l; x++) {
				var row = cells[x] = [];

				for (var y = 0; y < l; y++) {
					row.push(Math.random() < this.pitProb);
				}
			}
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
		this.position = new Grid(gridSize).getRandomCell(true);
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
	 * Wampus
	 * @constructor
	 * @returns {Wampus}
	 */	
	function Wampus(gridSize) {
		this.position = new Grid(gridSize).getRandomCell(true);
		this.isAlive = true;
	}

	jQuery.extend(Wampus.prototype, {
		kill: function() {
			this.isAlive = false;
		},

		at: function(cell) {
			return this.isAlive && Grid.sameCells(cell, this.position);
		},

		isAdjacentTo: function(cell) {
			return this.isAlive && (Math.abs(cell[0] - this.position[0]) + Math.abs(cell[1] - this.position[1]) === 1)
		},

		fromState: function(state) {
			this.position = state.position;
			this.isAlive = state.isAlive;
		},
	});


	/**
	 * Hunter
	 * @constructor
	 * @returns {Hunter}
	 */
	function Hunter(gridSize) {
		this.grid = new Grid(gridSize);
		this.hasArrow = true;
		this.position = [0, 0];
		this.orientation = [1, 0];
	}

	jQuery.extend(Hunter.prototype, {
		getForwardCell: function() {
			var p = this.position;
			var o = this.orientation;

			return [ p[0] + o[0], p[1] + o[1] ];
		},

		getCCWOrientation: function() {
			var o = this.orientation;
			return [ -o[1], o[0] ];
		},

		getCWOrientation: function() {
			return [ o[1], -o[0] ];
		},

		shoot: function() {
			this.hasArrow = false;
		},

		turnCW: function() {
			this.orientation = this.getCWOrientation();
		},

		turnCCW: function() {
			this.orientation = this.getCCWOrientation();
		},

		moveForward: function() {
			var newPos = this.grid.closestInGridTo( this.getForwardCell() );
			if (Grid.sameCells(this.position, newPos)) {
				return false;
			} else {
				this.position = newPos;
				return true;
			}
		},

		fromState: function(state) {
			this.hasArrow = state.hasArrow;
			this.position = state.position;
			this.orientation = state.orientation;
		},

		lookingAt: function(w) {
			var h = this.position;
			var f = this.getForwardCell();

			return ((w[0] - f[0] === 0 && h[0] - f[0] === 0 && (w[1] - f[1]) * (h[1] - f[1]) <= 0)
			     || (w[1] - f[1] === 0 && h[1] - f[1] === 0 && (w[0] - f[0]) * (h[0] - f[0]) <= 0));
		}
	});

	/**
	 * Environment
	 * @constructor
	 * @returns {Environment}
	 */	
	function Environment(gridSize, pitProb) {

		this.grid = new Grid(gridSize);
		this.pitProb = pitProb;

		this.pits = new Pits(this.grid.size, this.pitProb).generate();
		this.wampus = new Wampus(this.grid.size);
		this.gold = new Gold(this.grid.size);
		this.hunter = new Hunter(this.grid.size);
	}

	jQuery.extend(Environment.prototype, {
		getPerceptAt: function(cell) {
			return {
				bump: false,
				stench: this.wampus.isAdjacentTo(cell),
				breeze: this.pits.existAdjacentTo(cell),
				glitter: this.gold.at(cell),
				scream: false
			}
		},

		getState: function() {
			return jQuery.extend(true, {}, {
				pits: this.pits.cells,
				wampus: {
					position: this.wampus.position,
					isAlive: this.wampus.isAlive
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
			this.wampus.fromState(state.wampus);
			this.gold.fromState(state.gold);
			this.hunter.fromState(state.hunter);
		},
	});

	return Environment;

})(jQuery, WampusWorld.Grid);