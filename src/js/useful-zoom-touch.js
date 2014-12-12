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
useful.Zoom.prototype.Touch = function (parent) {

	// PROPERTIES

	"use strict";
	this.parent = parent;
	this.config = parent.config;
	this.element = parent.element;

	// METHODS

	this.init = function () {
		// make the dimensions update themselves upon resize
		window.addEventListener('resize', this.onResize());
		// add touch event handlers
		this.gestures = new useful.Gestures().init({
			'element' : this.element,
			'threshold' : 50,
			'increment' : 0.1,
			'cancelTouch' : true,
			'cancelGesture' : true,
			'swipeLeft' : function (coords) {},
			'swipeUp' : function (coords) {},
			'swipeRight' : function (coords) {},
			'swipeDown' : function (coords) {},
			'drag' : this.onDrag(),
			'pinch' : this.onPinch(),
			'twist' : (this.config.allowRotation) ? this.onTwist() : function () {},
			'doubleTap' : this.onDoubleTap()
		});
		// cancel transitions afterwards
		this.element.addEventListener('transitionEnd', this.afterTransitions());
		this.element.addEventListener('webkitTransitionEnd', this.afterTransitions());
		// return the object
		return this;
	};

	this.pause = function (status) {
		// pause or unpause the touch controls
		this.gestures.paused = status;
	};

	// EVENTS

	this.onResize = function () {
		var _this = this;
		return function () {
			// redraw the display
			_this.parent.redraw();
		};
	};

	this.onDrag = function () {
		var _this = this;
		return function (coords) {
			// calculate the translation
			_this.parent.moveBy(
				coords.horizontal / _this.config.dimensions.width / _this.config.transformation.zoom,
				coords.vertical / _this.config.dimensions.height / _this.config.transformation.zoom
			);
		};
	};

	this.onPinch = function () {
		var _this = this;
		return function (coords) {
			// calculate the magnification
			_this.parent.zoomBy(
				coords.scale * _this.config.transformation.zoom
			);
		};
	};

	this.onTwist = function () {
		var _this = this;
		return function (coords) {
			// calculate the rotation
			_this.parent.rotateBy(
				coords.rotation
			);
		};
	};

	this.onDoubleTap = function () {
		var _this = this;
		return function (coords) {
			coords.event.preventDefault();
			// calculate the zoom
			_this.parent.transform({
				'left' : (coords.x / _this.config.dimensions.width - 0.5) / _this.config.transformation.zoom + _this.config.transformation.left,
				'top' : (coords.y / _this.config.dimensions.height - 0.5) / _this.config.transformation.zoom + _this.config.transformation.top,
				'zoom' : _this.config.transformation.zoom * 1.5
			});
		};
	};

	this.afterTransitions = function () {
		var _this = this;
		return function () {
			_this.parent.transitions(false);
		};
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Zoom.Touch;
}
