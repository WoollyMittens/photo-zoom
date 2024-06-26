export class PhotoZoomTile {
	constructor(context, properties) {
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
	}

	redraw() {
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
	}

	remove() {
		// remove the tile
		this.element.parentNode.removeChild(this.element);
		// remove  the reference
		delete this.context.tiles[this.name];
	}

	show() {
		// show the tile
		this.element.style.display = 'block';
	}

	hide() {
		// hide the tile
		this.element.style.display = 'none';
	}
}
