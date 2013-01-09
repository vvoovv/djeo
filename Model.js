define([
	"dojo/_base/declare",
	"dojo/_base/lang", // isObject
	"./Placemark",
	"./_base",
], function(declare, lang, Placemark, djeo) {
	
var dependency = "Model";
djeo.registerDependency(dependency, function(map){
	return map.engine.canRenderModels;
});

var Model = declare([Placemark], {

	constructor: function(/* Object? */featureDef, /* Object? */kwArgs) {
		lang.mixin(this, kwArgs);
		if (!lang.isObject(this.orientation)) {
			var heading = this.orientation;
			this.orientation = {
				heading: heading === undefined ? 0: heading,
				tilt: 0,
				roll: 0
			};
			
		}
	},
	
	getCoordsType: function() {
		return this.coordsType || "Point";
	},

	_render: function(theme, destroy) {
		// set factory
		if (!this.factory) {
			var map = this.map;
			if (map.engine.canRenderModels && map.renderModels) {
				this.factory = map.engine.getFactory(dependency);
			}
			else this.factory = this.map.engine.factories.Placemark;
		}
		
		if (this.map.engine.canRenderModels && this.map.renderModels) {
			// return Deferred
			return this.factory.render(this);
		}
		else {
			this.inherited(arguments);
		}
	},
	
	_set_coords: function(coords) {
		// convert coordinates to the map projection if it is relevant here
		var _coords = this.map.getCoords(coords);
		this.factory.setCoords(_coords, this);
		this.coords = coords;
		this._coords = _coords;
	},
	
	_set_orientation: function(orientation) {
		var m = this.map;
		if (m.engine.canRenderModels && m.renderModels) {
			if (!lang.isObject(orientation)) {
				orientation = {heading: orientation};
			}
			this.factory.setOrientation(orientation, this);
			lang.mixin(this.orientation, orientation);
		}
		else {
			this.inherited(arguments);
		}
	}
});

// register the constructor
djeo.featureTypes.Model = Model;
return Model;
});