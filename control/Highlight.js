define([
	"dojo/_base/declare", // declare
	"../_base",
	"./_PointerBase"
], function(declare, djeo, Base) {

var dependency = "Highlight";
djeo.registerDependency(dependency);

return declare([Base], {
	//	summary:
	//		A basic highlighting control for the map

	constructor: function(map, kwArgs){
		if (this.enabled) this.enable();
	},

	pointeroverAction: function(newFeature, oldFeature) {
		if (oldFeature) {
			oldFeature.set("state", null);
		}
		newFeature.set("state", "highlight");
	},
	
	pointeroutAction: function(feature) {
		feature.set("state", null);
	}
});

});