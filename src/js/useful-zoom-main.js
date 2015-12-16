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
useful.Zoom.prototype.Main = function () {

	// PROPERTIES

	"use strict";
	this.context = null;
	this.config = null;
	this.element = null;

	// METHODS

	this.init = function (context) {
		// store the context
		this.context = context;
		this.config = context.config;
		this.element = context.config.element;
		// apply the transformation
		this.config.transformation = {
			'left' : 0.5,
			'top' : 0.5,
			'zoom' : 1,
			'rotate' : 0
		};
		this.config.dimensions = {
			'width' : null,
			'height' : null,
			'maxWidth' : null,
			'maxHeight' : null
		};
		// create the components
		this.styling = new this.context.Styling().init(this);
		this.overlay = new this.context.Overlay().init(this);
		this.controls = new this.context.Controls().init(this);
		this.touch = new this.context.Touch().init(this);
		// first redraw
		this.redraw();
		// return the object
		return this;
	};

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
		this.config.transformation.left = Math.max(Math.min(transformation.left, 1), 0) || this.config.transformation.left;
		this.config.transformation.top = Math.max(Math.min(transformation.top, 1), 0) || this.config.transformation.top;
		this.config.transformation.zoom = Math.max(Math.min(transformation.zoom, this.config.dimensions.maxZoom), 1) || this.config.transformation.zoom;
		this.config.transformation.rotate = Math.max(Math.min(transformation.rotate, 359), 0) || this.config.transformation.rotate;
		// activate the transition
		this.overlay.transitions(true);
		// trigger the transformation
		setTimeout(this.redraw.bind(this), 0);
	};

	this.moveBy = function (x,y) {
		this.moveTo(
			this.config.transformation.left - x,
			this.config.transformation.top - y
		);
	};

	this.moveTo = function (x,y) {
		// apply the translation
		this.config.transformation.left = x;
		this.config.transformation.top = y;
		// apply the limits
		this.config.transformation.left = Math.max(Math.min(this.config.transformation.left, 1), 0);
		this.config.transformation.top = Math.max(Math.min(this.config.transformation.top, 1), 0);
		// redraw the display
		this.overlay.redraw();
	};

	this.zoomBy = function (z) {
		this.zoomTo(
			this.config.transformation.zoom + z
		);
	};

	this.zoomTo = function (z) {
		// apply the translation
		this.config.transformation.zoom = z;
		// apply the limits
		this.config.transformation.zoom = Math.max(Math.min(this.config.transformation.zoom, this.config.dimensions.maxZoom), 1);
		// redraw the display
		this.overlay.redraw();
	};

	this.rotateBy = function (r) {
		this.rotateTo(
			this.config.transformation.rotate + r
		);
	};

	this.rotateTo = function (r) {
		// apply the translation
		this.config.transformation.rotate += r;
		// apply the limits
		this.config.transformation.rotate = Math.max(Math.min(this.config.transformation.rotate, 359), 0);
		// redraw the display
		this.overlay.redraw();
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Zoom.Main;
}
