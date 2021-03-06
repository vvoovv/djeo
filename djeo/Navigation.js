define([
	"dojo/_base/declare", // declare
	"dojo/has", // has
	"dojo/on",
	"dojo/aspect",
	"dojo/_base/lang", // hitch
	"dojo/_base/event", // stop
	"dojo/dom-geometry",
	"../dojox/gfx",
	"./Moveable",
	"dojo/_base/sniff"
], function(declare, has, on, aspect, lang, event, domGeom, gfx, Moveable) {

return declare(null, {

	moveable: null,

	enable: function(enable) {
		if (enable === undefined) enable = true;
		if (enable) {
			this.moveable = new Moveable(this.map.engine.container, this.map);
			var engine = this.map.engine;
			this._onFirstMove = aspect.after(this.moveable, "onFirstMove", lang.hitch(this, function(){
				this._moved = true;
			}));
			this._onMoveStop = aspect.after(this.moveable, "onMoveStop", lang.hitch(this, function(){
				if (this._moved) {
					this._moved = false;
					this.map.engine.emit("extent_changed");
				}
			}));
			if (gfx.renderer!="silverlight") this.enableZoom(true);
		}
		else {
			if (gfx.renderer!="silverlight") this.enableZoom(false);
			this._onMoveStop.remove();
			this._onFirstMove.remove();
			this.moveable.destroy();
			this.moveable = null;
		}
	},

	enableZoom: function(enable) {
		if (enable) {
			var engine = this.map.engine;
			// wheel event
			var wheelEventName = !has("mozilla") ? "mousewheel" : "DOMMouseScroll";
			this.wheelHandler = on(engine.container, wheelEventName, lang.hitch(this, this._onWheel));
			// double click
			this.dblclickHandler = on(engine.container, "dblclick", lang.hitch(this, function(mouseEvent){
				this._onZoom(mouseEvent, engine.scaleFactor);
			}));
		}
		else {
			this.dblclickHandler.remove();
			this.wheelHandler.remove();
			this.wheelHandler = this.dblclickHandler = null;
		}
	},
	
	_onWheel: function(mouseEvent) {
		// zoom increment power
		var power = mouseEvent[ has("mozilla") ? "detail" : "wheelDelta" ] / (has("mozilla") ? -3 : 120),
			scaleFactor = Math.pow(this.map.engine.scaleFactor, power)
		;
		this._onZoom(mouseEvent, scaleFactor);
	},

	_onZoom: function(mouseEvent, scaleFactor) {
		// prevent browser interaction
		event.stop(mouseEvent);
		
		var map = this.map,
			engine = map.engine,
			zoom = engine._get_zoom()
		;
		if (zoom >= 0 && ((zoom == map.minZoom && scaleFactor<1) || (zoom == map.maxZoom && scaleFactor>1)) ) {
			return;
		}
		
		// position relative to map container
		var coords = domGeom.position(this.map.engine.container, true),
			x = mouseEvent.pageX - coords.x,
			y = mouseEvent.pageY - coords.y
		;
		
		for (var i=0; i<engine.layers.length; i++) {
			engine.layers[i].doZoom(scaleFactor, mouseEvent);
		}

		engine.group.applyLeftTransform({xx:scaleFactor,yy:scaleFactor, dx: x*(1-scaleFactor), dy: y*(1-scaleFactor)});

		engine.factories.Placemark.calculateLengthDenominator();
		engine.resizeFeatures(this.map.document, 1/scaleFactor);
		
		// update info window position
		if (engine._infoWindow) {
			engine._infoWindow._doZoom(scaleFactor, x, y);
		}

		engine.onzoom_changed();
		engine.emit("extent_changed");
	}
});

});