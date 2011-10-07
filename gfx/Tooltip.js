dojo.provide("djeo.gfx.Tooltip");

dojo.require("djeo.gfx.AnimatedControl");
dojo.require("djeo.gfx.feature_interaction");

dojo.require("dijit.Tooltip");

(function(){
	
var gg = djeo.gfx,
	p = gg._pointed;

var offsetX = -1,// a bit to the left
	offsetY = 2;// a bit downwards

var position = ["above", "below"]
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
	dijit.placeOnScreenAroundElement(tooltip.domNode, aroundRect, dijit.getPopupAroundAlignment((position && position.length) ? position : dijit.Tooltip.defaultPosition, !rtl), dojo.hitch(tooltip, "orient"));
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
	_patchTooltip(tooltip);
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
				gg.onpointeroutDelay
			)
		};
	});
	return tooltip;
},
_patchTooltip = function(tooltip) {
	tooltip.show = function(/*String*/ innerHTML, /*DomNode*/ aroundNode, /*String[]?*/ position, /*Boolean*/ rtl){
		// summary:
		//		Display tooltip w/specified contents to right of specified node
		//		(To left if there's no space on the right, or if rtl == true)
		/* patched
		if(this.aroundNode && this.aroundNode === aroundNode){
			return;
		}
		*/

		// reset width; it may have been set by orient() on a previous tooltip show()
		this.domNode.width = "auto";

		if(this.fadeOut.status() == "playing"){
			// previous tooltip is being hidden; wait until the hide completes then show new one
			this._onDeck=arguments;
			return;
		}
		this.containerNode.innerHTML=innerHTML;

		var pos = dijit.placeOnScreenAroundElement(this.domNode, aroundNode, dijit.getPopupAroundAlignment((position && position.length) ? position : dijit.Tooltip.defaultPosition, !rtl), dojo.hitch(this, "orient"));
		if (dojo.isIE) tooltip.connectorNode.style.bottom = "-5px";

		// show it
		dojo.style(this.domNode, "opacity", 0);
		this.fadeIn.play();
		this.isShowingNow = true;
		this.aroundNode = aroundNode;
	};
}
clearOnpointeroutTimeout = function(type, obj) {
	clearTimeout(onpointeroutTimeout[type].id);
	onpointeroutTimeout[type] = null;
};

dojo.declare("djeo.gfx.Tooltip", djeo.gfx.AnimatedControl, {

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
						gg.onpointeroutDelay
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
