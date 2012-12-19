define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // hitch
	"dojo/dom-style",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/form/HorizontalRule",
	"djeo/util/_base",
	"./_MapWidgetMixin"
], function(declare, lang, domStyle, _Widget, _TemplatedMixin, HorizontalRule, u, _MapWidgetMixin) {

var acceptableMantissas = [1, 2, 5],
	numMantissas = acceptableMantissas.length - 1
;

return declare([_Widget, _TemplatedMixin, _MapWidgetMixin], {
	
	minWidth: 60,
	
	typicalWidth: 100,
	
	maxWidth: 140,
	
	templateString: "<div class='djeoScaleBarContainer'><div class='djeoScaleBar' data-dojo-attach-point='scaleBar'><div></div><div></div></div><span class='djeoScaleBarLabel' data-dojo-attach-point='label'></span></div>",
	
	buildRendering: function() {
		this.inherited(arguments);

		new HorizontalRule({
			count:5,
			style:{height:".4em"}
		}, this.scaleBar.children[0]);
		new HorizontalRule({
			count:9,
			style:{height:".4em"}
		}, this.scaleBar.children[1]);
	},
	
	postCreate: function() {
		this.inherited(arguments);
		
		var map = this.map;
		
		this.calculateLength(this.map.get("zoom"), map.get("extent")[1]);
		this.domNode.style.zIndex = 1000;

		map.on("extent_changed", lang.hitch(this, function(){
			this.calculateLength(map.get("zoom"), map.get("extent")[1]);
		}));
		
		if (this.appendToMap) {
			map._appendDiv(this.domNode);
		}
	},
	
	calculateLength: function(zoom, lat) {
		// calculating length for the bottom of the map
		lat = u.degToRad(lat);
		var earthDistance = Math.round(
				2*Math.PI*u.earthRadius*Math.cos(lat)*this.typicalWidth/(256*Math.pow(2, zoom))
			),
			// finding the number of digits and the first digit
			earthDistanceStr = earthDistance.toString(),
			numDigits = earthDistanceStr.length,
			// rounding the mantissa
			mantissa = earthDistance/Math.pow(10, numDigits-1)
		;
		for (var i=0; i<numMantissas; i++) {
			if (acceptableMantissas[i]<=mantissa && mantissa<=acceptableMantissas[i+1]) {
				mantissa = (mantissa - acceptableMantissas[i]) <= (acceptableMantissas[i+1] - mantissa) ?
					acceptableMantissas[i] :
					acceptableMantissas[i+1]
				;
				break;
			}
		}
		if (i == numMantissas) {
			if (mantissa - acceptableMantissas[numMantissas] < 10 - mantissa) {
				mantissa = acceptableMantissas[numMantissas];
			}
			else {
				mantissa = 1;
				numDigits++;
			}
		}
		earthDistance = (numDigits > 3) ? Math.pow(10, numDigits-4) : Math.pow(10, numDigits-1);
		earthDistance = Math.round(mantissa*earthDistance);
		
		this.label.innerHTML = earthDistance + ((numDigits > 3) ? " km" : " m");
		if (numDigits > 3) {
			earthDistance *= 1000;
		}
		this.scaleBar.style.width = Math.round(earthDistance*128*Math.pow(2, zoom)/(Math.PI*u.earthRadius*Math.cos(lat))) + "px";
	}
});

});
