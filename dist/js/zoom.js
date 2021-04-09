(function() {
    var Gestures = function(config) {
        this.only = function(config) {
            return new this.Main(config, this);
        };
        this.each = function(config) {
            var _config, _context = this, instances = [];
            for (var a = 0, b = config.elements.length; a < b; a += 1) {
                _config = Object.create(config);
                _config.element = config.elements[a];
                delete _config.elements;
                instances[a] = new this.Main(_config, _context);
            }
            return instances;
        };
        return config.elements ? this.each(config) : this.only(config);
    };
    Gestures.prototype.Main = function(config, context) {
        this.config = config;
        this.context = context;
        this.element = config.element;
        this.paused = false;
        this.init = function() {
            this.config = this.checkConfig(config);
            if (config.allowSingle) {
                this.single = new this.context.Single(this);
            }
            if (config.allowMulti) {
                this.multi = new this.context.Multi(this);
            }
        };
        this.checkConfig = function(config) {
            config.threshold = config.threshold || 50;
            config.increment = config.increment || .1;
            if (config.cancelTouch === undefined || config.cancelTouch === null) {
                config.cancelTouch = true;
            }
            if (config.cancelGesture === undefined || config.cancelGesture === null) {
                config.cancelGesture = true;
            }
            if (config.swipeUp || config.swipeLeft || config.swipeRight || config.swipeDown || config.drag || config.doubleTap) {
                config.allowSingle = true;
                config.swipeUp = config.swipeUp || function() {};
                config.swipeLeft = config.swipeLeft || function() {};
                config.swipeRight = config.swipeRight || function() {};
                config.swipeDown = config.swipeDown || function() {};
                config.drag = config.drag || function() {};
                config.doubleTap = config.doubleTap || function() {};
            }
            if (config.pinch || config.twist) {
                config.allowMulti = true;
                config.pinch = config.pinch || function() {};
                config.twist = config.twist || function() {};
            }
            return config;
        };
        this.readEvent = function(event) {
            var coords = {}, offsets;
            if (event.touches && event.touches[0]) {
                coords.x = event.touches[0].pageX;
                coords.y = event.touches[0].pageY;
            } else if (event.pageX !== undefined) {
                coords.x = event.pageX;
                coords.y = event.pageY;
            } else {
                coords.x = event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
                coords.y = event.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
            }
            return coords;
        };
        this.correctOffset = function(element) {
            var offsetX = 0, offsetY = 0;
            if (element.offsetParent) {
                while (element !== this.element) {
                    offsetX += element.offsetLeft;
                    offsetY += element.offsetTop;
                    element = element.offsetParent;
                }
            }
            return {
                x: offsetX,
                y: offsetY
            };
        };
        this.enableDefaultTouch = function() {
            this.config.cancelTouch = false;
        };
        this.disableDefaultTouch = function() {
            this.config.cancelTouch = true;
        };
        this.enableDefaultGesture = function() {
            this.config.cancelGesture = false;
        };
        this.disableDefaultGesture = function() {
            this.config.cancelGesture = true;
        };
        this.init();
    };
    Gestures.prototype.Multi = function(parent) {
        this.parent = parent;
        this.config = parent.config;
        this.element = parent.config.element;
        this.gestureOrigin = null;
        this.gestureProgression = null;
        this.init = function() {
            this.element.addEventListener("mousewheel", this.onChangeWheel());
            if (navigator.userAgent.match(/firefox/gi)) {
                this.element.addEventListener("DOMMouseScroll", this.onChangeWheel());
            }
            if ("ongesturestart" in window) {
                this.element.addEventListener("gesturestart", this.onStartGesture());
                this.element.addEventListener("gesturechange", this.onChangeGesture());
                this.element.addEventListener("gestureend", this.onEndGesture());
            } else if ("msgesturestart" in window) {
                this.element.addEventListener("msgesturestart", this.onStartGesture());
                this.element.addEventListener("msgesturechange", this.onChangeGesture());
                this.element.addEventListener("msgestureend", this.onEndGesture());
            } else {
                this.element.addEventListener("touchstart", this.onStartFallback());
                this.element.addEventListener("touchmove", this.onChangeFallback());
                this.element.addEventListener("touchend", this.onEndFallback());
            }
        };
        this.cancelGesture = function(event) {
            if (this.config.cancelGesture) {
                event = event || window.event;
                event.preventDefault();
            }
        };
        this.startGesture = function(event) {
            if (!this.parent.paused) {
                this.gestureOrigin = {
                    scale: event.scale,
                    rotation: event.rotation,
                    target: event.target || event.srcElement
                };
                this.gestureProgression = {
                    scale: this.gestureOrigin.scale,
                    rotation: this.gestureOrigin.rotation
                };
            }
        };
        this.changeGesture = function(event) {
            if (this.gestureOrigin) {
                var scale = event.scale, rotation = event.rotation;
                var coords = this.parent.readEvent(event);
                this.config.pinch({
                    x: coords.x,
                    y: coords.y,
                    scale: scale - this.gestureProgression.scale,
                    event: event,
                    target: this.gestureOrigin.target
                });
                this.config.twist({
                    x: coords.x,
                    y: coords.y,
                    rotation: rotation - this.gestureProgression.rotation,
                    event: event,
                    target: this.gestureOrigin.target
                });
                this.gestureProgression = {
                    scale: event.scale,
                    rotation: event.rotation
                };
            }
        };
        this.endGesture = function() {
            this.gestureOrigin = null;
        };
        this.startFallback = function(event) {
            if (!this.parent.paused && event.touches.length === 2) {
                this.gestureOrigin = {
                    touches: [ {
                        pageX: event.touches[0].pageX,
                        pageY: event.touches[0].pageY
                    }, {
                        pageX: event.touches[1].pageX,
                        pageY: event.touches[1].pageY
                    } ],
                    target: event.target || event.srcElement
                };
                this.gestureProgression = {
                    touches: this.gestureOrigin.touches
                };
            }
        };
        this.changeFallback = function(event) {
            if (this.gestureOrigin && event.touches.length === 2) {
                var coords = this.parent.readEvent(event);
                var scale = 0, progression = this.gestureProgression;
                scale += (event.touches[0].pageX - event.touches[1].pageX) / (progression.touches[0].pageX - progression.touches[1].pageX);
                scale += (event.touches[0].pageY - event.touches[1].pageY) / (progression.touches[0].pageY - progression.touches[1].pageY);
                scale = scale - 2;
                this.config.pinch({
                    x: coords.x,
                    y: coords.y,
                    scale: scale,
                    event: event,
                    target: this.gestureOrigin.target
                });
                this.gestureProgression = {
                    touches: [ {
                        pageX: event.touches[0].pageX,
                        pageY: event.touches[0].pageY
                    }, {
                        pageX: event.touches[1].pageX,
                        pageY: event.touches[1].pageY
                    } ]
                };
            }
        };
        this.endFallback = function() {
            this.gestureOrigin = null;
        };
        this.changeWheel = function(event) {
            var scale = 1, distance = window.event ? window.event.wheelDelta / 120 : -event.detail / 3;
            var coords = this.parent.readEvent(event);
            scale = distance > 0 ? +this.config.increment : scale = -this.config.increment;
            this.config.pinch({
                x: coords.x,
                y: coords.y,
                scale: scale,
                event: event,
                source: event.target || event.srcElement
            });
        };
        this.onStartGesture = function() {
            var _this = this;
            return function(event) {
                _this.cancelGesture(event);
                _this.startGesture(event);
                _this.changeGesture(event);
            };
        };
        this.onChangeGesture = function() {
            var _this = this;
            return function(event) {
                _this.cancelGesture(event);
                _this.changeGesture(event);
            };
        };
        this.onEndGesture = function() {
            var _this = this;
            return function(event) {
                _this.endGesture(event);
            };
        };
        this.onStartFallback = function() {
            var _this = this;
            return function(event) {
                _this.startFallback(event);
                _this.changeFallback(event);
            };
        };
        this.onChangeFallback = function() {
            var _this = this;
            return function(event) {
                _this.cancelGesture(event);
                _this.changeFallback(event);
            };
        };
        this.onEndFallback = function() {
            var _this = this;
            return function(event) {
                _this.endGesture(event);
            };
        };
        this.onChangeWheel = function() {
            var _this = this;
            return function(event) {
                event = event || window.event;
                _this.cancelGesture(event);
                _this.changeWheel(event);
            };
        };
        this.init();
    };
    Gestures.prototype.Single = function(parent) {
        this.parent = parent;
        this.config = parent.config;
        this.element = parent.config.element;
        this.lastTouch = null;
        this.touchOrigin = null;
        this.touchProgression = null;
        this.init = function() {
            this.element.addEventListener("mousedown", this.onStartTouch());
            this.element.addEventListener("mousemove", this.onChangeTouch());
            document.body.addEventListener("mouseup", this.onEndTouch());
            this.element.addEventListener("touchstart", this.onStartTouch());
            this.element.addEventListener("touchmove", this.onChangeTouch());
            document.body.addEventListener("touchend", this.onEndTouch());
            this.element.addEventListener("mspointerdown", this.onStartTouch());
            this.element.addEventListener("mspointermove", this.onChangeTouch());
            document.body.addEventListener("mspointerup", this.onEndTouch());
        };
        this.cancelTouch = function(event) {
            if (this.config.cancelTouch) {
                event = event || window.event;
                event.preventDefault();
            }
        };
        this.startTouch = function(event) {
            if (!this.parent.paused) {
                var coords = this.parent.readEvent(event);
                this.touchOrigin = {
                    x: coords.x,
                    y: coords.y,
                    target: event.target || event.srcElement
                };
                this.touchProgression = {
                    x: this.touchOrigin.x,
                    y: this.touchOrigin.y
                };
            }
        };
        this.changeTouch = function(event) {
            if (this.touchOrigin) {
                var coords = this.parent.readEvent(event);
                this.config.drag({
                    x: this.touchOrigin.x,
                    y: this.touchOrigin.y,
                    horizontal: coords.x - this.touchProgression.x,
                    vertical: coords.y - this.touchProgression.y,
                    event: event,
                    source: this.touchOrigin.target
                });
                this.touchProgression = {
                    x: coords.x,
                    y: coords.y
                };
            }
        };
        this.endTouch = function(event) {
            if (this.touchOrigin && this.touchProgression) {
                var distance = {
                    x: this.touchProgression.x - this.touchOrigin.x,
                    y: this.touchProgression.y - this.touchOrigin.y
                };
                if (this.lastTouch && Math.abs(this.touchOrigin.x - this.lastTouch.x) < 10 && Math.abs(this.touchOrigin.y - this.lastTouch.y) < 10 && new Date().getTime() - this.lastTouch.time < 500 && new Date().getTime() - this.lastTouch.time > 100) {
                    this.config.doubleTap({
                        x: this.touchOrigin.x,
                        y: this.touchOrigin.y,
                        event: event,
                        source: this.touchOrigin.target
                    });
                } else if (Math.abs(distance.x) > Math.abs(distance.y)) {
                    if (distance.x > this.config.threshold) {
                        this.config.swipeRight({
                            x: this.touchOrigin.x,
                            y: this.touchOrigin.y,
                            distance: distance.x,
                            event: event,
                            source: this.touchOrigin.target
                        });
                    } else if (distance.x < -this.config.threshold) {
                        this.config.swipeLeft({
                            x: this.touchOrigin.x,
                            y: this.touchOrigin.y,
                            distance: -distance.x,
                            event: event,
                            source: this.touchOrigin.target
                        });
                    }
                } else {
                    if (distance.y > this.config.threshold) {
                        this.config.swipeDown({
                            x: this.touchOrigin.x,
                            y: this.touchOrigin.y,
                            distance: distance.y,
                            event: event,
                            source: this.touchOrigin.target
                        });
                    } else if (distance.y < -this.config.threshold) {
                        this.config.swipeUp({
                            x: this.touchOrigin.x,
                            y: this.touchOrigin.y,
                            distance: -distance.y,
                            event: event,
                            source: this.touchOrigin.target
                        });
                    }
                }
                this.lastTouch = {
                    x: this.touchOrigin.x,
                    y: this.touchOrigin.y,
                    time: new Date().getTime()
                };
            }
            this.touchProgression = null;
            this.touchOrigin = null;
        };
        this.onStartTouch = function() {
            var _this = this;
            return function(event) {
                event = event || window.event;
                _this.startTouch(event);
                _this.changeTouch(event);
            };
        };
        this.onChangeTouch = function() {
            var _this = this;
            return function(event) {
                event = event || window.event;
                _this.cancelTouch(event);
                _this.changeTouch(event);
            };
        };
        this.onEndTouch = function() {
            var _this = this;
            return function(event) {
                event = event || window.event;
                _this.endTouch(event);
            };
        };
        this.init();
    };
    var Zoom = function(config) {
        this.config = {
            element: document.getElementById("zoomExample"),
            tileSource: "php/imageslice.php?src={src}&left={left}&top={top}&right={right}&bottom={bottom}&width={width}&height={height}",
            tileCache: 128,
            tileSize: 128,
            allowRotation: false
        };
        for (var name in config) {
            this.config[name] = config[name];
        }
        this.main = new this.Main(this);
        this.transform = this.main.transform.bind(this.main);
        this.moveBy = this.main.moveBy.bind(this.main);
        this.moveTo = this.main.moveTo.bind(this.main);
        this.zoomBy = this.main.zoomBy.bind(this.main);
        this.zoomTo = this.main.zoomTo.bind(this.main);
        this.rotateBy = this.main.rotateBy.bind(this.main);
        this.rotateTo = this.main.rotateTo.bind(this.main);
    };
    Zoom.prototype.Controls = function(context) {
        this.context = null;
        this.config = null;
        this.element = null;
        this.zoomIn = null;
        this.zoomOut = null;
        this.init = function(context) {
            this.context = context;
            this.config = context.config;
            this.element = document.createElement("menu");
            this.element.className = "useful-zoom-controls";
            this.zoomIn = document.createElement("button");
            this.zoomIn.className = "useful-zoom-in enabled";
            this.zoomIn.innerHTML = "Zoom In";
            this.zoomIn.addEventListener("touchstart", this.onSuspendTouch.bind(this));
            this.zoomIn.addEventListener("mousedown", this.onSuspendTouch.bind(this));
            this.zoomIn.addEventListener("touchend", this.onZoom.bind(this, 1.5));
            this.zoomIn.addEventListener("mouseup", this.onZoom.bind(this, 1.5));
            this.element.appendChild(this.zoomIn);
            this.zoomOut = document.createElement("button");
            this.zoomOut.className = "useful-zoom-out disabled";
            this.zoomOut.innerHTML = "Zoom Out";
            this.zoomOut.addEventListener("touchstart", this.onSuspendTouch.bind(this));
            this.zoomOut.addEventListener("mousedown", this.onSuspendTouch.bind(this));
            this.zoomOut.addEventListener("touchend", this.onZoom.bind(this, .75));
            this.zoomOut.addEventListener("mouseup", this.onZoom.bind(this, .75));
            this.element.appendChild(this.zoomOut);
            this.context.element.appendChild(this.element);
            return this;
        };
        this.redraw = function() {
            var zoomIn = this.zoomIn, zoomOut = this.zoomOut, dimensions = this.config.dimensions, transformation = this.config.transformation;
            zoomIn.className = transformation.zoom < dimensions.maxZoom ? zoomIn.className.replace("disabled", "enabled") : zoomIn.className.replace("enabled", "disabled");
            zoomOut.className = transformation.zoom > 1 ? zoomOut.className.replace("disabled", "enabled") : zoomOut.className.replace("enabled", "disabled");
        };
        this.onZoom = function(factor) {
            event.preventDefault();
            this.context.gestures(true);
            var transformation = this.config.transformation, dimensions = this.config.dimensions;
            transformation.zoom = Math.max(Math.min(transformation.zoom * factor, dimensions.maxZoom), 1);
            this.context.redraw();
        };
        this.onSuspendTouch = function() {
            event.preventDefault();
            this.context.gestures(false);
        };
        this.init(context);
    };
    if ("object" == typeof exports && "object" == typeof module) {
        module.exports = Zoom;
    } else if ("function" == typeof define && define.amd) {
        define([], function() {
            return Zoom;
        });
    } else if ("object" == typeof exports) {
        exports.Zoom = Zoom;
    } else {
        self.Zoom = Zoom;
    }
    Zoom.prototype.Main = function(context) {
        this.context = null;
        this.config = null;
        this.element = null;
        this.init = function(context) {
            this.context = context;
            this.config = context.config;
            this.element = context.config.element;
            this.config.transformation = {
                left: .5,
                top: .5,
                zoom: 1,
                rotate: 0
            };
            this.config.dimensions = {
                width: null,
                height: null,
                maxWidth: null,
                maxHeight: null
            };
            this.styling = new this.context.Styling(this);
            this.overlay = new this.context.Overlay(this);
            this.controls = new this.context.Controls(this);
            this.touch = new this.context.Touch(this);
            this.redraw();
            return this;
        };
        this.redraw = function() {
            this.styling.measure();
            this.controls.redraw();
            this.overlay.redraw();
        };
        this.update = function() {
            this.controls.redraw();
        };
        this.gestures = function(status) {
            this.touch.pause(!status);
        };
        this.transitions = function(status) {
            this.overlay.transitions(status);
        };
        this.transform = function(transformation) {
            this.config.transformation.left = Math.max(Math.min(transformation.left, 1), 0) || this.config.transformation.left;
            this.config.transformation.top = Math.max(Math.min(transformation.top, 1), 0) || this.config.transformation.top;
            this.config.transformation.zoom = Math.max(Math.min(transformation.zoom, this.config.dimensions.maxZoom), 1) || this.config.transformation.zoom;
            this.config.transformation.rotate = Math.max(Math.min(transformation.rotate, 359), 0) || this.config.transformation.rotate;
            this.overlay.transitions(true);
            setTimeout(this.redraw.bind(this), 0);
        };
        this.moveBy = function(x, y) {
            this.moveTo(this.config.transformation.left - x, this.config.transformation.top - y);
        };
        this.moveTo = function(x, y) {
            this.config.transformation.left = x;
            this.config.transformation.top = y;
            this.config.transformation.left = Math.max(Math.min(this.config.transformation.left, 1), 0);
            this.config.transformation.top = Math.max(Math.min(this.config.transformation.top, 1), 0);
            this.overlay.redraw();
        };
        this.zoomBy = function(z) {
            this.zoomTo(this.config.transformation.zoom + z);
        };
        this.zoomTo = function(z) {
            this.config.transformation.zoom = z;
            this.config.transformation.zoom = Math.max(Math.min(this.config.transformation.zoom, this.config.dimensions.maxZoom), 1);
            this.overlay.redraw();
        };
        this.rotateBy = function(r) {
            this.rotateTo(this.config.transformation.rotate + r);
        };
        this.rotateTo = function(r) {
            this.config.transformation.rotate += r;
            this.config.transformation.rotate = Math.max(Math.min(this.config.transformation.rotate, 359), 0);
            this.overlay.redraw();
        };
        this.init(context);
    };
    Zoom.prototype.Overlay = function(context) {
        this.context = null;
        this.config = null;
        this.root = null;
        this.element = null;
        this.timeout = null;
        this.tiles = {};
        this.index = 0;
        this.updated = 0;
        this.init = function(context) {
            this.context = context;
            this.config = context.config;
            this.root = context.context;
            this.config.area = {};
            var image = this.context.element.getElementsByTagName("img")[0];
            this.element = document.createElement("div");
            this.element.className = "useful-zoom-overlay";
            this.element.style.backgroundImage = "url(" + image.getAttribute("src") + ")";
            this.context.element.appendChild(this.element);
            image.style.visibility = "hidden";
            return this;
        };
        this.redraw = function() {
            var transformation = this.config.transformation;
            var updated = new Date().getTime();
            if (updated - this.updated > 20) {
                this.updated = updated;
                var styleTransform = "scale(" + transformation.zoom + ", " + transformation.zoom + ") rotate(" + transformation.rotate + "deg)";
                var styleOrigin = transformation.left * 100 + "% " + transformation.top * 100 + "%";
                this.element.style.msTransformOrigin = styleOrigin;
                this.element.style.WebkitTransformOrigin = styleOrigin;
                this.element.style.transformOrigin = styleOrigin;
                this.element.style.msTransform = styleTransform;
                this.element.style.WebkitTransform = styleTransform;
                this.element.style.transform = styleTransform;
            }
            clearTimeout(this.timeout);
            this.timeout = setTimeout(this.update.bind(this), 300);
        };
        this.update = function() {
            this.context.update();
            this.measure();
            this.clean();
            this.populate();
        };
        this.measure = function() {
            var transformation = this.config.transformation, area = this.config.area;
            area.size = 1 / transformation.zoom;
            area.left = Math.max(transformation.left - area.size / 2, 0);
            area.top = Math.max(transformation.top - area.size / 2, 0);
            area.right = Math.min(area.left + area.size, 1);
            area.bottom = Math.min(area.top + area.size, 1);
        };
        this.clean = function() {
            for (var name in this.tiles) {
                if (this.tiles.hasOwnProperty(name)) {
                    this.tiles[name].redraw();
                }
            }
        };
        this.populate = function() {
            var dimensions = this.config.dimensions, transformation = this.config.transformation, area = this.config.area;
            var cols = dimensions.width * transformation.zoom / this.config.tileSize, rows = dimensions.height * transformation.zoom / this.config.tileSize, zoom = Math.ceil(transformation.zoom), startCol = Math.max(Math.floor(area.left * cols) - 1, 0), endCol = Math.min(Math.ceil(area.right * cols) + 1, cols), startRow = Math.max(Math.floor(area.top * rows) - 1, 0), endRow = Math.min(Math.ceil(area.bottom * rows) + 1, rows), tileName;
            for (var row = startRow; row < endRow; row += 1) {
                for (var col = startCol; col < endCol; col += 1) {
                    tileName = "tile_" + col + "_" + row + "_" + zoom;
                    if (this.tiles[tileName] === undefined) {
                        this.tiles[tileName] = new this.root.Tile(this, {
                            name: tileName,
                            index: this.index,
                            zoom: zoom,
                            left: col / cols,
                            top: row / rows,
                            right: 1 - (col + 1) / cols,
                            bottom: 1 - (row + 1) / rows
                        });
                        this.index += 1;
                    }
                }
            }
        };
        this.transitions = function(status) {
            this.element.className = status ? this.element.className + " useful-zoom-transition" : this.element.className.replace(/useful-zoom-transition| useful-zoom-transition/g, "");
        };
        this.init(context);
    };
    Zoom.prototype.Styling = function(context) {
        this.context = null;
        this.config = null;
        this.element = null;
        this.init = function(context) {
            this.context = context;
            this.config = context.config;
            this.element = context.element;
            var style = document.createElement("style");
            if (navigator.userAgent.match(/webkit/gi)) {
                style.appendChild(document.createTextNode(""));
            }
            document.body.appendChild(style);
            var sheet = style.sheet || style.styleSheet;
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
            return this;
        };
        this.measure = function() {
            var link = this.element.getElementsByTagName("a")[0];
            this.config.tileUrl = link.getAttribute("href");
            this.config.dimensions.width = this.element.offsetWidth;
            this.config.dimensions.height = this.element.offsetHeight;
            this.config.dimensions.maxWidth = parseInt(link.getAttribute("data-width"));
            this.config.dimensions.maxHeight = parseInt(link.getAttribute("data-height"));
            this.config.dimensions.maxZoom = this.config.dimensions.maxWidth / this.config.dimensions.width;
        };
        this.init(context);
    };
    Zoom.prototype.Tile = function(context, properties) {
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
        this.init = function(context, properties) {
            this.context = context;
            this.config = context.config;
            this.name = properties.name;
            this.index = properties.index;
            this.zoom = properties.zoom;
            this.left = properties.left;
            this.top = properties.top;
            this.right = properties.right;
            this.bottom = properties.bottom;
            var rightCor = 1;
            if (this.right > 1) {
                rightCor = 1 - this.left / this.right - this.left;
                this.right = 1;
            }
            var bottomCor = 1;
            if (this.bottom > 1) {
                bottomCor = 1 - this.top / this.bottom - this.top;
                this.bottom = 1;
            }
            this.element = document.createElement("div");
            this.element.id = this.name;
            this.element.style.position = "absolute";
            this.element.style.left = this.left * 100 + "%";
            this.element.style.top = this.top * 100 + "%";
            this.element.style.right = this.right * 100 + "%";
            this.element.style.bottom = this.bottom * 100 + "%";
            this.element.style.backgroundSize = "100% 100%";
            this.element.style.zIndex = this.zoom;
            this.element.style.backgroundImage = "url(" + this.config.tileSource.replace("{src}", this.config.tileUrl).replace("{left}", this.left).replace("{top}", this.top).replace("{right}", 1 - this.right).replace("{bottom}", 1 - this.bottom).replace("{width}", Math.round(this.config.tileSize * rightCor)).replace("{height}", Math.round(this.config.tileSize * bottomCor)) + ")";
            this.context.element.appendChild(this.element);
            return this;
        };
        this.redraw = function() {
            var area = this.config.area;
            if (this.index < this.context.index - this.config.tileCache) {
                this.remove();
            } else if ((this.right >= area.left || this.left <= area.right) && (this.bottom >= area.top || this.top <= area.bottom)) {
                this.show();
            } else {
                this.hide();
            }
        };
        this.remove = function() {
            this.element.parentNode.removeChild(this.element);
            delete this.context.tiles[this.name];
        };
        this.show = function() {
            this.element.style.display = "block";
        };
        this.hide = function() {
            this.element.style.display = "none";
        };
        this.init(context, properties);
    };
    Zoom.prototype.Touch = function(context) {
        this.context = null;
        this.config = null;
        this.element = null;
        this.init = function(context) {
            this.context = context;
            this.config = context.config;
            this.element = context.element;
            window.addEventListener("resize", this.onResize.bind(this));
            this.gestures = new Gestures({
                element: this.element,
                threshold: 50,
                increment: .1,
                cancelTouch: true,
                cancelGesture: true,
                swipeLeft: function(coords) {},
                swipeUp: function(coords) {},
                swipeRight: function(coords) {},
                swipeDown: function(coords) {},
                drag: this.onDrag.bind(this),
                pinch: this.onPinch.bind(this),
                twist: this.config.allowRotation ? this.onTwist.bind(this) : function() {},
                doubleTap: this.onDoubleTap.bind(this)
            });
            this.element.addEventListener("transitionEnd", this.afterTransitions.bind(this));
            this.element.addEventListener("webkitTransitionEnd", this.afterTransitions.bind(this));
            return this;
        };
        this.pause = function(status) {
            this.gestures.paused = status;
        };
        this.onResize = function() {
            this.context.redraw();
        };
        this.onDrag = function(coords) {
            this.context.moveBy(coords.horizontal / this.config.dimensions.width / this.config.transformation.zoom, coords.vertical / this.config.dimensions.height / this.config.transformation.zoom);
        };
        this.onPinch = function(coords) {
            this.context.zoomBy(coords.scale * this.config.transformation.zoom);
        };
        this.onTwist = function(coords) {
            this.context.rotateBy(coords.rotation);
        };
        this.onDoubleTap = function(coords) {
            coords.event.preventDefault();
            this.context.transform({
                left: (coords.x / this.config.dimensions.width - .5) / this.config.transformation.zoom + this.config.transformation.left,
                top: (coords.y / this.config.dimensions.height - .5) / this.config.transformation.zoom + this.config.transformation.top,
                zoom: this.config.transformation.zoom * 1.5
            });
        };
        this.afterTransitions = function() {
            this.context.transitions(false);
        };
        this.init(context);
    };
})();