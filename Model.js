dojo.provide("djeo.Model");

dojo.require("djeo.Placemark");

(function() {

var g = djeo;

dojo.declare("djeo.Model", djeo.Placemark, {
	
	type: "Model",

	constructor: function(/* Object? */featureDef, /* Object? */kwArgs) {
	},
	
	setFactory: function() {
		var map = this.map;
		if (map.engine.canRenderModels && map.renderModels) {
			this.factory = map.engine.getFactory(this.type);
		}
		else this.factory = this.map.engine.factories.Placemark;
	},
	
	getCoordsType: function() {
		return this.coordsType || "Point";
	},

	_render: function(stylingOnly, theme) {
		if (this.map.engine.canRenderModels && this.map.renderModels) {
			this.factory.render(this);
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
			dojo.mixin(this.orientation, orientation);
		}
	}
});


// default methods;
var p = g.Model.prototype;
if (!g.methods) g.methods = {};
g.methods.Model = {
	render: p._render
}

// register the constructor
g.featureTypes.Model = g.Model;

}());
