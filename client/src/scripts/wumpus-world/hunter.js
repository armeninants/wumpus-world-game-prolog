import jQuery from 'jquery/src/jquery.js'
import Grid from './grid.js'


/**
 * Hunter
 * @constructor
 * @returns {Hunter}
 */
export default function Hunter(gridSize) {
	this.grid = new Grid(gridSize);
	this.hasArrow = true;
	this.position = [0, 0];
	this.prevPosition = undefined;
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
		var o = this.orientation;
		return [ o[1], -o[0] ];
	},

	shoot: function() {
		this.hasArrow = false;
	},

	turnCW: function() {
		this.prevPosition = this.position;
		this.orientation = this.getCWOrientation();
	},

	turnCCW: function() {
		this.prevPosition = this.position;
		this.orientation = this.getCCWOrientation();
	},

	moveForward: function() {
		var newPos = this.grid.closestInGridTo( this.getForwardCell() );
		if (Grid.sameCells(this.position, newPos)) {
			return false;
		} else {
			this.prevPosition = this.position;
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