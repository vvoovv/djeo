define([
	"dojo/_base/lang", // isString
	"dojo/_base/array" // array
], function(lang, array){
	
var _onBegin = function(){
	if (!this.style) return;
	// building registry of style filter functions
	var filters = {};
	array.forEach(this.style, function(style){
		var filter = style.filter;
		if (style.id && filter) {
			// the first element of the array is filter function itself
			// the second element of the array is reserved for a feature container
			filters[style.id] = [(lang.isString(filter)) ? eval("_=function(){return "+filter+";}" ) : filter, 0];
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
	// check if filter is evaluated to true
	var container;
	for (var filterId in this._filters){
		if (this._filters[filterId][0].call(feature)) {
			container = this._filters[filterId][1];
			break;
		}
	}
	if (container) {
		container.features.push(feature);
	}
};

var _onNode = function(node, feature) {
	_onElement.call(this, node, feature);
};

var _onWay = function(way, feature) {
	_onElement.call(this, way, feature);
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