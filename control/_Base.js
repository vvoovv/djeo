define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin, hitch, isArray, isString
	"dojo/_base/array", // forEach
	"../util/_base"
], function(declare, lang, array, u){

return declare(null, {
	// summary:
	//		The base class for controls related to interaction with map features

	// array of features, featureContainers or the whole map
	features: null,

	id: null,

	enabled: true,

	constructor: function(map, kwArgs){
		this.id = u.uid();
		
		this.handle = u.uid();
		
		this.map = map;

		if(!kwArgs) kwArgs = {};
		lang.mixin(this, kwArgs);
		
		// process features
		// if features kwArg is not specified all map features are considered as targets for the control
		var features = kwArgs.features ? kwArgs.features : [map.document];
		if (!lang.isArray(features)) features = [features];
		this.features = [];
		array.forEach(features, function(feature){
			if (lang.isString(feature)) feature = this.map.getFeatureById(feature);
			if (feature) this.features.push(feature);
		}, this);
	},
	
	init: function() {
		
	},

	attachFactory: function() {
		var factory = this.map.engine.getFactory(this._dependency);
		if (factory) {
			lang.mixin(this, factory);
		}
	},

	enable: function(enable){
		if (enable === undefined) enable = true;
		if (enable) this._connectEvents();
		else this._disconnectEvents();
		this.enabled = enable;
	},
	
	_connectEvents: function() {
		array.forEach(this.features, function(feature){
			feature.onForHandle(this.handle, {
				events: this.events,
				context: this,
				method: this.process,
				key: this.id,
				value: this
			});
		}, this);
	},

	_disconnectEvents: function() {
		array.forEach(this.features, function(feature){
			feature.disconnect(this.handle, this.id, true);
		}, this);
	},

	destroy: function(){
		this.enable(false);
	}
});

});