define([
	"dojo/_base/declare", // declare
	"dijit/typematic",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_CssStateMixin",
	"dojo/text!./templates/ZoomControl.html",
	"./_MapWidgetMixin"
], function(declare, typematic, _Widget, _TemplatedMixin, _CssStateMixin, template, _MapWidgetMixin){

	// module:
	//		djeo/widget/ZoomControl
	// summary:
	//		A widget that allows one to zoom in or zoom out the map


return declare([_Widget, _TemplatedMixin, _CssStateMixin, _MapWidgetMixin], {
	// summary:
	//		A widget that allows one to zoom in or zoom out the map

	templateString: template,
		
	baseClass: "djeoZoomControl",

	// Apply CSS classes for zoomIn/zoomOut buttons per mouse state
	cssStateNodes: {
		zoomIn: "djeoZoomControlZoomIn",
		zoomOut: "djeoZoomControlZoomOut",
	},

	_typematicCallback: function(/*Number*/ count, /*Object*/ button, /*Event*/ e){
		if (count) {
			var zoomIncrement = (button == this.zoomIn) ? 1 : -1;
			this.map.set("zoom", this.map.get("zoom") + zoomIncrement);
		}
	},

	postCreate: function(){
		this.inherited(arguments);

		this._connects.push(typematic.addMouseListener(
			this.zoomIn, this, "_typematicCallback", 25, 500));
		this._connects.push(typematic.addMouseListener(
			this.zoomOut, this, "_typematicCallback", 25, 500));

		this.domNode.style.zIndex = 1000;

		if (this.appendToMap) {
			this.map._appendDiv(this.domNode);
		}
	}
});

});
