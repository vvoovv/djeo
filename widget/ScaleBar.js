define([
	"dojo/_base/declare", // declare
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/form/HorizontalRule"
], function(declare, _Widget, _TemplatedMixin, HorizontalRule) {

return declare("dijit.form.HorizontalRule", [_Widget, _TemplatedMixin], {
	
	templateString: "<div class='djeoScaleBar' style='position: absolute;'><div></div><div></div></div>",
	
	buildRendering: function() {
		this.inherited(arguments);

		new HorizontalRule({
			count:6,
			style:{height:".4em"}
		}, this.domNode.children[0]);
		new HorizontalRule({
			count:11,
			style:{height:".4em"}
		}, this.domNode.children[1]);
	},
	
	postCreate: function() {
		this.inherited(arguments);
		
		this.domNode.style.zIndex = 1000;
		this.map._appendDiv(this.domNode);
	}
});

});
