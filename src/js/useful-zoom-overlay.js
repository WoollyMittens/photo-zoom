/*
	Source:
	van Creij, Maurice (2014). "useful.zoom.js: Pan and Zoom an Image", version 20140528, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	"use strict";

	useful.Zoom_Overlay = function (parent) {

		// PROPERTIES

		this.parent = parent;
		this.cfg = parent.cfg;
		this.obj = null;
		this.timeout = null;
		this.tiles = {};
		this.index = 0;
		this.area = {};

		// METHODS

		this.start = function () {
			// get the original image
			var image = this.parent.obj.getElementsByTagName('img')[0];
			// create an overlay
			this.obj = document.createElement('div');
			this.obj.className = 'useful-zoom-overlay';
			// add the image as a background
			this.obj.style.backgroundImage = 'url(' + image.getAttribute('src') + ')';
			// put the overlay into the parent object
			this.parent.obj.appendChild(this.obj);
			// hide the original image
			image.style.visibility = 'hidden';
		};
		this.redraw = function () {
			// get the transformation settings from the parent object
			var _this = this, transformation = this.parent.transformation;
			// if the last redraw occurred sufficiently long ago
			var updated = new Date().getTime();
			if (updated - this.parent.updated > 20) {
				// store the time of this redraw
				this.parent.updated = updated;
				// formulate a css transformation
				var styleTransform = 'scaleX(' + transformation.zoom +') scaleY(' + transformation.zoom +') rotateZ(' + transformation.rotate + 'deg)';
				var styleOrigin = (transformation.left * 100) + '% ' + (transformation.top * 100) + '%';
				// re-centre the origin
				this.obj.style.WebkitTransformOrigin = styleOrigin;
				this.obj.style.transformOrigin = styleOrigin;
				// implement the style
				this.obj.style.WebkitTransform = styleTransform;
				this.obj.style.transform = styleTransform;
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
			var transformation = this.parent.transformation;
			// report the transformation
			console.log('transformation:', transformation);
			// calculate the visible area
			this.area.size = 1 / transformation.zoom;
			this.area.left = Math.max(transformation.left - this.area.size / 2, 0);
			this.area.top = Math.max(transformation.top - this.area.size / 2, 0);
			this.area.right = Math.min(this.area.left + this.area.size, 1);
			this.area.bottom = Math.min(this.area.top + this.area.size, 1);
			// report the visible area
			console.log('visible area: ', this.area);
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
			var dimensions = this.parent.dimensions,
				transformation = this.parent.transformation,
				cfg = this.parent.cfg;
			// calculate the grid size at this magnification
			var cols = dimensions.width * transformation.zoom / cfg.tileSize,
				rows = dimensions.height * transformation.zoom / cfg.tileSize,
				zoom = Math.ceil(transformation.zoom),
				startCol = Math.floor(this.area.left * cols),
				endCol = Math.ceil(this.area.right * cols),
				startRow = Math.floor(this.area.top * rows),
				endRow = Math.ceil(this.area.bottom * rows),
				tileName;
			// report the grid properties
			console.log('grid - cols:', cols, startCol, endCol);
			console.log('grid - rows:', rows, startRow, endRow);
			// for every row of the grid
			for (var row = startRow; row < endRow; row += 1) {
				// for every column in the row
				for (var col = startCol; col < endCol; col += 1) {
					// formulate the name this tile should have (tile_x_y_z)
					tileName = 'tile_' + col + '_' + row + '_' + zoom;
					// if this is a new tile
					if (this.tiles[tileName] === undefined) {
						// create a new tile with the name and dimensions (name,index,zoom,left,top,right,bottom)
						console.log('create tile:' + tileName);
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

}(window.useful = window.useful || {}));
