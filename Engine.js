define([
	"dojo/_base/declare", // declare
	"dojo/has", // has
	"dojo/_base/lang", // mixin, hitch, isArray, isString, isObject
	"dojo/_base/array", // forEach
	"./_base"
], function(declare, has, lang, array, djeo){
	
var defaultCenter = [0,0],
	defaultZoom = 3
;

return declare(null, {
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
		this._layerCtrs = {};
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
	
	_setCamera: function() {
		var map = this.map;
		if (map.extent) {
			this.zoomTo(map.extent);
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
				this.zoom = map.zoom;
				if (!center) {
					center = bbox ? [(bbox[2] + bbox[0])/2, (bbox[3] + bbox[1])/2] : [defaultCenter[0], defaultCenter[1]];
				}
			}
			else {
				if (center || !bbox) {
					this.zoom = defaultZoom;
					if (!bbox) {
						center = [defaultCenter[0], defaultCenter[1]];
					}
				}
				// If center is not set bbox has been calculated,
				// the center of the bounding box will be used as a map center
			}
			if (center) {
				this.center = map.getCoords(center);
			}
			// now actually set the camera
			if (!center) {
				this.zoomTo(bbox);
			}
		}
		
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
		this._setCamera();
		map.document.render(stylingOnly, theme);
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
	}
});

});