dojo.provide("djeo.gfx.Navigation");

dojo.require("djeo.gfx.Moveable");

dojo.declare("djeo.gfx.Navigation",null, {

	moveable: null,
	wheelConnection: null,

	enable: function(enable) {
		if (enable === undefined) enable = true;
		if (enable) {
			this.moveable = new djeo.gfx.Moveable(this.map.engine.surface);
			if (dojox.gfx.renderer!="silverlight") this.enableZoom(true);
		}
		else {
			if (dojox.gfx.renderer!="silverlight") this.enableZoom(false);
			this.moveable.destroy();
			this.moveable = null;
		}
	},

	enableZoom: function(enable) {
		if (enable) {
			var wheelEventName = !dojo.isMozilla ? "onmousewheel" : "DOMMouseScroll";
			this.wheelConnection = this.map.engine.surface.connect(wheelEventName, this, this._onWheel);
		}
		else {
			this.map.engine.surface.disconnect(this.wheelConnection);
			this.wheelConnection = null;
		}
	},

	_onWheel: function(mouseEvent) {
		// prevent browser interaction
		dojo.stopEvent(mouseEvent);
		
		// position relative to map container
		var x = mouseEvent.pageX - this.map.x,
			y = mouseEvent.pageY - this.map.y;
		
		// zoom increment power 
		var power = mouseEvent[ dojo.isMozilla ? "detail" : "wheelDelta" ] / (dojo.isMozilla ? -3 : 120),
			scaleFactor = Math.pow(1.2, power);

		var engine = this.map.engine;
		engine.group.applyLeftTransform({xx:scaleFactor,yy:scaleFactor, dx: x*(1-scaleFactor), dy: y*(1-scaleFactor)});

		engine.factories.Placemark.calculateLengthDenominator();
		engine.resizeFeatures(this.map.featureContainer, 1/scaleFactor);
	}
});