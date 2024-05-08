import { Gestures } from '../lib/gestures.js';

export class PhotoZoomTouch {
	constructor(context) {
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
	}

	pause(status) {
		// pause or unpause the touch controls
		this.gestures.paused = status;
	}

	onResize() {
		// redraw the display
		this.context.redraw();
	}

	onDrag(coords) {
		// calculate the translation
		this.context.moveBy(
			coords.horizontal / this.config.dimensions.width / this.config.transformation.zoom, 
			coords.vertical / this.config.dimensions.height / this.config.transformation.zoom
		);
	}

	onPinch(coords) {
		// calculate the magnification
		this.context.zoomBy(coords.scale * this.config.transformation.zoom);
	}

	onTwist(coords) {
		// calculate the rotation
		this.context.rotateBy(coords.rotation);
	}

	onDoubleTap(coords) {
		coords.event.preventDefault();
		// calculate the zoom
		this.context.transform({
			'left': (coords.x / this.config.dimensions.width - 0.5) / this.config.transformation.zoom + this.config.transformation.left,
			'top': (coords.y / this.config.dimensions.height - 0.5) / this.config.transformation.zoom + this.config.transformation.top,
			'zoom': this.config.transformation.zoom * 1.5
		});
	}

	afterTransitions() {
		this.context.transitions(false);
	}
}
