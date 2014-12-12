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
useful.Zoom.prototype.Overlay = function (parent) {

	// PROPERTIES

	"use strict";
	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	this.element = null;
	this.timeout = null;
	this.tiles = {};
	this.index = 0;
	this.updated = 0;
	this.config.area = {};

	// METHODS

	this.init = function () {
		// get the original image
		var image = this.parent.element.getElementsByTagName('img')[0];
		// create an overlay
		this.element = document.createElement('div');
		this.element.className = 'useful-zoom-overlay';
		// add the image as a background
		this.element.style.backgroundImage = 'url(' + image.getAttribute('src') + ')';
		// put the overlay into the parent object
		this.parent.element.appendChild(this.element);
		// hide the original image
		image.style.visibility = 'hidden';
		// return the object
		return this;
	};

	this.redraw = function () {
		// get the transformation settings from the parent object
		var _this = this, transformation = this.config.transformation;
		// if the last redraw occurred sufficiently long ago
		var updated = new Date().getTime();
		if (updated - this.updated > 20) {
			// store the time of this redraw
			this.updated = updated;
			// formulate a css transformation
			var styleTransform = 'scale(' + transformation.zoom + ', ' + transformation.zoom +') rotate(' + transformation.rotate + 'deg)';
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
		this.timeout = setTimeout(function () {
			// update the parent
			_this.parent.update();
			// recalculate the visible area
			_this.measure();
			// clean out the older tiles
			_this.clean();
			// populate with new tile
			_this.populate();
		}, 300);
	};

	this.measure = function () {
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

	this.clean = function () {
		// for all existing tiles
		for (var name in this.tiles) {
			if (this.tiles.hasOwnProperty(name)) {
				// redraw the tile
				this.tiles[name].redraw();
			}
		}
	};

	this.populate = function () {
		// get the component's dimensions
		var dimensions = this.config.dimensions,
			transformation = this.config.transformation,
			area = this.config.area;
		// calculate the grid size at this magnification
		var cols = dimensions.width * transformation.zoom / this.config.tileSize,
			rows = dimensions.height * transformation.zoom / this.config.tileSize,
			zoom = Math.ceil(transformation.zoom),
			startCol = Math.max( Math.floor( area.left * cols ) - 1, 0 ),
			endCol = Math.min( Math.ceil( area.right * cols ) + 1, cols ),
			startRow = Math.max( Math.floor( area.top * rows ) - 1, 0 ),
			endRow = Math.min( Math.ceil( area.bottom * rows ) + 1, rows ),
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
					this.tiles[tileName] = new this.context.Tile(this, {
						'name' : tileName,
						'index' : this.index,
						'zoom' : zoom,
						'left' : col / cols,
						'top' : row / rows,
						'right' : 1 - (col + 1) / cols,
						'bottom' : 1 - (row + 1) / rows
					}).init();
					// increase the tile count
					this.index += 1;
				}
			}
		}
	};
	
	this.transitions = function (status) {
		this.element.className = (status) ?
			this.element.className + ' useful-zoom-transition':
			this.element.className.replace(/useful-zoom-transition| useful-zoom-transition/g, '');
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Zoom.Overlay;
}
