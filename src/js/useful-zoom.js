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
		// TODO: move these into the model (cfg) to pass on to sub-components
		this.transformation = {
			'left' : 0.5,
			'top' : 0.5,
			'zoom' : 1,
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
				if (this.cfg.colorPassive) {
					sheet.insertRule(".useful-zoom-controls button {background-color : " + this.cfg.colorPassive + " !important;}", 0);
				}
				if (this.cfg.colorHover) {
					sheet.insertRule(".useful-zoom-controls button:hover, .useful-zoom button:active {background-color : " + this.cfg.colorHover + " !important;}", 0);
				}
				if (this.cfg.colorDisabled) {
					sheet.insertRule(".useful-zoom-controls button.disabled, .useful-zoom-controls button.disabled:hover {background-color : " + this.cfg.colorDisabled + " !important;}", 0);
				}
			} else {
				if (this.cfg.colorPassive) {
					sheet.addRule(".useful-zoom-controls button", "background-color : " + this.cfg.colorPassive + " !important;", 0);
				}
				if (this.cfg.colorHover) {
					sheet.addRule(".useful-zoom-controls button:hover, .useful-zoom button:active", "background-color : " + this.cfg.colorHover + " !important;", 0);
				}
				if (this.cfg.colorDisabled) {
					sheet.addRule(".useful-zoom-controls button.disabled, .useful-zoom-controls button.disabled:hover", "background-color : " + this.cfg.colorDisabled + " !important;", 0);
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
				'twist' : (this.cfg.allowRotation) ? this.onTwist() : function () {},
				'doubleTap' : this.onDoubleTap()
			});
			// cancel transitions afterwards
			this.obj.addEventListener('transitionEnd', this.afterTransitions());
			this.obj.addEventListener('webkitTransitionEnd', this.afterTransitions());
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
					coords.scale * _this.transformation.zoom
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
					'left' : (coords.x / _this.dimensions.width - 0.5) + _this.transformation.left,
					'top' : (coords.y / _this.dimensions.height - 0.5) + _this.transformation.top,
					'zoom' : _this.transformation.zoom * 1.5
				});
				console.log('double tap:', coords, _this.dimensions);
			};
		};
		this.afterTransitions = function () {
			var _this = this;
			return function () {
				_this.overlay.obj.className = _this.overlay.obj.className.replace(/useful-zoom-transition| useful-zoom-transition/g, '');
			};
		};

		// PUBLIC

		this.transform = function (transformation) {
			// apply the transformation
			this.transformation.left = Math.max(Math.min(transformation.left, 1), 0) || this.transformation.left;
			this.transformation.top = Math.max(Math.min(transformation.top, 1), 0) || this.transformation.top;
			this.transformation.zoom = Math.max(Math.min(transformation.zoom, this.dimensions.maxZoom), 1) || this.transformation.zoom;
			this.transformation.rotate = Math.max(Math.min(transformation.rotate, 359), 0) || this.transformation.rotate;
			// activate the transition
			this.overlay.obj.className += ' useful-zoom-transition';
			// trigger the transformation
			var _this = this;
			setTimeout(function () { _this.overlay.redraw(); }, 0);
		};
		this.moveBy = function (x,y) {
			this.moveTo(
				this.transformation.left - x,
				this.transformation.top - y
			);
		};
		this.moveTo = function (x,y) {
			// apply the translation
			this.transformation.left = x;
			this.transformation.top = y;
			// apply the limits
			this.transformation.left = Math.max(Math.min(this.transformation.left, 1), 0);
			this.transformation.top = Math.max(Math.min(this.transformation.top, 1), 0);
			// redraw the display
			this.overlay.redraw();
		};
		this.zoomBy = function (z) {
			this.zoomTo(
				this.transformation.zoom + z
			);
		};
		this.zoomTo = function (z) {
			// apply the translation
			this.transformation.zoom = z;
			// apply the limits
			this.transformation.zoom = Math.max(Math.min(this.transformation.zoom, this.dimensions.maxZoom), 1);
			// redraw the display
			this.overlay.redraw();
		};
		this.rotateBy = function (r) {
			this.rotateTo(
				this.transformation.rotate + r
			);
		};
		this.rotateTo = function (r) {
			// apply the translation
			this.transformation.rotate += r;
			// apply the limits
			this.transformation.rotate = Math.max(Math.min(this.transformation.rotate, 359), 0);
			// redraw the display
			this.overlay.redraw();
		};

		// STARTUP

		this.start();

	};

}(window.useful = window.useful || {}));
