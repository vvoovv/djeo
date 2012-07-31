define([
	"dojo/_base/declare", // declare
	"dojo/dom-geometry",
	"dijit/Tooltip",
	"dojo/text!./templates/InfoWindow.html"
], function(declare, domGeom, Tooltip, template) {
	
var aroundRect = {x: 0, y:0, w:0, h:0};

var InfoWindow = declare([Tooltip._MasterTooltip], {
	
	position: ["above-centered", "below-centered"],
	
	rtl: false,
	
	buttonCancel: "Cancel",

	templateString: template,

	_setTitleAttr: [
		{ node: "titleNode", type: "innerHTML" }
	],
	
	postCreate: function() {
		this.inherited(arguments);
		if (!this.title) {
			this.titleNode.style.display = "none";
		}
	},
	
	_open: function(x, y, content) {
		aroundRect.x = x;
		aroundRect.y = y;
		this.map.engine._infoWindow = this;
		this.show(content, aroundRect, this.position, this.rtl);
	},
	
	close: function(){
		// summary:
		//		close the info window

		if(this._onDeck && this._onDeck[1] == aroundNode){
			// this hide request is for a show() that hasn't even started yet;
			// just cancel the pending show()
			this._onDeck=null;
		}else if(this.aroundNode){
			// this hide request is for the currently displayed tooltip
			this.fadeIn.stop();
			this.isShowingNow = false;
			this.aroundNode = null;
			delete this.map.engine._infoWindow;
			this.fadeOut.play();
		}else{
			// just ignore the call, it's for a tooltip that has already been erased
		}
	},
	
	_doZoom: function(scaleFactor, centerX, centerY) {
		var coords = domGeom.position(this.map.container, true),
			// contentBox for tooltipContainer
			cb_tc = domGeom.getContentBox(this.tooltipContainer),
			// contentBox for connectorNode
			cb_cn = domGeom.getContentBox(this.connectorNode)
		;
		
		// calculate current position of connectorNode relative to map container
		var s = this.domNode.style,
			l = s.left,
			t = s.top
		;
		l = parseInt(l.substr(0, l.length-2));
		t = parseInt(t.substr(0, t.length-2));
		var	x1 = l - coords.x + cb_tc.w/2,
			y1 = t - coords.y + cb_tc.h + cb_cn.h
		;
		// calculate new position of connectorNode relative to map container
		x2 = scaleFactor*x1 + centerX*(1-scaleFactor);
		y2 = scaleFactor*y1 + centerY*(1-scaleFactor);
		s.left = Math.round(l + x2 - x1) + "px";
		s.top = Math.round(t + y2 - y1) + "px";
	}

});

return InfoWindow;

});
