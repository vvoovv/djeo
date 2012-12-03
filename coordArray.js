define([
	"dojo/_base/declare",
	"./_base"
], function(declare, djeo){
	
var dependency = "CoordArray";
djeo.registerDependency(dependency);

return {
	push: function(feature, point) {
		var factory = this._getFactory(feature);
		if (!factory) return;
		
		var _coords = feature.getCoords(),
			_point = feature.map.getCoords(point)
		;
		if (feature.getCoordsType() == "LineString") {
			_coords.push(_point);
			if (feature.coords != _coords) {
				feature.coords.push(point);
			}
		}
		
		factory.push(feature, point);
	},

	set: function(feature, index, point) {
		var factory = this._getFactory(feature);
		if (!factory) return;
		
		var _coords = feature.getCoords(),
			_point = feature.map.getCoords(point)
		;
		if (feature.getCoordsType() == "LineString") {
			_coords[index] = _point;
			if (feature.coords != _coords) {
				feature.coords[index] = point;
			}
		}

		factory.set(feature, index, point);
	},
	
	remove: function(feature, index) {
		var factory = this._getFactory(feature);
		if (!factory) return;
		
		var _coords = feature.getCoords();
		if (feature.getCoordsType() == "LineString") {
			_coords.splice(index, 1);
			if (feature.coords != _coords) {
				feature.coords.splice(index, 1);
			}
		}

		factory.remove(feature, index);
	},

	_getFactory: function(feature) {
		return feature.map.engine.getFactory(dependency);
	}
};
	
});
