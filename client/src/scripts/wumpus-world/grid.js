import jQuery from 'jquery/src/jquery.js'


/**
 * Grid
 * @constructor
 * @returns {Grid}
 */	
export default function Grid(size) {
	this.size = size;
	this.cells = this.empty();
}

jQuery.extend(Grid.prototype, {
	empty: function(l) {
		var cells = [];

		for (var x = 0, l = this.size; x < l; x++) {
			var row = cells[x] = [];

			for (var y = 0; y < l; y++) {
				row.push(false);
			}
		}

		return cells;
	},

	getRandomCell: function(exceptStart) {
		var x = Math.floor(Math.random() * this.size);
		var y = Math.floor(Math.random() * this.size);

		if (exceptStart === true && x === 0 && y === 0) {
			return this.getRandomCell(exceptStart);
		} else {
			return [x, y];
		}
	},

	withinBounds: function(cell) {
		return cell[0] >= 0 && cell[0] < this.size && cell[1] >= 0 && cell[1] < this.size;
	},

	closestInGridTo: function(c) {
		return jQuery.isNumeric(c) 
			? Math.min(Math.max(0, c), this.size - 1)
			: [this.closestInGridTo(c[0]), this.closestInGridTo(c[1])];
	},

	at: function(cell) {
		this.cells = this.cells || this.empty();
		return this.cells[cell[0]][cell[1]];
	},

	set: function(cell, val) {
		this.cells[cell[0]][cell[1]] = val;
		return val;
	},

	existAdjacentTo: function(cell) {
		var found = false,
			x = cell[0], y = cell[1];

		[[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].forEach(function(cell) {
			if (!this.withinBounds(cell)) { return }
			found = found || this.at(cell);
		}, this);

		return found;
	},

	getAdjacents: function(cell, bool) {
		var cells = [],
			x = cell[0], y = cell[1];

		[[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].forEach(function(c) {
			if (this.withinBounds(c) && this.at(c) === bool) {
				cells.push(c);
			}
		}, this);

		return cells;
	},

	/**
	 * Call callback for every cell
	 * @param {function} callback - The callback function operating on a cell
	 */
	eachCell: function(callback) {
		this.cells = this.cells || this.empty();

		for (var x = 0, l = this.size; x < l; x++) {
			for (var y = 0; y < l; y++) {
				callback(x, y, this.cells[x][y]);
			}
		}
	},

	/**
	 *
	 */
	getCells: function(bool) {
		var cells = [];

		this.eachCell(function(x, y, val) {
			if (val === bool) {
				cells.push([x, y]);
			}
		});

		return cells;
	},

	/**
	 * Find the first available random position
	 */
	randomAvailableCell: function () {
		var cells = this.getCells(false);

		if (cells.length) {
			return cells[Math.floor(Math.random() * cells.length)];
		}
	},

	/**
	 * Returns a Grid object, with cells set true if they are accessible from the given cell
	 * @param {array} cell - A linear array of cell coordinates [x,y]
	 */
	accessGrid: function(cell) {
		var bool = this.at(cell);
		var g = new Grid(this.size);
		var stack = [cell];

		g.set(cell, true);
		while (stack.length > 0) {
			var c = stack.pop();
			var adjacent = this.getAdjacents(c, bool);
			for (var i = 0, l = adjacent.length; i < l; i++) {
				var a = adjacent[i];
				if (g.at(a) === false) {
					stack.push(a);
					g.set(a, true);
				}
			}
		}

		g.set([0,0], false);

		return g;
	},


});

Grid.sameCells = function(c1, c2) {
	return c1[0] === c2[0] && c1[1] === c2[1];
};