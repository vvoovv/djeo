define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin, isArray, isString
	"dojo/_base/array", // forEach
	"./Style",
	"./util/_base"
], function(declare, lang, array, Style, u){

return declare("djeo.Feature", null, {
	// summary:
	//		The base class for all map features.
	
	id: null,
	
	visible: true,
	
	bbox: null,

	style: null,

	parent: null,

	map: null,

	constructor: function(featureDef, kwArgs) {
		if (kwArgs) lang.mixin(this, kwArgs);
		if (featureDef) lang.mixin(this, featureDef);
		if (!this.id) this.id = "_geo_"+u.uid();
		if (this.styleClass && !lang.isArray(this.styleClass)) this.styleClass = [this.styleClass];
		if (featureDef && featureDef.style) {
			this.style = null;
			this.addStyle(featureDef.style, true);
		}
	},
	
	setMap: function(map) {
		this.map = map;
		if (this.styleClass) {
			array.forEach(this.styleClass, function(_class){
				var featuresByClass = map.featuresByClass;
				if (!featuresByClass[_class]) featuresByClass[_class] = [];
				featuresByClass[_class].push(this);
			}, this);
		}
	},
	
	setParent: function(parent) {
		this.parent = parent;
	},
	
	get: function(attr) {
		return this.map.useAttrs ? (this.attrs && this.attrs[attr]!==undefined ? this.attrs[attr] : this[attr]) : this[attr];
	},
	
	addStyle: function(/* Array|Object */style, /* Boolean */preventRendering) {
		if (!lang.isArray(style)) style = [style];
		array.forEach(style, function(_style){
			var s = new Style(_style, this.map);
			if (!s.styleClass && !s.fid) {
				s._features[this.id] = this;
				if (!this.style) this.style = [];
				this.style.push(s);
			}
		}, this);
		if (!preventRendering) this.render(true);
	},
	
	render: function() {
		
	},
	
	toggleVisibility: function() {
		this.show(!this.visible);
	},
	
	getBbox: function() {
		return this.bbox;
	},

	connect: function(/* String|Array? */events, /*Object|null*/ context, /*String|Function*/ method) {
		return this.connectWithHandle(null, {
			events: lang.isString(events) ? [events] : events,
			context: context,
			method: method
		});
	},
	
	connectWithHandle: function(/* String|Number */ handle, /*Object*/ kwArgs) {
		
	},
	
	disconnect: function(handle, key, removeEventListener) {
		
	}
});

});
