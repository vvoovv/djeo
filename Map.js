dojo.provide("djeo.Map");

(function() {
	
var g = djeo;


var defaultLayerID = "ROADMAP",
	defaultEngine = {type: "gfx", options:{}};

var restoreMethods = function(map) {
// summary:
//		Fill methods object of a map instance with
//		default implementation of each method.
//		The default implementation is taken out of g.methods
// tags:
//		private
	if (!map.methods) map.methods = {};
	for (var type in g.methods) {
		if (!map.methods[type]) map.methods[type] = {};
		dojo.mixin(map.methods[type], g.methods[type]);
	}
};


dojo.declare("djeo.Map", null, {
	// summary:
	//		The main map object. See tests and demo for examples

	// engine: djeo.Engine
	//		Engine used by the map
	//		Engine examples: gfx (dojo gfx), ge (Google Earth)
	engine: null,
	
	//	methods: Object
	//		Registry of externally available methods
	//		An engine may specify its own realization of a particular method.
	//		This is needed in order to employ batching functionality of Google Earth Javascript API
	methods: null,
	
	// extent: Array
	//		Active area of the map
	//		Its format: [smallest horizontal coordinate, smallest vertical coordinate,
	//		largest horizontal coordinate, largest vertical coordinate]
	extent: null,
	
    // features: Object
	//		A registry of features that can be referenced by id.
	features: null,
    // geometries: Object
	//		A registry of geometries that can be referenced by id.
	geometries: null,
	// document: djeo.FeatureContainer
	//		Top level djeo.FeatureContainer
	document: null,
	// layers: String | Array
	//		Specifies which additional information to display on the djeo map. Typical layers are
	//		sattelite imagery, road map, hybrid of sattelite imagery and road map.
	//		Google Earth engine supports multiple layers. The other engines support only one layer at time.
	//		The attribute is used only during map initialization. Use enableLayer member function
	//		to enable or disable a specific layer.
	layers: null,
	
	// useAttrs: Boolean
	//		Specifies whether feature attributes are defined directly in the feature
	//		or in the 'attrs' attribute of the feature.
	//		Example for useAttrs==true:
	//	|	var feature = {
	//	|		id: "someId",
	//	|		attrs: {
	//	|			attribute1: 1,
	//	|			attribute2: "someValue"
	//	|		}
	//	|	}
	//		Example for useAttrs==false:
	//	|	var feature = {
	//	|		id: "someId",
	//	|		attribute1: 1,
	//	|		attribute2: "someValue"
	//	|	}
	useAttrs: false,
	
	// renderModels: Boolean
	//		Specifies if an engine (e.g. ge - Google Earth) capable of rendering 3D models
	//		should really render them.
	//		If renderModels is set to false for such engine, it is supposed to render
	//		2D representation of the 3D model
	renderModels: true,
	
	// iconBasePath: String
	//		This path is prepended to the src field in each style definition
	//		provided that the src field specifies a relative path
	iconBasePath: '',
	// modelBasePath: String
	//		This path is prepended to the href field in each definition of djeo.Model
	//		provided that the href field specifies a relative path
	modelBasePath: '',
	
	// styleById: Object
	//		A registry of instances of djeo.Style. Instance id is used as a key
	styleById: null,
	// styleByFid: Object
	//		A registry of instances of djeo.Style with fid attribute (feature id)
	//		Fid (feature id) is used as a key
	styleByFid: null,
	// styleByFid: Object
	//		A registry of instances of djeo.Style with styleClass attribute
	//		styleClass is used as a key
	styleByClass: null,
	// styleByClassAndFid: Object
	//		A registry of instances of djeo.Style with both styleClass and fid attributes
	//		styleClass and fid are used as keys
	styleByClassAndFid: null,
	// featuresByClass: Object
	//		A registry of features (i.e. instances of djeo.Feature) with styleClass attribute
	//		styleClass is used as a key
	featuresByClass: null,

	constructor: function(/* DOMNode */container, /* Object? */kwArgs){
		// summary:
		//		The constructor for a new Chart. Add map features if provided.
		// returns: djeo.Map
		//		The newly created map object.
		
		// initialize styling registries
		this.styleById = {};
		this.styleByFid = {};
		this.styleByClass = {};
		this.styleByClassAndFid = {};
		this.featuresByClass = {};

		restoreMethods(this);

		this.container = container;

		if(!kwArgs) kwArgs = {};
		dojo.mixin(this, kwArgs);

		// features
		this.features = {};
		// geometries
		this.geometries = {};
		// load geometries that can be referenced by features
		if (kwArgs.geometries) this.loadGeometries(kwArgs.geometries);
		// top level instance of djeo.FeatureContainer
		this.document = new djeo.FeatureContainer(null, {
			map: this,
			parent: this
		});
		// add default styling definition
		this.addStyle(djeo.styling.style, /*prevent rendering*/true);
		// add user supplied styling definition
		if (kwArgs.style) this.addStyle(kwArgs.style, /*prevent rendering*/true);
		// set engine
		this.setEngine(kwArgs.engine || (dojo.config&&dojo.config.mapEngine) || defaultEngine);
		// add features
		if (kwArgs.features) this.addFeatures(kwArgs.features, /*prevent rendering*/true);
	},
	
	ready: function(/* Function */readyFunction) {
		// summary:
		//		Calls the supplied function when the map engine is ready
		if (!this.engine.initialized) this.engine.initialize(dojo.hitch(this, function(){

			// load layers
			if (this.layers) {
				if (dojo.isString(this.layers)) this.layers = [this.layers];
				if (this.layers.length) {
					dojo.forEach(this.layers, function(layerId){
						this.enableLayer(layerId, true);
					}, this);
				}
				else this.enableLayer(defaultLayerID);
			}
			else this.enableLayer(defaultLayerID);

			// peform rendering
			this.render();

			// the map is ready; call readyFunction
			if (readyFunction) readyFunction();
		}));
	},
	
	addFeatures: function(/* Array|Object */features, /* Boolean? */preventRendering) {
		// summary:
		//		Adds features to the top level feature container of the map
		// preventRendering:
		//		If set to true prevents immediate rendering of the added features
		// returns: Array
		//		Array of added features or an empty array
		return this.document.addFeatures(features, preventRendering);
	},
	
	removeFeatures: function(/* Array|Object */features) {
		// summary:
		//		Removes features from the top level container of the map
		this.document.removeFeatures(features);
	},
	
	render: function(/* Boolean */stylingOnly, /* String? */theme) {
		// summary:
		//		Render map features
		// stylingOnly:
		//		If set to true, only style is reapplied to the features. This is used by the Highlight control
		// theme:
		//		Specifies which theme to use for map rendering.
		//		If theme is not set, the map will be rendered with the theme set for the "normal" map mode
		this.methods.Map.render.call(this, stylingOnly, theme);
	},
	
	_render: function(/* Boolean */stylingOnly, /* String? */theme) {
		// summary:
		//		Default implementation of the render method
		if (!this.extent) this.extent = this.getBbox();
		this._calculateViewport();
		this.engine.prepare();
		this.document._render(stylingOnly, theme);
	},
	
	renderFeatures: function(/* Array|Object */features, /* Boolean */stylingOnly, /* String? */theme) {
		// summary:
		//		Renders the specified features instead of the whole map tree
		// features:
		//		Can be an array or a "hash" (javascript object) of features.
		//		Feature id is used as a hash key in the latter case.
		this.methods.Map.renderFeatures.call(this, features, stylingOnly, theme);
	},

	_renderFeatures: function(/* Array|Object */features, /* Boolean */stylingOnly, /* String? */theme) {
		// summary:
		//		Default implementation of the renderFeatures method
		if (dojo.isArray(features)) {
			dojo.forEach(features, function(feature){
				feature._render(stylingOnly, theme);
			}, this);
		}
		else {
			for(var fid in features) {
				// TODO: avoid double rendering
				features[fid]._render(stylingOnly, theme);
			}
		}
	},
	
	show: function(/* Array|Object|String|Boolean */features, /* Boolean? */show) {
		if (features === undefined) {
			features = this.document;
		}
		if (show === undefined) {
			if (features === true || features === false) {
				show = features;
				features = this.document;
			}
			else {
				show = true;
			}
		}

		if (!dojo.isArray(features)) features = [features];
		dojo.forEach(features, function(feature){
			if (dojo.isString(feature)) feature = this.getFeatureById(feature);
			if (feature) feature.show(show);
		}, this);
	},
	
	toggleVisibility: function(features) {
		if (!features) features = this.document;
		if (!dojo.isArray(features)) features = [features];
		dojo.forEach(features, function(feature){
			if (dojo.isString(feature)) feature = this.getFeatureById(feature);
			if (feature) feature.toggleVisibility();
		}, this);
	},

	resize: function() {
		// summary:
		//		Call it if the map container has been resized
		this._calculateViewport();
		//this.render();
	},

	enableLayer: function(/* String */layerId, /* Boolean? */enable) {
		// summary:
		//		Enables or disables an additional layer specified by its id.
		// description:
		//		Enables or disables an additional layer specified by its id.
		//		A layer specifies which additional information to display on the djeo map.
		//		Typical layers are sattelite imagery, road map, hybrid of sattelite imagery and road map.
		if (enable === undefined) enable = true;
		this.engine.enableLayer(layerId, enable);
	},
	
	getContainer: function() {
		return this.engine.getTopContainer();
	},

	_calculateViewport: function() {
		// summary:
		//		Calculates map's div parameters
		// tags:
		//		private
		var contentBox = dojo.contentBox(this.container);
		var coords = dojo.position(this.container,true);
		this.width = this.width || contentBox.w || 100;
		this.height = this.height || contentBox.h || 100;
		this.x = coords.x;
		this.y = coords.y;
	},

	loadGeometries: function(/* String|Array|Object */geometries) {
		// summary:
		//		Loads geometries that can be referenced by features
		// geometries:
		//		1) If set to a string, it specifies a path for actual geometries
		//		2) If set to an object, it specifies a "hash" of geometries.
		//		   Geometry id is used as a hash key in this case.
		//		3) If set to an array, it specifies an array of geometries.
		//		   The array is transormed to the "hash" of geometries
		if (dojo.isString(geometries)) {
			dojo.xhrGet({
				url: geometries,
				handleAs: "json",
				sync: true,
				load: dojo.hitch(this, function(/* Array|Object */_geometries){
					this.loadGeometries(_geometries);
				})
			});
		}
		else if (dojo.isArray(geometries)) {
			dojo.forEach(geometries, function(geometry){
				if (geometry.id) this.geometries[geometry.id] = geometry;
			}, this);
		}
		else { // Object
			this.geometries = geometries;
		}
	},
	
	addStyle: function(/* Array|Object */style, /* Boolean? */preventRendering) {
		// summary:
		//		Adds styling definition.
		// preventRendering:
		//		If set to true prevents immediate rendering
		this.document.addStyle(style);
		if (!preventRendering) this.document._render(true);
	},

	getGeometryById: function(/* String */id) {
		// summary:
		//		Looks up a geometry by id from the registry of geometries
		// returns:
		//		Geometry object or undefined
		return this.geometries[id];
	},

	getStyleById: function(/* String */id) {
		// summary:
		//		Looks up a style by id from the registry of styles
		// returns:
		//		djeo.Style or undefined
		return this.styleById[id];
	},

	registerFeature: function(/* Object */feature) {
		// summary:
		//		Adds the feature to the registry of features
		// feature:
		//		Should be an instance of a class inherited from djeo.Feature
		if (feature.id) this.features[feature.id] = feature;
	},

	getFeatureById: function(id) {
		// summary:
		//		Looks up a map feature by id from the registry of features
		// returns:
		//		An instance of a class inherited from djeo.Feature or undefined
		return this.features[id];
	},

	connect: function(/* String|Array? */events, /*Object|null*/ context, /*String|Function*/ method) {
		// summary:
		//		Adds a listener for an event or an array of events for all features in the map
		// returns: Number
		//		A handle that identifies this particular connection
		return this.document.connect(events, context, method);
	},

	connectWithHandle: function(/* Number */handle, /* String|Array? */events, /*Object|null*/ context, /*String|Function*/ method) {
		// summary:
		//		Adds a listener for an event or an array of events for all features in the map
		//		The connection will be associated with the supplied handle
		// returns: Number
		//		The supplied handle
		return this.document.connectWithHandle(handle, events, context, method);
	},
	
	disconnect: function(/* Number */handle) {
		// summary:
		//		Removes all event listeners associated with the handle for all features in the map
		this.document.disconnect(handle);
	},
	
	setEngine: function(/* String|Object */engine) {
		// summary:
		//		Sets an engine for the map. Engine examples: gfx (dojo gfx), ge (Google Earth)

		// cheating the build util
		var req = dojo.require;
		if (dojo.isString(engine)) engine = {type: engine};
		if (!engine.declaredClass) {
			var options = {map: this};
			if (engine.options) dojo.mixin(options, engine.options);
			// dojo.require Engine class
			req("djeo."+engine.type+".Engine");
			// instantiate Engine class
			engine = new djeo[engine.type].Engine(options);
		}
		// check dependencies in the _dependencies local variable
		for (dependency in _dependencies) {
			req("djeo."+engine.type+"."+dependency, true);
		}
		this.engine = engine;
	},
	
	getBbox: function() {
		// summary:
		//		Calculates a 2D bounding box for the map
		// returns: Array
		//		[smallest horizontal coordinate, smallest vertical coordinate, largest horizontal coordinate, largest vertical coordinate]
		return this.document.getBbox();
	},
	
	destroy: function() {
		// summary:
		//		Destroys the map
		
		// TODO: provide more thorough implementation
		this.engine.destroy();
	},

	getCoords: function(/* Array */coords, /* String? */type) {
		// summary:
		//		Returns feature coordinates in the map projection.
		//		If module djeo.projection is loaded, the coordinates are converted to
		//		the map projection. Otherwise it is returned intact
		// returns:
		//		feature coordinates in the map projection
		return coords;
	},

	executeBatch: function(/* Function */batchFunction) {
		// summary:
		//		Executes the batchFunction in the batch mode
		//		if the map engine provides batching mode (like Google Earth javascript API).
		//		Otherwise just executes the batchFunction
		var engine = this.engine;
		if (engine.executeBatch) engine.executeBatch(batchFunction);
		else batchFunction();
	},

	zoomTo: function(/* Array | String | Object */extent) {
		// summary:
		//		Zooms the map to the given extent or to a single feature or to an array features (or their ids).
		//		The feature can be specified either by its javascript object or by its id
		var validExtent;
		if (dojo.isArray(extent)) {
			// check if we have an array of features or a real extent (an array of coordinates)
			if (dojo.isString(extent[0]) || dojo.isObject(extent[0])) {
				var validExtent = [Infinity,Infinity,-Infinity,-Infinity];
				dojo.forEach(extent, function(feature){
					if (dojo.isString(feature)) feature = this.getFeatureById(extent);
					if (feature) g.util.bbox.extend(validExtent, feature.getBbox());
				}, this);
			}
			else validExtent = extent;
		}
		else if (dojo.isString(extent)) {
			// extent is a feature id
			validExtent = this.getFeatureById(extent);
			if (validExtent) validExtent = validExtent.getBbox();
		}
		else if (dojo.isObject(extent)) {
			// extent is a feature javascript object
			validExtent = extent.getBbox();
		}
		if (validExtent) this.engine.zoomTo(validExtent);
	}
});

// An engine is supposed to implement each module listed in the _dependencies.
var _dependencies = {};
g.setDependency = function(dependency) {
	// summary:
	//		Sets the dependency for engines
	_dependencies[dependency] = 1;
};

// default methods;
var p = g.Map.prototype;
if (!g.methods) g.methods = {};
g.methods.Map = {
	render: p._render,
	renderFeatures: p._renderFeatures
}

}());

// require basic classes
dojo.require("djeo.styling");
dojo.require("djeo.FeatureContainer");
dojo.require("djeo.Placemark");