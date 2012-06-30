define([
	"dojo/_base/declare", // declare
	"dijit/Tooltip",
	"dojo/text!./templates/InfoWindow.html"
], function(declare, Tooltip, template) {
	
var aroundRect = {x: 0, y:0, w:0, h:0};

var InfoWindow = declare([Tooltip._MasterTooltip], {
	
	position: ["above-centered", "below-centered"],
	
	rtl: false,
	
	constructor: function(map, kwArgs) {
		this.map = map;
	},
	
	buttonCancel: "Cancel",

	templateString: template,

	_setTitleAttr: [
		{ node: "titleNode", type: "innerHTML" },
		{ node: "titleBar", type: "attribute" }
	],
	
	_open: function(x, y, content) {
		aroundRect.x = x;
		aroundRect.y = y;
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
			this.fadeOut.play();
		}else{
			// just ignore the call, it's for a tooltip that has already been erased
		}
	}

});

return InfoWindow;

});
