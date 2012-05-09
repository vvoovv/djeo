define([
	"dojo/_base/declare", // declare
	"dojo/_base/event", // stop
	"dojo/on",
	"dojo/touch",
	"dojo/_base/lang", // hitch
	"dojo/dom-class",
	"./Mover"
], function(declare, event, on, touch, lang, domClass, Mover) {

return declare(null, {
	
	// delay: Number
	//		delay move by this number of pixels
	delay: 0,
	
	constructor: function(node, map){
		this.node = node;
		this.map = map;
		this.mover = Mover;
		this._pressHandle = on(node, touch.press, lang.hitch(this, this.onPress));
	},
	
	destroy: function(){
		// summary:
		//		stops watching for possible move, deletes all references, so the object can be garbage-collected
		this._pressHandle.remove();
		delete this._pressHandle, this.node, this.map;
	},
	
	onPress: function(e){
		if(this.delay){
			this._onMoveHandle = on(this.node, touch.move, lang.hitch(this, this._onMove));
			this._onReleaseHandle = on(this.node, touch.release, lang.hitch(this, this.onRelease));
			this._lastX = e.pageX;
			this._lastY = e.pageY;
		}
		else{
			this.onDragDetected(e);
		}
		event.stop(e);
	},
	
	_onMove: function(e){
		if(Math.abs(e.pageX - this._lastX) > this.delay || Math.abs(e.pageY - this._lastY) > this.delay){
			this.onRelease(e);
			this.onDragDetected(e);
		}
		event.stop(e);
	},
	
	onRelease: function(e){
		this._onReleaseHandle.cancel();
		this._onMoveHandle.cancel();
		delete this._onReleaseHandle, this._onMoveHandle;
		event.stop(e);
	},
	
	// local events
	onDragDetected: function(/* Event */ e){
		// summary:
		//		called when the drag is detected;
		//		responsible for creation of the mover
		new this.mover(this.node, e, this);
	},
	onMoveStart: function(/* dojo.dnd.Mover */ mover){
		// summary:
		//		called before every move operation
		//dojo.publish("/dnd/move/start", [mover]);
		//dojo.addClass(dojo.body(), "dojoMove");
		domClass.add(this.node, "djeoMove");
	},
	onMoveStop: function(/* dojo.dnd.Mover */ mover){
		// summary:
		//		called after every move operation
		//dojo.publish("/dnd/move/stop", [mover]);
		//dojo.removeClass(dojo.body(), "dojoMove");
		domClass.remove(this.node, "djeoMove");
	},
	onFirstMove: function(/* dojo.dnd.Mover */ mover, /* Event */ e){
		// summary:
		//		called during the very first move notification;
		//		can be used to initialize coordinates, can be overwritten.
		// setting start positions for the layers
		var engine = this.map.engine;
		for (var i=0; i<engine.layers.length; i++) {
			engine.layers[i].setStartPos();
		}
	},
	onMove: function(/* dojo.dnd.Mover */ mover, left, top, shiftX, shiftY, /* Event */ e){
		// summary:
		//		called during every move notification;
		//		should actually move the node; can be overwritten.
		this.onMoving(mover, left, top, shiftX, shiftY);
		//var s = mover.node.style;
		//s.left = left + "px";
		//s.top  = top + "px";
		var engine = this.map.engine;
		engine.group.applyLeftTransform({dx: shiftX, dy: shiftY});
		for (var i=0; i<engine.layers.length; i++) {
			engine.layers[i].onMove(left, top);
		}
		this.onMoved(mover, left, top, shiftX, shiftY);
	},
	onMoving: function(/* dojo.dnd.Mover */ mover, /* Object */ leftTop){
		// summary:
		//		called before every incremental move; can be overwritten.

		// default implementation does nothing
	},
	onMoved: function(/* dojo.dnd.Mover */ mover, /* Object */ leftTop){
		// summary:
		//		called after every incremental move; can be overwritten.

		// default implementation does nothing
	}
});

});
