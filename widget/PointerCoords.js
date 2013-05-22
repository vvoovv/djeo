define([
	"dojo/_base/declare", // declare
	"dijit/_Widget",
	"./_MapWidgetMixin"
], function(declare, _Widget, _MapWidgetMixin) {
	
var numDecimals = 4;

return declare([_Widget, _MapWidgetMixin], {
	
	postCreate: function() {
		this.inherited(arguments);
		
		var map = this.map,
			domNode = this.domNode
		;
		domNode.className = "djeoPointerCoords";
		
		domNode.style.zIndex = 1000;

		map.on("mousemove", function(event){
			var coords = event.mapCoords;
			domNode.innerHTML = coords[0].toFixed(numDecimals) + " " + coords[1].toFixed(numDecimals);
		});
		
		if (this.appendToMap) {
			map._appendDiv(domNode);
		}
	}
});

});
