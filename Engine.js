define([
	"dojo/_base/declare", // declare
	"dojo/has", // has
	"dojo/_base/lang", // mixin, hitch, isArray, isString, isObject
	"dojo/_base/array" // forEach
], function(declare, has, lang, array){

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

	constructor: function(kwArgs){
		lang.mixin(this, kwArgs);
		this.factories = {};
		this.ignoredDependencies = {};
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
		//		Normally called by _render method of djeo.Map.
		//		Should include some preparatory code for rendering.
		//		Should be implemented in the inherited class
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
	
	normalizeCallback: function(feature, event, context, method) {
		// summary:
		//		Normalizes callback function for events
		//		A particular map engine may provide different implementation of the function
		method = method ? lang.hitch(context, method) : context;
		return function(nativeEvent){
			method({
				type: event,
				event: nativeEvent,
				feature: feature
			});
		};
	},
	
	render: function(/* Boolean */stylingOnly, /* String? */theme) {
		// summary:
		//		Default implementation of the render method of djeo.Map
		// stylingOnly:
		//		See description in the render method of djeo.Map
		// theme:
		//		See description in the render method of djeo.Map
		var map = this.map;
		if (!map.extent) map.extent = map.getBbox();
		map._calculateViewport();
		this.prepare();
		map.document.render(stylingOnly, theme);
	},
	
	renderFeatures: function(/* Array|Object */features, /* Boolean */stylingOnly, /* String? */theme) {
		// summary:
		//		Default implementation of the renderFeatures method of djeo.Map
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
		this._renderContainer(container, stylingOnly, theme);
	},

	_renderContainer: function(container, stylingOnly, theme) {
		if (!container.visible) return;
		array.forEach(container.features, function(feature){
			if (feature.isContainer || feature.visible) feature._render(stylingOnly, theme);
		}, container);
	},
	
	enableLayer: function(layerId, enabled) {

	}
});

});