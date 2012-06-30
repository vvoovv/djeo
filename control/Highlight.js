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
	
	theme: "highlight",
	
	highlightedFeature: null,

	constructor: function(map, kwArgs){
		if (this.enabled) this.enable();
	},

	pointeroverAction: function(newfeature, oldFeature) {
		if (oldFeature) {
			oldFeature.render(true);
		}
		newfeature.render(true, "highlight");
	},
	
	pointeroutAction: function(feature) {
		feature.render(true);
	}
});

});