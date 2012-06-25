define([], function(lang){

var djeo = {
	defaultLayerID: "ROADMAP",
	defaultEngine: "djeo",
	// registry of feature constructors
	featureTypes: {},
	// supported events
	events: {mouseover: 1, mouseout: 1, click: 1, mousemove: 1}
};

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

// building array of scales; array index corresponds to zoom
// scale is the number of pixels per map projection unit
// scale = 256*2^zoom/(2*Math.PI*earthRadius)
var scales = [1/156543.034];
for(var i=1; i<20; i++) {
	scales[i] = 2 * scales[i-1];
}
djeo.scales = scales;

return djeo;
	
});