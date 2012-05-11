define([
	"require",
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin, isString, hitch
	"dojo/_base/array", // forEach
	"dojo/dom-construct", // create
	"../dojox/gfx",
	"../dojox/gfx/matrix",
	"../Engine",
	"./Placemark",
	"../util/geometry"
], function(require, declare, lang, array, domConstruct, gfx, matrix, Engine, Placemark, geom) {

var _osm = ["./WebTiles", {url: "http://[a,b,c].tile.openstreetmap.org"}];

// MapQuest-OSM Tiles
var _mqOsm = ["./WebTiles", {url: "http://otile[1,2,3,4].mqcdn.com/tiles/1.0.0/osm"}];

// MapQuest Open Aerial Tiles
var _mqOa = ["./WebTiles", {url: "http://oatile[1,2,3,4].mqcdn.com/tiles/1.0.0/sat"}];

var supportedLayers = {
	"webtiles": ["./WebTiles", {}],
	"roadmap": _osm,
	"osm": _osm,
	"openstreetmap": _osm,
	"osm.org": _osm,
	"openstreetmap.org": _osm,
	"mapquest-osm": _mqOsm,
	"mapquest-oa": _mqOa
};

var engineEvents = {mouseover: "onmouseover", mouseout: "onmouseout", click: "onclick"};

var getLayerClassId = function(/* String */layerId) {
	// check if we've got a complex structure like "layerClassId:url"
	var colonIndex = layerId.indexOf(":");
	return (colonIndex > 0) ? layerId.substring(0, colonIndex) : layerId;
};

return declare([Engine], {
	
	scaleFactor: 1.2,
	
	correctionScale: 100000,
	
	pointZoomFactor: 0.01,
	
	resizePoints: true,
	resizeLines: true,
	resizeAreas: true,
	
	correctScale: false,
	
	// array of layers
	layers: null,
	
	// registry of layers
	_layerReg: null,
	
	// the bottom layer may set projection for the whole map
	// it may also set discrete zooms for the whole map
	bottomLayer: null,
	
	// container: Object
	//		Container for all map's divs
	container: null,
	
	constructor: function(kwArgs) {
		this._require = require;
		// set ignored dependencies
		lang.mixin(this.ignoredDependencies, {"Highlight": 1, "Tooltip": 1});
		this.layers = [];
		this._layerReg = {};
		// initialize basic factories
		this._initBasicFactories(new Placemark({
			map: this.map,
			engine: this
		}));
	},
	
	initialize: function(/* Function */readyFunction) {
		var map = this.map;
		this.map.container.style.overflow = "hidden";
		this.container = domConstruct.create("div", {style:{
			width: "100%",
			height: "100%",
			position: "relative"
		}}, map.container);
		this.surface = gfx.createSurface(this.container, map.width, map.height);
		this.surface.rawNode.style.position = "absolute";
		this.group = this.surface.createGroup();
		
		if (map.resizePoints !== undefined) this.resizePoints = map.resizePoints;
		if (map.resizeLines !== undefined) this.resizeLines = map.resizeLines;
		if (map.resizeAreas !== undefined) this.resizeAreas = map.resizeAreas;
		
		if (map.resizePoints !== undefined) this.resizePoints = map.resizePoints;
		if (map.resizeLines !== undefined) this.resizeLines = map.resizeLines;
		if (map.resizeAreas !== undefined) this.resizeAreas = map.resizeAreas;

		this.initialized = true;
		readyFunction();
	},
	
	createContainer: function(parentContainer, featureType) {
		// parentContainer is actually parent group
		return parentContainer.createGroup();
	},

	prepare: function() {
		//transform the map to fit container
		var mapExtent = this.map.extent,
			mapWidth = mapExtent[2] - mapExtent[0],
			mapHeight = mapExtent[3] - mapExtent[1];

		// check if we need to apply a corrective scaling
		if (mapWidth<1000 || mapHeight<1000) this.correctScale = true;

		this.factories.Placemark.init();
		this.zoomTo(mapExtent);
		this.factories.Placemark.prepare();
	},
	
	getTopContainer: function() {
		return this.group;
	},
	
	on: function(feature, event, method, context) {
		var connections = [];
		// normalize the callback function
		method = this.normalizeCallback(feature, event, method, context);
		event = engineEvents[event];
		array.forEach(feature.baseShapes, function(shape){
			connections.push([shape, shape.connect(event, method)]);
		});
		return connections;
	},
	
	disconnect: function(connections) {
		array.forEach(connections, function(connection){
			connection[0].disconnect(connection[1]);
		});
	},
	
	destroy: function() {
		this.surface.destroy();
	},
	
	enableLayer: function(/* String|Object */layer, enabled) {
		if (enabled === undefined) enabled = true;
		if (enabled) {
			if (lang.isString(layer)) {
				// we've got a layer id
				layer = layer.toLowerCase();
				// check if the layer already has been enabled
				if (this._layerReg[layer]) return;

				var colonIndex = layer.indexOf(":")
					classId = (colonIndex > 0) ? layer.substring(0, colonIndex) : layer
				;
				
				// check if know the layer class id
				if (!supportedLayers[classId]) return;
				var layerDef = supportedLayers[classId];
				var kwArgs = layerDef[1];
				if (colonIndex > 0) {
					kwArgs.paramStr = layer.substring(colonIndex+1);
				}

				if (this._layerCtrs[classId]) {
					// layer constructor is already available
					// proceed directly to layer initialization
					this._createLayer(layer, this._layerCtrs[classId], kwArgs);
				}
				else {
					// load layer module
					require([layerDef[0]], lang.hitch(this, function(layerCtor){
						this._layerCtrs[classId] = layerCtor;
						this._createLayer(layer, layerCtor, kwArgs);
					}));
				}
			}
			else {
				// we've got a layer instance
				// check if the layer already has been enabled
				for (var i=0; i<this.layers.length; i++) {
					if (this.layers[i] === layer) return;
				}
			}
		}
	},
	
	_createLayer: function(/* String */layerId, /* Function */layerCtor, kwArgs) {
		// create container for the layer
		var container = domConstruct.create("div", {style:{
			top: 0,
			left: 0,
			width: "100%",
			height: "100%",
			position: "absolute"
		}}, this.container, 0);
		if (!kwArgs) {
			kwArgs = {};
		}
		kwArgs.container = container;
		var layer = new layerCtor(kwArgs, this.map);
		// TODO: check if the layer supports bottom layer projection
		if (!this.bottomLayer) {
			this.bottomLayer = layer;
			if (layer.projection) {
				this.map.projection = layer.projection;
			}
		}
		layer.init();
		this.layers.push(layer);
		this._layerReg[layerId] = layer;
	},
	
	isValidLayerId: function(/* String */layerId) {
		var classId = getLayerClassId(layerId.toLowerCase());
		return classId in supportedLayers;
	},
	
	getLayerModuleId: function(/* String */layerId) {
		var classId = getLayerClassId(layerId.toLowerCase());
		return this._require.toAbsMid(supportedLayers[classId][0]);
	},
	
	zoomTo: function(/* Array */extent) {
		// extent is array [x1,y1,x2,y2]
		var map = this.map,
			extentWidth = extent[2] - extent[0],
			extentHeight = extent[3] - extent[1],
			oldScale = (this.group.getTransform()||{xx:1}).xx,
			scale = Math.min(map.width/extentWidth, map.height/extentHeight),
			pf = this.factories.Placemark,
			x1 = pf.getX(extent[0]),
			y2 = pf.getY(extent[3])
		;
		
		if (extentWidth==0 && extentHeight==0) {
			// we've got a point
			var mapExtent = map.extent,
				mapWidth = mapExtent[2] - mapExtent[0],
				mapHeight = mapExtent[3] - mapExtent[1],
				extentSize = this.pointZoomFactor * Math.min(mapWidth, mapHeight);

			if (map.width > map.height) {
				extentHeight = extentSize;
				extentWidth = map.width/map.height*extentSize;
			}
			else {
				extentWidth = extentSize;
				extentHeight = map.height/map.width*extentSize;
			}

			scale = map.width/extentWidth; // equal to map.height/extentHeight
			x1 = pf.getX(extent[0] - extentWidth/2);
			y2 = pf.getY(extent[3] + extentHeight/2);
		}
		else if (extentWidth == 0) {
			// we've got a vertical line
			
		}
		else if (extentHeight == 0) {
			// we've got a horizontal line
		}
		else {
			
		}
		
		// check if we need to adjust scale if we have a bottom layer
		// and if the bottom layer supports only discrete zooms
		var bottomLayer = this.bottomLayer;
		if (bottomLayer && bottomLayer.discreteScales) {
			scale = bottomLayer.getScale();
		}
		// backup scale to perform the scale correction in the next line
		var _scale =  scale;
		if (this.correctScale) scale /= this.correctionScale;

	
		this.group.setTransform([
			matrix.translate( (map.width-_scale*extentWidth)/2, (map.height-_scale*extentHeight)/2 ),
			matrix.scale(scale),
			matrix.translate(-x1, -y2)
		]);
		
		if (oldScale != scale) {
			pf.calculateLengthDenominator();
			this.resizeFeatures(this.map.document, oldScale/scale);
		}
	},
	
	resizeFeatures: function(featureContainer, scaleFactor) {
		array.forEach(featureContainer.features, function(feature){
			if (feature.isPlacemark) this._resizePlacemark(feature, scaleFactor);
			else if (feature.isContainer) this.resizeFeatures(feature, scaleFactor);
		}, this);
	},
	
	_resizePlacemark: function(feature, scaleFactor) {
		if (feature.invalid) return;

		if (this.resizePoints && feature.isPoint()) {
			array.forEach(feature.baseShapes, function(shape){
				shape.applyRightTransform(matrix.scale(scaleFactor));
			});
		}
		else if ( gfx.renderer!="vml" && (
				(this.resizeLines && feature.isLine()) ||
				(this.resizeAreas && feature.isArea()) )) {
			array.forEach(feature.baseShapes, function(shape){
				var stroke = shape.getStroke();
				if (stroke) {
					stroke.width *= scaleFactor;
					shape.setStroke(stroke);
				}
			});
		}
		
		if (feature.textShapes) {
			var factory = this.map.engine.factories.Placemark,
				center = geom.center(feature),
				x = factory.getX(center[0]),
				y = factory.getY(center[1]);
			array.forEach(feature.textShapes, function(t){
				t.applyRightTransform(matrix.scaleAt(scaleFactor, x, y));
			});
		}
	}
});

});