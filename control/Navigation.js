dojo.provide("djeo.control.Navigation");


(function(){

dojo.declare("djeo.control.Navigation", null, {
	
	factoryType: "control.Navigation",
	
	constructor: function(map, kwArgs) {
		this.map = map;
		var factory = this.map.engine.getFactory(this.factoryType);
		if (factory) {
			dojo.mixin(this, factory);
			if (kwArgs) dojo.mixin(this, kwArgs);
			this.enable(true);
		}
	},

	enable: function(enable) {
		
	}
});

})();
