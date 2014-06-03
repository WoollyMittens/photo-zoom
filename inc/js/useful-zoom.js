/*
	Source:
	van Creij, Maurice (2012). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	// invoke strict mode
	"use strict";

	// object
	useful.Gestures = function (obj, cfg) {
		// properties
		this.obj = obj;
		this.cfg = cfg;
		this.touchOrigin = null;
		this.touchProgression = null;
		this.gestureOrigin = null;
		this.gestureProgression = null;
		// methods
		this.start = function () {
			// check the configuration properties
			this.checkConfig(this.cfg);
			// set the required events for mouse
			this.obj.addEventListener('mousedown', this.onStartTouch());
			this.obj.addEventListener('mousemove', this.onChangeTouch());
			document.body.addEventListener('mouseup', this.onEndTouch());
			this.obj.addEventListener('mousewheel', this.onChangeWheel());
			if (navigator.userAgent.match(/firefox/gi)) { this.obj.addEventListener('DOMMouseScroll', this.onChangeWheel()); }
			// set the required events for touch
			this.obj.addEventListener('touchstart', this.onStartTouch());
			this.obj.addEventListener('touchmove', this.onChangeTouch());
			document.body.addEventListener('touchend', this.onEndTouch());
			this.obj.addEventListener('mspointerdown', this.onStartTouch());
			this.obj.addEventListener('mspointermove', this.onChangeTouch());
			document.body.addEventListener('mspointerup', this.onEndTouch());
			// set the required events for gestures
			this.obj.addEventListener('gesturestart', this.onStartGesture());
			this.obj.addEventListener('gesturechange', this.onChangeGesture());
			this.obj.addEventListener('gestureend', this.onEndGesture());
			this.obj.addEventListener('msgesturestart', this.onStartGesture());
			this.obj.addEventListener('msgesturechange', this.onChangeGesture());
			this.obj.addEventListener('msgestureend', this.onEndGesture());
			// disable the start function so it can't be started twice
			this.start = function () {};
		};
		this.checkConfig = function (config) {
			// add default values for missing ones
			config.threshold = config.threshold || 50;
			config.increment = config.increment || 0.1;
			// cancel all events by default
			if (config.cancelTouch === undefined || config.cancelTouch === null) { config.cancelTouch = true; }
			if (config.cancelGesture === undefined || config.cancelGesture === null) { config.cancelGesture = true; }
			// add dummy event handlers for missing ones
			config.swipeUp = config.swipeUp || function () {};
			config.swipeLeft = config.swipeLeft || function () {};
			config.swipeRight = config.swipeRight || function () {};
			config.swipeDown = config.swipeDown || function () {};
			config.drag = config.drag || function () {};
			config.pinch = config.pinch || function () {};
			config.twist = config.twist || function () {};
		};
		this.readEvent = function (event) {
			var coords = {}, offsets;
			// try all likely methods of storing coordinates in an event
			if (event.x !== undefined) {
				coords.x = event.x;
				coords.y = event.y;
			} else if (event.touches && event.touches[0]) {
				coords.x = event.touches[0].pageX;
				coords.y = event.touches[0].pageY;
			} else if (event.pageX !== undefined) {
				coords.x = event.pageX;
				coords.y = event.pageY;
			} else {
				offsets = this.correctOffset(event.target || event.srcElement);
				coords.x = event.layerX + offsets.x;
				coords.y = event.layerY + offsets.y;
			}
			return coords;
		};
		this.correctOffset = function (element) {
			var offsetX = 0, offsetY = 0;
			// if there is an offset
			if (element.offsetParent) {
				// follow the offsets back to the right parent element
				while (element !== this.obj) {
					offsetX += element.offsetLeft;
					offsetY += element.offsetTop;
					element = element.offsetParent;
				}
			}
			// return the offsets
			return { 'x' : offsetX, 'y' : offsetY };
		};
		this.cancelTouch = function (event) {
			if (this.cfg.cancelTouch) {
				event = event || window.event;
				event.preventDefault();
			}
		};
		this.startTouch = function (event) {
			// get the coordinates from the event
			var coords = this.readEvent(event);
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
		};
		this.changeTouch = function (event) {
			// if there is an origin
			if (this.touchOrigin) {
				// get the coordinates from the event
				var coords = this.readEvent(event);
				// get the gesture parameters
				this.cfg.drag({
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
				// if the horizontal motion was the largest
				if (Math.abs(distance.x) > Math.abs(distance.y)) {
					// if there was a right swipe
					if (distance.x > this.cfg.threshold) {
						// report the associated swipe
						this.cfg.swipeRight({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.x, 'event' : event, 'source' : this.touchOrigin.target});
					// else if there was a left swipe
					} else if (distance.x < -this.cfg.threshold) {
						// report the associated swipe
						this.cfg.swipeLeft({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.x, 'event' : event, 'source' : this.touchOrigin.target});
					}
				// else
				} else {
					// if there was a down swipe
					if (distance.y > this.cfg.threshold) {
						// report the associated swipe
						this.cfg.swipeDown({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.y, 'event' : event, 'source' : this.touchOrigin.target});
					// else if there was an up swipe
					} else if (distance.y < -this.cfg.threshold) {
						// report the associated swipe
						this.cfg.swipeUp({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.y, 'event' : event, 'source' : this.touchOrigin.target});
					}
				}
			}
			// clear the input
			this.touchProgression = null;
			this.touchOrigin = null;
		};
		this.changeWheel = function (event) {
			// measure the wheel distance
			var scale = 1, distance = ((window.event) ? window.event.wheelDelta / 120 : -event.detail / 3);
			// get the coordinates from the event
			var coords = this.readEvent(event);
			// equate wheeling up / down to zooming in / out
			scale = (distance > 0) ? +this.cfg.increment : scale = -this.cfg.increment;
			// report the zoom
			this.cfg.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale,
				'event' : event,
				'source' : event.target || event.srcElement
			});
		};
		this.cancelGesture = function (event) {
			if (this.cfg.cancelGesture) {
				event = event || window.event;
				event.preventDefault();
			}
		};
		this.startGesture = function (event) {
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
		};
		this.changeGesture = function (event) {
			// if there is an origin
			if (this.gestureOrigin) {
				// get the distances from the event
				var scale = event.scale,
					rotation = event.rotation;
				// get the coordinates from the event
				var coords = this.readEvent(event);
				// get the gesture parameters
				this.cfg.pinch({
					'x' : coords.x,
					'y' : coords.y,
					'scale' : scale - this.gestureProgression.scale,
					'event' : event,
					'target' : this.gestureOrigin.target
				});
				this.cfg.twist({
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
		// touch events
		this.onStartTouch = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// get event object
				event = event || window.event;
				// handle the event
				context.startTouch(event);
				context.changeTouch(event);
			};
		};
		this.onChangeTouch = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// get event object
				event = event || window.event;
				// optionally cancel the default behaviour
				context.cancelTouch(event);
				// handle the event
				context.changeTouch(event);
			};
		};
		this.onEndTouch = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// get event object
				event = event || window.event;
				// handle the event
				context.endTouch(event);
			};
		};
		// mouse wheel events
		this.onChangeWheel = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// get event object
				event = event || window.event;
				// optionally cancel the default behaviour
				context.cancelGesture(event);
				// handle the event
				context.changeWheel(event);
			};
		};
		// gesture events
		this.onStartGesture = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// get event object
				event = event || window.event;
				// optionally cancel the default behaviour
				context.cancelGesture(event);
				// handle the event
				context.startGesture(event);
				context.changeGesture(event);
			};
		};
		this.onChangeGesture = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// get event object
				event = event || window.event;
				// optionally cancel the default behaviour
				context.cancelGesture(event);
				// handle the event
				context.changeGesture(event);
			};
		};
		this.onEndGesture = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// get event object
				event = event || window.event;
				// handle the event
				context.endGesture(event);
			};
		};
		// external API
		this.enableDefaultTouch = function () {
			this.cfg.cancelTouch = false;
		};
		this.disableDefaultTouch = function () {
			this.cfg.cancelTouch = true;
		};
		this.enableDefaultGesture = function () {
			this.cfg.cancelGesture = false;
		};
		this.disableDefaultGesture = function () {
			this.cfg.cancelGesture = true;
		};
		// go
		this.start();
	};

}(window.useful = window.useful || {}));

/*
	Source:
	van Creij, Maurice (2012). "useful.polyfills.js: A library of useful polyfills to ease working with HTML5 in legacy environments.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	// Invoke strict mode
	"use strict";

	// private functions
	var polyfills = polyfills || {};

	// enabled the use of HTML5 elements in Internet Explorer
	polyfills.html5 = function () {
		var a, b, elementsList;
		elementsList = ['section', 'nav', 'article', 'aside', 'hgroup', 'header', 'footer', 'dialog', 'mark', 'dfn', 'time', 'progress', 'meter', 'ruby', 'rt', 'rp', 'ins', 'del', 'figure', 'figcaption', 'video', 'audio', 'source', 'canvas', 'datalist', 'keygen', 'output', 'details', 'datagrid', 'command', 'bb', 'menu', 'legend'];
		if (navigator.userAgent.match(/msie/gi)) {
			for (a = 0 , b = elementsList.length; a < b; a += 1) {
				document.createElement(elementsList[a]);
			}
		}
	};

	// allow array.indexOf in older browsers
	polyfills.arrayIndexOf = function () {
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function (obj, start) {
				for (var i = (start || 0), j = this.length; i < j; i += 1) {
					if (this[i] === obj) { return i; }
				}
				return -1;
			};
		}
	};

	// allow document.querySelectorAll (https://gist.github.com/connrs/2724353)
	polyfills.querySelectorAll = function () {
		if (!document.querySelectorAll) {
			document.querySelectorAll = function (a) {
				var b = document, c = b.documentElement.firstChild, d = b.createElement("STYLE");
				return c.appendChild(d), b.__qsaels = [], d.styleSheet.cssText = a + "{x:expression(document.__qsaels.push(this))}", window.scrollBy(0, 0), b.__qsaels;
			};
		}
	};

	// allow addEventListener (https://gist.github.com/jonathantneal/3748027)
	polyfills.addEventListener = function () {
		!window.addEventListener && (function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
			WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
				var target = this;
				registry.unshift([target, type, listener, function (event) {
					event.currentTarget = target;
					event.preventDefault = function () { event.returnValue = false; };
					event.stopPropagation = function () { event.cancelBubble = true; };
					event.target = event.srcElement || target;
					listener.call(target, event);
				}]);
				this.attachEvent("on" + type, registry[0][3]);
			};
			WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
				for (var index = 0, register; register = registry[index]; ++index) {
					if (register[0] == this && register[1] == type && register[2] == listener) {
						return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
					}
				}
			};
			WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
				return this.fireEvent("on" + eventObject.type, eventObject);
			};
		})(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);
	};

	// allow console.log
	polyfills.consoleLog = function () {
		var overrideTest = new RegExp('console-log', 'i');
		if (!window.console || overrideTest.test(document.querySelectorAll('html')[0].className)) {
			window.console = {};
			window.console.log = function () {
				// if the reporting panel doesn't exist
				var a, b, messages = '', reportPanel = document.getElementById('reportPanel');
				if (!reportPanel) {
					// create the panel
					reportPanel = document.createElement('DIV');
					reportPanel.id = 'reportPanel';
					reportPanel.style.background = '#fff none';
					reportPanel.style.border = 'solid 1px #000';
					reportPanel.style.color = '#000';
					reportPanel.style.fontSize = '12px';
					reportPanel.style.padding = '10px';
					reportPanel.style.position = (navigator.userAgent.indexOf('MSIE 6') > -1) ? 'absolute' : 'fixed';
					reportPanel.style.right = '10px';
					reportPanel.style.bottom = '10px';
					reportPanel.style.width = '180px';
					reportPanel.style.height = '320px';
					reportPanel.style.overflow = 'auto';
					reportPanel.style.zIndex = '100000';
					reportPanel.innerHTML = '&nbsp;';
					// store a copy of this node in the move buffer
					document.body.appendChild(reportPanel);
				}
				// truncate the queue
				var reportString = (reportPanel.innerHTML.length < 1000) ? reportPanel.innerHTML : reportPanel.innerHTML.substring(0, 800);
				// process the arguments
				for (a = 0, b = arguments.length; a < b; a += 1) {
					messages += arguments[a] + '<br/>';
				}
				// add a break after the message
				messages += '<hr/>';
				// output the queue to the panel
				reportPanel.innerHTML = messages + reportString;
			};
		}
	};

	// allows Object.create (https://gist.github.com/rxgx/1597825)
	polyfills.objectCreate = function () {
		if (typeof Object.create !== "function") {
			Object.create = function (original) {
				function Clone() {}
				Clone.prototype = original;
				return new Clone();
			};
		}
	};

	// allows String.trim (https://gist.github.com/eliperelman/1035982)
	polyfills.stringTrim = function () {
		if (!String.prototype.trim) {
			String.prototype.trim = function () { return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, ''); };
		}
		if (!String.prototype.ltrim) {
			String.prototype.ltrim = function () { return this.replace(/^\s+/, ''); };
		}
		if (!String.prototype.rtrim) {
			String.prototype.rtrim = function () { return this.replace(/\s+$/, ''); };
		}
		if (!String.prototype.fulltrim) {
			String.prototype.fulltrim = function () { return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' '); };
		}
	};

	// for immediate use
	polyfills.html5();
	polyfills.arrayIndexOf();
	polyfills.querySelectorAll();
	polyfills.addEventListener();
	polyfills.consoleLog();
	polyfills.objectCreate();
	polyfills.stringTrim();

}(window.useful = window.useful || {}));

/*
	Source:
	van Creij, Maurice (2014). "useful.zoom.js: Pan and Zoom an Image", version 20140528, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	"use strict";

	useful.Zoom_Controls = function (parent) {

		// PROPERTIES

		this.parent = parent;
		this.cfg = parent.cfg;
		this.obj = null;
		this.ui = {};

		// METHODS

		this.start = function () {
			// create a controls
			this.obj = document.createElement('menu');
			this.obj.className = 'useful-zoom-controls';
			// add the zoom in button
			this.ui.zoomIn = document.createElement('button');
			this.ui.zoomIn.className = 'useful-zoom-in enabled';
			this.ui.zoomIn.innerHTML = 'Zoom In';
			this.ui.zoomIn.addEventListener('click', this.onZoom(1.5));
			this.obj.appendChild(this.ui.zoomIn);
			// add the zoom out button
			this.ui.zoomOut = document.createElement('button');
			this.ui.zoomOut.className = 'useful-zoom-out disabled';
			this.ui.zoomOut.innerHTML = 'Zoom Out';
			this.ui.zoomOut.addEventListener('click', this.onZoom(0.75));
			this.obj.appendChild(this.ui.zoomOut);
			// add the controls to the parent
			this.parent.obj.appendChild(this.obj);
		};

		this.redraw = function () {
			var zoomIn = this.ui.zoomIn,
				zoomOut = this.ui.zoomOut,
				dimensions = this.parent.dimensions,
				transformation = this.parent.transformation;
			// disable the zoom in button at max zoom
			zoomIn.className = (transformation.zoom < dimensions.maxZoom) ?
				zoomIn.className.replace('disabled', 'enabled'):
				zoomIn.className.replace('enabled', 'disabled');
			// disable the zoom out button at min zoom
			zoomOut.className = (transformation.zoom > 1) ?
				zoomOut.className.replace('disabled', 'enabled'):
				zoomOut.className.replace('enabled', 'disabled');
		};

		// EVENTS

		this.onZoom = function (factor) {
			var _this = this;
			return function (evt) {
				// cancel the click
				evt.preventDefault();
				// apply the zoom factor
				var transformation = _this.parent.transformation,
					dimensions = _this.parent.dimensions;
				// apply the zoom factor to the transformation
				transformation.zoom = Math.max(Math.min(transformation.zoom * factor, dimensions.maxZoom), 1);
				// redraw
				_this.parent.redraw();
			};
		};

		// STARTUP

		this.start();

	};

}(window.useful = window.useful || {}));

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

/*
	Source:
	van Creij, Maurice (2014). "useful.zoom.js: Pan and Zoom an Image", version 20140528, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	"use strict";

	useful.Zoom_Tile = function (parent, properties) {

		// PROPERTIES

		this.parent = parent;
		this.cfg = parent.cfg;
		this.obj = null;
		this.name = properties.name;
		this.index = properties.index;
		this.zoom = properties.zoom;
		this.left = properties.left;
		this.top = properties.top;
		this.right = properties.right;
		this.bottom = properties.bottom;

		// METHODS

		this.redraw = function () {
			var area = this.parent.area;
			// if the index of the tile is too low
			if (
				this.index < this.parent.index - this.cfg.tileCache
			) {
				// remove the tile
				this.remove();
			// if it exists within the visible area and at the zoom level
			} else if (
				(this.right >= area.left || this.left <= area.right) &&
				(this.bottom >= area.top || this.top <= area.bottom)
			) {
				// show the tile
				this.show();
			// else
			} else {
				// hide the tile
				this.hide();
			}
		};
		this.add = function () {
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
			this.obj = document.createElement('div');
			this.obj.id = this.name;
			this.obj.style.position = 'absolute';
			this.obj.style.left = (this.left * 100) + '%';
			this.obj.style.top = (this.top * 100) + '%';
			this.obj.style.right = (this.right * 100) + '%';
			this.obj.style.bottom = (this.bottom * 100) + '%';
			this.obj.style.backgroundSize = '100% 100%';
			this.obj.style.zIndex = this.zoom;
			// construct the url of the tile
			this.obj.style.backgroundImage = 'url(' + this.cfg.tileSource
				.replace('{src}', this.cfg.tileUrl)
				.replace('{left}', this.left)
				.replace('{top}', this.top)
				.replace('{right}', 1 - this.right)
				.replace('{bottom}', 1 - this.bottom)
				.replace('{width}', Math.round(this.cfg.tileSize * rightCor))
				.replace('{height}', Math.round(this.cfg.tileSize * bottomCor)) + ')';
			// add the tile to the layer
			this.parent.obj.appendChild(this.obj);
		};
		this.remove = function () {
			console.log('removed:', this.name);
			// remove the tile
			this.obj.parentNode.removeChild(this.obj);
			// remove  the reference
			delete this.parent.tiles[this.name];
		};
		this.show = function () {
			// show the tile
			this.obj.style.display = 'block';
		};
		this.hide = function () {
			// hide the tile
			this.obj.style.display = 'none';
		};

		// STARTUP

		this.add();

	};

}(window.useful = window.useful || {}));

/*
	Source:
	van Creij, Maurice (2014). "useful.zoom.js: Pan and Zoom an Image", version 20140528, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	"use strict";

	useful.Zoom = function (obj, cfg) {

		// PROPERTIES

		this.obj = obj;
		this.cfg = cfg;
		// TODO: move these into the model (cfg) to pass on to sub-components
		this.transformation = {
			'left' : 0.5,
			'top' : 0.5,
			'zoom' : 2,
			'rotate' : 0
		};
		this.dimensions = {
			'width' : null,
			'height' : null,
			'maxWidth' : null,
			'maxHeight' : null
		};
		this.updated = 0;

		// OBJECTS

		this.controls = null;
		this.overlay = null;

		// METHODS

		this.start = function () {
			// apply the custom styles
			this.applyStyling();
			// build the overlay
			this.overlay = new useful.Zoom_Overlay(this);
			// build the controls
			this.controls = new useful.Zoom_Controls(this);
			// add the events
			this.addEvents();
			// first redraw
			this.redraw();
			// disable the start function so it can't be started twice
			this.start = function () {};
		};
		this.redraw = function () {
			// measure the dimensions, maximum zoom and aspect ratio
			this.measureDimensions();
			// redraw the controls
			this.controls.redraw();
			// redraw the overlay
			this.overlay.redraw();
		};
		this.update = function () {
			// redraw the controls
			this.controls.redraw();
		};
		this.applyStyling = function () {
			// create a custom stylesheet
			var style = document.createElement("style");
			if (navigator.userAgent.match(/webkit/gi)) { style.appendChild(document.createTextNode("")); }
			document.body.appendChild(style);
			var sheet = style.sheet || style.styleSheet;
			// add the custom styles
			if (sheet.insertRule) {
				if (this.cfg.colorPassive) {
					sheet.insertRule(".useful-zoom-controls button {background-color : " + this.cfg.colorPassive + " !important;}", 0);
				}
				if (this.cfg.colorHover) {
					sheet.insertRule(".useful-zoom-controls button:hover, .useful-zoom button:active {background-color : " + this.cfg.colorHover + " !important;}", 0);
				}
				if (this.cfg.colorDisabled) {
					sheet.insertRule(".useful-zoom-controls button.disabled, .useful-zoom-controls button.disabled:hover {background-color : " + this.cfg.colorDisabled + " !important;}", 0);
				}
			} else {
				if (this.cfg.colorPassive) {
					sheet.addRule(".useful-zoom-controls button", "background-color : " + this.cfg.colorPassive + " !important;", 0);
				}
				if (this.cfg.colorHover) {
					sheet.addRule(".useful-zoom-controls button:hover, .useful-zoom button:active", "background-color : " + this.cfg.colorHover + " !important;", 0);
				}
				if (this.cfg.colorDisabled) {
					sheet.addRule(".useful-zoom-controls button.disabled, .useful-zoom-controls button.disabled:hover", "background-color : " + this.cfg.colorDisabled + " !important;", 0);
				}
			}
		};
		this.addEvents = function () {
			// make the dimensions update themselves upon resize
			window.addEventListener('resize', this.onResize());
			// add touch event handlers
			this.gestures = new useful.Gestures(this.obj, {
				'threshold' : 50,
				'increment' : 0.1,
				'cancelTouch' : true,
				'cancelGesture' : true,
				'swipeLeft' : function (coords) {},
				'swipeUp' : function (coords) {},
				'swipeRight' : function (coords) {},
				'swipeDown' : function (coords) {},
				'drag' : this.onDrag(),
				'pinch' : this.onPinch(),
				'twist' : (this.cfg.allowRotation) ? this.onTwist() : function () {}
			});
			// cancel transitions afterwards
			this.obj.addEventListener('transitionEnd', this.afterTransitions());
			this.obj.addEventListener('webkitTransitionEnd', this.afterTransitions());
		};
		this.measureDimensions = function () {
			// get the original link
			var link = this.obj.getElementsByTagName('a')[0];
			// store the image source
			this.cfg.tileUrl = link.getAttribute('href');
			// store the starting dimensions
			this.dimensions.width = this.obj.offsetWidth;
			this.dimensions.height = this.obj.offsetHeight;
			// store the maximum dimensions
			this.dimensions.maxWidth = parseInt(link.getAttribute('data-width'));
			this.dimensions.maxHeight = parseInt(link.getAttribute('data-height'));
			this.dimensions.maxZoom = this.dimensions.maxWidth / this.dimensions.width;
		};

		// EVENTS

		this.onResize = function () {
			var _this = this;
			return function () {
				// redraw the display
				_this.redraw();
			};
		};
		this.onDrag = function () {
			var _this = this;
			return function (coords) {
				// calculate the translation
				_this.moveBy(
					coords.horizontal / _this.dimensions.width / _this.transformation.zoom,
					coords.vertical / _this.dimensions.height / _this.transformation.zoom
				);
			};
		};
		this.onPinch = function () {
			var _this = this;
			return function (coords) {
				// calculate the magnification
				_this.zoomBy(
					coords.scale
				);
			};
		};
		this.onTwist = function () {
			var _this = this;
			return function (coords) {
				// calculate the rotation
				_this.rotateBy(
					coords.rotation
				);
			};
		};
		this.afterTransitions = function () {
			var _this = this;
			return function () {
				_this.overlay.obj.className = _this.overlay.obj.className.replace(/useful-zoom-transition| useful-zoom-transition/g, '');
			};
		};

		// PUBLIC

		this.transform = function (transformation) {
			// apply the transformation
			this.transformation.left = Math.max(Math.min(transformation.left, 1), 0);
			this.transformation.top = Math.max(Math.min(transformation.top, 1), 0);
			this.transformation.zoom = Math.max(Math.min(transformation.zoom, this.dimensions.maxZoom), 1);
			this.transformation.rotate = Math.max(Math.min(transformation.rotate, 359), 0);
			// activate the transition
			this.overlay.obj.className += ' useful-zoom-transition';
			// trigger the transformation
			var _this = this;
			setTimeout(function () { _this.overlay.redraw(); }, 0);
		};
		this.moveBy = function (x,y) {
			this.moveTo(
				this.transformation.left - x,
				this.transformation.top - y
			);
		};
		this.moveTo = function (x,y) {
			// apply the translation
			this.transformation.left = x;
			this.transformation.top = y;
			// apply the limits
			this.transformation.left = Math.max(Math.min(this.transformation.left, 1), 0);
			this.transformation.top = Math.max(Math.min(this.transformation.top, 1), 0);
			// redraw the display
			this.overlay.redraw();
		};
		this.zoomBy = function (z) {
			this.zoomTo(
				this.transformation.zoom + z
			);
		};
		this.zoomTo = function (z) {
			// apply the translation
			this.transformation.zoom = z;
			// apply the limits
			this.transformation.zoom = Math.max(Math.min(this.transformation.zoom, this.dimensions.maxZoom), 1);
			// redraw the display
			this.overlay.redraw();
		};
		this.rotateBy = function (r) {
			this.rotateTo(
				this.transformation.rotate + r
			);
		};
		this.rotateTo = function (r) {
			// apply the translation
			this.transformation.rotate += r;
			// apply the limits
			this.transformation.rotate = Math.max(Math.min(this.transformation.rotate, 359), 0);
			// redraw the display
			this.overlay.redraw();
		};

		// STARTUP

		this.start();

	};

}(window.useful = window.useful || {}));
