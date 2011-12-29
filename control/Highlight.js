dojo.provide("djeo.control.Highlight");

dojo.require("djeo.control.Base");

dojo.declare("djeo.control.Highlight", djeo.control.Base, {
	//	summary:
	//		A basic highlighting control for the map
	
	factoryType: "control.Highlight",
	
	theme: "highlight",
	
	highlightedFeature: null,

	constructor: function(map, kwArgs){
		this.attachFactory(this.enabled);
	},
	
	init: function() {

	},
	
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
});
