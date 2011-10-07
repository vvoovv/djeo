dojo.provide("djeo.gmaps.CoordArray");

(function() {

var GM = google.maps;

dojo.declare("djeo.gmaps.CoordArray", null, {
	
	constructor: function(kwArgs) {
		dojo.mixin(this, kwArgs);
	},

	push: function(feature, point) {
		var coords = feature.getCoords();
		point = feature.map.getCoords(point, "Point");
		if (feature.getCoordsType() == "LineString") {
			feature.baseShapes[0].getPath().push(new GM.LatLng(point[1], point[0]));
			coords.push(point);
		}
	},

	set: function(feature, index, point) {
		var coords = feature.getCoords();
		point = feature.map.getCoords(point, "Point");
		if (feature.getCoordsType() == "LineString") {
			feature.baseShapes[0].getPath().setAt(index, new GM.LatLng(point[1], point[0]));
			coords[index] = point;
		}
	}
});

}());