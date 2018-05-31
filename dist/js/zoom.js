/*
	Source:
	van Creij, Maurice (2014). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Gestures = useful.Gestures || function () {};

// extend the constructor
useful.Gestures.prototype.Main = function (config, context) {

	// PROPERTIES

	"use strict";
	this.config = config;
	this.context = context;
	this.element = config.element;
	this.paused = false;

	// METHODS

	this.init = function () {
		// check the configuration properties
		this.config = this.checkConfig(config);
		// add the single touch events
		if (config.allowSingle) { this.single = new this.context.Single(this).init(); }
		// add the multi touch events
		if (config.allowMulti) { this.multi = new this.context.Multi(this).init(); }
		// return the object
		return this;
	};

	this.checkConfig = function (config) {
		// add default values for missing ones
		config.threshold = config.threshold || 50;
		config.increment = config.increment || 0.1;
		// cancel all events by default
		if (config.cancelTouch === undefined || config.cancelTouch === null) { config.cancelTouch = true; }
		if (config.cancelGesture === undefined || config.cancelGesture === null) { config.cancelGesture = true; }
		// add dummy event handlers for missing ones
		if (config.swipeUp || config.swipeLeft || config.swipeRight || config.swipeDown || config.drag || config.doubleTap) {
			config.allowSingle = true;
			config.swipeUp = config.swipeUp || function () {};
			config.swipeLeft = config.swipeLeft || function () {};
			config.swipeRight = config.swipeRight || function () {};
			config.swipeDown = config.swipeDown || function () {};
			config.drag = config.drag || function () {};
			config.doubleTap = config.doubleTap || function () {};
		}
		// if there's pinch there's also twist
		if (config.pinch || config.twist) {
			config.allowMulti = true;
			config.pinch = config.pinch || function () {};
			config.twist = config.twist || function () {};
		}
		// return the fixed config
		return config;
	};

	this.readEvent = function (event) {
		var coords = {}, offsets;
		// try all likely methods of storing coordinates in an event
		if (event.touches && event.touches[0]) {
			coords.x = event.touches[0].pageX;
			coords.y = event.touches[0].pageY;
		} else if (event.pageX !== undefined) {
			coords.x = event.pageX;
			coords.y = event.pageY;
		} else {
			coords.x = event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
			coords.y = event.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
		}
		return coords;
	};

	this.correctOffset = function (element) {
		var offsetX = 0, offsetY = 0;
		// if there is an offset
		if (element.offsetParent) {
			// follow the offsets back to the right parent element
			while (element !== this.element) {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
				element = element.offsetParent;
			}
		}
		// return the offsets
		return { 'x' : offsetX, 'y' : offsetY };
	};

	// EXTERNAL

	this.enableDefaultTouch = function () {
		this.config.cancelTouch = false;
	};

	this.disableDefaultTouch = function () {
		this.config.cancelTouch = true;
	};

	this.enableDefaultGesture = function () {
		this.config.cancelGesture = false;
	};

	this.disableDefaultGesture = function () {
		this.config.cancelGesture = true;
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures.Main;
}

/*
	Source:
	van Creij, Maurice (2014). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Gestures = useful.Gestures || function () {};

// extend the constructor
useful.Gestures.prototype.Multi = function (parent) {

	// PROPERTIES

	"use strict";
	this.parent = parent;
	this.config = parent.config;
	this.element = parent.config.element;
	this.gestureOrigin = null;
	this.gestureProgression = null;

	// METHODS

	this.init = function () {
		// set the required events for mouse
		this.element.addEventListener('mousewheel', this.onChangeWheel());
		if (navigator.userAgent.match(/firefox/gi)) { this.element.addEventListener('DOMMouseScroll', this.onChangeWheel()); }
		// set the required events for gestures
		if ('ongesturestart' in window) {
			this.element.addEventListener('gesturestart', this.onStartGesture());
			this.element.addEventListener('gesturechange', this.onChangeGesture());
			this.element.addEventListener('gestureend', this.onEndGesture());
		} else if ('msgesturestart' in window) {
			this.element.addEventListener('msgesturestart', this.onStartGesture());
			this.element.addEventListener('msgesturechange', this.onChangeGesture());
			this.element.addEventListener('msgestureend', this.onEndGesture());
		} else {
			this.element.addEventListener('touchstart', this.onStartFallback());
			this.element.addEventListener('touchmove', this.onChangeFallback());
			this.element.addEventListener('touchend', this.onEndFallback());
		}
		// return the object
		return this;
	};

	this.cancelGesture = function (event) {
		if (this.config.cancelGesture) {
			event = event || window.event;
			event.preventDefault();
		}
	};

	this.startGesture = function (event) {
		// if the functionality wasn't paused
		if (!this.parent.paused) {
			// note the start position
			this.gestureOrigin = {
				'scale' : event.scale,
				'rotation' : event.rotation,
				'target' : event.target || event.srcElement
			};
			this.gestureProgression = {
				'scale' : this.gestureOrigin.scale,
				'rotation' : this.gestureOrigin.rotation
			};
		}
	};

	this.changeGesture = function (event) {
		// if there is an origin
		if (this.gestureOrigin) {
			// get the distances from the event
			var scale = event.scale,
				rotation = event.rotation;
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// get the gesture parameters
			this.config.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale - this.gestureProgression.scale,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			this.config.twist({
				'x' : coords.x,
				'y' : coords.y,
				'rotation' : rotation - this.gestureProgression.rotation,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			// update the current position
			this.gestureProgression = {
				'scale' : event.scale,
				'rotation' : event.rotation
			};
		}
	};

	this.endGesture = function () {
		// note the start position
		this.gestureOrigin = null;
	};

	// FALLBACK

	this.startFallback = function (event) {
		// if the functionality wasn't paused
		if (!this.parent.paused && event.touches.length === 2) {
			// note the start position
			this.gestureOrigin = {
				'touches' : [
					{ 'pageX' : event.touches[0].pageX, 'pageY' : event.touches[0].pageY },
					{ 'pageX' : event.touches[1].pageX, 'pageY' : event.touches[1].pageY }
				],
				'target' : event.target || event.srcElement
			};
			this.gestureProgression = {
				'touches' : this.gestureOrigin.touches
			};
		}
	};

	this.changeFallback = function (event) {
		// if there is an origin
		if (this.gestureOrigin && event.touches.length === 2) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// calculate the scale factor
			var scale = 0, progression = this.gestureProgression;
			scale += (event.touches[0].pageX - event.touches[1].pageX) / (progression.touches[0].pageX - progression.touches[1].pageX);
			scale += (event.touches[0].pageY - event.touches[1].pageY) / (progression.touches[0].pageY - progression.touches[1].pageY);
			scale = scale - 2;
			// get the gesture parameters
			this.config.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			// update the current position
			this.gestureProgression = {
				'touches' : [
					{ 'pageX' : event.touches[0].pageX, 'pageY' : event.touches[0].pageY },
					{ 'pageX' : event.touches[1].pageX, 'pageY' : event.touches[1].pageY }
				]
			};
		}
	};

	this.endFallback = function () {
		// note the start position
		this.gestureOrigin = null;
	};

	this.changeWheel = function (event) {
		// measure the wheel distance
		var scale = 1, distance = ((window.event) ? window.event.wheelDelta / 120 : -event.detail / 3);
		// get the coordinates from the event
		var coords = this.parent.readEvent(event);
		// equate wheeling up / down to zooming in / out
		scale = (distance > 0) ? +this.config.increment : scale = -this.config.increment;
		// report the zoom
		this.config.pinch({
			'x' : coords.x,
			'y' : coords.y,
			'scale' : scale,
			'event' : event,
			'source' : event.target || event.srcElement
		});
	};

	// GESTURE EVENTS

	this.onStartGesture = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.startGesture(event);
			_this.changeGesture(event);
		};
	};

	this.onChangeGesture = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.changeGesture(event);
		};
	};

	this.onEndGesture = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// handle the event
			_this.endGesture(event);
		};
	};

	// FALLBACK EVENTS

	this.onStartFallback = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			//_this.cancelGesture(event);
			// handle the event
			_this.startFallback(event);
			_this.changeFallback(event);
		};
	};

	this.onChangeFallback = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.changeFallback(event);
		};
	};

	this.onEndFallback = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// handle the event
			_this.endGesture(event);
		};
	};

	// MOUSE EVENTS

	this.onChangeWheel = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.changeWheel(event);
		};
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures.Multi;
}

/*
	Source:
	van Creij, Maurice (2014). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Gestures = useful.Gestures || function () {};

// extend the constructor
useful.Gestures.prototype.Single = function (parent) {

	// PROPERTIES

	"use strict";
	this.parent = parent;
	this.config = parent.config;
	this.element = parent.config.element;
	this.lastTouch = null;
	this.touchOrigin = null;
	this.touchProgression = null;

	// METHODS

	this.init = function () {
		// set the required events for mouse
		this.element.addEventListener('mousedown', this.onStartTouch());
		this.element.addEventListener('mousemove', this.onChangeTouch());
		document.body.addEventListener('mouseup', this.onEndTouch());
		// set the required events for touch
		this.element.addEventListener('touchstart', this.onStartTouch());
		this.element.addEventListener('touchmove', this.onChangeTouch());
		document.body.addEventListener('touchend', this.onEndTouch());
		this.element.addEventListener('mspointerdown', this.onStartTouch());
		this.element.addEventListener('mspointermove', this.onChangeTouch());
		document.body.addEventListener('mspointerup', this.onEndTouch());
		// return the object
		return this;
	};

	this.cancelTouch = function (event) {
		if (this.config.cancelTouch) {
			event = event || window.event;
			event.preventDefault();
		}
	};

	this.startTouch = function (event) {
		// if the functionality wasn't paused
		if (!this.parent.paused) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// note the start position
			this.touchOrigin = {
				'x' : coords.x,
				'y' : coords.y,
				'target' : event.target || event.srcElement
			};
			this.touchProgression = {
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y
			};
		}
	};

	this.changeTouch = function (event) {
		// if there is an origin
		if (this.touchOrigin) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// get the gesture parameters
			this.config.drag({
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y,
				'horizontal' : coords.x - this.touchProgression.x,
				'vertical' : coords.y - this.touchProgression.y,
				'event' : event,
				'source' : this.touchOrigin.target
			});
			// update the current position
			this.touchProgression = {
				'x' : coords.x,
				'y' : coords.y
			};
		}
	};

	this.endTouch = function (event) {
		// if the numbers are valid
		if (this.touchOrigin && this.touchProgression) {
			// calculate the motion
			var distance = {
				'x' : this.touchProgression.x - this.touchOrigin.x,
				'y' : this.touchProgression.y - this.touchOrigin.y
			};
			// if there was very little movement, but this is the second touch in quick successionif (
			if (
				this.lastTouch &&
				Math.abs(this.touchOrigin.x - this.lastTouch.x) < 10 &&
				Math.abs(this.touchOrigin.y - this.lastTouch.y) < 10 &&
				new Date().getTime() - this.lastTouch.time < 500 &&
				new Date().getTime() - this.lastTouch.time > 100
			) {
				// treat this as a double tap
				this.config.doubleTap({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'event' : event, 'source' : this.touchOrigin.target});
			// if the horizontal motion was the largest
			} else if (Math.abs(distance.x) > Math.abs(distance.y)) {
				// if there was a right swipe
				if (distance.x > this.config.threshold) {
					// report the associated swipe
					this.config.swipeRight({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.x, 'event' : event, 'source' : this.touchOrigin.target});
				// else if there was a left swipe
				} else if (distance.x < -this.config.threshold) {
					// report the associated swipe
					this.config.swipeLeft({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.x, 'event' : event, 'source' : this.touchOrigin.target});
				}
			// else
			} else {
				// if there was a down swipe
				if (distance.y > this.config.threshold) {
					// report the associated swipe
					this.config.swipeDown({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.y, 'event' : event, 'source' : this.touchOrigin.target});
				// else if there was an up swipe
				} else if (distance.y < -this.config.threshold) {
					// report the associated swipe
					this.config.swipeUp({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.y, 'event' : event, 'source' : this.touchOrigin.target});
				}
			}
			// store the history of this touch
			this.lastTouch = {
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y,
				'time' : new Date().getTime()
			};
		}
		// clear the input
		this.touchProgression = null;
		this.touchOrigin = null;
	};

	// TOUCH EVENTS

	this.onStartTouch = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// handle the event
			_this.startTouch(event);
			_this.changeTouch(event);
		};
	};

	this.onChangeTouch = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// optionally cancel the default behaviour
			_this.cancelTouch(event);
			// handle the event
			_this.changeTouch(event);
		};
	};

	this.onEndTouch = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// handle the event
			_this.endTouch(event);
		};
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures.Single;
}

/*
	Source:
	van Creij, Maurice (2014). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Gestures = useful.Gestures || function () {};

// extend the constructor
useful.Gestures.prototype.init = function (config) {

	// PROPERTIES
	
	"use strict";

	// METHODS
	
	this.only = function (config) {
		// start an instance of the script
		return new this.Main(config, this).init();
	};
	
	this.each = function (config) {
		var _config, _context = this, instances = [];
		// for all element
		for (var a = 0, b = config.elements.length; a < b; a += 1) {
			// clone the configuration
			_config = Object.create(config);
			// insert the current element
			_config.element = config.elements[a];
			// delete the list of elements from the clone
			delete _config.elements;
			// start a new instance of the object
			instances[a] = new this.Main(_config, _context).init();
		}
		// return the instances
		return instances;
	};

	// START

	return (config.elements) ? this.each(config) : this.only(config);

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures;
}

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
if (typeof module !== 'undefined') {
	exports = module.exports = Zoom;
}

// extend the class
Zoom.prototype.Controls = function(context) {

	// PROPERTIES

	this.context = null;
	this.config = null;

	this.element = null;
	this.zoomIn = null;
	this.zoomOut = null;

	// METHODS

	this.init = function(context) {
		// store the context
		this.context = context;
		this.config = context.config;
		// create a controls
		this.element = document.createElement('menu');
		this.element.className = 'useful-zoom-controls';
		// add the zoom in button
		this.zoomIn = document.createElement('button');
		this.zoomIn.className = 'useful-zoom-in enabled';
		this.zoomIn.innerHTML = 'Zoom In';
		this.zoomIn.addEventListener('touchstart', this.onSuspendTouch.bind(this));
		this.zoomIn.addEventListener('mousedown', this.onSuspendTouch.bind(this));
		this.zoomIn.addEventListener('touchend', this.onZoom.bind(this, 1.5));
		this.zoomIn.addEventListener('mouseup', this.onZoom.bind(this, 1.5));
		this.element.appendChild(this.zoomIn);
		// add the zoom out button
		this.zoomOut = document.createElement('button');
		this.zoomOut.className = 'useful-zoom-out disabled';
		this.zoomOut.innerHTML = 'Zoom Out';
		this.zoomOut.addEventListener('touchstart', this.onSuspendTouch.bind(this));
		this.zoomOut.addEventListener('mousedown', this.onSuspendTouch.bind(this));
		this.zoomOut.addEventListener('touchend', this.onZoom.bind(this, 0.75));
		this.zoomOut.addEventListener('mouseup', this.onZoom.bind(this, 0.75));
		this.element.appendChild(this.zoomOut);
		// add the controls to the parent
		this.context.element.appendChild(this.element);
		// return the object
		return this;
	};

	this.redraw = function() {
		var zoomIn = this.zoomIn,
			zoomOut = this.zoomOut,
			dimensions = this.config.dimensions,
			transformation = this.config.transformation;
		// disable the zoom in button at max zoom
		zoomIn.className = (transformation.zoom < dimensions.maxZoom)
			? zoomIn.className.replace('disabled', 'enabled')
			: zoomIn.className.replace('enabled', 'disabled');
		// disable the zoom out button at min zoom
		zoomOut.className = (transformation.zoom > 1)
			? zoomOut.className.replace('disabled', 'enabled')
			: zoomOut.className.replace('enabled', 'disabled');
	};

	// EVENTS

	this.onZoom = function(factor) {
		// cancel the click
		event.preventDefault();
		// restore the touch events
		this.context.gestures(true);
		// apply the zoom factor
		var transformation = this.config.transformation,
			dimensions = this.config.dimensions;
		// apply the zoom factor to the transformation
		transformation.zoom = Math.max(Math.min(transformation.zoom * factor, dimensions.maxZoom), 1);
		// redraw
		this.context.redraw();
	};

	this.onSuspendTouch = function() {
		// cancel the click
		event.preventDefault();
		// suspend touch events
		this.context.gestures(false);
	};

	this.init(context);

};

// extend the class
Zoom.prototype.Main = function(context) {

	// PROPERTIES

	this.context = null;
	this.config = null;
	this.element = null;

	// METHODS

	this.init = function(context) {
		// store the context
		this.context = context;
		this.config = context.config;
		this.element = context.config.element;
		// apply the transformation
		this.config.transformation = {
			'left': 0.5,
			'top': 0.5,
			'zoom': 1,
			'rotate': 0
		};
		this.config.dimensions = {
			'width': null,
			'height': null,
			'maxWidth': null,
			'maxHeight': null
		};
		// create the components
		this.styling = new this.context.Styling(this);
		this.overlay = new this.context.Overlay(this);
		this.controls = new this.context.Controls(this);
		this.touch = new this.context.Touch(this);
		// first redraw
		this.redraw();
		// return the object
		return this;
	};

	this.redraw = function() {
		// measure the dimensions, maximum zoom and aspect ratio
		this.styling.measure();
		// redraw the controls
		this.controls.redraw();
		// redraw the overlay
		this.overlay.redraw();
	};

	this.update = function() {
		// redraw the controls
		this.controls.redraw();
	};

	this.gestures = function(status) {
		// enable or disable the touch controls
		this.touch.pause(!status);
	};

	this.transitions = function(status) {
		// enable or disable the transitions on the overlays
		this.overlay.transitions(status);
	};

	// PUBLIC

	this.transform = function(transformation) {
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

	this.moveBy = function(x, y) {
		this.moveTo(this.config.transformation.left - x, this.config.transformation.top - y);
	};

	this.moveTo = function(x, y) {
		// apply the translation
		this.config.transformation.left = x;
		this.config.transformation.top = y;
		// apply the limits
		this.config.transformation.left = Math.max(Math.min(this.config.transformation.left, 1), 0);
		this.config.transformation.top = Math.max(Math.min(this.config.transformation.top, 1), 0);
		// redraw the display
		this.overlay.redraw();
	};

	this.zoomBy = function(z) {
		this.zoomTo(this.config.transformation.zoom + z);
	};

	this.zoomTo = function(z) {
		// apply the translation
		this.config.transformation.zoom = z;
		// apply the limits
		this.config.transformation.zoom = Math.max(Math.min(this.config.transformation.zoom, this.config.dimensions.maxZoom), 1);
		// redraw the display
		this.overlay.redraw();
	};

	this.rotateBy = function(r) {
		this.rotateTo(this.config.transformation.rotate + r);
	};

	this.rotateTo = function(r) {
		// apply the translation
		this.config.transformation.rotate += r;
		// apply the limits
		this.config.transformation.rotate = Math.max(Math.min(this.config.transformation.rotate, 359), 0);
		// redraw the display
		this.overlay.redraw();
	};

	// EVENTS

	this.init(context);

};

// extend the class
Zoom.prototype.Overlay = function(context) {

	// PROPERTIES

	this.context = null;
	this.config = null;
	this.root = null;

	this.element = null;
	this.timeout = null;
	this.tiles = {};
	this.index = 0;
	this.updated = 0;

	// METHODS

	this.init = function(context) {
		// store the context
		this.context = context;
		this.config = context.config;
		this.root = context.context;
		// reset the area
		this.config.area = {};
		// get the original image
		var image = this.context.element.getElementsByTagName('img')[0];
		// create an overlay
		this.element = document.createElement('div');
		this.element.className = 'useful-zoom-overlay';
		// add the image as a background
		this.element.style.backgroundImage = 'url(' + image.getAttribute('src') + ')';
		// put the overlay into the parent object
		this.context.element.appendChild(this.element);
		// hide the original image
		image.style.visibility = 'hidden';
		// return the object
		return this;
	};

	this.redraw = function() {
		// get the transformation settings from the parent object
		var transformation = this.config.transformation;
		// if the last redraw occurred sufficiently long ago
		var updated = new Date().getTime();
		if (updated - this.updated > 20) {
			// store the time of this redraw
			this.updated = updated;
			// formulate a css transformation
			var styleTransform = 'scale(' + transformation.zoom + ', ' + transformation.zoom + ') rotate(' + transformation.rotate + 'deg)';
			var styleOrigin = (transformation.left * 100) + '% ' + (transformation.top * 100) + '%';
			// re-centre the origin
			this.element.style.msTransformOrigin = styleOrigin;
			this.element.style.WebkitTransformOrigin = styleOrigin;
			this.element.style.transformOrigin = styleOrigin;
			// implement the style
			this.element.style.msTransform = styleTransform;
			this.element.style.WebkitTransform = styleTransform;
			this.element.style.transform = styleTransform;
		}
		// repopulate the tiles after interaction stops
		clearTimeout(this.timeout);
		this.timeout = setTimeout(this.update.bind(this), 300);
	};

	this.update = function() {
		// update the parent
		this.context.update();
		// recalculate the visible area
		this.measure();
		// clean out the older tiles
		this.clean();
		// populate with new tile
		this.populate();
	};

	this.measure = function() {
		// get the desired transformation
		var transformation = this.config.transformation,
			area = this.config.area;
		// calculate the visible area
		area.size = 1 / transformation.zoom;
		area.left = Math.max(transformation.left - area.size / 2, 0);
		area.top = Math.max(transformation.top - area.size / 2, 0);
		area.right = Math.min(area.left + area.size, 1);
		area.bottom = Math.min(area.top + area.size, 1);
	};

	this.clean = function() {
		// for all existing tiles
		for (var name in this.tiles) {
			if (this.tiles.hasOwnProperty(name)) {
				// redraw the tile
				this.tiles[name].redraw();
			}
		}
	};

	this.populate = function() {
		// get the component's dimensions
		var dimensions = this.config.dimensions,
			transformation = this.config.transformation,
			area = this.config.area;
		// calculate the grid size at this magnification
		var cols = dimensions.width * transformation.zoom / this.config.tileSize,
			rows = dimensions.height * transformation.zoom / this.config.tileSize,
			zoom = Math.ceil(transformation.zoom),
			startCol = Math.max(Math.floor(area.left * cols) - 1, 0),
			endCol = Math.min(Math.ceil(area.right * cols) + 1, cols),
			startRow = Math.max(Math.floor(area.top * rows) - 1, 0),
			endRow = Math.min(Math.ceil(area.bottom * rows) + 1, rows),
			tileName;
		// for every row of the grid
		for (var row = startRow; row < endRow; row += 1) {
			// for every column in the row
			for (var col = startCol; col < endCol; col += 1) {
				// formulate the name this tile should have (tile_x_y_z)
				tileName = 'tile_' + col + '_' + row + '_' + zoom;
				// if this is a new tile
				if (this.tiles[tileName] === undefined) {
					// create a new tile with the name and dimensions (name,index,zoom,left,top,right,bottom)
					this.tiles[tileName] = new this.root.Tile(this, {
						'name': tileName,
						'index': this.index,
						'zoom': zoom,
						'left': col / cols,
						'top': row / rows,
						'right': 1 - (col + 1) / cols,
						'bottom': 1 - (row + 1) / rows
					});
					// increase the tile count
					this.index += 1;
				}
			}
		}
	};

	this.transitions = function(status) {
		this.element.className = (status)
			? this.element.className + ' useful-zoom-transition'
			: this.element.className.replace(/useful-zoom-transition| useful-zoom-transition/g, '');
	};

	// EVENTS

	this.init(context);

};

// extend the class
Zoom.prototype.Styling = function(context) {

	// PROPERTIES

	this.context = null;
	this.config = null;
	this.element = null;

	// METHODS

	this.init = function(context) {
		// store the context
		this.context = context;
		this.config = context.config;
		this.element = context.element;
		// create a custom stylesheet
		var style = document.createElement("style");
		if (navigator.userAgent.match(/webkit/gi)) {
			style.appendChild(document.createTextNode(""));
		}
		document.body.appendChild(style);
		var sheet = style.sheet || style.styleSheet;
		// add the custom styles
		if (sheet.insertRule) {
			if (this.config.colorPassive) {
				sheet.insertRule(".useful-zoom-controls button {background-color : " + this.config.colorPassive + " !important;}", 0);
			}
			if (this.config.colorHover) {
				sheet.insertRule(".useful-zoom-controls button:hover, .useful-zoom button:active {background-color : " + this.config.colorHover + " !important;}", 0);
			}
			if (this.config.colorDisabled) {
				sheet.insertRule(".useful-zoom-controls button.disabled, .useful-zoom-controls button.disabled:hover {background-color : " + this.config.colorDisabled + " !important;}", 0);
			}
		} else {
			if (this.config.colorPassive) {
				sheet.addRule(".useful-zoom-controls button", "background-color : " + this.config.colorPassive + " !important;", 0);
			}
			if (this.config.colorHover) {
				sheet.addRule(".useful-zoom-controls button:hover, .useful-zoom button:active", "background-color : " + this.config.colorHover + " !important;", 0);
			}
			if (this.config.colorDisabled) {
				sheet.addRule(".useful-zoom-controls button.disabled, .useful-zoom-controls button.disabled:hover", "background-color : " + this.config.colorDisabled + " !important;", 0);
			}
		}
		// return the object
		return this;
	};

	this.measure = function() {
		// get the original link
		var link = this.element.getElementsByTagName('a')[0];
		// store the image source
		this.config.tileUrl = link.getAttribute('href');
		// store the starting dimensions
		this.config.dimensions.width = this.element.offsetWidth;
		this.config.dimensions.height = this.element.offsetHeight;
		// store the maximum dimensions
		this.config.dimensions.maxWidth = parseInt(link.getAttribute('data-width'));
		this.config.dimensions.maxHeight = parseInt(link.getAttribute('data-height'));
		this.config.dimensions.maxZoom = this.config.dimensions.maxWidth / this.config.dimensions.width;
	};

	// EVENTS

	this.init(context);

};

// extend the class
Zoom.prototype.Tile = function(context, properties) {

	// PROPERTIES

	this.context = null;
	this.config = null;

	this.element = null;
	this.name = null;
	this.index = null;
	this.zoom = null;
	this.left = null;
	this.top = null;
	this.right = null;
	this.bottom = null;

	// METHODS

	this.init = function(context, properties) {
		// store the context
		this.context = context;
		this.config = context.config;
		// update the properties
		this.name = properties.name;
		this.index = properties.index;
		this.zoom = properties.zoom;
		this.left = properties.left;
		this.top = properties.top;
		this.right = properties.right;
		this.bottom = properties.bottom;
		// adjust if the tile is across the right edge and not square
		var rightCor = 1;
		if (this.right > 1) {
			rightCor = 1 - this.left / this.right - this.left;
			this.right = 1;
		}
		// adjust if the tile is across the bottom edge and not square
		var bottomCor = 1;
		if (this.bottom > 1) {
			bottomCor = 1 - this.top / this.bottom - this.top;
			this.bottom = 1;
		}
		// create an image of the specified dimensions
		this.element = document.createElement('div');
		this.element.id = this.name;
		this.element.style.position = 'absolute';
		this.element.style.left = (this.left * 100) + '%';
		this.element.style.top = (this.top * 100) + '%';
		this.element.style.right = (this.right * 100) + '%';
		this.element.style.bottom = (this.bottom * 100) + '%';
		this.element.style.backgroundSize = '100% 100%';
		this.element.style.zIndex = this.zoom;
		// construct the url of the tile
		this.element.style.backgroundImage = 'url(' + this.config.tileSource.replace('{src}', this.config.tileUrl).replace('{left}', this.left).replace('{top}', this.top).replace('{right}', 1 - this.right).replace('{bottom}', 1 - this.bottom).replace('{width}', Math.round(this.config.tileSize * rightCor)).replace('{height}', Math.round(this.config.tileSize * bottomCor)) + ')';
		// add the tile to the layer
		this.context.element.appendChild(this.element);
		// return the object
		return this;
	};

	this.redraw = function() {
		var area = this.config.area;
		// if the index of the tile is too low
		if (this.index < this.context.index - this.config.tileCache) {
			// remove the tile
			this.remove();
			// if it exists within the visible area and at the zoom level
		} else if ((this.right >= area.left || this.left <= area.right) && (this.bottom >= area.top || this.top <= area.bottom)) {
			// show the tile
			this.show();
			// else
		} else {
			// hide the tile
			this.hide();
		}
	};

	this.remove = function() {
		// remove the tile
		this.element.parentNode.removeChild(this.element);
		// remove  the reference
		delete this.context.tiles[this.name];
	};

	this.show = function() {
		// show the tile
		this.element.style.display = 'block';
	};

	this.hide = function() {
		// hide the tile
		this.element.style.display = 'none';
	};

	// EVENTS

	this.init(context, properties);

};

// extend the class
Zoom.prototype.Touch = function(context) {

	// PROPERTIES

	this.context = null;
	this.config = null;
	this.element = null;

	// METHODS

	this.init = function(context) {
		// store the context
		this.context = context;
		this.config = context.config;
		this.element = context.element;
		// make the dimensions update themselves upon resize
		window.addEventListener('resize', this.onResize.bind(this));
		// add touch event handlers
		this.gestures = new useful.Gestures().init({
			'element': this.element,
			'threshold': 50,
			'increment': 0.1,
			'cancelTouch': true,
			'cancelGesture': true,
			'swipeLeft': function(coords) {},
			'swipeUp': function(coords) {},
			'swipeRight': function(coords) {},
			'swipeDown': function(coords) {},
			'drag': this.onDrag.bind(this),
			'pinch': this.onPinch.bind(this),
			'twist': (this.config.allowRotation)
				? this.onTwist.bind(this)
				: function() {},
			'doubleTap': this.onDoubleTap.bind(this)
		});
		// cancel transitions afterwards
		this.element.addEventListener('transitionEnd', this.afterTransitions.bind(this));
		this.element.addEventListener('webkitTransitionEnd', this.afterTransitions.bind(this));
		// return the object
		return this;
	};

	this.pause = function(status) {
		// pause or unpause the touch controls
		this.gestures.paused = status;
	};

	// EVENTS

	this.onResize = function() {
		// redraw the display
		this.context.redraw();
	};

	this.onDrag = function(coords) {
		// calculate the translation
		this.context.moveBy(coords.horizontal / this.config.dimensions.width / this.config.transformation.zoom, coords.vertical / this.config.dimensions.height / this.config.transformation.zoom);
	};

	this.onPinch = function(coords) {
		// calculate the magnification
		this.context.zoomBy(coords.scale * this.config.transformation.zoom);
	};

	this.onTwist = function(coords) {
		// calculate the rotation
		this.context.rotateBy(coords.rotation);
	};

	this.onDoubleTap = function(coords) {
		coords.event.preventDefault();
		// calculate the zoom
		this.context.transform({
			'left': (coords.x / this.config.dimensions.width - 0.5) / this.config.transformation.zoom + this.config.transformation.left,
			'top': (coords.y / this.config.dimensions.height - 0.5) / this.config.transformation.zoom + this.config.transformation.top,
			'zoom': this.config.transformation.zoom * 1.5
		});
	};

	this.afterTransitions = function() {
		this.context.transitions(false);
	};

	this.init(context);

};
