function WampusWorld() {

	var _percept =  {
		stench: false,
		breeze: false,
		glitter: false,
		bump: false,
		scream: false
	};

	var _actions = {
		shoot: function() {
			_arrow = false;
		},

		forward: function() {
			switch (_orientation) {
				case 'e':
					if (_pos[0] < GRID_LENGTH - 1) _pos[0]++;
					break;
				case 'w':
					if (_pos[0] > 0) _pos[0]--;
					break;
				case 'n':
					if (_pos[1] < GRID_LENGTH - 1) _pos[1]++;
					break;
				case 's':
					if (_pos[1] > 0) _pos[1]--;
					break;
			}
		},

		turnLeft: function() {

		},

		turnRight: function() {

		},

		grab: function() {

		},

		climb: function() {

		},

		goToPosition: function(x, y, callback) {
			if (x >= 0 && x < GRID_LENGTH && y >= 0 && y < GRID_LENGTH) {
				callback(x, y);
				this.hunter.perceive(this.getPerceptAt(x, y));
			}
		}
	};


	return {
		pits: new Pits(),
		gold: new Gold(),
		wampus: new Wampus(),
		hunter: new Hunter(this),

		getPerceptAt: function() {

		},

		do: function(actor, action) {
			_actions[action].call
		}
	};
}