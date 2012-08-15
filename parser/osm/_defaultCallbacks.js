define([
	"dojo/_base/lang", // isString
	"dojo/_base/array" // array
], function(lang, array){
	
var defaultBuildingHeight = 10;

// search for $attribute or $[attribute] or 
var filterPattern = /\$(?:(\w+)|\[([^\]]+)\])|this\.(\w+)\(\)/g;
	
var _onBegin = function(){
	if (!this.style) {
		// this is need for correct operation of _onElement
		this.container = this;
		return;
	}
	// building registry of style filter functions
	var filters = {};
	array.forEach(this.style, function(style){
		var filter = style.filter;
		if (style.id && filter) {
			// process filter, the related code is taken from djeo/Style
			if (lang.isString(filter)) {
				// replace $attribute or $[attribute] with f['attribute']
				filter = filter.replace(filterPattern, function(match, attr1, attr2, functionName){
					// f stands for feature
					return functionName ? "this."+functionName+"(f)" : "f['"+(attr1||attr2)+"']";
				});
				// parameter f stands for feature
				filter = eval("_=function(f){return "+filter+";}");
			}
			// the first element of the array is filter function itself
			// the second element of the array is reserved for a feature container
			filters[style.id] = [filter, 0];
		}
	});
	this._filters = filters;
	var processFeatures = function(inputFeatures, outputFeatures){
		for(var i=0, numFeatures=inputFeatures.length; i<numFeatures; i++) {
			var f = inputFeatures[i];
			// style ids
			var ids = f.sid;
			if (lang.isString(ids)) {
				ids = [ids];
			}
			var filterEntry = null;
			array.forEach(ids, function(id){
				if (filters[id]) {
					filterEntry = filters[id];
				}
			});
			if (filterEntry || f.features) {
				// create a feature container
				var feature = {features:[]};
				if (filterEntry) {
					filterEntry[1] = feature;
				}
				// mixin all attributes except sid and features
				for (var attr in f) {
					if (attr != "sid" && attr!= "features") {
						feature[attr] = f[attr]; 
					}
				}
				outputFeatures.push(feature);
				if (f.features && f.features.length) {
					processFeatures(f.features, feature.features);
				}
			}
		}
	}
	processFeatures(this.featureTree, this.features);
};

var _onComplete = function(){
	
};

var _onElement = function(element, feature) {
	// default value for container variable
	var container = this.container,
		elementAdded = false;
	;
	// check if filter is evaluated to true
	for (var filterId in this._filters){
		if (this._filters[filterId][0].call(this, feature)) {
			container = this._filters[filterId][1];
			break;
		}
	}
	if (container) {
		container.features.push(feature);
		elementAdded = true;
	}
	return elementAdded;
};

var _onNode = function(node, feature) {
	_onElement.call(this, node, feature);
};

var _onWay = function(way, feature) {
	var elementAdded = _onElement.call(this, way, feature);
	if (elementAdded && feature.building) {
		if (this.assignBuildingHeight && feature["building:levels"]) {
			feature.height = 2.5 * parseInt(feature["building:levels"]);
		}
		else if (feature.height) {
			var h = feature.height;
			// strip out units
			var parts = h.split(" ");
			h = (parts.length == 1) ? h : parts[0];
			feature.height = parseFloat(h);
		}
		else if (this.assignBuildingHeight) {
			feature.height = this.defaultBuildingHeight || defaultBuildingHeight;
		}
	}
};

var _onRelation = function(node) {
};

return {
	onBegin: _onBegin,
	onComplete: _onComplete,
	onNode: _onNode,
	onWay: _onWay,
	onRelation: _onRelation
}
	
});