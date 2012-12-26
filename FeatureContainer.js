define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // isString, isArray
	"dojo/_base/array", // forEach
	"./_base",
	"./Feature",
	"./util/_base",
	"./util/bbox"
], function(declare, lang, array, djeo, Feature, u, bbox){

var fc = declare([Feature], {
	
	type: "FeatureContainer",
	
	isContainer: true,
	
	features: null,
	
	handles: null,
	
	numVisibleFeatures: 0,
	
	constructor: function(featureDef, kwArgs) {
		if (this.features) {
			var features = this.features;
			this.features = [];
			this.addFeatures(features, true, true);
		}
		else this.features = [];
		this.handles = {};
	},
	
	show: function(show) {
		if (show === undefined) show = true;
		if (this.features.length == 0) {
			// just notify parent
			this.parent._show(this, show, true);
		}
		array.forEach(this.features, function(feature){
			feature.show(show);
		}, this);
		if (this.visible != show) {
			this.visible = show;
		}
	},
	
	_show: function(feature, show, attrOnly){
		// if attrOnly==true don't call feature._show();
		if (show) {
			this.numVisibleFeatures++;
			if (!this.visible) {
				// set visibility to true
				this.visible = true;
			}
			if (this.numVisibleFeatures == 1) {
				// notify parent
				this.parent._show(this, true, true);
			}
		}
		else {
			this.numVisibleFeatures--;
			if (this.numVisibleFeatures==0){
				// notify parent
				this.parent._show(this, false, true);
			}
		}
		if (!attrOnly) {
			feature._show(show);
		}
	},
	
	addFeatures: function(/* Array */features, ignoreEvents, preventRendering) {
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

		if (!preventRendering) {
			this.map.renderFeatures(addedFeatures);
			if (!ignoreEvents) {
				// attach parent's events to the feature
				array.forEach(addedFeatures, function(feature) {
					for(var handle in this.handles) {
						var handleObj = this.handles[handle];
						if (handleObj.keys) {
							for (var key in handleObj.keys) {
								feature.onForHandle(handle, {
									events: handleObj.events,
									method: handleObj.method,
									context: handleObj.context,
									key: key,
									value: handleObj.keys[key]
								});
							}
						}
						else {
							feature.onForHandle(handle, {
								events: handleObj.events,
								method: handleObj.method,
								context: handleObj.context
							});
						}
					}
				}, this);
			}
		}
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
		if (this.features.length == 0) return null;

		var bb = [Infinity,Infinity,-Infinity,-Infinity];
		array.forEach(this.features, function(feature){
			bbox.extend(bb, feature.getBbox());
		}, this);
		return bb;
	},
	
	render: function(theme, destroy) {
		return this.map.engine.renderContainer(this, theme, destroy);
	},
	
	_render: function(theme, destroy) {
		return this.map.engine._renderContainer(this, theme, destroy);
	},
	
	getContainer: function() {
		if (!this.container) {
			this.container = this.map.engine.createContainer(this);
		}
		return this.container;
	},
	
	onForHandle: function(handle, kwArgs) {
		if (!this.features.length) return handle;
		if (kwArgs.events) {
			kwArgs.events = lang.isString(kwArgs.events) ? [kwArgs.events] : kwArgs.events;
		}
		handle = handle || u.uid();
		array.forEach(this.features, function(feature) {
			feature.onForHandle(handle, kwArgs);
		});
		var handles = this.handles,
			handleObj = handles[handle]
		;
		if (!handleObj) {
			handleObj = {
				events: kwArgs.events,
				method: kwArgs.method,
				context: kwArgs.context
			}
			handles[handle] = handleObj;
		}
		var key = kwArgs.key
		if (key) {
			if (!handleObj.keys) handleObj.keys = {};
			handleObj.keys[key] = kwArgs.value;
		}
		return handle;
	},
	
	disconnect: function(handle, key, keepIfKey) {
		var deleteHandle = true;
		array.forEach(this.features, function(feature) {
			feature.disconnect(handle, key, keepIfKey);
			if (keepIfKey && feature.handles[handle]) {
				deleteHandle = false;
			}
		});
		if (deleteHandle) {
			delete this.handles[handle];
		}
		else {
			var handleObj = this.handles[handle];
			if (handleObj &&handleObj.keys) {
				// Can keys object be empty? I don't think so
				delete handleObj.keys[key];
			}
		}
	}
});

// register the constructor
djeo.featureTypes.FeatureContainer = fc;
djeo.featureTypes.FeatureCollection = fc;

return fc;
});
