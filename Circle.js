define([
	"dojo/_base/declare",
	"./_base",
	"./Placemark",
	"./util/_base"
], function(declare, djeo, Placemark, u) {
	
var numPoints = 40;

var C = declare([Placemark], {
	
	getType: function() {
		return "Circle";
	},

	getCoordsType: function() {
		return "Polygon";
	},

	_getCoords: function() {
		var coords = this.coords;
		if (!coords) {
			var c = this.center,
				lon0 = Math.PI * c[0]/180,
				lat0 = Math.PI * c[1]/180,
				r = this.radius,
				coords = [[]]
			;
			// calculating circle points
			for (var i=0; i<numPoints; i++) {
				var angle = 2*Math.PI*i/numPoints;
				// TODO: change this
				if (this.map.projection == "EPSG:3857" || this.map.projection == "EPSG:4326") {
					// calculate circle points on the surface
					var ratio = this.radius/u.earthRadius,
						lat = Math.asin( Math.sin(lat0)*Math.cos(ratio) + Math.cos(lat0)*Math.sin(ratio)*Math.cos(angle) );
						lon = lon0 + Math.atan2(Math.sin(angle)*Math.sin(ratio)*Math.cos(lat0), Math.cos(ratio)-Math.sin(lat0)*Math.sin(lat))
					;
					coords[0].push([180*lon/Math.PI, 180*lat/Math.PI]);
				}
				else {
					// calculate circle points on the plane
					coords[0].push([c[0]+r*Math.sin(angle), c[1]+r*Math.cos(angle)]);
				}
			}
			coords[0].push([coords[0][0][0], coords[0][0][1]]);
			this.coords = coords;
		}
		return coords;
	}
	
});

// register the constructor
djeo.featureTypes.Circle = C;

return C;

});