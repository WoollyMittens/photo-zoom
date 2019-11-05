# useful.zoom.js: Pan and Zoom an Image

Pans and zooms images while loading additional detail on the fly.

Try the <a href="http://www.woollymittens.nl/default.php?url=useful-zoom">demo</a>.

## How to include the script

The stylesheet is best included in the header of the document.

```html
<link rel="stylesheet" href="css/zoom.css"/>
```

This include can be added to the header or placed inline before the script is invoked.

```html
<script src="lib/gestures.js"></script>
<script src="js/zoom.js"></script>
```

Or use [Require.js](https://requirejs.org/).

```js
requirejs([
	'lib/gestures.js',
	'js/zoom.js'
], function(Gestures, Zoom) {
	...
});
```

Or import into an MVC framework.

```js
var Gestures = require('lib/gestures.js');
var Zoom = require('js/zoom.js');
```

## How to start the script

```javascript
var zoom = new Zoom({
	'element' : document.getElementById('zoomExample'),
	'tileSource' : 'php/imageslice.php?src=../{src}&left={left}&top={top}&right={right}&bottom={bottom}&width={width}&height={height}',
	'tileCache' : 128,
	'tileSize' : 128,
	'allowRotation' : false
});
```

**tileSource : {url}** - A webservice that provides image tiles (PHP example included).

**tileCache : {integer}** - The amount of tiles that can be active at one time. Reduce this to save memory at the expense of bandwidth.

**tileSize : {integer}** - The horizontal and vertical size of each tile in pixels.

**allowRotation : {boolean}** - Enable or disable rotation as well as pan and zoom.

## How to control the script

### Transform

```javascript
zoom.transform(transformation);
```

Applies a set of transformations all at once in an animated manner.

**transformation : {left, top, zoom, rotate}** - An object containing transformations to apply at once.
+ *left* - Offset from the left as a fraction between 0 and 1.
+ *top* - Offset from the top as a fraction between 0 and 1.
+ *zoom* - Zoom factor.
+ *rotate* - Rotation in degrees.

### moveBy

```javascript
zoom.moveBy(x,y);
```

Moves the canvas by a set distance instantly.

**x : {float}** - Offset from the left as a fraction between 0 and 1.

**y : {float}** - Offset from the top as a fraction between 0 and 1.

### moveTo

```javascript
zoom.moveTo(x,y);
```

Moves the canvas to a set position instantly.

**x : {float}** - Offset from the left as a fraction between 0 and 1.

**y : {float}** - Offset from the top as a fraction between 0 and 1.

### zoomBy

```javascript
zoom.zoomBy(factor);
```

Magnifies the canvas by a set distance instantly.

**factor : {float}** - Zoom factor between 1 and as high as the bitmap allows.

### zoomTo

```javascript
zoom.zoomTo(factor);
```

Magnifies the canvas to a set position instantly.

**factor : {float}** - Zoom factor between 1 and as high as the bitmap allows.

### rotateBy

```javascript
zoom.rotateBy(angle);
```

Rotates the canvas by a set number of degrees.

**angle : {float}** - A rotation between 0 and 359.

### rotateTo

```javascript
zoom.rotateTo(angle);
```

Rotates the canvas to a set number of degrees.

**angle : {float}** - A rotation between 0 and 359.

## How to build the script

This project uses node.js from http://nodejs.org/

This project uses gulp.js from http://gulpjs.com/

The following commands are available for development:
+ `npm install` - Installs the prerequisites.
+ `gulp import` - Re-imports libraries from supporting projects to `./src/libs/` if available under the same folder tree.
+ `gulp dev` - Builds the project for development purposes.
+ `gulp dist` - Builds the project for deployment purposes.
+ `gulp watch` - Continuously recompiles updated files during development sessions.
+ `gulp connect` - Serves the project on a temporary web server at http://localhost:8500/ .

## License

This work is licensed under a [MIT License](https://opensource.org/licenses/MIT). The latest version of this and other scripts by the same author can be found on [Github](https://github.com/WoollyMittens) and at [WoollyMittens.nl](https://www.woollymittens.nl/).
