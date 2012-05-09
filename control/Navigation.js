define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin
	"../_base"
], function(declare, lang, djeo){

var dependency = "Navigation";
djeo.registerDependency(dependency);

return declare(null, {
	
	constructor: function(map, kwArgs) {
		this.map = map;
		var factory = this.map.engine.getFactory(dependency);
		if (factory) {
			lang.mixin(this, factory);
			if (kwArgs) lang.mixin(this, kwArgs);
			this.enable(true);
		}
	},

	enable: function(enable) {
		
	}
});

});
