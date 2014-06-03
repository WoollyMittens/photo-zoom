/*
	Source:
	van Creij, Maurice (2014). "useful.zoom.js: Pan and Zoom an Image", version 20140528, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	"use strict";

	useful.Zoom_Controls = function (parent) {

		// PROPERTIES

		this.parent = parent;
		this.cfg = parent.cfg;
		this.obj = null;
		this.ui = {};

		// METHODS

		this.start = function () {
			// create a controls
			this.obj = document.createElement('menu');
			this.obj.className = 'useful-zoom-controls';
			// add the zoom in button
			this.ui.zoomIn = document.createElement('button');
			this.ui.zoomIn.className = 'useful-zoom-in enabled';
			this.ui.zoomIn.innerHTML = 'Zoom In';
			this.ui.zoomIn.addEventListener('touchstart', this.onSuspendTouch());
			this.ui.zoomIn.addEventListener('mousedown', this.onSuspendTouch());
			this.ui.zoomIn.addEventListener('touchend', this.onZoom(1.5));
			this.ui.zoomIn.addEventListener('mouseup', this.onZoom(1.5));
			this.obj.appendChild(this.ui.zoomIn);
			// add the zoom out button
			this.ui.zoomOut = document.createElement('button');
			this.ui.zoomOut.className = 'useful-zoom-out disabled';
			this.ui.zoomOut.innerHTML = 'Zoom Out';
			this.ui.zoomOut.addEventListener('touchstart', this.onSuspendTouch());
			this.ui.zoomOut.addEventListener('mousedown', this.onSuspendTouch());
			this.ui.zoomOut.addEventListener('touchend', this.onZoom(0.75));
			this.ui.zoomOut.addEventListener('mouseup', this.onZoom(0.75));
			this.obj.appendChild(this.ui.zoomOut);
			// add the controls to the parent
			this.parent.obj.appendChild(this.obj);
		};

		this.redraw = function () {
			var zoomIn = this.ui.zoomIn,
				zoomOut = this.ui.zoomOut,
				dimensions = this.parent.dimensions,
				transformation = this.parent.transformation;
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
				_this.parent.gestures.paused = false;
				// apply the zoom factor
				var transformation = _this.parent.transformation,
					dimensions = _this.parent.dimensions;
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
				_this.parent.gestures.paused = true;
			};
		};

		// STARTUP

		this.start();

	};

}(window.useful = window.useful || {}));
