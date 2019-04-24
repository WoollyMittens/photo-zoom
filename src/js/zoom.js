/*
	Source:
	van Creij, Maurice (2018). "zoom.js: Pan and Zoom an Image", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var Zoom = function (config) {

	// PROPERTIES

	this.config = {
		'element': document.getElementById('zoomExample'),
		'tileSource': 'php/imageslice.php?src=../{src}&left={left}&top={top}&right={right}&bottom={bottom}&width={width}&height={height}',
		'tileCache': 128,
		'tileSize': 128,
		'allowRotation': false
	};

	for (var name in config) {
		this.config[name] = config[name];
	}

	// CLASSES

	this.main = new this.Main(this);

	// METHODS

	this.transform = this.main.transform.bind(this.main);
	this.moveBy = this.main.moveBy.bind(this.main);
	this.moveTo = this.main.moveTo.bind(this.main);
	this.zoomBy = this.main.zoomBy.bind(this.main);
	this.zoomTo = this.main.zoomTo.bind(this.main);
	this.rotateBy = this.main.rotateBy.bind(this.main);
	this.rotateTo = this.main.rotateTo.bind(this.main);

	// EVENTS

};

// return as a require.js module
if (typeof define != 'undefined') define([], function () { return Zoom });
if (typeof module != 'undefined') module.exports = Zoom;
