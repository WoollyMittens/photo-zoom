/*
	Source:
	van Creij, Maurice (2014). "useful.zoom.js: Pan and Zoom an Image", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Zoom = useful.Zoom || function () {};

// extend the constructor
useful.Zoom.prototype.init = function (config) {
	// invoke strict mode
	"use strict";
	// define the default properties
	this.config = {
		'element' : document.getElementById('zoomExample'),
		'tileSource' : 'php/imageslice.php?src=../{src}&left={left}&top={top}&right={right}&bottom={bottom}&width={width}&height={height}',
		'tileCache' : 128,
		'tileSize' : 128,
		'allowRotation' : false
	};
  // update the properties
  for (var name in config) { this.config[name] = config[name]; }
  // bind the components
  this.main = new this.Main().init(this);
	// expose the public functions
	this.transform = this.main.transform.bind(this.main);
	this.moveBy = this.main.moveBy.bind(this.main);
	this.moveTo = this.main.moveTo.bind(this.main);
	this.zoomBy = this.main.zoomBy.bind(this.main);
	this.zoomTo = this.main.zoomTo.bind(this.main);
	this.rotateBy = this.main.rotateBy.bind(this.main);
	this.rotateTo = this.main.rotateTo.bind(this.main);
  // return the object
  return this;
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Zoom;
}
