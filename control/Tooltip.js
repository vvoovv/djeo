define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // hitch
	"dojo/on",
	"dojo/dom-geometry", // position
	"dijit/Tooltip",
	"dijit/place",
	"../_base",
	"./_PointerBase"
], function(declare, lang, on, domGeom, Tooltip, place, djeo, Base){

var dependency = "Tooltip";
djeo.registerDependency(dependency);

var DEFAULT_CONTENT = function(feature){
	return feature.tooltip || feature.name || feature.id;
};

var tooltip,
	tooltipControl,
	aroundRect = {x: 0, y:0, w:0, h:0}
;

return declare([Base], {
	
	offsetX: 0,
	
	offsetY: -5,
	
	position: ["above-centered", "below-centered"],
	
	rtl: false,

	constructor: function(map, kwArgs) {
		this.content = kwArgs && kwArgs.content ? kwArgs.content : DEFAULT_CONTENT;
		
		// attach factory if it exists
		var factory = this.map.engine.getFactory(dependency);
		if (factory) {
			lang.mixin(this, factory);
		}
		
		this.init();
		if (this.enabled) this.enable();
	},

	init: function() {
		if (!tooltip) {
			tooltip = new Tooltip._MasterTooltip();
			tooltipControl = this;
			on(tooltip.domNode, "mousemove", lang.hitch(this, function(domEvent){
				this.clientX = domEvent.clientX;
				this.clientY = domEvent.clientY;
				if (tooltipControl) tooltipControl.moveTooltip(domEvent.clientX, domEvent.clientY);
			}));
		}
		on(this.map.container, "mousemove", lang.hitch(this, function(domEvent){
			this.clientX = domEvent.clientX;
			this.clientY = domEvent.clientY;
			if (!tooltipControl.c.timeoutId) tooltipControl.moveTooltip(domEvent.clientX, domEvent.clientY);
		}));
	},

	pointeroverAction: function(feature) {
		this.showTooltip(feature);
	},
	
	pointeroutAction: function(feature) {
		this.hideTooltip();
	},

	showTooltip: function(feature) {
		this._setAroundRect();
		// calculated style
		var cs = feature.state.cs;
		tooltip.show(cs.tooltip ? cs.tooltip(feature) : this.content(feature), aroundRect, this.position, this.rtl);
	},
	
	hideTooltip: function() {
		tooltip.hide(aroundRect);
	},
	
	moveTooltip: function(x, y) {
		// currently active feature
		var f = this.c.feature;
		if (f && f.handles[this.c.handle][4][this.id]) {
			this._setAroundRect(x, y);
			place.around(tooltip.domNode, aroundRect, this.position, !this.rtl, lang.hitch(tooltip, "orient"));
		}
	},
	
	_setAroundRect: function(x, y) {
		// adjust relative coordinates to absolute, and remove fractions
		var p1 = domGeom.position(this.map.container, true),
			p2 = domGeom.position(this.map.container, false)
		;
		if (x=== undefined) {
			x = this.clientX;
			y = this.clientY;
		}
		aroundRect.x = Math.round(x + p1.x - p2.x + this.offsetX);
		aroundRect.y = Math.round(y + p1.y - p2.y + this.offsetY);
	}
});

});
