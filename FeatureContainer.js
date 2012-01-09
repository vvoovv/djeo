define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // isString, isArray
	"dojo/_base/array", // forEach
	"djeo/_base",
	"djeo/Feature",
	"djeo/util/_base",
	"djeo/util/bbox"
], function(declare, lang, array, djeo, Feature, u, bbox){

var fc = declare("djeo.FeatureContainer", [Feature], {
	
	type: "FeatureContainer",
	
	isContainer: true,
	
	features: null,
	
	constructor: function(featureDef, kwArgs) {
		if (this.features) {
			var features = this.features;
			this.features = [];
			this.addFeatures(features, true);
		}
		else this.features = [];
	},
	
	show: function(show) {
		if (show === undefined) show = true;
		if (this.visible != show) {
			array.forEach(this.features, function(feature){
				feature.show(show);
			}, this);
			this.visible = show;
		}
	},
	
	addFeatures: function(/* Array */features, noRendering) {
		if (!lang.isArray(features)) features = [features];
		var addedFeatures = [];
		array.forEach(features, function(feature){
			if (feature.declaredClass) { // derived from djeo.Feature
				feature.setMap(this.map);
				feature.setParent(this);
				this.features.push(feature);
			}
			else {
				var featureType = feature.type ? feature.type : ( feature.features ? "FeatureContainer" : "Placemark" );
				var ctor = djeo.featureTypes[featureType];
				if (ctor) {
					feature = new ctor(feature, {map: this.map, parent: this});
					this.features.push(feature);
				}
			}
			if (feature.declaredClass) {
				feature.setMap(this.map);
				feature.setParent(this);
				this.map.registerFeature(feature);
				addedFeatures.push(feature);
			}
		}, this);
		if (!noRendering) this.map.renderFeatures(addedFeatures);
		return addedFeatures;
	},
	
	removeFeatures: function(features) {
		if (!lang.isArray(features)) features = [features];
		var removedFeatures = [];
		array.forEach(features, function(feature){
			feature = feature.declaredClass ? feature : this.map.getFeatureById(feature);
			if (feature) feature.remove();
		}, this);
		return removedFeatures;
	},
	
	remove: function() {
		this.removeFeatures(this.features);
	},
	
	getBbox: function() {
		var bb = [Infinity,Infinity,-Infinity,-Infinity];
		array.forEach(this.features, function(feature){
			bbox.extend(bb, feature.getBbox());
		}, this);
		return bb;
	},
	
	render: function(stylingOnly, theme) {
		this.map.engine.renderContainer(this, stylingOnly, theme);
	},
	
	_render: function(stylingOnly, theme) {
		this.map.engine._renderContainer(this, stylingOnly, theme);
	},
	
	getContainer: function() {
		if (!this.container) {
			this.container = this.map.engine.createContainer(this);
		}
		return this.container;
	},
	
	connectWithHandle: function(handle, /* String|Array? */events, /*Object|null*/ context, /*String|Function*/ method) {
		if (!this.features.length) return handle;
		events = lang.isString(events) ? [events] : events;
		handle = handle || u.uid();
		array.forEach(this.features, function(feature) {
			feature.connectWithHandle(handle, events, context, method);
		});
		return handle;
	},
	
	disconnect: function(handle) {
		if (!this.features.length) return;
		array.forEach(this.features, function(feature) {
			feature.disconnect(handle);
		});
	}
});

// register the constructor
djeo.featureTypes.FeatureContainer = fc;
djeo.featureTypes.FeatureCollection = fc;

return fc;
});
