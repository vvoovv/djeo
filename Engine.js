define([
	"dojo/_base/declare", // declare
	"dojo/has", // has
	"dojo/_base/lang", // mixin, hitch, isArray, isString, isObject
	"dojo/on",
	"dojo/_base/array", // forEach
	"dojo/Evented", //emit
	"./_base"
], function(declare, has, lang, on, array, Evented, djeo){
	
var defaultCenter = [0,0],
	defaultZoom = 3
;

var mapEvents = {
	"zoom_changed": 1
};

return declare([Evented], {
	// summary:
	//		The base class for engines. An engine class is supposed to be a singleton
	
	// type: String
	//		Type of the engine. Example values: "djeo", "gmaps", "ge"
	type: '',
	
	// factories: Object
	//		A registry of factories. The term "factory" should be understood as
	//		a realization of actual functionalities of basic djeo classes
	factories: null,
	
	// initialized: Boolean
	//		Specifies if the engine is initialized
	initialized: false,
	
	// canRenderModels: Boolean
	//		Specifies if the engine can render 3D models
	canRenderModels: false,
	
	// _require: Function
	//		Reference to the context-sensitive require of the actual Engine instance
	_require: null,
	
	// ignoredDependencies: Object
	//		Ignored dependencies (e.g default implementation is used)
	ignoredDependencies: null,
	
	// _layerCtrs: Object
	//		Registry of layer constructors. Used to store costructors resolved from layer modules via require call
	//		in the _onEngineReady functions of djeo/Map during djeo/Map initialization.
	//		We need to resolve modules there to simplify things
	//		(e.g. so set a proper map projection before rendering of features)
	_layerCtrs: null,

	constructor: function(kwArgs){
		lang.mixin(this, kwArgs);
		this.factories = {};
		this.ignoredDependencies = {};
		// layers stuff
		this.layers = [];
		this._layerCtrs = {};
		this._layerReg = {};
	},

	initialize: function(/* Function */readyFunction) {
		// summary:
		//		Initializes the engine and calls the supplied function.
		//		Should be implemented in the inherited class
	},
	
	_initBasicFactories: function(placemarkFactory) {
		var f = this.factories;
		f.Placemark = placemarkFactory;
		f.Point = placemarkFactory;
		f.LineString = placemarkFactory;
		f.Polygon = placemarkFactory;
		f.MultiLineString = placemarkFactory;
		f.MultiPolygon = placemarkFactory;
	},
	
	matchModuleId: function(dependency) {
		if (this.ignoredDependencies[dependency]) return null;
		// calculate moduleId
		var moduleId = this._require.toAbsMid("./");
		// treat the case of a build when "./" is resolved to "pack/main"
		if (moduleId.length>5 && moduleId.substr(moduleId.length-5, 5)=="/main") {
			moduleId = moduleId.substring(0, moduleId.length-4);
		}
		moduleId += dependency;
		return moduleId;
	},

	createContainer: function(parentContainer, featureType) {

	},
	
	appendChild: function(/* Object */parent, /* Object */child) {
		// summary:
		//		Appends a child to the parent. Should be implemented in the inherited class
	},

	prepare: function() {
		// summary:
		//		Normally called by this.render() method.
		//		Should include some preparatory code for rendering.
		//		Should be implemented in the inherited class
	},

	onForMap: function(event, method, context) {
		if (!event in mapEvents) return;
		on(this, event, lang.hitch(context, method));
	},
	
	_initCamera: function() {
		var map = this.map,
			extent = map.extent,
			zoom,
			// do we need to project center to the map's projection?
			projectCenter = true
		;
		// the following attribute checked in the onzoom_changed function
		// if this._renderingDisabled == true, then no rendering due to style change will occur in the onzoom_changed
		this._renderingDisabled = true;
		if (extent) {
			// converting extent to the map's projection
			var lb = this.map.getCoords([extent[0], extent[1]]),
				rt = this.map.getCoords([extent[2], extent[3]])
			;
			this.zoomTo([lb[0], lb[1], rt[0], rt[1]]);
		}
		else {
			// finding map center
			var center = map.center || (map.lookAt && map.lookAt.coords),
				bbox
			;
			if (!center || !("zoom" in map)) {
				bbox = map.getBbox();
			}
			if ("zoom" in map) {
				zoom = map.zoom;
				if (!center) {
					if (bbox) {
						center = [(bbox[2] + bbox[0])/2, (bbox[3] + bbox[1])/2];
						// bbox is already in the map's projection
						projectCenter = false;
					}
					else {
						center = [defaultCenter[0], defaultCenter[1]];
					}
				}
			}
			else {
				if (center || !bbox) {
					zoom = defaultZoom;
					if (!bbox) {
						center = [defaultCenter[0], defaultCenter[1]];
					}
				}
				// If center is not set bbox has been calculated,
				// the center of the bounding box will be used as a map center
			}
			if (center && projectCenter) {
				center = map.getCoords(center);
			}
			// now actually set the camera
			if (center) {
				this._setCamera({center: center, zoom: zoom});
			}
			else {
				this.zoomTo(bbox);
			}
		}
		this._renderingDisabled = false;
	},
	
	getFactory: function(/* String */dependency) {
		// summary:
		//		Looks up a factory for the given type.
		//		If the factory is not found, tries to load the factory class and instantiate it
		if (!dependency || this.ignoredDependencies[dependency]) return null;
		var factories = this.factories;
		if (!factories[dependency]) {
			var moduleId = this.matchModuleId(dependency);
			if (moduleId) {
				var factoryClass = require(moduleId);
				factories[dependency] = new factoryClass({engine: this});
			}
		}
		return factories[dependency];
	},
	
	getTopContainer: function() {
		// summary:
		//		Returns the top container
		//		Should be implemented in the inherited class
		// returns:
		//		The top level container
	},

	connect: function(feature, event, context, method) {
		// summary:
		//		Adds a listener for the event for the specified feature
		//		Should be implemented in the inherited class
		// returns: Array
		//		An array that holds connection parameters that are specific for the engine
	},
	
	normalizeCallback: function(feature, event, method, context) {
		// summary:
		//		Normalizes callback function for events
		//		A particular map engine may provide different implementation of the function
		return function(nativeEvent){
			method.call(context, {
				type: event,
				event: nativeEvent,
				feature: feature
			});
		};
	},
	
	render: function(/* Boolean */stylingOnly, /* String? */theme) {
		// summary:
		//		Default implementation of the render method of djeo/Map
		// stylingOnly:
		//		See description in the render method of djeo/Map
		// theme:
		//		See description in the render method of djeo/Map
		var map = this.map;
		map._calculateViewport();
		this.prepare();
		this._initCamera();
		return map.document.render(stylingOnly, theme);
	},
	
	renderFeatures: function(/* Array|Object */features, /* Boolean */stylingOnly, /* String? */theme) {
		// summary:
		//		Default implementation of the renderFeatures method of djeo/Map
		if (lang.isString(features)) features = [features];
		if (lang.isArray(features)) {
			array.forEach(features, function(feature){
				if (lang.isString(feature)) feature = this.getFeatureById(feature);
				if (feature) feature._render(stylingOnly, theme);
			}, this);
		}
		else {
			for(var fid in features) {
				// TODO: avoid double rendering
				features[fid]._render(stylingOnly, theme);
			}
		}
	},

	renderContainer: function(container, stylingOnly, theme) {
		if (!stylingOnly) {
			// reset numVisibleFeatures
			container.numVisibleFeatures = 0;
		}
		this._renderContainer(container, stylingOnly, theme);
	},

	_renderContainer: function(container, stylingOnly, theme) {
		if (!container.visible) return;
		if (container.features.length == 0 && !stylingOnly) {
			container.parent.numVisibleFeatures++;
		}
		array.forEach(container.features, function(feature){
			if (feature.isContainer || feature.visible) {
				feature._render(stylingOnly, theme);
			}
		});
	},
	
	enableLayer: function(/* String|Object */layer, enabled) {
		if (enabled === undefined) enabled = true;
		if (enabled) {
			if (lang.isString(layer)) {
				// we've got a layer id
				layer = layer.toLowerCase();
				// check if the layer already has been enabled
				if (this._layerReg[layer]) return;

				var colonIndex = layer.indexOf(":"),
					classId = (colonIndex > 0) ? layer.substring(0, colonIndex) : layer
				;
				
				// check if know the layer class id
				if (!this._supportedLayers[classId]) return;
				var layerDef = this._supportedLayers[classId];
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
					this._require([layerDef[0]], lang.hitch(this, function(layerCtor){
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
		if (!kwArgs) {
			kwArgs = {};
		}
		var layer = new layerCtor(kwArgs, this.map);
		// TODO: check if the layer supports bottom layer projection
		var layers = this.layers;
		if (layers.length == 0) {
			// it will be the bottom layer
			// so set map's projection to the layer's one
			if (layer.projection) {
				this.map.projection = layer.projection;
			}
		}
		layer.init();
		this.layers.push(layer);
		this._layerReg[layerId] = layer;
	},
	
	isValidLayerId: function(/* String */layerId) {
		return true;
	},
	
	getLayerModuleId: function(/* String */layerId) {
		return null;
	},
	
	setLayerConstructor: function(/* String */layerId, /* Function */ctr) {
		var classId = djeo.getLayerClassId(layerId.toLowerCase());
		this._layerCtrs[classId] = ctr;
	},
	
	onzoom_changed: function() {
		if (!this._renderingDisabled && this.map._hasZoomStyle) {
			this.map.document.render(true);
		}
		// "zoom_changed" is emited here automatically (see documentation for dojo/Evented)
	}
});

});