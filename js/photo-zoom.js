import { PhotoZoomOverlay } from './photo-zoom-overlay.js';
import { PhotoZoomControls } from './photo-zoom-controls.js';
import { PhotoZoomTouch } from './photo-zoom-touch.js';

export class PhotoZoom {
	constructor(config) {
		// store the config
		this.defaults = {
			'element': document.querySelector('.photo-zoom'),
			'tileSource': 'php/imageslice.php?src={src}&left={left}&top={top}&right={right}&bottom={bottom}&width={width}&height={height}',
			'tileCache': 128,
			'tileSize': 128,
			'allowRotation': false
		};
		this.config = {...this.defaults, ...config};
		this.element = this.config.element;
		// add the default transformation
		this.init();
		// create the components
		this.overlay = new PhotoZoomOverlay(this);
		this.controls = new PhotoZoomControls(this);
		this.touch = new PhotoZoomTouch(this);
		// first redraw
		this.redraw();
	}

	init() {
		// get the link to the full size image
		const link = this.element.querySelector('a');
		this.config.tileUrl = link.getAttribute('href');
		// set the intial transformation
		this.config.transformation = {
			'left': 0.5,
			'top': 0.5,
			'zoom': 1,
			'rotate': 0
		};
		// set the initial dimensions
		this.config.dimensions = {
			'width': this.element.offsetWidth,
			'height': this.element.offsetHeight,
			'maxWidth': parseInt(link.getAttribute('data-width')),
			'maxHeight': parseInt(link.getAttribute('data-height'))
		};
		// calculate the maximum zoom factor
		this.config.dimensions.maxZoom = this.config.dimensions.maxWidth / this.config.dimensions.width;
		console.log('this.config.dimensions.maxZoom', this.config.dimensions.maxZoom);
	}

	redraw() {
		// measure the dimensions
		this.config.dimensions.width = this.element.offsetWidth;
		this.config.dimensions.height = this.element.offsetHeight;
		this.config.dimensions.maxZoom = this.config.dimensions.maxWidth / this.config.dimensions.width;
		// redraw the controls
		this.controls.redraw();
		// redraw the overlay
		this.overlay.redraw();
	}

	update() {
		// redraw the controls
		this.controls.redraw();
	}

	gestures(status) {
		// enable or disable the touch controls
		this.touch.pause(!status);
	}

	transitions(status) {
		// enable or disable the transitions on the overlays
		this.overlay.transitions(status);
	}

	transform(transformation) {
		// apply the transformation
		this.config.transformation.left = Math.max(Math.min(transformation.left, 1), 0) || this.config.transformation.left;
		this.config.transformation.top = Math.max(Math.min(transformation.top, 1), 0) || this.config.transformation.top;
		this.config.transformation.zoom = Math.max(Math.min(transformation.zoom, this.config.dimensions.maxZoom), 1) || this.config.transformation.zoom;
		this.config.transformation.rotate = Math.max(Math.min(transformation.rotate, 359), 0) || this.config.transformation.rotate;
		// activate the transition
		this.overlay.transitions(true);
		// trigger the transformation
		setTimeout(this.redraw.bind(this), 0);
	}

	moveBy(x, y) {
		this.moveTo(this.config.transformation.left - x, this.config.transformation.top - y);
	}

	moveTo(x, y) {
		// apply the translation
		this.config.transformation.left = x;
		this.config.transformation.top = y;
		// apply the limits
		this.config.transformation.left = Math.max(Math.min(this.config.transformation.left, 1), 0);
		this.config.transformation.top = Math.max(Math.min(this.config.transformation.top, 1), 0);
		// redraw the display
		this.overlay.redraw();
	}

	zoomBy(z) {
		this.zoomTo(this.config.transformation.zoom + z);
	}

	zoomTo(z) {
		// apply the translation
		this.config.transformation.zoom = z;
		// apply the limits
		this.config.transformation.zoom = Math.max(Math.min(this.config.transformation.zoom, this.config.dimensions.maxZoom), 1);
		// redraw the display
		this.overlay.redraw();
	}

	rotateBy(r) {
		this.rotateTo(this.config.transformation.rotate + r);
	};

	rotateTo(r) {
		// apply the translation
		this.config.transformation.rotate += r;
		// apply the limits
		this.config.transformation.rotate = Math.max(Math.min(this.config.transformation.rotate, 359), 0);
		// redraw the display
		this.overlay.redraw();
	}

}

window.PhotoZoom = PhotoZoom;
