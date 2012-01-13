define([
	"dojo/_base/lang", // extend
	"dojo/_base/array", // forEach
	"dojo/_base/kernel", // global
	"djeo/Map",
	"djeo/Placemark",
	"djeo/FeatureContainer",
	"djeo/util/bbox"
], function(lang, array, kernel, Map, Placemark, FeatureContainer, bbox) {

// module object
var proj = {},
	proj4js,
	// registry of direct transform functions
	transforms = {},
	// registry of projection instances, used if global Proj4js is defined
	projInstances = {}
;
	

// tranform function for the djeo wrapper for Proj4js
var djeoProj4jsTransform = function(fromProj, toProj, point) {
	return proj4js.transform(fromProj, toProj, point);
};

// tranform function for the original Proj4js
var proj4jsTransform = function(fromProj, toProj, point) {
	return Proj4js.transform(fromProj, toProj, point);
};

// direct transform function
var directTransform = function(fromProj, toProj, point) {
	return transforms[fromProj][toProj](point);
};


// transform a single point (depth == 1)
// transform an array of points (depth == 2)
// transform an array of arrays of points (depth == 3)
// transfrom an array of arrays of arrays of points (depth == 4)
var transform = function(depth, /* Array */entities, /* Array */_entities, fromProj, toProj, transformFunction, bb) {
	if (depth == 1) {
		var p = transformFunction(fromProj, toProj, {x: entities[0], y: entities[1]});
		_entities.push(p.x, p.y);
		bbox.extend(bb, [p.x, p.y]);
	}
	else {
		array.forEach(entities, function(entity){
			var _entity = [];
			transform(depth-1, entity, _entity, fromProj, toProj, transformFunction, bb);
			_entities.push(_entity);
		});
	}
}

proj.transform = function(fromProj, toProj, coords, coordsType) {
	// _ prefix means "projected"
	var _coords = coords,
		pi = projInstances
	;

	// get transforFunction, fromProj, toProj
	// try different ways
	var transformFunction;
	// djeo wrapper for Proj4js
	if (proj4js) {
		if (!pi[fromProj]) pi[fromProj] = new proj4js.Proj(fromProj);
		if (!pi[toProj]) pi[toProj] = new proj4js.Proj(toProj);
		if (pi[fromProj].readyToUse && pi[fromProj].readyToUse) {
			fromProj = pi[fromProj];
			toProj = pi[toProj];
			transformFunction = djeoProj4jsTransform;
		}
	}
	// original Proj4js
	else if (kernel.global.Proj4js) {
		if (!pi[fromProj]) pi[fromProj] = new Proj4js.Proj(fromProj);
		if (!pi[toProj]) pi[toProj] = new Proj4js.Proj(toProj);
		if (pi[fromProj].readyToUse && pi[fromProj].readyToUse) {
			fromProj = pi[fromProj];
			toProj = pi[toProj];
			transformFunction = proj4jsTransform;
		}
	}
	
	if (!transformFunction && transforms[fromProj] && transforms[fromProj][toProj]) {
		// try direct transform function
		transformFunction = directTransform;
	}

	if (transformFunction) {
		if (coordsType) {
			_coords = [];
			var _bbox = [Infinity,Infinity,-Infinity,-Infinity];
			var depth = 0;
			switch (coordsType) {
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
			if (depth) transform(
				depth,
				coords,
				_coords,
				fromProj,
				toProj,
				transformFunction,
				_bbox
			);
		}
		else {
			var p1 = transformFunction(fromProj, toProj, {x: coords[0], y: coords[1]});
			var p2 = transformFunction(fromProj, toProj, {x: coords[2], y: coords[3]});
			_coords = [p1.x, p1.y, p2.x, p2.y];
		}
	}
	return _coords;
}

proj.addTransform = function(fromProj, toProj, transformFunc) {
	if (!transforms[fromProj]) transforms[fromProj] = {};
	transforms[fromProj][toProj] = transformFunc;
}

proj.setProj4js = function(_proj4js){
	if (!proj4js) {
		proj4js = _proj4js;
	}
}


var p = Placemark.prototype;
// patch getCoords method of the Placemark class
var getCoords = p.getCoords; // original getCoords
p.getCoords = function() {
	var coords  = this._coords;
	if (!coords) {
		// calling original getCoords
		coords = getCoords.call(this);
		if (coords) {
			var projection = this.getProjection();
			// compare projections of coords and the map
			var mapProjection = this.map.projection;
			if (projection && mapProjection && projection !== mapProjection) {
				coords = proj.transform(projection, mapProjection, coords, this.getCoordsType());
				this._coords = coords;
			}
		}
	}
	return coords;
};

// patch the Placemark class
lang.extend(Placemark, {
	getProjection: function() {
		return this.projection || this.parent.getProjection();
	}
});


// patch the FeatureContainer class
lang.extend(FeatureContainer, {
	getProjection: function() {
		var projection = this.projection || this._projection;
		if (!projection) {
			projection = this.parent.getProjection();
			// store the projection for future calls
			this._projection = projection;
		}
		return projection;
	}
});

// patch the Map class
lang.extend(Map, {
	getProjection: function() {
		return this.coordsProjection || this.projection;
	},
	getCoords: function(coords, type) {
		var userProjection = this.userProjection || this.coordsProjection || this.projection;
		if (this.projection && userProjection != this.projection) {
			coords = proj.transform(userProjection, this.projection, coords, type || "Point");
		}
		return coords;
	}
});

return proj;
});