define([
	"dojo/_base/lang", // isArray, isString, getObject
	"dojo/_base/array", // forEach
	"djeo/common/Placemark"
], function(lang, array, P){

// module object
var n = {};

n.composeArray = function(featureContainer, attr, performSort, ascendingSort) {
	var values = [];
	array.forEach(featureContainer.features, function(feature){
		var value = feature.get(attr);
		if (!isNaN(value)) values.push(value);
	});
	if (performSort) {
		ascendingSort = ascendingSort ? function(a, b) {return (a - b);} : null;
		values.sort(ascendingSort);
	}
	return values;
};

n.getBreakIndex = function(breaks, numClasses, value) {
	for (var i=0; i<numClasses; i++) {
		if (i==0) {
			if (breaks[0]<=value && value<=breaks[1]) break;
		}
		else if (breaks[i]<value && value<=breaks[i+1]) break;
	}
	// the value doesn't belong to the given breaks
	return (i<numClasses) ? i : -1;
};

n.composeStyle = function(feature, kwArgs, style, lastUpdated) {
	var attrValue = feature.get(kwArgs.attr);
	
	if (attrValue === undefined) return;
	
	var composeStyle = lang.isString(kwArgs.composeStyle) ? lang.getObject(kwArgs.composeStyle) : kwArgs.composeStyle,
		breaks, numClasses;

	if (lang.isArray(kwArgs.breaks)) {
		breaks = kwArgs.breaks;
		numClasses = breaks.length - 1;
	}
	else {
		var getBreaks = lang.isString(kwArgs.breaks) ? lang.getObject(kwArgs.breaks) : kwArgs.breaks,
			featureContainer = feature.parent;
		breaks = featureContainer._breaks;
		if (!breaks || lastUpdated > featureContainer._breaksTimestamp) {
			breaks = getBreaks(featureContainer, kwArgs);
			
			// store calculated breaks for the use by other features that are children of the featureContainer
			featureContainer._breaks = breaks;
			featureContainer._breaksTimestamp = (new Date()).getTime();
		}
		numClasses = kwArgs.numClasses;
	}

	var breakIndex = n.getBreakIndex(breaks, numClasses, attrValue);
	if (breakIndex < numClasses) composeStyle(style, breakIndex, kwArgs);
};

n.composeSizeStyle = function(style, breakIndex, kwArgs) {
	var numClasses = lang.isArray(kwArgs.breaks) ? kwArgs.breaks.length - 1 : kwArgs.numClasses,
		iconSize = kwArgs.medianSize + kwArgs.sizeStep*( breakIndex - parseInt(numClasses/2) + (numClasses%2 ? 0 : 0.5) ),
		src = P.getImgSrc(style),
		size = src ? P.getImgSize(style) : P.getSize(style);

	if (size) style.scale = (size[0]>size[1]) ? iconSize/size[0] : iconSize/size[1]
	else style.size = iconSize;
};

return n;
});