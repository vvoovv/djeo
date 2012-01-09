define([
	"dojo/_base/lang" // getObject
], function(lang){

var djeo = lang.getObject("djeo", true);

lang.mixin(djeo, {
	defaultLayerID: "ROADMAP",
	defaultEngine: {type: "djeo", options:{}}
});

// registry of feature constructors
djeo.featureTypes = {};

// supported events
djeo.events = {onmouseover: 1, onmouseout: 1, onclick: 1, onmousemove: 1};

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
		polygon: {strokeWidth: 3},
		rScale: 1.5
	}
]

return djeo;
	
});