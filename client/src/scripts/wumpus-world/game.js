import jQuery from 'jquery/src/jquery.js' 
import Grid from './grid.js'
import Environment from './environment.js'


var GOLD_PICKED_SCORE = 1000;
var STEP_SCORE = -1;
var WUMPUS_KILL_SCORE = 100;

var GRID_SIZE = 4;
var PIT_PROBABILITY = 0.2;

/**
 * Game
 * @constructor
 * @returns {Game}
 */
export default function Game(gridSize, pitProb) {
	this.gridSize = gridSize || GRID_SIZE;
	this.pitProb = pitProb || PIT_PROBABILITY;
	this.actuators = Object.keys(Actuators);
	this.inProgress = false;
	this.externalMethods = {};
}

jQuery.extend(Game.prototype, {
	startNewGame: function() {
		this.env = new Environment(this.gridSize, this.pitProb).generate();
		this.score = 0;
		this.inProgress = true;

		this.cast('gameStarted');
		var percept = this.env.getPerceptAt(this.env.hunter.position);
		this.cast('perceive', percept);
	},

	addToScore: function(score) {
		this.score = this.score + score;
		this.cast('updateScore', this.score);
	},

	isLost: function() {
		var h = this.env.hunter.position;
		return this.env.wumpus.at(h) || this.env.pits.at(h);
	},

	gameOver: function(status) {
		this.inProgress = false;
		var percepts = this.env.getPercepts();

		if (status === 'won') {
			this.cast('won', percepts);
		} else {
			this.cast('lost', percepts);
		}
	},

	actuate: function(actuator) {
		if (!this.inProgress) { return }

		for (var i = 0, l = this.actuators.length; i < l; i++) {
			if (actuator === this.actuators[i]) {
				this[actuator]();
				return;
			}
		}
	},

	getActuatorControl: function() {
		return this.actuate.bind(this)
	},

	getStartNewGameControl: function() {
		return this.startNewGame.bind(this)
	},

    /**
	 * Invokes an external method (e.g. perceive, perceiveSame, won, lost, gameStarted, updateScore)
	 * @param {string} method - The method name.
	 */
	cast: function(method) {
		if (this.externalMethods.hasOwnProperty(method)) {
			var externalMethod = this.externalMethods[method];
			return Function.call.apply(externalMethod, arguments);
		}
	},

	registerExternalMethods: function(obj) {
		for (var k in obj) { this.externalMethods[k] = obj[k] }
	},

});

var Actuators = {
	shoot: function() {
		if (!this.env.hunter.hasArrow) {
			this.cast('perceiveSame');
		} else {
			this.env.hunter.shoot();

			if (this.env.hunter.lookingAt(this.env.wumpus.position)) {
				this.env.wumpus.kill();
				this.addToScore(WUMPUS_KILL_SCORE);
				this.cast('perceiveSame', {scream: true});
			} else {
				this.cast('perceiveSame');
			}
		}
	},

	forward: function() {
		if (this.env.hunter.moveForward()) {
			var h = this.env.hunter.position;

			if (this.isLost()) {
				this.gameOver('lost');
			} else {
				this.addToScore(STEP_SCORE);
				var percept = this.env.getPerceptAt(h);
				this.cast('perceive', percept);
			}
		} else  {
			this.cast('perceiveSame', {bump: true});
		}
	},

	turnLeft: function() {
		this.env.hunter.turnCCW();
		this.cast('perceiveSame');
	},

	turnRight: function() {
		this.env.hunter.turnCW();
		this.cast('perceiveSame');
	},

	grab: function() {
		if (!this.env.gold.isPicked && Grid.sameCells(this.env.hunter.position, this.env.gold.position)) {
			this.env.gold.pick();
			this.addToScore(GOLD_PICKED_SCORE);
			this.cast('perceiveSame', {glitter: false});
		} else {
			this.cast('perceiveSame');
		}
	},

	climb: function() {
		if (Grid.sameCells(this.env.hunter.position, [0, 0]) && this.env.gold.isPicked) {
			this.gameOver('won');
		} else {
			this.cast('perceiveSame');
		}
	},
};

jQuery.extend(Game.prototype, Actuators);