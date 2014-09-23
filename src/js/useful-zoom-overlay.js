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

	useful.Zoom_Overlay = function (parent) {

		// PROPERTIES

		this.parent = parent;
		this.model = parent.model;

		this.element = null;
		this.timeout = null;
		this.tiles = {};
		this.index = 0;
		this.updated = 0;
		this.model.area = {};

		// METHODS

		this.start = function () {
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
		};
		this.redraw = function () {
			// get the transformation settings from the parent object
			var _this = this, transformation = this.model.transformation;
			// if the last redraw occurred sufficiently long ago
			var updated = new Date().getTime();
			if (updated - this.updated > 20) {
				// store the time of this redraw
				this.updated = updated;
				// formulate a css transformation
				var styleTransform = 'scaleX(' + transformation.zoom +') scaleY(' + transformation.zoom +') rotateZ(' + transformation.rotate + 'deg)';
				var styleOrigin = (transformation.left * 100) + '% ' + (transformation.top * 100) + '%';
				// re-centre the origin
				this.element.style.WebkitTransformOrigin = styleOrigin;
				this.element.style.transformOrigin = styleOrigin;
				// implement the style
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
			var transformation = this.model.transformation,
				area = this.model.area;
			// report the transformation
			console.log('transformation:', transformation);
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
			var dimensions = this.model.dimensions,
				transformation = this.model.transformation,
				area = this.model.area;
			// calculate the grid size at this magnification
			var cols = dimensions.width * transformation.zoom / this.model.tileSize,
				rows = dimensions.height * transformation.zoom / this.model.tileSize,
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
						this.tiles[tileName] = new useful.Zoom_Tile(this, {
							'name' : tileName,
							'index' : this.index,
							'zoom' : zoom,
							'left' : col / cols,
							'top' : row / rows,
							'right' : 1 - (col + 1) / cols,
							'bottom' : 1 - (row + 1) / rows
						});
						// increase the tile count
						this.index += 1;
					}
				}
			}
		};

		// STARTUP

		this.start();

	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Zoom_Overlay;
	}

})();
