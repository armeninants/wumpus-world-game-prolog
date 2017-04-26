<template>
	<div id="app">
		<nav class="navbar navbar-inverse">
		  <div class="container">
		    <!-- Brand and toggle get grouped for better mobile display -->
		    <div class="navbar-header">
		      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#mainnav" aria-expanded="false">
		        <span class="sr-only">Toggle navigation</span>
		        <span class="icon-bar"></span>
		        <span class="icon-bar"></span>
		        <span class="icon-bar"></span>
		      </button>
		      <a class="navbar-brand" href="#">Wumpus World<sup><i>alpha</i></sup></a>
		    </div>

		    <!-- Collect the nav links, forms, and other content for toggling -->
		    <div class="collapse navbar-collapse" id="mainnav">
		      <ul class="nav navbar-nav navbar-right">
		        <li><a href="#" data-toggle="modal" data-target="#myModal">Rules</a></li>
		      </ul>
		    </div><!-- /.navbar-collapse -->
		  </div><!-- /.container-fluid -->
		</nav>


		<div class="container">
			<div class="row">
				<div class="col-lg-7 col-md-12">
					<canvas id="game-canvas"  v-bind:class="{active: gameActive}"></canvas>
				</div>
				<div class="col-lg-5 col-md-12">
					<div class="controls">
						<!-- <select class="selectpicker">
							<option>Novice</option>
							<option>Intermediate</option>
							<option>Advanced</option>
						</select> -->
						<button class="btn btn-success btn-lg" @click="startNewGame()">Start a <strong>N</strong>ew game</button>
						<span class="score">Score: {{score}}</span>
					</div>
					
					<!--div class="controls">
						<button class="btn btn-default btn-lg" @click="actuate('turnLeft')">Turn <strong>L</strong>eft</button>
						<button class="btn btn-default btn-lg" @click="actuate('forward')"><strong>F</strong>orward</button>
						<button class="btn btn-default btn-lg" @click="actuate('turnRight')">Turn <strong>R</strong>ight</button>
					</div>
					<div class="controls">
						<button class="btn btn-default btn-lg" @click="actuate('shoot')"><strong>S</strong>hoot</button>
						<button class="btn btn-default btn-lg" @click="actuate('grab')"><strong>G</strong>rab</button>
						<button class="btn btn-default btn-lg" @click="actuate('climb')"><strong>C</strong>limb</button>
					</div-->
					<div class="controls" v-show="gameActive">
						<h3>Agent's suggestion</h3>
						<button
							class="btn btn-primary btn-lg" 
							@click="actuateAgent()"
						>{{actionLabels[agentSuggestion]}}</button>
					</div>					
					<div id="notes"></div>
				</div>
			</div>
		</div>

		<!-- Modal -->
		<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h4 class="modal-title" id="myModalLabel">Rules of the Wumpus World</h4>
					</div>
					<div class="modal-body">

						<p>Wumpus World is a cave with a number of rooms, represented as a 4x4 square.</p>


						<p>
						The neighborhood of a node (room) consists of the four squares north, south, east, west of the given square.
						In a square the agent gets one (or many, or none) of these percepts:
						</p>

						<p><strong>Stench, Breeze, Glitter, Bump, Scream</strong></p>

						<p>
						<strong>Stench</strong> is perceived at a square iff the wumpus is at this square or in its neighborhood.
						<strong>Breeze</strong> is perceived at a square iff a pit is in the neighborhood of this square.
						<strong>Glitter</strong> is perceived at a square iff gold is in this square.
						<strong>Bump</strong> is perceived at a square iff the agent goes Forward into a wall.
						<strong>Scream</strong> is perceived at a square iff the wumpus is killed anywhere in the cave.
						</p>

						<p>
						An agent can do the following actions (one at a time):
						</p>
							
						<p><strong>Turn Right, Turn Left, Forward, Shoot, Grab, Climb</strong></p>

						<ul>
							<li>
								The agent can go Forward in the direction it is currently facing, or Turn Right, or Turn Left. Going Forward into a wall will generate a Bump percept.
							</li>
							<li>
								The agent has a single arrow that it can Shoot. It will go straight in the direction faced by the agent until it hits (and kills) the wumpus, or hits (and is absorbed by) a wall.
							</li>
							<li>
								The agent can Grab gold at the current square.
							</li>
							<li>
								The agent can Climb out of the cave if at the Start square.
							</li>
						</ul>

						<p>
						The Start square is (1,1) and initially the agent is facing east. The agent dies if it is in the same square as the wumpus.
						The objective of the game is to kill the wumpus, to pick up the gold, and to climb out with it.
						</p>

					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
						<!-- <button type="button" class="btn btn-primary">Save changes</button> -->
					</div>
				</div>
			</div>
		</div>


	</div>
</template>

<script>
import Hunter from './scripts/wumpus-world/hunter.js'
import Game from './scripts/wumpus-world/game.js'
import AgentWs from './scripts/agent-ws.js'
export default {
	name: 'app',
	data () {
		return {
			gameActive: false,
			score: 0,
			stepCount: 0,
			gridSize: 4,
			agentSuggestion: '',
			actionLabels: {
				forward: 'Forward',
				turnLeft: 'Turn Left',
				turnRight: 'Turn Right',
				shoot: 'Shoot',
				climb: 'Climb',
				grab: 'Grab'
			}
		}
	},

	mounted: function() {
		// this.gridSize = 4;
		var game = this.game = new Game(this.gridSize, 0.2);

		this._startNewGame = game.getStartNewGameControl();
		this._actuate      = game.getActuatorControl();

		game.registerExternalMethods({
			perceive:     this.perceive.bind(this),
			perceiveSame: this.perceiveSame.bind(this),
			won:          this.won.bind(this),
			lost:         this.lost.bind(this),
			gameStarted:  this.gameStarted.bind(this),
			updateScore:  this.updateScore.bind(this),
		});

		this.hunterSize = 47;
		this.strokeWidth = 2;
		this.canvasFontSize = 20;
		this.cellPadding = Math.ceil(this.strokeWidth/2);
		this.cellWidth = this.canvasFontSize*2 + this.hunterSize + this.strokeWidth;
		this.cellInnerWidth = this.cellWidth - this.strokeWidth;
		// this.canvasFontSize = (this.cellWidth - this.hunterSize) / 2;
		this.canvas = document.getElementById('game-canvas');
		this.ctx = this.canvas.getContext('2d');

		this.hunterImage = new Image();
		this.hunterImage.src = './static/archer.png';

		this.wumpusImage = new Image();
		this.wumpusImage.src = './static/wumpus.png';

		this.pitImage = new Image();
		this.pitImage.src = './static/pit.png';

		this.perceptsImage = new Image();
		this.perceptsImage.src = './static/percepts-sprite.png';

		this.render();


		// var that = this;
		// jQuery(document).keydown(function(e) {
		// 	switch (e.keyCode) {
		// 		case 38:
		// 			if (e.shiftKey) {
		// 				that.actuate('forward');
		// 			} else {
		// 				that.moveHandler('up');
		// 			}
		// 			break;
		// 		case 40:
		// 			that.moveHandler('down');
		// 			break;
		// 		case 37:
		// 			if (e.shiftKey) {
		// 				that.actuate('turnLeft');
		// 			} else {
		// 				that.moveHandler('left');
		// 			}
		// 			break;
		// 		case 39:
		// 			if (e.shiftKey) {
		// 				that.actuate('turnRight');
		// 			} else {
		// 				that.moveHandler('right');
		// 			}
		// 			break;
		// 		case 78:
		// 			that.startNewGame();
		// 			break;
		// 		case 83:
		// 			that.actuate('shoot');
		// 			break;
		// 		case 71:
		// 			that.actuate('grab');
		// 			break;
		// 		case 67:
		// 			that.actuate('climb');
		// 			break;
		// 		case 70:
		// 			that.actuate('forward');
		// 			break;
		// 		case 76:
		// 			that.actuate('turnLeft');
		// 			break;
		// 		case 82:
		// 			that.actuate('turnRight');
		// 			break;
		// 	}
		// });

		this.agentWs = new AgentWs( this.actionCallback.bind(this) );
		this.agentWs.connect();
	},

	methods: {
		startNewGame: function() {
			this.agentWs.restartAgent();
			this._startNewGame();
		},

		actuate: function(actuator) {
			if (!this.gameActive) { return; }

			switch (actuator) {
				case 'forward':
					this.hunter.moveForward();
					this.renderHunter();
					break;
				case 'turnLeft':
					this.hunter.turnCCW();
					this.renderHunter();
					break;
				case 'turnRight':
					this.hunter.turnCW();
					this.renderHunter();
					break;
				case 'shoot':
					this.hunter.shoot();
					break;
				case 'grab':
					// this.hunter.moveForward();
					break;
				case 'climb':
					// this.hunter.moveForward();
					break;
			}

			// this.agentWs.tellAction(actuator);
			this._actuate(actuator);
		},

		perceive: function(percept) {
			this.percepts.push(percept);
			this.updateCell(this.hunter.position, percept);
			this.stepCount++;

			if (percept.scream === true) {
				this.log(this.stepCount + '. You hear a hideous scream! You killed the Wumpus!');
			}
			if (percept.stench === true) {
				this.log(this.stepCount + '. Smelly!');
			} 
			if (percept.glitter === true) {
				this.log(this.stepCount + '. The place is glittering');
			}
			if (percept.breeze === true) {
				this.log(this.stepCount + '. Breezy!');
			}

			var perceptVec = [
					percept.stench,
					percept.breeze,
					percept.glitter,
					percept.scream,
					percept.bump
				];

			console.log(perceptVec);

			function tellAgent() {
				this.agentWs.runAgent(perceptVec);
			}
			setTimeout(tellAgent.bind(this), 100);
		},

		perceiveSame: function(partialPercept) {
			var percept = jQuery.extend({}, this.percepts[this.percepts.length - 1]);
			percept.scream = false;
			percept.bump = false;
			jQuery.extend(percept, partialPercept);
			this.perceive(percept);
		},

		won: function(percepts) {
			this.gameActive = false;
			this.log('You won!');
			this.revealState(percepts);
		},

		lost: function(percepts) {
			this.gameActive = false;
			this.log('You lost.');
			this.revealState(percepts);
		},

		revealState: function(percepts) {
			for (var x = 0, l = this.gridSize; x < l; x++) {
				for (var y = 0; y < l; y++) {
					this.updateCell([x,y], percepts[x][y]);
				}
			}
		},

		gameStarted: function() {
			this.percepts = [];
			this.hunter = new Hunter(this.gridSize);
			this.render();
			this.renderHunter();
			this.gameActive = true;
			this.score = 0;
			this.stepCount = 0;

			document.getElementById('notes').innerHTML = '';
			this.log('Game started.');
		},

		updateScore: function(score) {
			this.score = score;
			// this.log('Your score is ' + score);
		},

		render: function() {
			var size = this.gridSize;
			var width = this.cellWidth;
			var s = this.strokeWidth;
			var p = this.cellPadding;

			var ctx = this.canvas.getContext('2d');
			
			ctx.canvas.width  = size*width + p*2;
			ctx.canvas.height = size*width + p*2;

			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			for (var i = 0; i <= size; i++) {
				var c1 = i*width + p;
				var c2 = size*width + p;
				ctx.moveTo(c1, p);
				ctx.lineTo(c1, c2);
				ctx.stroke();
				ctx.moveTo(p, c1);
				ctx.lineTo(c2, c1);
				ctx.stroke();	
			}

			ctx.font = this.canvasFontSize + 'px Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.globalCompositeOperation = 'source-over';

		},

		log: function(msg) {
			if (!msg) { return }
			var el = document.getElementById('notes');
			el.innerHTML = '<div class="line">' + msg + '</div>' + el.innerHTML;
		},

		updateState: function() {

		},

		getCellCoord: function(pos) {
			return [this.cellWidth * pos[0] + this.strokeWidth,
					this.cellWidth * (this.gridSize - pos[1] - 1) + this.strokeWidth];
		},

		updateCell: function(pos, percept) {
			var ctx = this.ctx;
			var w = this.cellInnerWidth;
			var c = this.getCellCoord(pos);
			var fontSize = this.canvasFontSize;
			var hunterSize = this.hunterSize;
			var hunterPadding = this.canvasFontSize;

			if (percept.stench) {
				// ctx.fillStyle = '#a3ae7e';
				// ctx.fillText('S', c[0] + w - fontSize/2, c[1] + fontSize/2);
				ctx.drawImage(this.perceptsImage, 0, 40,
					fontSize,
					fontSize,
					c[0] + w - fontSize,
					c[1],
					fontSize,
					fontSize
				);
	
			}

			if (percept.glitter) {
				// ctx.fillStyle = '#ffd700';
				// ctx.fillText('G', c[0] + w - fontSize/2, c[1] + w - fontSize/2);
				ctx.drawImage(this.perceptsImage, 0, 20,
					fontSize,
					fontSize,
					c[0] + w - fontSize,
					c[1] + w - fontSize,
					fontSize,
					fontSize
				);

			} else {
				ctx.clearRect(c[0] + w - fontSize, c[1] + w - fontSize, fontSize, fontSize);
			}

			if (percept.breeze) {
				// ctx.fillStyle = '#33ccff';
				// ctx.fillText('B', c[0] + w - fontSize/2, c[1] + w/2);
				ctx.clearRect(c[0] + w - fontSize, c[1] + w/2 - fontSize/2, fontSize, fontSize);
				ctx.drawImage(this.perceptsImage, 0, 0,
					fontSize-1,
					fontSize-1,
					c[0] + w - fontSize,
					c[1] + w/2 - fontSize/2,
					fontSize,
					fontSize
				);				
			}

			if (percept.wumpus) {
				// ctx.fillStyle = '#830303';
				// ctx.fillText('W', c[0] + fontSize/2, c[1] + w - fontSize/2);
				ctx.globalCompositeOperation = 'destination-over';
				ctx.drawImage(this.wumpusImage, 0, 0,
					w,
					w,
					c[0],
					c[1],
					w,
					w
				);
			}

			if (percept.pit) {
				// ctx.fillStyle = '#000080';
				// ctx.fillText('P', c[0] + fontSize/2, c[1] + fontSize/2);
				ctx.globalCompositeOperation = 'destination-over';
				ctx.drawImage(this.pitImage, 0, 0,
					hunterSize,
					hunterSize,
					c[0]+hunterPadding,
					c[1]+hunterPadding,
					hunterSize,
					hunterSize
				);
			}

		},

		renderHunter: function() {
			var ctx = this.ctx;
			var hunterSize = this.hunterSize;
			var hunterPadding = this.canvasFontSize;
			
			var prevPos = this.hunter.prevPosition;
			if (prevPos) {
				var cPrev = this.getCellCoord(prevPos);
				ctx.clearRect(cPrev[0]+hunterPadding, cPrev[1]+hunterPadding, hunterSize, hunterSize);
			}

			var pos = this.hunter.position;
			var orient = this.hunter.orientation;
			var c = this.getCellCoord(pos);
			switch (orient[0]*10 + orient[1]) {
				case 1:
					var frameOffset = 0;
					break;
				case -10:
					var frameOffset = 1;
					break;
				case -1:
					var frameOffset = 2;
					break;
				case 10:
					var frameOffset = 3;
					break;

			}

			var img = this.hunterImage;
			function drawHunter() {
				ctx.drawImage(img, 0, hunterSize*frameOffset,
				    hunterSize,
				    hunterSize,
				    c[0]+hunterPadding,
				    c[1]+hunterPadding,
				    hunterSize,
				    hunterSize
				);
			}

			// TODO: not a robust way
			if (img.complete) {
				drawHunter();
			} else {
				img.onload = drawHunter;
			}

		},

		moveHandler: function(dir) {
			var o = this.hunter.orientation;

			switch (dir) {
				case 'up':
					if (o[1] === 1) {
						this.actuate('forward');
					} else if (o[1] === -1) {
						this.actuate('turnLeft');
						this.actuate('turnLeft');
						this.actuate('forward');
					} else if (o[0] === 1) {
						this.actuate('turnLeft');
						this.actuate('forward');
					} else {
						this.actuate('turnRight');
						this.actuate('forward');
					}
					break;
				case 'down':
					if (o[1] === 1) {
						this.actuate('turnLeft');
						this.actuate('turnLeft');
						this.actuate('forward');
					} else if (o[1] === -1) {
						this.actuate('forward');
					} else if (o[0] === 1) {
						this.actuate('turnRight');
						this.actuate('forward');
					} else {
						this.actuate('turnLeft');
						this.actuate('forward');
					}
					break;
				case 'left':
					if (o[1] === 1) {
						this.actuate('turnLeft');
						this.actuate('forward');
					} else if (o[1] === -1) {
						this.actuate('turnRight');
						this.actuate('forward');
					} else if (o[0] === 1) {
						this.actuate('turnLeft');
						this.actuate('turnLeft');
						this.actuate('forward');
					} else {
						this.actuate('forward');
					}
					break;
				case 'right':
					if (o[1] === 1) {
						this.actuate('turnRight');
						this.actuate('forward');
					} else if (o[1] === -1) {
						this.actuate('turnLeft');
						this.actuate('forward');
					} else if (o[0] === 1) {
						this.actuate('forward');
					} else {
						this.actuate('turnLeft');
						this.actuate('turnLeft');
						this.actuate('forward');
					}
					break;

			}		
		},

		actuateAgent() {
			this.actuate(this.agentSuggestion);
		},

		actionCallback(action) {
			this.agentSuggestion = action;
			// console.log(action);
		}
	}
}
</script>

<style lang="scss">

body {
	background-color: #000;
	color: #ccc;
}

h1 {
	color: #ccc;
}

.score {
	margin-left: 1em;
	font-size: 18px;
}

#app {
	text-align: center;
}

.cell {
	width: 190px;
	height: 190px;
	background-color: green;
}

.upper-controls {
	margin: 10px 0;
}

#game-canvas {
	background: azure;
}

.controls {
	margin: 20px 0;
	text-align: center;
}

#notes {
	font-family: 'Courier New';
	font-size: 1.25em;
	text-align: left;
	height: 200px;
	width: 500px;
	display: inline-block;
	background-color: black;
	color: #ccc;

	overflow-x: hidden;
	overflow-y: scroll;


	&::-webkit-scrollbar-track {
		background-color: #000;
	}

	&::-webkit-scrollbar {
		width: 6px;
		background-color: #000;
	}

	&::-webkit-scrollbar-thumb {
		background-color: #ccc;
	}

	// .line:before {
	// 	font-family: FontAwesome;
	// 	content: "\f120";
	// 	margin-right: 10px;
	// }
}

#game-canvas {
	opacity: 0.7;

	&.active {
		opacity: 1;
	}
}

.modal-header {
	color: #333;
}

.modal-body {
	text-align: left;
	color: #333;
}


</style>
