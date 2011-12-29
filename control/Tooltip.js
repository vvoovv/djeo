dojo.provide("djeo.control.Tooltip");

dojo.require("djeo.control.Base");

dojo.require("dijit.Tooltip");

(function(){
var DEFAULT_TEXT = function(feature){
	return feature.tooltip || feature.name || feature.id;
};

var tooltip,
	tooltipControl,
	aroundRect = {x: 0, y:0, w:0, h:0}
;

var timeoutId, timeoutFeature;

dojo.declare("djeo.control.Tooltip", djeo.control.Base, {

	factoryType: "control.Tooltip",
	
	// current tooltip feature
	feature: null,
	
	offsetX: 0,
	
	offsetY: -5,
	
	position: ["above-centered", "below-centered"],
	
	rtl: false,
	
	onpointeroutDelay: 200, // milliseconds

	constructor: function(map, kwArgs) {
		this.text = kwArgs && kwArgs.text ? kwArgs.text : DEFAULT_TEXT;
		
		this.attachFactory(this.enabled);
	},

	init: function() {
		if (!tooltip) {
			tooltip = new dijit._MasterTooltip();
			tooltipControl = this;
			dojo.connect(tooltip.domNode, "onmousemove", this, function(domEvent){
				this.clientX = domEvent.clientX;
				this.clientY = domEvent.clientY;
				if (tooltipControl) tooltipControl.moveTooltip(domEvent.clientX, domEvent.clientY);
			});
		}
		dojo.connect(this.map.container, "onmousemove", this, function(domEvent){
			this.clientX = domEvent.clientX;
			this.clientY = domEvent.clientY;
			if (!timeoutId) this.moveTooltip(domEvent.clientX, domEvent.clientY);
		});
	},
	
	process: function(event){
		var feature = event.feature;
		
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}

		if (event.type == "onmouseover") {
			if (this.feature == feature) return;

			this.feature = feature;
			this.showTooltip(feature);
		}
		else if (event.type == "onmouseout"){
			timeoutFeature = feature;
			timeoutId = setTimeout(
				dojo.hitch(this, this._onpointerout),
				this.onpointeroutDelay
			)
		}
	},
	
	_onpointerout: function() {
		if (this.feature) {
			this.hideTooltip();
			this.feature = null;
		}
	},
	
	showTooltip: function(feature) {
		this._setAroundRect();
		tooltip.show(this.text(feature), aroundRect, this.position, this.rtl);
	},
	
	hideTooltip: function() {
		console.debug("hide tooltip");
		tooltip.hide(aroundRect);
	},
	
	moveTooltip: function(x, y) {
		if (this.feature) {
			this._setAroundRect(x, y);
			dijit.place.around(tooltip.domNode, aroundRect, this.position, !this.rtl, dojo.hitch(tooltip, "orient"));
		}
	},
	
	_setAroundRect: function(x, y) {
		// adjust relative coordinates to absolute, and remove fractions
		var p1 = dojo.position(this.map.container, true),
			p2 = dojo.position(this.map.container, false)
		;
		if (x=== undefined) {
			x = this.clientX;
			y = this.clientY;
		}
		aroundRect.x = Math.round(x + p1.x - p2.x + this.offsetX);
		aroundRect.y = Math.round(y + p1.y - p2.y + this.offsetY);
	}
});

})();
