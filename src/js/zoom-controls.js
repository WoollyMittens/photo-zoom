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
