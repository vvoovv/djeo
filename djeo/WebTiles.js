define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin, hitch, isString
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/dom-construct",
	"tiles/BaseTileable",
	"../util/_base",
	"../projection" // load projection machinery and transformations for Spherical Mercator projection (aka EPSG:3857)
], function(declare, lang, geometry, style, domConstruct, Tileable, u, proj) {

// building array of scales; array index corresponds to zoom
// scale is the number of pixels per map projection unit
// scale = 256*2^zoom/(2*Math.PI*earthRadius)
var scales = [1/156543.034];
for(var i=1; i<20; i++) {
	scales[i] = 2 * scales[i-1];
}

var defaultCenter = [0,0];

return declare(null, {
	
	zoom: 3,
	
	_urlCounter: 0,
	
	_lastUrlIndex: 0,
	
	// Spherical Mercator projection
	projection: "EPSG:3857",

	constructor: function(kwArgs, map) {
		this.map = map;
		this.discreteScales = scales;
		lang.mixin(this, kwArgs);

		// paramStr is actually url
		var url = kwArgs.paramStr ? kwArgs.paramStr : this.url;
		if (lang.isString(url)) {
			// check if url contains the left square bracket
			var lBracket = url.indexOf("[");
			if (lBracket > -1) {
				// we have a template in the url
				// the right square bracket is supposed to close the left square bracket
				var rBracket = url.indexOf("]")
					parts = url.substring(lBracket+1, rBracket).split(",")
				;
				this.url = [];
				for (var i=0; i<parts.length; i++) {
					this.url[i] = url.substring(0, lBracket) + parts[i] + url.substring(rBracket+1);
				}
			}
			else {
				this.url = [url];
			}
		}
		this._lastUrlIndex = this.url.length - 1;
	},
	
	init: function() {
		var map = this.map;
		if (!map.coordsProjection) {
			map.coordsProjection = "EPSG:4326";
		}
		map.engine.scaleFactor = 2;
		// finding center, zoom, scale
		var center = map.center;
		if (center) {
			center = map.getCoords(center);
		}
		else {
			var bbox = map.getBbox();
			if (bbox) {
				center = [(bbox[2] + bbox[0])/2, (bbox[3] + bbox[1])/2];
			}
			else {
				center = [defaultCenter[0], defaultCenter[1]];
			}
		}
		if (map.zoom === undefined) {
			scale = Math.min(map.width/(bbox[2] - bbox[0]), map.height/(bbox[3] - bbox[1]));
			// find which zoom is the closest to the scale
			if (scale <= scales[0]) {
				this.zoom = 0;
			}
			else {
				var maxZoom = scales.length - 1;
				if (scale > scales[maxZoom]) {
					this.zoom = maxZoom;
				}
				else {
					for (var i = 0; i<maxZoom; i++) {
						if (scales[i] < scale && scale <= scales[i+1]) {
							this.zoom = ( (scale - scales[i]) <= (scales[i+1] - scale) ) ? i : i+1;
							break;
						}
					}
				}
			}
		}
		else {
			this.zoom = map.zoom;
		}
		
		this.tileable = new Tileable({
			wrapHor: true,
			zoom: this.zoom, //3,
			setTileContent: lang.hitch(this, this.setTileContent),
			extraTiles: 1
		}, this.container);
		
		// calculating center for this.tileable
		var extent = this.tileable.extent,
			x = center[0]/(2*Math.PI*u.earthRadius/extent[2]),
			y = center[1]/(2*Math.PI*u.earthRadius/extent[3])
		;
		// map center relative to the top left corner of the tiles set
		x += extent[2]/2;
		y = -y + extent[3]/2;
		this.tileable.center = [x, y];

		this.tileable._mixin();
		this.tileable._buildRendering();
		this.tileable._startup();
	},
	
	onMove: function(shiftX, shiftY) {
		this.tileable.onTouchMove(shiftX, shiftY);
	},
	
	setStartPos: function() {
		this.tileable.startPos = this.tileable.getPos();
	},
	
	getScale: function() {
		return this.discreteScales[this.zoom];
	},
	
	doZoom: function(scaleFactor, event) {
		var borderBox = geometry.position(this.container, true),
			divX = Math.floor(event.pageX - borderBox.x - style.get(this.container, "borderLeftWidth")),
			divY = Math.floor(event.pageY - borderBox.y - style.get(this.container, "borderTopWidth"))
		;
		this.tileable.doZoom(scaleFactor>1 ? scaleFactor : -1/scaleFactor, divX, divY);
	},
	
	setTileContent: function(tile, zoom, x, y) {
		if (tile.img) {
			tile.div.removeChild(tile.img);
		}
		var img = domConstruct.create("img", {
			width: 256,
			height: 256,
			src: this.url[this._urlCounter]+"/"+zoom+"/"+x+"/"+y+".png"
		}, tile.div);
		// storing img
		tile.img = img;
		if (this._urlCounter == this._lastUrlIndex) {
			this._urlCounter = 0;
		}
		else {
			this._urlCounter++;
		}
		
	}
});

});
