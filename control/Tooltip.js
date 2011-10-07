dojo.provide("djeo.control.Tooltip");

dojo.require("djeo.control.Base");

(function(){
var DEFAULT_TEXT = function(feature){
	return feature.tooltip || feature.name || feature.id;
};

dojo.declare("djeo.control.Tooltip", djeo.control.Base, {

	factoryType: "control.Tooltip",

	constructor: function(map, kwArgs) {
		this.text = kwArgs && kwArgs.text ? kwArgs.text : DEFAULT_TEXT;
		
		this.attachFactory(this.enabled);
	},

	init: function() {

	}
});

})();
