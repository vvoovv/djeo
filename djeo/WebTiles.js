define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // hitch
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/dom-construct",
	"../_base",
	"../WebTiles",
	"tiles/BaseTileable",
	"../util/_base",
	"../projection" // load projection machinery and transformations for Spherical Mercator projection (aka EPSG:3857)
], function(declare, lang, geometry, style, domConstruct, djeo, WebTiles, Tileable, u, proj) {

return declare([WebTiles], {
	
	zoom: 3,
	
	_urlCounter: 0,
	
	_lastUrlIndex: 0,
	
	// Spherical Mercator projection
	projection: "EPSG:3857",

	constructor: function(kwArgs, map) {
		// create container for the layer
		this.container = domConstruct.create("div", {style:{
			top: 0,
			left: 0,
			width: "100%",
			height: "100%",
			position: "absolute"
		}}, map.engine.container, 0);

		this.discreteScales = djeo.scales;
		this._lastUrlIndex = this.url.length - 1;
	},
	
	init: function() {
		var map = this.map;
		if (!map.dataProjection) {
			map.dataProjection = "EPSG:4326";
		}
		map.engine.scaleFactor = 2;
		
		this.tileable = new Tileable({
			wrapHor: true,
			setTileContent: lang.hitch(this, this.setTileContent),
			extraTiles: 1
		}, this.container);

		this.tileable._mixin();
		this.tileable._buildRendering();
	},

	zoomTo: function(extent) {
		var map = this.map,
			scales = djeo.scales,
			center = [(extent[2] + extent[0])/2, (extent[3] + extent[1])/2],
			scale = Math.min(map.width/(extent[2] - extent[0]), map.height/(extent[3] - extent[1])),
			zoom
		;
		// find which zoom is the closest one to the scale
		if (scale <= scales[0]) {
			zoom = 0;
		}
		else {
			var maxZoom = scales.length - 1;
			if (scale > scales[maxZoom]) {
				zoom = maxZoom;
			}
			else {
				for (var i = 0; i<maxZoom; i++) {
					if (scales[i] < scale && scale <= scales[i+1]) {
						zoom = i;
						break;
					}
				}
			}
		}
		
		this._setCenterAndZoom(center, zoom);
	},
	
	_setCenterAndZoom: function(center, zoom) {
		// calculating center for this.tileable
		var tileable = this.tileable,
			_pow = Math.pow(2, zoom)
		;
		tileable.extent = [0, 0, tileable.tileSize[0] * _pow, tileable.tileSize[1] * _pow];
		tileable._calculateTileBounds();
		var tExtent = tileable.extent,
			x = center[0]/(2*Math.PI*u.earthRadius/tExtent[2]),
			y = center[1]/(2*Math.PI*u.earthRadius/tExtent[3])
		;
		// map center relative to the top left corner of the tiles set
		x += tExtent[2]/2;
		y = -y + tExtent[3]/2;
		
		tileable.center = [x, y];
		tileable.zoom = zoom;
		this.tileable.updateTileDivs();
		this.zoom = zoom;
	},
	
	setCenter: function(center) {
		this._setCenterAndZoom(center, this.zoom);
	},
	
	setZoom: function(zoom) {
		this.tileable.doZoom(zoom);
		this.zoom = zoom;
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
		var zoomAmount = scaleFactor>1 ? scaleFactor : -1/scaleFactor
		this.zoom += zoomAmount/2;
		this.tileable.doZoom(this.zoom, divX, divY);
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
