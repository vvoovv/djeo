dojo.provide("djeo.djeo.Tooltip");

dojo.require("djeo.djeo.AnimatedControl");
dojo.require("djeo.djeo.feature_interaction");

dojo.require("dijit.Tooltip");

(function(){
	
var dd = djeo.djeo,
	p = dd._pointed;

var offsetX = 0,
	offsetY = 2;// a bit downwards

var position = ["above-centered", "below-centered"],
	rtl = false;

// singletons!
var tooltip,
	onpointermoveConn,
	aroundRect = {x: 0, y:0, w:0, h:0},
	onpointeroutTimeout = {feature: null, tooltip: null};

var showTooltip = function(/*String*/ innerHTML, browserEvent, control, /*Boolean*/ rtl){
	if(!tooltip) tooltip = createTooltip();
	_setAroundRect(browserEvent, control);
	onpointermoveConn = dojo.connect(tooltip.domNode, "onmousemove", function(event){
		moveTooltip(event);
	});
	return tooltip.show(innerHTML, aroundRect, position, rtl);
},
moveTooltip = function(browserEvent) {
	_setAroundRect(browserEvent);
	dijit.place.around(tooltip.domNode, aroundRect, position, !rtl, dojo.hitch(tooltip, "orient"));
	if (dojo.isIE) tooltip.connectorNode.style.bottom = "-5px";
},
_setAroundRect = function(browserEvent, control) {
	if (control) aroundRect.control = control;
	else control = aroundRect.control;
	var p1 = dojo.position(control.map.container, true),
		p2 = dojo.position(control.map.container, false);
	aroundRect.x = Math.round(browserEvent.clientX+p1.x-p2.x)-offsetX;
	aroundRect.y = Math.round(browserEvent.clientY+p1.y-p2.y)-offsetY;
},
hideTooltip = function(){
	dojo.disconnect(onpointermoveConn);
	if (onpointeroutTimeout.tooltip) clearOnpointeroutTimeout("tooltip");
	if (p.control) p.control.onpointeroutHandler.call(p.control);
	if(!tooltip) tooltip = createTooltip();
	return tooltip.hide(aroundRect);
},
createTooltip = function() {
	var tooltip = new dijit._MasterTooltip();
	dojo.connect(tooltip.domNode, "onmouseover", function() {
		p.cancelOnpointerout = true;
		if (onpointeroutTimeout.feature) clearOnpointeroutTimeout("feature");
		if (onpointeroutTimeout.tooltip) clearOnpointeroutTimeout("tooltip");
		if (p.onpointeroutTimeout){
			clearTimeout(p.onpointeroutTimeout.id);
			p.onpointeroutTimeout = null;
		}
	});
	tooltip.connect(tooltip.domNode, "onmouseout", function() {
		p.cancelOnpointerout = false;
		if (onpointeroutTimeout.feature) clearOnpointeroutTimeout("feature");
		if (onpointeroutTimeout.tooltip) clearOnpointeroutTimeout("tooltip");
		onpointeroutTimeout.tooltip = {
			id: setTimeout(
				function(){
					onpointeroutTimeout.tooltip = null;
					aroundRect.control.clearFeature();
					hideTooltip();
				},
				dd.onpointeroutDelay
			)
		};
	});
	return tooltip;
},
clearOnpointeroutTimeout = function(type, obj) {
	clearTimeout(onpointeroutTimeout[type].id);
	onpointeroutTimeout[type] = null;
};

dojo.declare("djeo.djeo.Tooltip", dd.AnimatedControl, {

	// current tooltip feature
	feature: null,
	
	onmousemoveHandle: null,

	onmouseoverTimeout: null,

	constructor: function(kwArgs) {
		this.onmousemoveHandle = djeo.util.uid();
	},

	process: function(event) {
		var feature = event.feature;
		
		if (onpointeroutTimeout.feature) clearOnpointeroutTimeout("feature");
		if (onpointeroutTimeout.tooltip) clearOnpointeroutTimeout("tooltip");

		if (event.type == "onmouseout") {
			if (!p.cancelOnpointerout) {
				onpointeroutTimeout.feature = {
					feature: feature,
					id: setTimeout(
						dojo.hitch(this, this._onpointerout),
						dd.onpointeroutDelay
					)
				};
			}
		}
		else if (event.type == "onmousemove") {
			// adjust relative coordinates to absolute, and remove fractions
			moveTooltip(event.event);
		}
		else if (event.type == "onmouseover") {
			if (this.feature == feature) return;
			
			if (this.feature) this.feature.disconnect(this.onmousemoveHandle);

			this.feature = feature;
			feature.connectWithHandle(this.onmousemoveHandle, "onmousemove", this, "process");
			showTooltip(this.text(feature), event.event, this);
		}
	},
	
	_onpointerout: function() {
		onpointeroutTimeout.feature = null;
		this.clearFeature();
		hideTooltip();
	},
	
	clearFeature: function() {
		if (this.feature) {
			this.feature.disconnect(this.onmousemoveHandle);
			this.feature = null;
		}
	},
	
	hideTooltip: function() {
		hideTooltip();
	},
	
	enable: function(enable) {
		if (enable === undefined) enable = true;
		if (enable) this._connectEvents();
		else {
			this.hideTooltip();
			if (this.feature) this.feature.disconnect(this.onmousemoveHandle);
			this._disconnectEvents();
		}
		this.enabled = enable;
	}
});

})();
