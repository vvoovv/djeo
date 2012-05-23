define([
	"dojo/has",
	"dojo/_base/Color",
	"./dojox/gfx",
	"./_base",
	"./common/Placemark",
	"dojo/_base/sniff"
], function(has, Color, gfx, djeo, P){

// center of each shape must be 0,0
djeo.shapes = {
	circle: 1, // a dummy value
	star: {
		size: [1000,1000],
		points: [0,-476, 118,-112, 500,-112, 191,112, 309,476, 0,251, -309,476, -191,112, -500,-112, -118,-112, 0,-476]
	},
	cross: {
		size: [10,10],
		points: [-1,-5, 1,-5, 1,-1, 5,-1, 5,1, 1,1, 1,5, -1,5, -1,1, -5,1, -5,-1, -1,-1, -1,-5]
	},
	x: {
		size: [100,100],
		points: [-50,-50, -25,-50, 0,-15, 25,-50, 50,-50, 15,0, 50,50, 25,50, 0,15, -25,50, -50,50, -15,0, -50,-50]
	},
	square: {
		size: [2,2],
		points: [-1,-1, -1,1, 1,1, 1,-1, -1,-1]
	},
	triangle: {
		size: [10,10],
		points: [-5,5, 5,5, 0,-5, -5,5]
	}
};

return {
	applyFill: function(shape, calculatedStyle, specificStyle, specificShapeStyle) {
		var fill = P.get("fill", calculatedStyle, specificStyle, specificShapeStyle),
			fillOpacity = P.get("fillOpacity", calculatedStyle, specificStyle, specificShapeStyle);
	
		if (fill || fillOpacity !== undefined) {
			var gfxFill = shape.getFill(),
				gfxFillOpacity = gfxFill && gfxFill.a;
			if (fill) gfxFill = new Color(fill);
			if (gfxFill) {
				if (fillOpacity !== undefined) gfxFill.a = fillOpacity;
				else if (gfxFillOpacity !== undefined) gfxFill.a = gfxFillOpacity;
				shape.setFill(gfxFill);
			}
		}
	},
	applyStroke: function(shape, calculatedStyle, specificStyle, specificShapeStyle, widthMultiplier) {
		if (gfx.renderer == "vml" || (gfx.renderer=="svg" && (has("webkit") || has("opera")))) {
			widthMultiplier=1;
		}
		var stroke = P.get("stroke", calculatedStyle, specificStyle, specificShapeStyle),
			strokeWidth = P.get("strokeWidth", calculatedStyle, specificStyle, specificShapeStyle),
			strokeOpacity = P.get("strokeOpacity", calculatedStyle, specificStyle, specificShapeStyle);
	
		if (stroke || strokeWidth!==undefined || strokeOpacity!==undefined) {
			if (strokeWidth === 0) shape.setStroke(null);
			else {
				var gfxStroke = shape.getStroke();
				if (stroke) {
					if (!gfxStroke) gfxStroke = {join: "round", cap: "round"};
					gfxStroke.color = new Color(stroke);
				}
				if (gfxStroke) {
					if (strokeOpacity !== undefined) gfxStroke.color.a = strokeOpacity;
					if (strokeWidth) gfxStroke.width = strokeWidth*widthMultiplier;
					shape.setStroke(gfxStroke);
				}
			}
		}
	}
};

});