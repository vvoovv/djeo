define([], function(lang){

var djeo = {
	defaultLayerID: "ROADMAP",
	defaultEngine: "djeo"
};

// registry of feature constructors
djeo.featureTypes = {};

// supported events
djeo.events = {mouseover: 1, mouseout: 1, click: 1, mousemove: 1};

var deps = {};
djeo.dependencies = deps;
djeo.registerDependency = function(moduleId) {
	deps[moduleId] = 1;
};

djeo.defaultStyle = [
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

djeo.getLayerClassId = function(/* String */layerId) {
	// check if we've got a complex structure like "layerClassId:url"
	var colonIndex = layerId.indexOf(":");
	return (colonIndex > 0) ? layerId.substring(0, colonIndex) : layerId;
};

return djeo;
	
});