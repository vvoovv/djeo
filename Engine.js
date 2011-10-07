dojo.provide("djeo.Engine");

dojo.declare("djeo.Engine", null, {
	// summary:
	//		The base class for engines. An engine class is supposed to be a singleton
	
	// type: String
	//		Type of the engine. Example values: "gfx", "ge"
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

	constructor: function(kwArgs){
		dojo.mixin(this, kwArgs);
		// find base module (e.g djeo.gfx)
		this.baseModule = this.declaredClass.substring(0, this.declaredClass.lastIndexOf("."));
		this.factories = {};
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
	
	getFactory: function(/* String */type) {
		// summary:
		//		Looks up a factory for the given type.
		//		If the factory is not found, tries to load the factory class and instantiate it
		if (!this.factories[type]) {
			// cheating build util
			var req = dojo.require;
			var lastDot = type.lastIndexOf("."),
				module = lastDot>=0 ? type.substring(lastDot+1) : type;
			// type can have one of the following forms: 1)Placemark 2)control.Highlight
			// in the case 1) we try the type as is, in the case of 2) we try Highlight
			module = this.baseModule + "." + module;
			req(module, true);
			var cstr = dojo.getObject(module);
			if (cstr) this.factories[type] = new (cstr)({engine: this});
			else if (lastDot>0) {
				// in the case 2) we try control.Highlight, i.e. type as is
				module = this.baseModule + "." + type;
				req(module, true);
				var cstr = dojo.getObject(module);
				if (cstr) this.factories[type] = new (cstr)({engine: this});
			}
		}
		return this.factories[type];
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
		method = method ? dojo.hitch(context, method) : context;
		return function(nativeEvent){
			method({
				type: event,
				event: nativeEvent,
				feature: feature
			});
		};
	},
	
	patchMethods: function() {
		// summary:
		//		Patches some methods (e.g. render) of the basic classes (djeo.Map, djeo.Placemark)
		//		Should be implemented in the inherited class
	}
});