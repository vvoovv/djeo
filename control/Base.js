dojo.provide("djeo.control.Base");

dojo.require("djeo.util");

dojo.declare("djeo.control.Base", null, {

	// array of features, featureContainers or the whole map
	features: null,

	handle: null,

	enabled: true,

	constructor: function(map, kwArgs){
		
		this.map = map;
		
		// default events to listen to
		this.events = ["onmouseover", "onmouseout"];

		if(!kwArgs) kwArgs = {};
		dojo.mixin(this, kwArgs);

		this.handle = djeo.util.uid();
		
		// process features
		// if features kwArg is not specified all map features are considered as targets for the control
		var features = kwArgs.features ? kwArgs.features : [map];
		if (!dojo.isArray(features)) features = [features];
		this.features = [];
		dojo.forEach(features, function(feature){
			if (dojo.isString(feature)) feature = this.map.getFeatureById(feature);
			if (feature) this.features.push(feature);
		}, this);
	},

	attachFactory: function() {
		var factory = this.map.engine.getFactory(this.factoryType);
		if (factory) {
			dojo.mixin(this, factory);
			this.init();
			if (this.enabled) this.enable();
		}
	},

	enable: function(enable){
		if (enable === undefined) enable = true;
		if (enable) this._connectEvents();
		else this._disconnectEvents();
		this.enabled = enable;
	},
	
	_connectEvents: function() {
		dojo.forEach(this.features, function(feature){
			feature.connectWithHandle(this.handle, this.events, this, "process");
		}, this);
	},

	_disconnectEvents: function() {
		dojo.forEach(this.features, function(feature){
			feature.disconnect(this.handle);
		}, this);
	},

	reset: function(){
		//	summary:
		//		Reset the action.
	},

	destroy: function(){
		this.enable(false);
	}
});

