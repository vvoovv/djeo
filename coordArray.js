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
		factory.push(feature, point);
	},

	set: function(feature, index, point) {
		var factory = this._getFactory(feature);
		if (!factory) return;
		factory.set(feature, index, point);
	},

	_getFactory: function(feature) {
		return feature.map.engine.getFactory(dependency);
	}
};
	
});
