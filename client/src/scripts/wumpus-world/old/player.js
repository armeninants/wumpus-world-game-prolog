var WampusWorld = WampusWorld || {};

/**
 * WampusWorld.PlayerInterface
 */
WampusWorld.PlayerInterface = (function(jQuery) {

	/**
	 * PlayerInterface
	 * @constructor
	 * @returns {PlayerInterface}
	 */
	function PlayerInterface(startCallback, actCallback, actuators) {
		this.percepts = [];
	}

	jQuery.extend(PlayerInterface.prototype, {
		perceive: function(percept) {
			this.percepts.push(percept);
		},

		perceiveSame: function(partialPercept) {
			var percept = jQuery.extend({}, this.percept[this.percepts.length - 1], partialPercept);
			this.perceive(percept);
		},

		won: function(state) {

		},

		lost: function(state) {

		},

		gameStarted: function() {

		},

		updateScore: function(score) {

		},

		play: function(game) {
			game.registerPlayer({
				registerGame: 	this.registerGame.bind(this),
				perceive: 		this.perceive.bind(this),
				perceiveSame: 	this.perceiveSame.bind(this),
				// won: 			this.won.bind(this),
				// lost: 			this.lost.bind(this),
				// gameStarted: 	this.gameStarted.bind(this),
				// updateScore: 	this.updateScore.bind(this),
			});
		},

		registerGame: function(c) {
			this.start = c.start;
			this.do = c.do;
			this.actuators = c.actuators;
		},
	});

	return PlayerInterface;

})(jQuery);