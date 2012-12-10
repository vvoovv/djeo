define([
	"dojo/_base/declare",
	"dojo/_base/lang" // isObject
], function(declare, lang) {
	
return declare(null, {
	
	postscript: function(/*Object?*/params, /*DomNode|String*/srcNodeRef){
		if (!params.map && srcNodeRef && lang.isObject(srcNodeRef) && !srcNodeRef.tagName) {
			// assume that srcNodeRef is actually an instance of djeo/Map
			this.map = srcNodeRef;
			this.appendToMap = true;
			srcNodeRef = null;
		}
		this.create(params, srcNodeRef);
	}
});
	
});