function Hunter() {
	this.arrow = true
	this.position = [0, 0]
	this.orientation = [1, 0]
}

Hunter.prototype.getForwardCell = function() {
	var p = this.position
	var o = this.orientation

	return [ p[0] + o[0], p[1] + o[1] ]
}

Hunter.prototype.getCCWOrientation = function() {
	var o = this.orientation
	return [ -o[1], o[0] ]
}

Hunter.prototype.getCWOrientation = function() {
	return [ o[1], -o[0] ]
}