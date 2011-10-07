dojo.provide("djeo.gfx.Moveable");

dojo.require("dojox.gfx.Moveable");

dojo.declare("djeo.gfx.Moveable", dojox.gfx.Moveable, {
	onMove: function(/* dojox.gfx.Mover */ mover, /* Object */ shift){
		// summary: called during every move notification,
		//	should actually move the node, can be overwritten.
		this.onMoving(mover, shift);
		var transformShape = (this.shape instanceof dojox.gfx.Surface) ? this.shape.children[0] : this.shape;
		transformShape.applyLeftTransform(shift);
		this.onMoved(mover, shift);
	}
});
