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
		'tileSource': 'php/imageslice.php?src={src}&left={left}&top={top}&right={right}&bottom={bottom}&width={width}&height={height}',
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
if (typeof define != 'undefined') define([], function () { return Zoom });
if (typeof module != 'undefined') module.exports = Zoom;

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
