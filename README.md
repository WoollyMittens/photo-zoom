# useful.zoom.js: Pan and Zoom an Image

Pans and zooms images while loading additional detail on the fly.

Try the <a href="http://www.woollymittens.nl/useful/default.php?url=useful-zoom">demo</a>.

## How to include the script

The stylesheet is best included in the header of the document.

```html
<link rel="stylesheet" href="./css/useful-zoom.css"/>
```

This include can be added to the header or placed inline before the script is invoked.

```html
<script src="./js/useful-zoom.js"></script>
```

## How to start the script

```javascript
var zoom = new useful.Zoom( document.getElementById('id'), {
	name : value
});
```

**name : {type}**
+ *value* - Explanation.
+ *value* - Explanation.
+ *evalue* - Explanation.

## How to control the script

### Lorem

```javascript
zoom.lorem(value);
```

Explanation.

**value : {type}** - Explanation.

## How to build the script

This project uses node.js from http://nodejs.org/

This project uses grunt.js from http://gruntjs.com/

The following commands are available for development:
+ `npm install` - Installs the prerequisites.
+ `grunt import` - Re-imports libraries from supporting projects to `./src/libs/` if available under the same folder tree.
+ `grunt dev` - Builds the project for development purposes.
+ `grunt prod` - Builds the project for deployment purposes.
+ `grunt watch` - Continuously recompiles updated files during development sessions.
+ `grunt serve` - Serves the project on a temporary web server at http://localhost:8000/ .

## License

This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/
