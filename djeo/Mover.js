define([
	"dojo/_base/declare", // declare
	"dojo/has",
	"dojo/_base/event", // stop
	"dojo/on",
	"dojo/touch",
	"dojo/_base/lang", // hitch
	"dojo/_base/sniff"
], function(declare, has, event, on, touch, lang) {

return declare(null, {
	
	constructor: function(node, e, host){
		this.node = node;
		this.startX = e.touches ? e.touches[0].pageX : e.pageX;
		this.startY = e.touches ? e.touches[0].pageY : e.pageY;
		this.mouseButton = e.button;
		var h = (this.host = host),
			d = node.ownerDocument
		;
		// At the start of a drag, onFirstMove is called, and then the following two
		// connects are disconnected
		this._onFirstMove = on(d, touch.move, lang.hitch(this, this.onFirstMove));

		// These are called continually during the drag
		this._onMouseMove = on(d, touch.move, lang.hitch(this, this.onMouseMove));

		// And these are called at the end of the drag
		this._onMouseUp = on(d, touch.release, lang.hitch(this, this.onMouseUp));

		// cancel text selection and text dragging
		//dojo.connect(d, "ondragstart",   dojo.stopEvent);TODO
		//dojo.connect(d.body, "onselectstart", dojo.stopEvent);TODO
		// notify that the move has started
		if(h && h.onMoveStart){
			h.onMoveStart(this);
		}
	},

	// mouse event processors
	onMouseMove: function(e){
		// summary:
		//		event processor for onmousemove/ontouchmove
		// e: Event
		//		mouse/touch event
		//dojo.dnd.autoScroll(e);TODO
		var x = e.touches ? e.touches[0].pageX : e.pageX,
			y = e.touches ? e.touches[0].pageY : e.pageY,
			dx = x - this.startX,
			dy = y - this.startY
		;
		this.host.onMove(this, this.startPosX + dx, this.startPosY + dy, x - this.lastX, y - this.lastY, e);
		this.lastX = x;
		this.lastY = y;
		event.stop(e);
	},
	onMouseUp: function(e){
		if (has("webkit")  && has("mac") && this.mouseButton == 2 ?
				e.button == 0 : this.mouseButton == e.button){ // TODO Should condition be met for touch devices, too?
			this.destroy();
		}
		event.stop(e);
	},
	// utilities
	onFirstMove: function(e){
		// summary:
		//		makes the node absolute; it is meant to be called only once.
		// 		relative and absolutely positioned nodes are assumed to use pixel units
		var s = this.node.style, l, t, h = this.host;
		// assume that left and top values are in pixels already
		this.startPosX = Math.round(parseFloat(s.left)) || 0;
		this.startPosY = Math.round(parseFloat(s.top)) || 0;
		this.lastX = this.startX;
		this.lastY = this.startY;
		if(h && h.onFirstMove){
			h.onFirstMove(this, e);
		}

		// Disconnect onmousemove and ontouchmove events that call this function
		this._onFirstMove.remove();
		delete this._onFirstMove;
	},
	destroy: function(){
		// summary:
		//		stops the move, deletes all references, so the object can be garbage-collected
		if (this._onFirstMove) {
			this._onFirstMove.remove();
		}
		this._onMouseUp.remove();
		this._onMouseMove.remove();
		// undo global settings
		var h = this.host;
		if(h && h.onMoveStop){
			h.onMoveStop(this);
		}
		// destroy objects
		this._onFirstMove = this._onMouseMove = this._onMouseUp = this._onFirstMove = this.node = this.host = null;
	}
});

});
