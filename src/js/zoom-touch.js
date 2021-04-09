// EXTENDS

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
		this.gestures = new Gestures({
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
