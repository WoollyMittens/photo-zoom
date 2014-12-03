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
useful.Zoom.prototype.Controls = function (parent) {

	// PROPERTIES

	"use strict";
	this.parent = parent;
	this.config = parent.config;

	this.element = null;
	this.zoomIn = null;
	this.zoomOut = null;

	// METHODS

	this.start = function () {
		// create a controls
		this.element = document.createElement('menu');
		this.element.className = 'useful-zoom-controls';
		// add the zoom in button
		this.zoomIn = document.createElement('button');
		this.zoomIn.className = 'useful-zoom-in enabled';
		this.zoomIn.innerHTML = 'Zoom In';
		this.zoomIn.addEventListener('touchstart', this.onSuspendTouch());
		this.zoomIn.addEventListener('mousedown', this.onSuspendTouch());
		this.zoomIn.addEventListener('touchend', this.onZoom(1.5));
		this.zoomIn.addEventListener('mouseup', this.onZoom(1.5));
		this.element.appendChild(this.zoomIn);
		// add the zoom out button
		this.zoomOut = document.createElement('button');
		this.zoomOut.className = 'useful-zoom-out disabled';
		this.zoomOut.innerHTML = 'Zoom Out';
		this.zoomOut.addEventListener('touchstart', this.onSuspendTouch());
		this.zoomOut.addEventListener('mousedown', this.onSuspendTouch());
		this.zoomOut.addEventListener('touchend', this.onZoom(0.75));
		this.zoomOut.addEventListener('mouseup', this.onZoom(0.75));
		this.element.appendChild(this.zoomOut);
		// add the controls to the parent
		this.parent.element.appendChild(this.element);
	};

	this.redraw = function () {
		var zoomIn = this.zoomIn,
			zoomOut = this.zoomOut,
			dimensions = this.config.dimensions,
			transformation = this.config.transformation;
		// disable the zoom in button at max zoom
		zoomIn.className = (transformation.zoom < dimensions.maxZoom) ?
			zoomIn.className.replace('disabled', 'enabled'):
			zoomIn.className.replace('enabled', 'disabled');
		// disable the zoom out button at min zoom
		zoomOut.className = (transformation.zoom > 1) ?
			zoomOut.className.replace('disabled', 'enabled'):
			zoomOut.className.replace('enabled', 'disabled');
	};

	// EVENTS

	this.onZoom = function (factor) {
		var _this = this;
		return function (evt) {
			// cancel the click
			evt.preventDefault();
			// restore the touch events
			_this.parent.gestures(true);
			// apply the zoom factor
			var transformation = _this.config.transformation,
				dimensions = _this.config.dimensions;
			// apply the zoom factor to the transformation
			transformation.zoom = Math.max(Math.min(transformation.zoom * factor, dimensions.maxZoom), 1);
			// redraw
			_this.parent.redraw();
		};
	};

	this.onSuspendTouch = function () {
		var _this = this;
		return function (evt) {
			// cancel the click
			evt.preventDefault();
			// suspend touch events
			_this.parent.gestures(false);
		};
	};

	// STARTUP

	this.start();

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Zoom.Controls;
}
