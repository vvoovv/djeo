dojo.provide("djeo.djeo.Highlight");

dojo.require("djeo.djeo.AnimatedControl");
dojo.require("djeo.djeo.feature_interaction");

dojo.require("dojox.gfx.fx");

(function(){

var dd = djeo.djeo,
	p = dd._pointed;

dojo.declare("djeo.djeo.Highlight", djeo.djeo.AnimatedControl, {
	
	highlightedFeature: null,
	
	constructor: function(kwArgs) {

	},
	
	process: function(event){
		var feature = event.feature;

		if (event.type == "onmouseover") {
			var onpointeroutTimeoutFeature;
			if (p.onpointeroutTimeout) {
				var onpointeroutTimeoutFeature = p.onpointeroutTimeout.feature;
				clearTimeout(p.onpointeroutTimeout.id);
				p.onpointeroutTimeout = null;
				if (onpointeroutTimeoutFeature==feature) return;
				else onpointeroutTimeoutFeature.render(true);
			}
			if (this.highlightedFeature) {
				if (this.highlightedFeature == feature) return;
				else if (this.highlightedFeature != onpointeroutTimeoutFeature) this.highlightedFeature.render(true);
			}
			this.highlightedFeature = feature;
			if (p.control != this) p.control = this;
			feature.render(true, "highlight");
		}
		else { // onmouseout
			if (!p.cancelOnpointerout) {
				p.onpointeroutTimeout = {
					feature: feature,
					id: setTimeout(
						dojo.hitch(this, this._onpointerout),
						dd.onpointeroutDelay
					)
				};
			}
		}
	},

	_onpointerout: function() {
		var feature = p.onpointeroutTimeout.feature;
		p.onpointeroutTimeout = null;
		this.highlightedFeature = null;
		feature.render(true);
	},

	onpointeroutHandler: function() {
		if (this.highlightedFeature) {
			this.highlightedFeature.render(true);
			this.highlightedFeature = null;
		}
	}
});

})();