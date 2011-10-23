dojo.provide("djeo.djeo.Highlight");

dojo.require("djeo.djeo.AnimatedControl");
dojo.require("djeo.djeo.feature_interaction");

dojo.require("dojox.gfx.fx");

(function(){

var dd = djeo.djeo,
	p = dd._pointed;

dojo.declare("djeo.djeo.Highlight", djeo.djeo.AnimatedControl, {
	
	highlightedFeature: null,
	
	constructor: function(kwArgs) {

	},
	
	process: function(event){
		var feature = event.feature,
			fid = feature.id,
			start,
			end,
			anim,
			anims = [],
			step; // result of _getStep;

		if (event.type == "onmouseover") {
			var onpointeroutTimeoutFeature;
			if (p.onpointeroutTimeout) {
				var onpointeroutTimeoutFeature = p.onpointeroutTimeout.feature;
				clearTimeout(p.onpointeroutTimeout.id);
				p.onpointeroutTimeout = null;
				if (onpointeroutTimeoutFeature==feature) return;
				else onpointeroutTimeoutFeature.render(true);
			}
			if (this.highlightedFeature) {
				if (this.highlightedFeature == feature) return;
				else if (this.highlightedFeature != onpointeroutTimeoutFeature) this.highlightedFeature.render(true);
			}
			this.highlightedFeature = feature;
			if (p.control != this) p.control = this;
			feature.render(true, "highlight");
		}
		else { // onmouseout
			if (!p.cancelOnpointerout) {
				p.onpointeroutTimeout = {
					feature: feature,
					id: setTimeout(
						dojo.hitch(this, this._onpointerout),
						dd.onpointeroutDelay
					)
				};
			}
		}
	},

	_onpointerout: function() {
		var feature = p.onpointeroutTimeout.feature;
		p.onpointeroutTimeout = null;
		this.highlightedFeature = null;
		feature.render(true);
	},

	onpointeroutHandler: function() {
		if (this.highlightedFeature) {
			this.highlightedFeature.render(true);
			this.highlightedFeature = null;
		}
	},
	
/*
	process: function(event){
		var feature = event.feature,
			fid = feature.id,
			start,
			end,
			anim,
			anims = [],
			step; // result of _getStep;

		// start apply highlight
		if (event.type == "onmouseover"){
			if (this.highlightedFeature) {
				if (this.highlightedFeature == feature) return;
				else this.highlightedFeature.render(true);
			}
			this.highlightedFeature = feature;
			feature.render(true, "highlight");
		}
		else {
			feature.render(true);
			this.highlightedFeature = null;
		}
		
		return;
		// end apply highlight

		if (fid in this.anim){
			anim = this.anim[fid];
		}else{
			this.anim[fid] = {};
		}
		
		this._getAnimateStroke(feature, event, anim, anims);
		this.anim[fid].action = dojo.fx.combine(anims);
		anim = this.anim[fid];
		
		if(event.type == "onmouseout"){
			anim.con = dojo.connect(anim.action, "onEnd", this, function(){
				if (this.anim[fid]){
					dojo.disconnect(this.anim[fid].con);
					delete this.anim[fid];
				}
			});
		}
		anim.action.play();
	},
*/
	
	_getAnimateFill: function(feature, event, anim) {
		var color = feature.baseShapes[0].getFill();
		if(anim) {
			anim.action.stop(true);
		}
		else {
			anim = this.anim[feature.id];
			anim.start = color;
			anim.end = this.colorFun(color);
		}
		
		start = color;
		if (event.type == "onmouseover"){
			end = anim.end;
		}
		else {
			end = anim.start;
		}

		var kwArgs = {
			shape:    feature.baseShapes[0],
			duration: this.duration,
			easing:   this.easing,
			color:    {start: start, end: end}
		};
		return dojox.gfx.fx.animateFill(kwArgs);
	},
	
	_getAnimateTransform: function(feature, event, anim) {
		var startScale, endScale, step;
		if (anim) {
			if (anim.action.status()=="stopped") step = 1;
			else step = anim.action._getStep();
			anim.action.stop(true);
		}
		else anim = this.anim[feature.id];

		if (event.type == "onmouseover"){
			if (!anim.matrix) {
				var matrix = feature.baseShapes[0].getTransform();
				if (matrix) anim.matrix = matrix;
			}
			startScale = step!=undefined ? this.scale*(1-step)+step : 1;
			endScale = this.scale;
		} else {
			startScale = step!=undefined ? step*this.scale+1-step : this.scale;
			endScale = 1;
		}
		
		var factory =  feature.map.engine.getFactory(feature.type),
			featureBbox = feature.getBbox(),
			centerX = factory.getX( (featureBbox[0]+featureBbox[2])/2 ),
			centerY = factory.getY( (featureBbox[1]+featureBbox[3])/2 );

		var kwArgs = {
			shape:    feature.baseShapes[0],
			duration: this.duration,
			easing:   this.easing
		}
		if (feature.getGeometry().type=="Point") {
			kwArgs.transform = [
				anim.matrix,
				{
					name: "scale",
					start: [startScale],
					end: [endScale]
				}
			];
		}
		else {
			kwArgs.transform = [
				{
					name: "scaleAt",
					start: [startScale, centerX, centerY],
					end: [endScale, centerX, centerY]
				}
			];
		}
		
		return dojox.gfx.fx.animateTransform(kwArgs);
	},
	
	_getAnimateStroke: function(feature, event, anim, anims) {
		this.scale = 5;
		var startWidthScale, endWidthScale, step;
		if (anim) {
			if (anim.action.status()=="stopped") step = 1;
			else step = anim.action._getStep();
			anim.action.stop(true);
		}
		else anim = this.anim[feature.id];

		if (event.type == "onmouseover"){
			startWidthScale = step!=undefined ? this.scale*(1-step)+step : 1;
			endWidthScale = this.scale;
		} else {
			startWidthScale = step!=undefined ? step*this.scale+1-step : this.scale;
			endWidthScale = 1;
		}
		
		if (event.type == "onmouseover" && !anim.width) {
			anim.width = [];
			dojo.forEach(feature.baseShapes, function(shape, i){
				var stroke = shape.getStroke();
				if (stroke && stroke.width) anim.width[i] = stroke.width;
			});
		}
		dojo.forEach(feature.baseShapes, function(shape, i){
			var kwArgs = {
				shape: shape,
				duration: this.duration,
				easing:   this.easing,
				width: {start: startWidthScale*anim.width[i], end:endWidthScale*anim.width[i]}
			}
			anims.push( dojox.gfx.fx.animateStroke(kwArgs) );
		}, this);
	}

});

})();