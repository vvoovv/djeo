dojo.provide("djeo.util");

(function(){
	
var u = djeo.util,
	idCounter = 0;

u.baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/')+1);

u.uid = function() {
	idCounter += 1;
	return idCounter;
}

u.degToRad = function(degree){
	return Math.PI * degree / 180;
};

u.radToDeg = function(radian){
	return radian / Math.PI * 180;
};

u.isRelativeUrl = function(url) {
	return url.substr(0,4)=="http" ? false : true;
};

u.bbox = {
	extend: function(extendWhat, extendWith) {
		if (extendWith) {
			// left
			if (extendWith[0] < extendWhat[0]) extendWhat[0] = extendWith[0];
			// bottom
			if (extendWith[1] < extendWhat[1]) extendWhat[1] = extendWith[1];
			if (extendWith.length == 4) {
				// right
				if (extendWith[2] > extendWhat[2]) extendWhat[2] = extendWith[2];
				// top
				if (extendWith[3] > extendWhat[3]) extendWhat[3] = extendWith[3];
			}
			else { // extendWith.length == 4 (e.g. a point)
				if (extendWith[0] > extendWhat[2]) extendWhat[2] = extendWith[0];
				// top
				if (extendWith[1] > extendWhat[3]) extendWhat[3] = extendWith[1];
			}
		}
		return extendWhat;
	},
	
	get: function(feature) {
		var coords = feature.getCoords();
		var bbox,
			depth = 0;
		switch (feature.getCoordsType()) {
			case "Point":
				depth = 1;
				break;
			case "LineString":
				depth = 2;
				break;
			case "Polygon":
				depth = 3;
				break;
			case "MultiLineString":
				depth = 3;
				break;
			case "MultiPolygon":
				depth = 4;
				break;
		}
		if (depth) {
			bbox = [Infinity,Infinity,-Infinity,-Infinity];
			_calculateBbox(depth, coords, bbox);
			feature._bbox = bbox;
		}
		return bbox;
	}	
};

u.center = function(feature) {
	var bbox = u.bbox.get(feature),
		center;
	if (bbox) {
		center = [ (bbox[0]+bbox[2])/2, (bbox[1]+bbox[3])/2 ];
	}
	return center;
};
	
// calculate bbox for:
// a single point (depth == 1)
// an array of points (depth == 2)
// an array of arrays of points (depth == 3)
// an array of arrays of arrays of points (depth == 4)
	
var _calculateBbox = function(depth, /* Array */entities, bbox) {
	if (depth == 1) {
		u.bbox.extend(bbox, entities);
	}
	else {
		dojo.forEach(entities, function(entity){
			_calculateBbox(depth-1, entity, bbox);
		});
	}
}

}());