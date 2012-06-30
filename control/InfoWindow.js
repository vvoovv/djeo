define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // hitch
	"../_base",
	"./_Base"
], function(declare, lang, djeo, Base){

var dependency = "InfoWindow";
djeo.registerDependency(dependency);

var DEFAULT_CONTENT = function(feature){
	return feature.info || feature.name || feature.id;
};

return declare([Base], {
	
	_dependency: dependency,
	
	infoWindow: null,
	
	offsetX: 0,
	
	offsetY: 0,

	constructor: function(map, kwArgs) {
		this.content = kwArgs && kwArgs.content ? kwArgs.content : DEFAULT_CONTENT;
		// the event to listen to
		this.events = ["click"];
		this.attachFactory();
		this.init();
		if (this.enabled) this.enable();
	}
});

});
