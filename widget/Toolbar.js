define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"dijit/Toolbar",
	"./_MapWidgetMixin"
], function(declare, domClass, Toolbar, _MapWidgetMixin) {
	
return declare([Toolbar, _MapWidgetMixin], {

	postCreate: function(){
		this.inherited(arguments);

		domClass.add(this.domNode, "djeoToolbar");
		this.domNode.style.zIndex = 1000;
		if (this.appendToMap) {
			this.map._appendDiv(this.domNode);
		}
	}
});
	
});