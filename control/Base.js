define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin, isArray, isString
	"dojo/_base/array", // forEach
	"djeo/util/_base"
], function(declare, lang, array, u){

return declare(null, {

	// array of features, featureContainers or the whole map
	features: null,

	handle: null,

	enabled: true,

	constructor: function(map, kwArgs){
		
		this.map = map;
		
		// default events to listen to
		this.events = ["onmouseover", "onmouseout"];

		if(!kwArgs) kwArgs = {};
		lang.mixin(this, kwArgs);

		this.handle = u.uid();
		
		// process features
		// if features kwArg is not specified all map features are considered as targets for the control
		var features = kwArgs.features ? kwArgs.features : [map];
		if (!lang.isArray(features)) features = [features];
		this.features = [];
		array.forEach(features, function(feature){
			if (lang.isString(feature)) feature = this.map.getFeatureById(feature);
			if (feature) this.features.push(feature);
		}, this);
	},

	attachFactory: function() {
		var factory = this.map.engine.getFactory(this._dependency);
		if (factory) {
			lang.mixin(this, factory);
		}
		this.init();
		if (this.enabled) this.enable();
	},

	enable: function(enable){
		if (enable === undefined) enable = true;
		if (enable) this._connectEvents();
		else this._disconnectEvents();
		this.enabled = enable;
	},
	
	_connectEvents: function() {
		array.forEach(this.features, function(feature){
			feature.connectWithHandle(this.handle, this.events, this, "process");
		}, this);
	},

	_disconnectEvents: function() {
		array.forEach(this.features, function(feature){
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

});