// EXPORTS

if ("object" == typeof exports && "object" == typeof module) {

    module.exports = Zoom;

} else if ("function" == typeof define && define.amd) {

    define([], function () {
        return Zoom
    });

} else if ("object" == typeof exports) {

    exports.Zoom = Zoom;

} else {

    self.Zoom = Zoom;

}