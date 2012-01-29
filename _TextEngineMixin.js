define([
	"dojo/_base/declare",
	"dojo/has",
	"dojo/_base/lang"
], function(declare, has, lang){

return declare(null, {

	renderedText: "",
	
	output: "toConsole",
	
	outputFile: "output.txt",
	
	provideOutput: function() {
		if (this.output) {
			if (lang.isFunction(this.output)) {
				this.output(this.renderedText);
			}
			else if (this[this.output]) {
				this[this.output]();
			}
		}
	},

	toConsole: function() {
		console.log(this.renderedText);
	},
	
	toMapContainer: function() {
		if (has("host-browser")) {
			this.map.container.innerHTML = "<pre>"+this.renderedText+"</pre>";
		}
	},
	
	toFile: function() {
		if (has("host-browser")) return;
		var fs = require.nodeRequire("fs");
		fs.writeFileSync(this.outputFile, this.renderedText);
	}
});

});