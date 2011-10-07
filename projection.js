dojo.provide("djeo.projection");

dojo.require("djeo.Map");

(function(){
	
var g = djeo,
	gp = g.projection,
	u = g.util,
	transforms = {},
	projInstances = {};
	
var getProjInstance = function(proj) {
	var instance;
	// try different ways to perform the transformation
	// dojo wrapper for Proj4js
	if (djeo.util.proj4js) {
		if (!projInstances[proj]) projInstances[proj] = new u.proj4js.Proj(proj);
		if (projInstances[proj] && projInstances[proj].readyToUse) instance = projInstances[proj];
	}
	// original Proj4js
	else if (window.Proj4js) {
		if (!projInstances[proj]) projInstances[proj] = new Proj4js.Proj(proj);
		if (projInstances[proj] && projInstances[proj].readyToUse) instance = projInstances[proj];
	}
	// direct transform function
	else {
		instance = proj;
	}
	return instance;
}

var getTransformFunction = function() {
	var transformFunction;
	// try different ways to perform the transformation

	// dojo wrapper for Proj4js
	if (djeo.util.proj4js) {
		transformFunction = function(fromProj, toProj, point) {
			return u.proj4js.transform(fromProj, toProj, point);
		};
	}
	// original Proj4js
	else if (window.Proj4js) {
		transformFunction = function(fromProj, toProj, point) {
			return Proj4js.transform(fromProj, toProj, point);
		}
	}
	// direct transform function
	else {
		transformFunction = function(fromProj, toProj, point) {
			return transforms[fromProj][toProj](point);
		};
	}
	return transformFunction;
}

// transform a single point (depth == 1)
// transform an array of points (depth == 2)
// transform an array of arrays of points (depth == 3)
// transfrom an array of arrays of arrays of points (depth == 4)
var transform = function(depth, /* Array */entities, /* Array */_entities, kwArgs) {
	if (depth == 1) {
		var p = kwArgs.transformFunction(kwArgs.fromProj, kwArgs.toProj, {x: entities[0], y: entities[1]});
		_entities.push(p.x, p.y);
		u.bbox.extend(kwArgs.bbox, [p.x, p.y]);
	}
	else {
		dojo.forEach(entities, function(entity){
			var _entity = [];
			transform(depth-1, entity, _entity, kwArgs);
			_entities.push(_entity);
		});
	}
}

gp.transform = function(fromProj, toProj, coords, coordsType) {
	// _ prefix means "projected"
	var _coords = coords;
	var transformFunction = getTransformFunction();
	fromProj = getProjInstance(fromProj);
	toProj = getProjInstance(toProj);
	if (transformFunction && fromProj && toProj) {
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
			if (depth) transform(depth, coords, _coords, {
				fromProj: fromProj,
				toProj: toProj,
				transformFunction: transformFunction,
				bbox: _bbox
			});
		}
		else {
			var p1 = transformFunction(fromProj, toProj, {x: coords[0], y: coords[1]});
			var p2 = transformFunction(fromProj, toProj, {x: coords[2], y: coords[3]});
			_coords = [p1.x, p1.y, p2.x, p2.y];
		}
	}
	return _coords;
}

gp.addTransform = function(fromProj, toProj, transformFunc) {
	if (!transforms[fromProj]) transforms[fromProj] = {};
	transforms[fromProj][toProj] = transformFunc;
}


var p = g.Placemark.prototype;
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
				coords = g.projection.transform(projection, mapProjection, coords, this.getCoordsType());
				this._coords = coords;
			}
		}
	}
	return coords;
};

// patch the Placemark class
dojo.extend(g.Placemark, {
	getProjection: function() {
		return this.projection || this.parent.getProjection();
	}
});


// patch the FeatureContainer class
dojo.extend(g.FeatureContainer, {
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
dojo.extend(g.Map, {
	getProjection: function() {
		return this.coordsProjection || this.projection;
	},
	getCoords: function(feature) {
		var userProjection = this.userProjection || this.coordsProjection || this.projection;
		if (this.projection && userProjection != this.projection) {
			coords = g.projection.transform(userProjection, this.projection, geometry);
			//geometry.projection = this.projection;
		}
		return coords;
	}
});

}());