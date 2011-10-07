dojo.provide("djeo.ge.CoordArray");

(function() {

dojo.declare("djeo.ge.CoordArray", null, {
	
	constructor: function(kwArgs) {
		dojo.mixin(this, kwArgs);
	},

	push: function(feature, point) {
		var coords = feature.getCoords();
		point = feature.map.getCoords(point, "Point");
		if (feature.getCoordsType() == "LineString") {
			coords.push(point);
			
			var placemark = feature.baseShapes[0],
				kmlCoordArray = placemark.getGeometry().getCoordinates();
			
			kmlCoordArray.pushLatLngAlt(point[1], point[0], point.length == 3 ? point[2] : 0);
		}
	},

	set: function(feature, index, point) {
		var coords = feature.getCoords();
		point = feature.map.getCoords(point, "Point");
		if (feature.getCoordsType() == "LineString") {
			coords[index] = point;
			
			var placemark = feature.baseShapes[0],
				kmlCoordArray = placemark.getGeometry().getCoordinates();

			kmlCoordArray.setLatLngAlt(index, point[1], point[0], point.length == 3 ? point[2] : 0);
		}
	}
});

}());