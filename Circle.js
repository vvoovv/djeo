define([
	"dojo/_base/declare",
	"./_base",
	"./Placemark",
	"./util/_base"
], function(declare, djeo, Placemark, u) {
	
var numPoints = 40;

function getCoords(center, radius) {
	var c = center,
		lon0 = Math.PI * c[0]/180,
		lat0 = Math.PI * c[1]/180,
		ratio = radius/u.earthRadius,
		coords = []
	;
	// calculating circle points
	for (var i=0; i<numPoints; i++) {
		var angle = 2*Math.PI*i/numPoints,
			// calculate circle points on the surface
			lat = Math.asin( Math.sin(lat0)*Math.cos(ratio) + Math.cos(lat0)*Math.sin(ratio)*Math.cos(angle) );
			lon = lon0 + Math.atan2(Math.sin(angle)*Math.sin(ratio)*Math.cos(lat0), Math.cos(ratio)-Math.sin(lat0)*Math.sin(lat))
		;
		coords.push([180*lon/Math.PI, 180*lat/Math.PI]);
	}
	coords.push([coords[0][0], coords[0][1]]);
	return coords;
}

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
			var coords = [ getCoords(this.center, this.radius) ];
			this.coords = coords;
		}
		return coords;
	}
	
});

// register the constructor
djeo.featureTypes.Circle = C;

// make getCoords available externally
C.getCoords = getCoords;

return C;

});