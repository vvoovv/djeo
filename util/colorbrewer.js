dojo.provide("djeo.util.colorbrewer");

dojo.require("djeo.util.colorbrewer_data");

djeo.util.colorbrewer.calculateStyle = function(style, breakIndex, kwArgs) {
	style.fill = djeo.util.colorbrewer_data["seq"][kwArgs.numClasses][kwArgs.colorSchemeName].colors[breakIndex];
};