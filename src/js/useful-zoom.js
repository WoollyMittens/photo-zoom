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
useful.Zoom.prototype.init = function (model) {

	// PROPERTIES

	"use strict";
	this.model = model;
	this.element = model.element;
	this.model.transformation = {
		'left' : 0.5,
		'top' : 0.5,
		'zoom' : 1,
		'rotate' : 0
	};
	this.model.dimensions = {
		'width' : null,
		'height' : null,
		'maxWidth' : null,
		'maxHeight' : null
	};

	// OBJECTS

	this.styling = new this.Styling(this);
	this.overlay = new this.Overlay(this);
	this.controls = new this.Controls(this);
	this.touch = new this.Touch(this);

	// METHODS

	this.redraw = function () {
		// measure the dimensions, maximum zoom and aspect ratio
		this.styling.measure();
		// redraw the controls
		this.controls.redraw();
		// redraw the overlay
		this.overlay.redraw();
	};
	this.update = function () {
		// redraw the controls
		this.controls.redraw();
	};
	this.gestures = function (status) {
		// enable or disable the touch controls
		this.touch.pause(!status);
	};
	this.transitions = function (status) {
		// enable or disable the transitions on the overlays
		this.overlay.transitions(status);
	};

	// PUBLIC

	this.transform = function (transformation) {
		// apply the transformation
		this.model.transformation.left = Math.max(Math.min(transformation.left, 1), 0) || this.model.transformation.left;
		this.model.transformation.top = Math.max(Math.min(transformation.top, 1), 0) || this.model.transformation.top;
		this.model.transformation.zoom = Math.max(Math.min(transformation.zoom, this.model.dimensions.maxZoom), 1) || this.model.transformation.zoom;
		this.model.transformation.rotate = Math.max(Math.min(transformation.rotate, 359), 0) || this.model.transformation.rotate;
		// activate the transition
		this.overlay.transitions(true);
		// trigger the transformation
		var _this = this;
		setTimeout(function () { _this.overlay.redraw(); }, 0);
	};
	this.moveBy = function (x,y) {
		this.moveTo(
			this.model.transformation.left - x,
			this.model.transformation.top - y
		);
	};
	this.moveTo = function (x,y) {
		// apply the translation
		this.model.transformation.left = x;
		this.model.transformation.top = y;
		// apply the limits
		this.model.transformation.left = Math.max(Math.min(this.model.transformation.left, 1), 0);
		this.model.transformation.top = Math.max(Math.min(this.model.transformation.top, 1), 0);
		// redraw the display
		this.overlay.redraw();
	};
	this.zoomBy = function (z) {
		this.zoomTo(
			this.model.transformation.zoom + z
		);
	};
	this.zoomTo = function (z) {
		// apply the translation
		this.model.transformation.zoom = z;
		// apply the limits
		this.model.transformation.zoom = Math.max(Math.min(this.model.transformation.zoom, this.model.dimensions.maxZoom), 1);
		// redraw the display
		this.overlay.redraw();
	};
	this.rotateBy = function (r) {
		this.rotateTo(
			this.model.transformation.rotate + r
		);
	};
	this.rotateTo = function (r) {
		// apply the translation
		this.model.transformation.rotate += r;
		// apply the limits
		this.model.transformation.rotate = Math.max(Math.min(this.model.transformation.rotate, 359), 0);
		// redraw the display
		this.overlay.redraw();
	};

	// STARTUP

	this.redraw();
	this.init = function () {};
	return this;

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Zoom;
}
