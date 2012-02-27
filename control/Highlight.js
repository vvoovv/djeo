define([
	"dojo/_base/declare", // declare
	"djeo/_base",
	"./_PointerBase"
], function(declare, djeo, Base) {

var dependency = "Highlight";
djeo.registerDependency("Highlight");

return declare("djeo.control.Highlight", [Base], {
	//	summary:
	//		A basic highlighting control for the map
	
	theme: "highlight",
	
	highlightedFeature: null,

	constructor: function(map, kwArgs){
		this.attachFactory(this.enabled);
	},
	
	init: function() {

	},
/*	
	process: function(event){
		var feature = event.feature;

		if (event.type == "onmouseover") {
			if (this.highlightedFeature) {
				if (this.highlightedFeature == feature) return;
				this.highlightedFeature.render(true);
			}
			this.highlightedFeature = feature;
			feature.render(true, "highlight");
		}
		else { // onmouseout
			if (this.highlightedFeature) {
				this.highlightedFeature.render(true);
				this.highlightedFeature = null;
			}
		}
	}
*/
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