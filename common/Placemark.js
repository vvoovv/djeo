dojo.provide("djeo.common.Placemark");

(function() {
	
var u = djeo.util;

dojo.declare("djeo.common.Placemark", null, {
	
	specificStyleIndex: -1, // -1 means: use the last specific style in the array
	
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
	
	_getLabel: function(feature, textStyle) {
		return textStyle.attr ? feature.get(textStyle.attr) : feature.get("label") || feature.get("name");
	},
	
	_getIconUrl: function(isVectorShape, shapeType, src) {
		var url;
		if (shapeType && isVectorShape) url = cp.shapeIconsUrl + cp.shapes[shapeType];
		else if (src) url = u.isRelativeUrl(src) ? u.baseUrl+this.map.iconBasePath+src : src;
		return url;
	},
	
	_getImageUrl: function(src) {
		return src && u.isRelativeUrl(src) ? u.baseUrl+this.map.iconBasePath+src : src;
	}
});

var cp = djeo.common.Placemark;

cp.defaultShapeType = "square";

cp.shapeIconsUrl = dojo.moduleUrl("djeo", "resources/icons/");

cp.shapes = {
	circle: "circle.png",
	star: "star.png",
	cross: "cross.png",
	x: "x.png",
	square: "square.png",
	triangle: "triangle.png"
};

cp.get = function(attr, calculatedStyle, specificStyle, specificShapeStyle) {
	var result;
	if (specificShapeStyle && specificShapeStyle[attr] !== undefined) result = specificShapeStyle[attr];
	else if (specificStyle && specificStyle[attr] !== undefined) result = specificStyle[attr];
	else result = calculatedStyle[attr];
	return result;
};

cp.getSpecificShapeStyle = function(specificStyles, specificStyleIndex) {
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

cp.getSize = function(calculatedStyle, specificStyle, specificShapeStyle) {
	var size = cp.get("size", calculatedStyle, specificStyle, specificShapeStyle);
	if (size !==undefined && !dojo.isArray(size)) size = [size, size];
	return size;
};

cp.getScale = function(calculatedStyle, specificStyle, specificShapeStyle) {
	var scale = cp.get("scale", calculatedStyle, specificStyle, specificShapeStyle);
	if (!scale) scale = 1;
	return scale;
};

cp.getAnchor = function(calculatedStyle, specificStyle, specificShapeStyle, size) {
	var img = cp.get("img", calculatedStyle, specificStyle, specificShapeStyle),
		anchor = (dojo.isObject(img) && img.anchor) ? img.anchor : cp.get("anchor", calculatedStyle, specificStyle, specificShapeStyle);
	return anchor ? anchor : [size[0]/2, size[1]/2];
};

cp.getImgSrc = function(calculatedStyle, specificStyle, specificShapeStyle) {
	var img = cp.get("img", calculatedStyle, specificStyle, specificShapeStyle);
	return dojo.isObject(img) ? img.src : img;
};

cp.getImgSize = function(calculatedStyle, specificStyle, specificShapeStyle) {
	var img = cp.get("img", calculatedStyle, specificStyle, specificShapeStyle);
	return (dojo.isObject(img) && img.size) ? img.size : cp.getSize(calculatedStyle, specificStyle, specificShapeStyle);
};

}());
