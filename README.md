# Dynamic Photo Zoom

// TODO: convert to modular / class based javascript

Pans and zooms images while loading additional detail on the fly.

## How to include the script

The includes can be added to the HTML document:

```html
<link rel="stylesheet" href="./css/zoom.css"/>
<script src="./js/zoom.js" type="module"></script>
```

Or as a [Javascript module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules):

```js
import { Zoom } from 'js/zoom.js';
```

## How to add the markup

```html
<figure id="zoomExample" class="useful-zoom">
	<a href="img/photo_0_large.jpg" 
		data-width="4608" 
		data-height="3456" 
		data-left="0" 
		data-top="0" 
		data-right="1" 
		data-bottom="1">
		<img src="./img/photo_0_small.jpg" width="512" height="384" title="Lorem ipsum dolor sit amet"/>
	</a>
</figure>
```

**href: {url}** - Path to the large version of the image.

**src: {url}** - Path to the small version of the image.

**data-width|height: {integer}** - Maximum bitmap size.

**data-left|right|top|bottom: {float}** - Starting zoom position between 0 and 1.

## How to start the script

```javascript
var zoom = new Zoom({
	'element' : document.getElementById('zoomExample'),
	'tileSource' : 'php/imageslice.php?src={src}&left={left}&top={top}&right={right}&bottom={bottom}&width={width}&height={height}',
	'tileCache' : 128,
	'tileSize' : 128,
	'allowRotation' : false
});
```

**element : {DOM node}** - The target element for the script.

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

## License

This work is licensed under a [MIT License](https://opensource.org/licenses/MIT). The latest version of this and other scripts by the same author can be found on [Github](https://github.com/WoollyMittens).
