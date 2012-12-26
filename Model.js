define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"./Placemark",
	"./_base",
], function(declare, lang, Placemark, djeo) {
	
var dependency = "Model";
djeo.registerDependency(dependency);

var Model = declare([Placemark], {

	constructor: function(/* Object? */featureDef, /* Object? */kwArgs) {
		lang.mixin(this, kwArgs);
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
	
	rotate: function(orientation) {
		var factory = this.factory;
		if (factory.rotate) {
			if (this.orientation === undefined) this.orientation = {
				heading: 0,
				tilt: 0,
				roll: 0
			};
			factory.rotate(orientation, this);
			lang.mixin(this.orientation, orientation);
		}
	}
});

// register the constructor
djeo.featureTypes.Model = Model;
return Model;
});