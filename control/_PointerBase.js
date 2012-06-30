define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin, hitch, isArray, isString
	"dojo/_base/array", // forEach
	"../util/_base",
	"./_Base"
], function(declare, lang, array, u, Base){
	
var handle = u.uid();

return declare([Base], {
	// summary:
	//		The base class for controls that do something with pointerover, pointerout events (Highlight, Tooltip)
	
	// common object for all controls derived from _PointerBase
	c: {
		timeoutId: null,
		//currently active feature (e.g. highlighted or with tooltip over it)
		feature: null
	},
	
	_onpointeroutDelay: 200, // milliseconds

	constructor: function(map, kwArgs){
		
		this.handle = handle;
		
		if (!this.c.handle) {
			this.c.handle = handle;
		}
		
		// default events to listen to
		this.events = ["mouseover", "mouseout"];
	},

	process: function(event){
		var feature = event.feature;
		
		if (this.c.timeoutId) {
			clearTimeout(this.c.timeoutId);
			this.c.timeoutId = null;
		}

		if (event.type == "mouseover") {
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
		else if (event.type == "mouseout"){
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
	}
});

});