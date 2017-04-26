var WampusWorld = WampusWorld || {};

/**
 * WampusWorld.Grid
 */
WampusWorld.Grid = (function(jQuery) {

	/**
	 * Grid
	 * @constructor
	 * @returns {Grid}
	 */	
	function Grid(size) {
		this.size = size;
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

			if (exceptStart === true && x == 0 && y == 0) {
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

		existAdjacentTo: function(cell) {
			var found = false,
				x = cell[0], y = cell[1];

			[[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].forEach(function(cell) {
				if (!this.withinBounds(cell)) { return }
				found = found || this.at(cell);
			}, this);

			return found;
		},


	});

	Grid.sameCells = function(c1, c2) {
		return c1[0] === c2[0] && c1[1] === c2[1];
	};

	return Grid;

})(jQuery);