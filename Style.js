define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // isString, isArray, getObject
	"dojo/_base/array", // forEach
	"./_base",
	"dojo/colors"
], function(declare, lang, array, djeo){

var symbolizers = ["points", "lines"],
	styleAttributes = {theme:1, name: 1, legend: 1},
	noStyleMixin = {id:1, filter:1, styleClass:1, fid:1, composer: 1, composerOptions: 1};

var filterPattern = /\$(?:(\w+)|\[([^\]]+)\])/g;

var Style = declare(null, {
	
	// json style definition
	def: null,
	
	// features that have this style in their style attribute (i.e. inline style)
	_features: null,

	constructor: function(def, map) {
		this.map = map;
		this._features = {};
		this._setDef(def);
		if (def.id) map.styleById[def.id] = this;
	},
	
	set: function(def) {
		var m = this.map;
		var affectedFeatures = this.styleClass || this.fid ? {} : this._features;
		// remove the style from styleByClassAndFid, styleByFid, styleByClass
		if (this.styleClass) {
			array.forEach(this.styleClass, function(_class){
				// remove the style from styleByClassAndFid
				if (this.fid) {
					array.forEach(this.fid, function(_fid){
						var entry = m.styleByClassAndFid[_class][_fid],
							entryLength = entry.length;
						for(var i=0; i<entryLength;i++) {
							if (entry[i]==this) break;
						}
						if (i<entryLength) {
							entry.splice(i,1);
							var feature = m.getFeatureById(_fid);
							if (feature && feature.styleClass) {
								for (var i=0; i<feature.styleClass.length; i++) {
									if (_class==feature.styleClass[i] && !affectedFeatures[feature.id]) {
										affectedFeatures[feature.id] = feature;
										break;
									}
								}
							}
						}
					}, this);
				}
				else {
					// remove the style from styleByClass
					var entry = m.styleByClass[_class],
						entryLength = entry.length;
					for(var i=0; i<entryLength;i++) {
						if (entry[i]==this) break;
					}
					if (i<entryLength) {
						entry.splice(i,1);
						var features = m.featuresByClass[_class];
						if (features) {
							array.forEach(features, function(f){
								if (!affectedFeatures[f.id]) affectedFeatures[f.id] = f;
							});
						}
					}
				}
			}, this);
		}
		else if (this.fid) {
			// remove the style from styleByFid
			array.forEach(this.fid, function(_fid){
				var entry = m.styleByFid[_fid],
					entryLength = entry.length;
				for(var i=0; i<entryLength;i++) {
					if (entry[i]==this) break;
				}
				if (i<entryLength) {
					entry.splice(i,1);
					var feature = m.getFeatureById(_fid);
					if (feature && !affectedFeatures[feature.id]) affectedFeatures[feature.id] = feature;
				}
			}, this);
		}
		
		delete this.styleClass, this.fid, this.filter;

		this._setDef(def);
		// apply the style to the the affected features
		this.map.renderFeatures(affectedFeatures, true, "normal");
	},
	
	_setDef: function(def) {
		var m = this.map;
		// mixin style attributes
		for (attr in def) {
			if (attr in styleAttributes) this[attr] = def[attr];
		}

		// prepare filter function
		var filter = def.filter;
		if (filter) {
			if (lang.isString(filter)) {
				// replace $attribute or $[attribute] with this.get('attribute')
				filter = filter.replace(filterPattern, function(match, attr1, attr2){
					return "this.get('" + (attr1||attr2) + "')";
				});
				filter = eval("_=function(){return "+filter+";}");
			}
			this.filter = filter;
		}

		// prepare styleClass and fid
		var styleClass = def.styleClass;
		var fid = def.fid;
		if (fid && !lang.isArray(fid)) fid = [fid];
		if (styleClass) {
			if (!lang.isArray(styleClass)) styleClass = [styleClass];
			array.forEach(styleClass, function(_class){
				// styleClass and fid simultaneously
				if (fid) {
					var byClassAndFid = m.styleByClassAndFid;
					array.forEach(fid, function(_fid){
						if (!byClassAndFid[_class]) byClassAndFid[_class] = {};
						if (!byClassAndFid[_class][_fid]) byClassAndFid[_class][_fid] = [];
						byClassAndFid[_class][_fid].push(this);
					}, this);
				}
				// styleClass only
				else {
					if (!m.styleByClass[_class]) m.styleByClass[_class] = [];
					m.styleByClass[_class].push(this);
				}
			}, this);
		}
		else if (fid) {
			// fid only
			array.forEach(fid, function(_fid){
				if (!m.styleByFid[_fid]) m.styleByFid[_fid] = [];
				m.styleByFid[_fid].push(this);
			}, this);
		}
		if (styleClass) this.styleClass = styleClass;
		if (fid) this.fid = fid;
		
		// prepare composer
		var composer = def.composer;
		if (composer) {
			if (lang.isString(composer)) {
				composer = lang.getObject(composer);
			}
			this.composer = composer;
			// features may need this attribute to be aware that the style has changed
			this._updated = (new Date()).getTime();
			this.composerOptions = def.composerOptions || def;
		}

		// prepare handler
		var handler = def.handler;
		if (handler) {
			if (lang.isString(handler)) {
				handler = lang.getObject(handler);
			}
			this.handler = handler;
		}

		// copy actual style attribute (e.g. color) to a separate javascript object
		this.def = {};
		for (attr in def) {
			if (!(attr in styleAttributes) && !(attr in noStyleMixin)) this.def[attr] = def[attr];
		}
	},
	
	destroy: function() {
		delete this.def, this.filter, this.map, this._features, this.composer, this.composerOptions, this.handler;
	}
});

djeo.calculateStyle = function(feature, theme) {
	var styles = [];
	// find all features participating in the style calculation
	// features = feature itself + all its parents
	var features = [],
		parent = feature;
	do {
		features.push(parent);
		parent = parent.parent;
	}
	while (parent != feature.map)
	
	for (var i=features.length-1; i>=0; i--) {
		appendFeatureStyle(features[i], styles, theme);
	}
	
	// now do actual style calculation
	var resultStyle = {};
	array.forEach(styles, function(style) {
		var applyStyle = style.filter ? evaluateFilter(style.filter, feature) : true;
		if (applyStyle) {
			styleMixin(resultStyle, style.def);
			if (style.composer) {
				style.composer(feature, style.composerOptions, resultStyle, style._updated);
			}
		}
	});
	
	// final adjustments
	array.forEach(symbolizers, function(styleType){
		// ensure that specific style is defined as array
		var s = resultStyle[styleType];
		if (s && !lang.isArray(s)) resultStyle[styleType] = [s];
	})
	return resultStyle;
}

var evaluateFilter = function(filter, feature) {
	return filter.call(feature.map.useAttrs ? feature.attrs : feature);
}

var appendFeatureStyle = function(feature, styles, theme) {
	// TODO: duplication of styleClass
	var m = feature.map;
		styleClass = feature.styleClass,
		fid = feature.id;
	if (styleClass) {
		array.forEach(styleClass, function(_styleClass){
			var byClassAndFid = m.styleByClassAndFid;
			if (byClassAndFid[_styleClass] && byClassAndFid[_styleClass][fid]) {
				append(byClassAndFid[_styleClass][fid], styles, theme);
			}
			else if (m.styleByClass[_styleClass]) append(m.styleByClass[_styleClass], styles, theme);
		});
	}
	else if (m.styleByFid[fid]) append(m.styleByFid[fid], styles, theme);

	if (feature.style) append(feature.style, styles, theme);
}

var append = function(/*Array*/what, /*Array*/to, theme) {
	array.forEach(what, function(element){
		if ( ( (!element.theme||element.theme=="normal") && (!theme||theme=="normal") ) || (element.theme==theme) ) {
			if (element.def.reset) {
				// clear all entries in the destination
				for(var i=to.length-1; i>=0; i--) to.pop();
			}
			to.push(element);
		}
	});
}

var styleMixin = function(styleDef, styleAttrs) {
	for (attr in styleAttrs) {
		if (attr=="shape" && styleDef.img) {
			// we've got a vector icon, override the currently set bitmap icon
			delete styleDef.img;
		}
		else if (attr=="img" && styleDef.shape) {
			// we've got a vector icon, override the currently set bitmap icon
			delete styleDef.shape;
		}
		styleDef[attr] = styleAttrs[attr];
	}
	return styleDef;
}

return Style;

});