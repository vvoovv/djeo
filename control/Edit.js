define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // hitch
	"dojo/on",
	"../_base",
	"./_Base"
], function(declare, lang, on, djeo, Base){

var dependency = "Edit";
djeo.registerDependency(dependency);

return declare([Base], {

	constructor: function(map, kwArgs) {
		// attach factory if it exists
		var factory = this.map.engine.getFactory(dependency);
		if (factory) {
			lang.mixin(this, factory);
		}
		
		this.init();
		if (this.enabled) this.enable();
	}
});

});
