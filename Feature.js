define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin, isArray, isString
	"dojo/_base/array", // forEach
	"./Style",
	"./util/_base"
], function(declare, lang, array, Style, u){

return declare(null, {
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
	
	set: function(attr, value) {
		// setter name
		var name = "_set_"+attr,
			setter = this[name]
		;
		return setter && setter.call(this, value);
	},
	
	get: function(attr) {
		// check if we have a getter function
		var name = "_get_"+attr,
			getter = this[name],
			result
		;
		if (getter) {
			result = getter.call(this);
		}
		else {
			result = this.map.useAttrs ? (this.attrs && this.attrs[attr]!==undefined ? this.attrs[attr] : this[attr]) : this[attr];
		}
		return result;
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

	on: function(/* String|Array? */events, /*Function*/ method, /*Object?*/ context) {
		var map = this.map,
			handle = this.onForHandle(null, {
				events: lang.isString(events) ? [events] : events,
				context: context,
				method: method
			})
		;
		return {
			remove: function(feature) {
				if (feature) feature.disconnect(handle);
				else map.disconnect(handle);
			}
		};
	},
	
	onForHandle: function(/* String|Number */ handle, /*Object*/ kwArgs) {
		
	},
	
	disconnect: function(handle, key, keepIfKey) {
		
	}
});

});
