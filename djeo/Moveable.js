define([
	"dojo/_base/declare", // declare
	"djeo/dojox/gfx",
	"djeo/dojox/gfx/Moveable"
], function(declare, gfx, Moveable) {

return declare([Moveable], {
	onMove: function(/* dojox.gfx.Mover */ mover, /* Object */ shift){
		// summary: called during every move notification,
		//	should actually move the node, can be overwritten.
		this.onMoving(mover, shift);
		var transformShape = (this.shape instanceof gfx.Surface) ? this.shape.children[0] : this.shape;
		transformShape.applyLeftTransform(shift);
		this.onMoved(mover, shift);
	}
});

});
