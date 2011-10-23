dojo.provide("djeo.djeo.CoordArray");

(function() {

dojo.declare("djeo.djeo.CoordArray", null, {
	
	constructor: function(kwArgs) {
		dojo.mixin(this, kwArgs);
	},

	push: function(feature, point) {
		var coords = feature.getCoords();
		point = feature.map.getCoords(point, "Point");
		if (feature.getCoordsType() == "LineString") {
			coords.push(point);
		}
		this._setShapes(feature);
	},

	set: function(feature, index, point) {
		var coords = feature.getCoords();
		point = feature.map.getCoords(point, "Point");
		if (feature.getCoordsType() == "LineString") {
			coords[index] = point;
		}
		this._setShapes(feature);
	},

	_setShapes: function(feature) {
		var pathString = this.engine.factories.Placemark.makePathString(feature.getCoords(), 1);
		dojo.forEach(feature.baseShapes, function(shape){
			shape.setShape(pathString);
		});
	}
});

}());