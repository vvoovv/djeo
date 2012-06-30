define([
	"dojo/_base/declare",
	"dojo/dom-geometry",
	"../widget/InfoWindow"
], function(declare, domGeom, InfoWindow) {

return declare(null, {
	
	init: function() {
		this.infoWindow = new InfoWindow();
	},

	process: function(event){
		var feature = event.feature,
			domEvent = event.event,
			cs = feature.state.cs,
			content = cs.info ? cs.info(feature) : this.content(feature)
		;
		// adjust relative coordinates to absolute, and remove fractions
		var p1 = domGeom.position(this.map.container, true),
			p2 = domGeom.position(this.map.container, false),
			x = Math.round(domEvent.clientX + p1.x - p2.x + this.offsetX),
			y = Math.round(domEvent.clientY + p1.y - p2.y + this.offsetY)
		;
		this.infoWindow._open(x, y, content);
	}

});

});