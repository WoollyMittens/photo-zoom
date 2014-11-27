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
useful.Zoom.prototype.Styling = function (parent) {

	// PROPERTIES

	"use strict";
	this.parent = parent;
	this.model = parent.model;
	this.element = parent.element;

	// METHODS

	this.apply = function () {
		// create a custom stylesheet
		var style = document.createElement("style");
		if (navigator.userAgent.match(/webkit/gi)) { style.appendChild(document.createTextNode("")); }
		document.body.appendChild(style);
		var sheet = style.sheet || style.styleSheet;
		// add the custom styles
		if (sheet.insertRule) {
			if (this.model.colorPassive) {
				sheet.insertRule(".useful-zoom-controls button {background-color : " + this.model.colorPassive + " !important;}", 0);
			}
			if (this.model.colorHover) {
				sheet.insertRule(".useful-zoom-controls button:hover, .useful-zoom button:active {background-color : " + this.model.colorHover + " !important;}", 0);
			}
			if (this.model.colorDisabled) {
				sheet.insertRule(".useful-zoom-controls button.disabled, .useful-zoom-controls button.disabled:hover {background-color : " + this.model.colorDisabled + " !important;}", 0);
			}
		} else {
			if (this.model.colorPassive) {
				sheet.addRule(".useful-zoom-controls button", "background-color : " + this.model.colorPassive + " !important;", 0);
			}
			if (this.model.colorHover) {
				sheet.addRule(".useful-zoom-controls button:hover, .useful-zoom button:active", "background-color : " + this.model.colorHover + " !important;", 0);
			}
			if (this.model.colorDisabled) {
				sheet.addRule(".useful-zoom-controls button.disabled, .useful-zoom-controls button.disabled:hover", "background-color : " + this.model.colorDisabled + " !important;", 0);
			}
		}
	};

	this.measure = function () {
		// get the original link
		var link = this.element.getElementsByTagName('a')[0];
		// store the image source
		this.model.tileUrl = link.getAttribute('href');
		// store the starting dimensions
		this.model.dimensions.width = this.element.offsetWidth;
		this.model.dimensions.height = this.element.offsetHeight;
		// store the maximum dimensions
		this.model.dimensions.maxWidth = parseInt(link.getAttribute('data-width'));
		this.model.dimensions.maxHeight = parseInt(link.getAttribute('data-height'));
		this.model.dimensions.maxZoom = this.model.dimensions.maxWidth / this.model.dimensions.width;
	};

	// STARTUP

	this.apply();

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Zoom.Styling;
}
