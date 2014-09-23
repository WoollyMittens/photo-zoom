/*
	Source:
	van Creij, Maurice (2014). "useful.zoom.js: Pan and Zoom an Image", version 20140528, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	"use strict";

	useful.Zoom = function (element, model) {

		// PROPERTIES

		this.element = element;
		this.model = model;

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

		this.controls = null;
		this.overlay = null;

		// METHODS

		this.start = function () {
			// apply the custom styles
			this.applyStyling();
			// build the overlay
			this.overlay = new useful.Zoom_Overlay(this);
			// build the controls
			this.controls = new useful.Zoom_Controls(this);
			// add the events
			this.addEvents();
			// first redraw
			this.redraw();
			// disable the start function so it can't be started twice
			this.start = function () {};
		};
		this.redraw = function () {
			// measure the dimensions, maximum zoom and aspect ratio
			this.measureDimensions();
			// redraw the controls
			this.controls.redraw();
			// redraw the overlay
			this.overlay.redraw();
		};
		this.update = function () {
			// redraw the controls
			this.controls.redraw();
		};
		this.applyStyling = function () {
			// create a custom stylesheet
			var style = document.createElement("style");
			if (navigator.userAgent.match(/webkit/gi)) { style.appendChild(document.createTextNode("")); }
			document.body.appendChild(style);
			var sheet = style.sheet || style.styleSheet;
			// add the custom styles
			if (sheet.insertRule) {
				if (this.model.colorPassive) {
					sheet.insertRule(".useful-zoom-controls button {background-color : " + this.model.colorPassive + " !important;}", 0);
				}
				if (this.model.colorHover) {
					sheet.insertRule(".useful-zoom-controls button:hover, .useful-zoom button:active {background-color : " + this.model.colorHover + " !important;}", 0);
				}
				if (this.model.colorDisabled) {
					sheet.insertRule(".useful-zoom-controls button.disabled, .useful-zoom-controls button.disabled:hover {background-color : " + this.model.colorDisabled + " !important;}", 0);
				}
			} else {
				if (this.model.colorPassive) {
					sheet.addRule(".useful-zoom-controls button", "background-color : " + this.model.colorPassive + " !important;", 0);
				}
				if (this.model.colorHover) {
					sheet.addRule(".useful-zoom-controls button:hover, .useful-zoom button:active", "background-color : " + this.model.colorHover + " !important;", 0);
				}
				if (this.model.colorDisabled) {
					sheet.addRule(".useful-zoom-controls button.disabled, .useful-zoom-controls button.disabled:hover", "background-color : " + this.model.colorDisabled + " !important;", 0);
				}
			}
		};
		this.addEvents = function () {
			// make the dimensions update themselves upon resize
			window.addEventListener('resize', this.onResize());
			// add touch event handlers
			this.gestures = new useful.Gestures(this.element, {
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
				'twist' : (this.model.allowRotation) ? this.onTwist() : function () {},
				'doubleTap' : this.onDoubleTap()
			});
			// cancel transitions afterwards
			this.element.addEventListener('transitionEnd', this.afterTransitions());
			this.element.addEventListener('webkitTransitionEnd', this.afterTransitions());
		};
		this.measureDimensions = function () {
			// get the original link
			var link = this.element.getElementsByTagName('a')[0];
			// store the image source
			this.model.tileUrl = link.getAttribute('href');
			// store the starting dimensions
			this.model.dimensions.width = this.element.offsetWidth;
			this.model.dimensions.height = this.element.offsetHeight;
			// store the maximum dimensions
			this.model.dimensions.maxWidth = parseInt(link.getAttribute('data-width'));
			this.model.dimensions.maxHeight = parseInt(link.getAttribute('data-height'));
			this.model.dimensions.maxZoom = this.model.dimensions.maxWidth / this.model.dimensions.width;
		};

		// EVENTS

		this.onResize = function () {
			var _this = this;
			return function () {
				// redraw the display
				_this.redraw();
			};
		};
		this.onDrag = function () {
			var _this = this;
			return function (coords) {
				// calculate the translation
				_this.moveBy(
					coords.horizontal / _this.model.dimensions.width / _this.model.transformation.zoom,
					coords.vertical / _this.model.dimensions.height / _this.model.transformation.zoom
				);
			};
		};
		this.onPinch = function () {
			var _this = this;
			return function (coords) {
				// calculate the magnification
				_this.zoomBy(
					coords.scale * _this.model.transformation.zoom
				);
			};
		};
		this.onTwist = function () {
			var _this = this;
			return function (coords) {
				// calculate the rotation
				_this.rotateBy(
					coords.rotation
				);
			};
		};
		this.onDoubleTap = function () {
			var _this = this;
			return function (coords) {
				coords.event.preventDefault();
				// calculate the zoom
				_this.transform({
					'left' : (coords.x / _this.model.dimensions.width - 0.5) / _this.model.transformation.zoom + _this.model.transformation.left,
					'top' : (coords.y / _this.model.dimensions.height - 0.5) / _this.model.transformation.zoom + _this.model.transformation.top,
					'zoom' : _this.model.transformation.zoom * 1.5
				});
			};
		};
		this.afterTransitions = function () {
			var _this = this;
			return function () {
				_this.overlay.element.className = _this.overlay.element.className.replace(/useful-zoom-transition| useful-zoom-transition/g, '');
			};
		};

		// PUBLIC

		this.transform = function (transformation) {
			// apply the transformation
			this.model.transformation.left = Math.max(Math.min(transformation.left, 1), 0) || this.model.transformation.left;
			this.model.transformation.top = Math.max(Math.min(transformation.top, 1), 0) || this.model.transformation.top;
			this.model.transformation.zoom = Math.max(Math.min(transformation.zoom, this.model.dimensions.maxZoom), 1) || this.model.transformation.zoom;
			this.model.transformation.rotate = Math.max(Math.min(transformation.rotate, 359), 0) || this.model.transformation.rotate;
			// activate the transition
			this.overlay.element.className += ' useful-zoom-transition';
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

		this.start();

	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Zoom;
	}

})();
