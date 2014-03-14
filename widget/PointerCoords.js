define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang",
	"dijit/_Widget",
	"./_MapWidgetMixin"
], function(declare, lang, _Widget, _MapWidgetMixin) {

return declare([_Widget, _MapWidgetMixin], {
	
	numDecimals: 4,
	
	latitudeFirst: true,
	
	postCreate: function() {
		this.inherited(arguments);
		
		var map = this.map,
			domNode = this.domNode
		;
		domNode.className = "djeoPointerCoords";

		this._setZIndex();

		map.on("mousemove", lang.hitch(this, function(event){
			var coords = event.mapCoords;
			domNode.innerHTML = this.getCoordString(coords);
		}));
		
		if (this.appendToMap) {
			map._appendDiv(domNode);
		}
	},
	
	getCoordString: function(coords) {
		var coord1 = coords[0].toFixed(this.numDecimals),
			coord2 = coords[1].toFixed(this.numDecimals)
		;
		if (this.latitudeFirst) {
			var t = coord1;
			coord1 = coord2;
			coord2 = t;
		}
		return coord1 + " " + coord2;
	}
});

});
