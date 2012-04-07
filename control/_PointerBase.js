define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin, hitch, isArray, isString
	"dojo/_base/array", // forEach
	"../util/_base"
], function(declare, lang, array, u){
	
var handle = u.uid();

return declare(null, {
	// summary:
	//		The base class for controls that do something with pointerover, pointerout events (Highlight, Tooltip)

	// array of features, featureContainers or the whole map
	features: null,

	id: null,

	enabled: true,
	
	// common object for all controls derived from _PointerBase
	c: {
		timeoutId: null,
		//currently active feature (e.g. highlighted or with tooltip over it)
		feature: null
	},
	
	_onpointeroutDelay: 200, // milliseconds

	constructor: function(map, kwArgs){
		
		if (!this.c.handle) {
			this.c.handle = handle;
		}
		
		this.id = u.uid();
		
		this.map = map;
		
		// default events to listen to
		this.events = ["onmouseover", "onmouseout"];

		if(!kwArgs) kwArgs = {};
		lang.mixin(this, kwArgs);
		
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
			feature.connectWithHandle(handle, {
				events: this.events,
				context: this,
				method: "process",
				key: this.id,
				value: this
			});
		}, this);
	},

	_disconnectEvents: function() {
		array.forEach(this.features, function(feature){
			feature.disconnect(handle, this.id, true);
		}, this);
	},

	process: function(event){
		var feature = event.feature;
		
		if (this.c.timeoutId) {
			clearTimeout(this.c.timeoutId);
			this.c.timeoutId = null;
		}

		if (event.type == "onmouseover") {
			if (this.c.feature == feature) return;

			//this.c.feature = feature;
			// trigger onpointeroverAction for all controls in question
			var handleObj = feature.handles[handle][4];
			for (var key in handleObj) {
				// handleObj[key] is a control object
				handleObj[key].pointeroverAction(feature, this.c.feature)
			}
			this.c.feature = feature;
		}
		else if (event.type == "onmouseout"){
			this.c.timeoutId = setTimeout(
				lang.hitch(this, this._onpointerout),
				this._onpointeroutDelay
			)
		}
	},
	
	_onpointerout: function() {
		var feature = this.c.feature;
		if (feature) {
			// trigger onpointeroutAction for all controls in question
			var handleObj = feature.handles[handle][4];
			for (var key in handleObj) {
				// handleObj[key] is a control object
				handleObj[key].pointeroutAction(feature)
			}
			this.c.feature = null;
		}
	},

	destroy: function(){
		this.enable(false);
	}
});

});