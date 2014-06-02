/*
	Source:
	van Creij, Maurice (2014). "useful.zoom.js: Pan and Zoom an Image", version 20140528, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	"use strict";

	useful.Zoom = function (obj, cfg) {

		// PROPERTIES

		this.obj = obj;
		this.cfg = cfg;
		this.transformation = {
			'left' : 0.5,
			'top' : 0.5,
			'zoom' : 2,
			'rotate' : 0
		};
		this.dimensions = {
			'width' : null,
			'height' : null,
			'maxWidth' : null,
			'maxHeight' : null
		};
		this.updated = 0;

		// OBJECTS

		this.controls = null;
		this.overlay = null;

		// METHODS

		this.start = function () {
			// apply the custom styles
			this.applyStyling();
			// build the overlay
			this.overlay = new useful.Zoom_Overlay(this);
			// TODO: build the controls
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
			// TODO: redraw the controls
			// redraw the overlay
			this.overlay.redraw();
		};
		this.applyStyling = function () {
			// create a custom stylesheet
			var style = document.createElement("style");
			if (navigator.userAgent.match(/webkit/gi)) { style.appendChild(document.createTextNode("")); }
			document.body.appendChild(style);
			var sheet = style.sheet || style.styleSheet;
			// add the custom styles
			if (sheet.insertRule) {
				if (this.cfg.colorPassive) {
					sheet.insertRule(".useful-zoom button {background-color : " + this.cfg.colorPassive + " !important;}", 0);
				}
				if (this.cfg.colorHover) {
					sheet.insertRule(".useful-zoom button:hover, .useful-zoom button:active {background-color : " + this.cfg.colorHover + " !important;}", 0);
				}
				if (this.cfg.colorDisabled) {
					sheet.insertRule(".useful-zoom button.disabled {background-color : " + this.cfg.colorDisabled + " !important;}", 0);
				}
			} else {
				if (this.cfg.colorPassive) {
					sheet.addRule(".useful-zoom button", "background-color : " + this.cfg.colorPassive + " !important;", 0);
				}
				if (this.cfg.colorHover) {
					sheet.addRule(".useful-zoom button:hover, .useful-zoom button:active", "background-color : " + this.cfg.colorHover + " !important;", 0);
				}
				if (this.cfg.colorDisabled) {
					sheet.addRule(".useful-zoom button.disabled", "background-color : " + this.cfg.colorDisabled + " !important;", 0);
				}
			}
		};
		this.addEvents = function () {
			// make the dimensions update themselves upon resize
			window.addEventListener('resize', this.onResize());
			// add touch event handlers
			this.gestures = new useful.Gestures(this.obj, {
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
				'twist' : this.onTwist()
			});
		};
		this.measureDimensions = function () {
			// get the original link
			var link = this.obj.getElementsByTagName('a')[0];
			// store the image source
			this.cfg.tileUrl = link.getAttribute('href');
			// store the starting dimensions
			this.dimensions.width = this.obj.offsetWidth;
			this.dimensions.height = this.obj.offsetHeight;
			// store the maximum dimensions
			this.dimensions.maxWidth = parseInt(link.getAttribute('data-width'));
			this.dimensions.maxHeight = parseInt(link.getAttribute('data-height'));
			this.dimensions.maxZoom = this.dimensions.maxWidth / this.dimensions.width;
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
					coords.horizontal / _this.dimensions.width / _this.transformation.zoom,
					coords.vertical / _this.dimensions.height / _this.transformation.zoom
				);
			};
		};
		this.onPinch = function () {
			var _this = this;
			return function (coords) {
				// calculate the magnification
				_this.zoomBy(
					coords.scale
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

		// PUBLIC

		this.moveBy = function (x,y) {
			// apply the translation
			this.transformation.left -= x;
			this.transformation.top -= y;
			// apply the limits
			this.transformation.left = Math.max(Math.min(this.transformation.left, 1), 0);
			this.transformation.top = Math.max(Math.min(this.transformation.top, 1), 0);
			// redraw the display
			this.overlay.redraw();
		};
		this.moveTo = function (x,y) {};
		this.zoomBy = function (z) {
			// apply the translation
			this.transformation.zoom += z;
			// apply the limits
			this.transformation.zoom = Math.max(Math.min(this.transformation.zoom, this.dimensions.maxZoom), 1);
			// redraw the display
			this.overlay.redraw();
		};
		this.zoomTo = function (z) {};
		this.rotateBy = function (r) {
			// apply the translation
			this.transformation.rotate += r;
			// apply the limits
			this.transformation.rotate = Math.max(Math.min(this.transformation.rotate, 359), 0);
			// redraw the display
			this.overlay.redraw();
		};
		this.rotateTo = function (r) {};

		// STARTUP

		this.start();

	};

}(window.useful = window.useful || {}));
