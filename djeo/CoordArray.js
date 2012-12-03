define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array"
], function(declare, lang, array){
	
return declare(null, {
	constructor: function(kwArgs) {
		lang.mixin(this, kwArgs);
	},

	push: function(feature, point) {
		this._setShapes(feature);
	},

	set: function(feature, index, point) {
		this._setShapes(feature);
	},
	
	remove: function(feature, index) {
		this._setShapes(feature);
	},

	_setShapes: function(feature) {
		var pathString = this.engine.factories.Placemark.makePathString(feature.getCoords(), 1);
		array.forEach(feature.baseShapes, function(shape){
			shape.setShape(pathString);
		});
	}
});

});