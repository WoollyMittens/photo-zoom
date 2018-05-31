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
