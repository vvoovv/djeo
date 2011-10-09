dojo.provide("djeo.Feature");

dojo.require("djeo.util");

(function() {

var g = djeo,
	u = g.util;

// supported events
g.events = {onmouseover: 1, onmouseout: 1, onclick: 1, onmousemove: 1};

dojo.declare("djeo.Feature", null, {
	// summary:
	//		The base class for all map features.
	
	id: null,
	
	visible: true,
	
	bbox: null,

	style: null,

	parent: null,

	map: null,

	constructor: function(featureDef, kwArgs) {
		if (kwArgs) dojo.mixin(this, kwArgs);
		if (featureDef) dojo.mixin(this, featureDef);
		if (!this.id) this.id = "_geo_"+u.uid();
		if (this.styleClass && !dojo.isArray(this.styleClass)) this.styleClass = [this.styleClass];
		if (featureDef && featureDef.style) {
			this.style = null;
			this.addStyle(featureDef.style);
		}
	},
	
	setMap: function(map) {
		this.map = map;
		if (this.styleClass) dojo.forEach(this.styleClass, function(_class){
			var featuresByClass = map.featuresByClass;
			if (!featuresByClass[_class]) featuresByClass[_class] = [];
			featuresByClass[_class].push(this);
		}, this);
	},
	
	setParent: function(parent) {
		this.parent = parent;
	},
	
	get: function(attr) {
		return this.map.useAttrs ? (this.attrs && this.attrs[attr]!==undefined ? this.attrs[attr] : this[attr]) : this[attr];
	},
	
	addStyle: function(/* Array|Object */style) {
		if (!dojo.isArray(style)) style = [style];
		dojo.forEach(style, function(_style){
			var s = new g.Style(_style, this.map);
			if (!s.styleClass && !s.fid) {
				s._features[this.id] = this;
				if (!this.style) this.style = [];
				this.style.push(s);
			}
		}, this);
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
		return this.connectWithHandle(null, events, context, method);
	},
	
	connectWithHandle: function(handle, /* String|Array? */events, /*Object|null*/ context, /*String|Function*/ method) {
		
	},
	
	disconnect: function(handle, keepHandlesEntry) {
		
	}
});


// registry of feature constructors
g.featureTypes = {};

}());
