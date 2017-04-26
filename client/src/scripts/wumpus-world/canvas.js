import jQuery from 'jquery/src/jquery.js'


/**
 * WumpusWorldCanvas
 * @constructor
 * @returns {WumpusWorldCanvas}
 */	
export default function WumpusWorldCanvas(size) {
	this.size = size;
}

jQuery.extend(WumpusWorldCanvas.prototype, {
	empty: function(l) {

	},
});