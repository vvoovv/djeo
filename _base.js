define([
	"dojo/_base/lang",
	"dojo/_base/array"
], function(lang, array){

var d = {
	defaultLayerID: "ROADMAP",
	defaultEngine: "djeo",
	// registry of feature constructors
	featureTypes: {},
	// supported events
	events: {mouseover: 1, mouseout: 1, click: 1, mousemove: 1}
};

var deps = {};
d.dependencies = deps;
d.registerDependency = function(moduleId, func) {
	deps[moduleId] = func || 1;
};

d.defaultStyle = [
	{
		stroke: "black",
		strokeWidth: 0.5,
		strokeOpacity: 1,
		fill: "#B7B7B7",
		fillOpacity: 0.8,
		shape: "square", // circle, square, triangle, star, cross, or x
		size: 10
	},
	{
		theme: "highlight",
		stroke: "orange",
		area: {strokeWidth: 3},
		rScale: 1.5
	}
];

d.getLayerClassId = function(/* String */layerId) {
	// check if we've got a complex structure like "layerClassId:url"
	var colonIndex = layerId.indexOf(":");
	return (colonIndex > 0) ? layerId.substring(0, colonIndex) : layerId;
};

d.getTraversedAttr = function(feature, attr) {
	// current feature
	var f = feature;
	while (f) {
		var attrValue = f[attr];
		if (attrValue !== undefined) {
			return attrValue;
		}
		f = f.parent;
	}
};

d.forEach = function(features, callback, thisObject) {
	if (!lang.isArray(features)) features = [features];
	array.forEach(features, function(feature){
		if (feature.isContainer) forEachIn(feature, callback, thisObject);
		else callback.call(thisObject, feature);
	});
};

function forEachIn(featureContainer, callback, thisObject) {
	var features = featureContainer.features,
		numFeatures = features.length
	;
	array.forEach(features, function(feature){
		if (feature.isContainer) {
			forEachIn(feature, callback, thisObject)
		}
		else {
			callback.call(thisObject, feature);
		}
	});
}

// building array of scales; array index corresponds to zoom
// scale is the number of pixels per map projection unit
// scale = 256*2^zoom/(2*Math.PI*earthRadius)
var scales = [1/156543.034];
for(var i=1; i<20; i++) {
	scales[i] = 2 * scales[i-1];
}
d.scales = scales;

return d;
	
});