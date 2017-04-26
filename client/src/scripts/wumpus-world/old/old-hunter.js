function Hunter(env) {
	var _pos = [0, 0],
		_arrow = true,
		_orientation = 'e',
		_percepts = [];

	console.log(env);

	var actuators = {
		forward: function() {
			var xNew = _pos[0],
				yNew = _pos[1];

			switch (_orientation) {
				case 'e':
					xNew++;
					break;
				case 'w':
					xNew--;
					break;
				case 'n':
					yNew++;
					break;
				case 's':
					yNew--;
					break;
			}

			if (xNew >= 0 && xNew < GRID_LENGTH && yNew >= 0 && yNew < GRID_LENGTH) {
				_pos[0] = xNew;
				_pos[1] = yNew;
				this.perceive( env.getPerceptAt(xNew, yNew) );
			} else {
				this.perceive('bump');
			}
		},

		turnLeft: function() {
			switch (_orientation) {
				case 'e':
					_orientation = 'n';
					break;
				case 'w':
					_orientation = 's';
					break;
				case 'n':
					_orientation = 'w';
					break;
				case 's':
					_orientation = 'e';
					break;
			}
		},

		turnRight: function() {
			switch (_orientation) {
				case 'e':
					_orientation = 's';
					break;
				case 'w':
					_orientation = 'n';
					break;
				case 'n':
					_orientation = 'e';
					break;
				case 's':
					_orientation = 'w';
					break;
			}
		},

		grab: function() {
			env.
		},

		climb: function() {

		},

		shoot: function() {

		}
	};

	return {
		getPosition: function() {
			return _pos;
		},

		hasArrow: function() {
			return _arrow;
		},

		getOrientation: function() {
			return _orientation;
		},

		setOrientation: function(o) {
			if (o == 'e' || o == 'w' || o == 'n' || o == 's') {
				_orientation = o;
			}
		},

		perceive: function(percept) {

		},

		useArrow: function() {
			_arrow = false;
		},

		do: function(action) {
			_actions[action].call();
		},

		perceive: function(percept) {
			if (percept === 'bump') {
				var newPercept = jQuery.extend({}, _percepts[_percepts.length - 1]);
				newPercept.bump = true;
				_percepts.push(newPercept);
			} else {
				_percepts.push(percept);
			}

		}
	}
}