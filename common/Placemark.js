define([
	"dojo/_base/declare", // declare
	"require",
	"dojo/_base/lang", // isArray, isObject
	"dojo/_base/array", // forEach
	"../_base",
	"../util/_base",
	"../Style"
], function(declare, require, lang, array, djeo, u) {
	
var P = declare(null, {
	
	specificStyleIndex: -1, // -1 means: use the last specific style in the array
	
	render: function(feature, stylingOnly, theme) {
		this._render(feature, stylingOnly, theme);
	},
	
	_render: function(feature, stylingOnly, theme) {
		if (!feature.visible) return;
		//TODO: disconnect connections and then reconnect them
		var coords = feature.getCoords();
		if (!coords) {
			feature.invalid = true;
			return;
		}

		// TODO: disconnect
		if (!stylingOnly) {
			// destroy base shapes
			for (var i=feature.baseShapes.length-1; i>=0; i--) {
				this.map.engine.destroy(feature.baseShapes.pop(), feature);
			}
		}
		// destroy extra shapes
		// extra shapes are destroyed in an case (also if stylingOnly == true)
		if (feature.extraShapes) for (var i=feature.extraShapes.length-1; i>=0; i--) {
			this.map.engine.destroy(feature.extraShapes.pop(), feature);
		}
		
		var style = djeo.calculateStyle(feature, theme);
		//save calculated style (for normal theme only) in this.state
		// cs stands for "calculated style"
		if (!theme || theme == "normal") {
			feature.state.cs = style;
		}

		// apply style to the base geometry
		var styleType = feature.isPoint() ? "point" : (feature.isArea() ? "polygon" : "line");
		if (stylingOnly) {
			this.applyStyle(feature, style, styleType, coords);
		}
		else {
			// create shape(s)
			if (this.multipleSymbolizers && style[styleType]) { // we have a specific style
				array.forEach(style[styleType], function(_style) {
					var shape = this.createShape(feature, coords);
					if (shape) feature.baseShapes.push(shape);
				}, this);
			}
			else {
				var shape = this.createShape(feature, coords);
				if (shape) feature.baseShapes.push(shape);
			}
			
			// apply style to the shape(s)
			this.applyStyle(feature, style, styleType, coords);
			
			// add shape(s) to the map
			array.forEach(feature.baseShapes, function(shape) {
				this.map.engine.appendChild(shape, feature);
			}, this);
		}
		
		// add text label if the text style is specified
		var textShape = this.makeText(feature, style);
		if (textShape) {
			feature.textShapes = textShape;
			this.map.engine.appendChild(textShape, feature);
		}
	},
	
	createShape: function(feature, coords) {
		var shape;
		switch (feature.getCoordsType()) {
			case "Point":
				shape = this.makePoint(feature, coords);
				break;
			case "LineString":
				shape = this.makeLineString(feature, coords);
				break;			
			case "Polygon":
				shape = this.makePolygon(feature, coords);
				break;
			case "MultiPolygon":
				shape = this.makeMultiPolygon(feature, coords);
				break;
			case "MultiLineString":
				shape = this.makeMultiLineString(feature, coords);
				break;
			case "MultiPoint":
				shape = this.makeMultiPoint(feature, coords);
				break;
		}
		return shape;
	},
	
	applyStyle: function(feature, style, styleType, coords) {
		switch(styleType) {
			case "point":
				this.applyPointStyle(feature, style, coords);
				break;
			case "line":
				this.applyLineStyle(feature, style, coords);
				break;
			case "polygon":
				this.applyPolygonStyle(feature, style, coords);
				break;
		}
	},
	
	_getLabel: function(feature, textStyle) {
		return textStyle.attr ? feature.get(textStyle.attr) : feature.get("label") || feature.get("name");
	},
	
	_getIconUrl: function(isVectorShape, shapeType, src) {
		var url;
		if (shapeType && isVectorShape) url = P.shapeIconsUrl + P.shapes[shapeType];
		else if (src) url = u.isRelativeUrl(src) ? u.baseUrl+this.map.iconBasePath+src : src;
		return url;
	},
	
	_getImageUrl: function(src) {
		return src && u.isRelativeUrl(src) ? u.baseUrl+this.map.iconBasePath+src : src;
	}
});

P.defaultShapeType = "square";

P.shapeIconsUrl = require.toUrl("../resources/icons/");

P.shapes = {
	circle: "circle.png",
	star: "star.png",
	cross: "cross.png",
	x: "x.png",
	square: "square.png",
	triangle: "triangle.png"
};

P.get = function(attr, calculatedStyle, specificStyle, specificShapeStyle) {
	var result;
	if (specificShapeStyle && specificShapeStyle[attr] !== undefined) result = specificShapeStyle[attr];
	else if (specificStyle && specificStyle[attr] !== undefined) result = specificStyle[attr];
	else result = calculatedStyle[attr];
	return result;
};

P.getSpecificShapeStyle = function(specificStyles, specificStyleIndex) {
	if (!specificStyles) return null;
	var specificStyle,
		numStyles = specificStyles.length;
	if (specificStyleIndex>=0) {
		specificStyle = specificStyleIndex < numStyles ? specificStyles[specificStyleIndex] : specificStyles[numStyles-1];
	}
	else {
		specificStyle = specificStyleIndex >= -numStyles ? specificStyles[numStyles+specificStyleIndex] : specificStyles[0];
	}
	return specificStyle;
};

P.getSize = function(calculatedStyle, specificStyle, specificShapeStyle) {
	var size = P.get("size", calculatedStyle, specificStyle, specificShapeStyle);
	if (size !==undefined && !lang.isArray(size)) size = [size, size];
	return size;
};

P.getScale = function(calculatedStyle, specificStyle, specificShapeStyle) {
	var scale = P.get("scale", calculatedStyle, specificStyle, specificShapeStyle);
	if (!scale) scale = 1;
	return scale;
};

P.getAnchor = function(calculatedStyle, specificStyle, specificShapeStyle, size) {
	var img = P.get("img", calculatedStyle, specificStyle, specificShapeStyle),
		anchor = (lang.isObject(img) && img.anchor) ? img.anchor : P.get("anchor", calculatedStyle, specificStyle, specificShapeStyle);
	return anchor ? anchor : [size[0]/2, size[1]/2];
};

P.getImgSrc = function(calculatedStyle, specificStyle, specificShapeStyle) {
	var img = P.get("img", calculatedStyle, specificStyle, specificShapeStyle);
	return lang.isObject(img) ? img.src : img;
};

P.getImgSize = function(calculatedStyle, specificStyle, specificShapeStyle) {
	var img = P.get("img", calculatedStyle, specificStyle, specificShapeStyle);
	return (lang.isObject(img) && img.size) ? img.size : P.getSize(calculatedStyle, specificStyle, specificShapeStyle);
};

return P;

});
