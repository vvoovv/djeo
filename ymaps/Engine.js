dojo.provide("djeo.ymaps.Engine");

dojo.require("djeo.Engine");
dojo.require("djeo.ymaps.Placemark");

dojo.require("dojo.io.script");

(function(){

var g = djeo,
	u = g.util,
	y = g.ymaps,
	Y = window.YMaps;

var engineEvents = {onclick: "Click", onmouseover: "MouseEnter", onmouseout: "MouseLeave"};

var supportedLayers = {
	ROADMAP: "MAP",
	SATELLITE: "SATELLITE",
	HYBRID: "HYBRID"
};

var initializing;

dojo.declare("djeo.ymaps.Engine", djeo.Engine, {
	
	type: "ymaps",
	
	ymap: null,
	
	constructor: function(kwArgs) {
		// initialize basic factories
		this._initBasicFactories(new y.Placemark({
			map: this.map,
			engine: this
		}));
	},
	
	initialize: function(/* Function */readyFunction) {
		if (Y) {
			// the first case: Yandex Maps API is completely loaded
			this.map.projection = "EPSG:4326";
			var ymap = new Y.Map(this.map.container, {
				propagateEvents: true
			});
			ymap.disableDblClickZoom();
			ymap.disableDragging();
			this.ymap = ymap;
			
			this.initialized = true;
			readyFunction();
		}
		else if (initializing) {
			// the second case: Yandex Maps API is being loaded
			// wait till initializing function is called
			dojo.connect(initializing, dojo.hitch(this, function(){
				this.initialize(readyFunction);
			}));
		}
		else {
			initializing = function(){};
			dojo.io.script.get({
				url: "http://api-maps.yandex.ru/1.1/index.xml",
				content: {
					loadByRequire: 1,
					key: this.map.ymapsKey || dojo.config.ymapsKey
				},
				load: dojo.hitch(this, function() {
					YMaps.load(dojo.hitch(this, function(){
						y.Placemark.init();
						Y = YMaps;
						initializing();
						initializing = null;
						this.initialize(readyFunction);
					}));
				})
			});
		}
	},

	createContainer: function(feature) {
	},
	
	prepare: function() {
		this.zoomTo( this.map.extent );
	},
	
	appendChild: function(child, feature) {
		this.ymap.addOverlay(child);
	},
	
	getTopContainer: function() {
		var features = this.ge.getFeatures();
		return this.ge;
	},
	
	connect: function(feature, event, context, method) {
		// normalize the callback function
		method = this.normalizeCallback(feature, event, context, method);
		var connections,
			featureType = feature.getType();
		if (featureType == "MultiPolygon" || featureType == "MultiLineString") {
			connections = [];
			feature.baseShapes[0].forEach(function(shape){
				connections.push( Y.Events.observe(shape, shape.Events[engineEvents[event]], method, context) );
			});
		}
		else {
			var shape = feature.baseShapes[0];
			connections = Y.Events.observe(shape, shape.Events[engineEvents[event]], method, context);
		}
		return connections;
	},
	
	disconnect: function(connections) {
		if (dojo.isArray(connections)) {
			dojo.forEach(connections, function(connection){
				connection.cleanup();
			});
		}
		else connections.cleanup();
	},
	
	normalizeCallback: function(feature, event, context, method) {
		// summary:
		//		Normalizes callback function for events
		if (method) {
			method = dojo.hitch(context, method);
		}
		else method = context;
		return function(shape, nativeEvent){
			method({
				type: event,
				event: nativeEvent,
				feature: feature
			});
		};
	},
	
	zoomTo: function(extent) {
		var yBounds = new Y.GeoBounds( new Y.GeoPoint(extent[0],extent[1]), new Y.GeoPoint(extent[2],extent[3]) );
		this.ymap.setBounds(yBounds);
	},
	
	destroy: function() {
		
	},
	
	enableLayer: function(layerId, enabled) {
		if (enabled && supportedLayers[layerId]) this.ymap.setType(Y.MapType[supportedLayers[layerId]]);
	}
});

}());