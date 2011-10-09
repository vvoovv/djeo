dojo.provide("djeo.FeatureContainer");

dojo.require("djeo.Feature");

(function() {

var g = djeo,
	u = g.util;

dojo.declare("djeo.FeatureContainer", g.Feature, {
	
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
			dojo.forEach(this.features, function(feature){
				feature.show(show);
			}, this);
			this.visible = show;
		}
	},
	
	addFeatures: function(/* Array */features, noRendering) {
		if (!dojo.isArray(features)) features = [features];
		var addedFeatures = [];
		dojo.forEach(features, function(feature){
			if (feature.declaredClass) { // derived from djeo.Feature
				feature.setMap(this.map);
				feature.setParent(this);
				this.features.push(feature);
			}
			else {
				var featureType = feature.type ? feature.type : ( feature.features ? "FeatureContainer" : "Placemark" );
				var ctor = g.featureTypes[featureType];
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
		if (!dojo.isArray(features)) features = [features];
		var removedFeatures = [];
		dojo.forEach(features, function(feature){
			feature = feature.declaredClass ? feature : this.map.getFeatureById(feature);
			if (feature) feature.remove();
		}, this);
		return removedFeatures;
	},
	
	remove: function() {
		this.removeFeatures(this.features);
	},
	
	getBbox: function() {
		var bbox = [Infinity,Infinity,-Infinity,-Infinity];
		dojo.forEach(this.features, function(feature){
			u.bbox.extend(bbox, feature.getBbox());
		}, this);
		return bbox;
	},
	
	_render: function(stylingOnly, theme) {
		if (!this.visible) return;
		dojo.forEach(this.features, function(feature){
			if (feature.isContainer || feature.visible) feature._render(stylingOnly, theme);
		}, this);
	},
	
	getContainer: function() {
		if (!this.container) {
			this.container = this.map.engine.createContainer(this);
		}
		return this.container;
	},
	
	connectWithHandle: function(handle, /* String|Array? */events, /*Object|null*/ context, /*String|Function*/ method) {
		if (!this.features.length) return handle;
		events = dojo.isString(events) ? [events] : events;
		handle = handle || u.uid();
		dojo.forEach(this.features, function(feature) {
			feature.connectWithHandle(handle, events, context, method);
		});
		return handle;
	},
	
	disconnect: function(handle) {
		if (!this.features.length) return;
		dojo.forEach(this.features, function(feature) {
			feature.disconnect(handle);
		});
	}
});

// register the constructor
g.featureTypes.FeatureContainer = g.FeatureContainer;
g.featureTypes.FeatureCollection = g.FeatureContainer;

}());
