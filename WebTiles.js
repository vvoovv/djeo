define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin
	"./_base"
], function(declare, lang, djeo) {
	
var dependency = "WebTiles";
djeo.registerDependency(dependency);

return declare(null, {
	
	yFirst: false,

	constructor: function(kwArgs) {
		lang.mixin(this, kwArgs);

		// paramStr is actually url
		var url = kwArgs.paramStr ? kwArgs.paramStr : this.url;
		if (lang.isString(url)) {
			// check if url contains the left square bracket
			var lBracket = url.indexOf("[");
			if (lBracket > -1) {
				// we have a template in the url
				// the right square bracket is supposed to close the left square bracket
				var rBracket = url.indexOf("]")
					parts = url.substring(lBracket+1, rBracket).split(",")
				;
				this.url = [];
				for (var i=0; i<parts.length; i++) {
					this.url[i] = url.substring(0, lBracket) + parts[i] + url.substring(rBracket+1);
				}
			}
			else {
				this.url = [url];
			}
		}
		this.numUrls = this.url.length;
	},

	startup: function(map) {
		this.map = map;
		var factory = this.map.engine.getFactory(dependency);
		if (factory) {
			lang.mixin(this, factory);
			this.init();
		}
	}
});

});
