dojo.provide("djeo.ge.Placemark");

dojo.require("djeo.common.Placemark");

(function() {
	
var shapeSize = 50.;

djeo.ge.methods.Placemark = {
	render: function(stylingOnly, theme) {
		google.earth.executeBatch(this.map.engine.ge, dojo.hitch(this, function(){
			this._render(stylingOnly, theme);
		}));
	}
};

var g = djeo,
	cp = g.common.Placemark,
	u = g.util,
	e = g.ge;

dojo.declare("djeo.ge.Placemark", djeo.common.Placemark, {

	constructor: function(kwArgs) {
		dojo.mixin(this, kwArgs);
	},
	
	init: function() {
		this.ge = this.map.engine.ge;
	},

	createPlacemark: function() {
		var placemark = this.ge.createPlacemark('');
		placemark.setStyleSelector(this.ge.createStyle(''));
		return placemark;
	},

	makePoint: function(feature, coords) {
		var placemark = this.createPlacemark();
		var point = this.ge.createPoint('');
		point.setLatLngAlt (coords[1], coords[0], getAltitude(coords));
		this._setGeometryAttributes(feature, point);
		placemark.setGeometry(point);
		return placemark;
	},

	makeLineString: function(feature, coords) {
		var placemark = this.createPlacemark();
		var lineString = this.ge.createLineString('');
		this._makeLineString(lineString, coords);
		this._setGeometryAttributes(feature, lineString);
		placemark.setGeometry(lineString);
		return placemark;
	},

	_makeLineString: function(lineString, coords) {
		dojo.forEach(coords, function(point, i){
			lineString.getCoordinates().pushLatLngAlt(point[1], point[0], getAltitude(point));
		}, this);
	},

	makePolygon: function(feature, coords) {
		var placemark = this.createPlacemark();
		var polygon = this.ge.createPolygon('');
		this._makePolygon(polygon, coords);
		this._setGeometryAttributes(feature, polygon);
		placemark.setGeometry(polygon);
		return placemark;
	},

	_makePolygon: function(polygon, coords) {
		dojo.forEach(coords, function(lineStringCoords, i){
			var linearRing = this.ge.createLinearRing('');
			dojo.forEach(lineStringCoords, function(point){
				linearRing.getCoordinates().pushLatLngAlt(point[1], point[0], getAltitude(point));
			});
			if (!i) polygon.setOuterBoundary(linearRing);
			else polygon.getInnerBoundaries().appendChild(linearRing);
		}, this);
	},
	
	makeMultiLineString: function(feature, coords) {
		var placemark = this.createPlacemark();
		var multiLineString = this.ge.createMultiGeometry('');
		this._setGeometryAttributes(feature, multiLineString);
		placemark.setGeometry(multiLineString);
		dojo.forEach(coords, function(lineStringCoords){
			var lineString = this.ge.createLineString('');
			this._makeLineString(lineString, lineStringCoords);
			multiLineString.getGeometries().appendChild(lineString);
		}, this);
		return placemark;
	},
	
	makeMultiPolygon: function(feature, coords) {
		var placemark = this.createPlacemark();
		var multiPolygon = this.ge.createMultiGeometry('');
		this._setGeometryAttributes(feature, multiPolygon);
		placemark.setGeometry(multiPolygon);
		
		dojo.forEach(coords, function(polygonCoords){
			var polygon = this.ge.createPolygon('');
			this._makePolygon(polygon, polygonCoords);
			multiPolygon.getGeometries().appendChild(polygon);
		}, this);
		return placemark;
	},
	
	_setGeometryAttributes: function(feature, geometry) {
		if (e.altitudeModes[feature.altitudeMode]) geometry.setAltitudeMode(this.ge[e.altitudeModes[feature.altitudeMode]]);
		if (feature.extrude != undefined) geometry.setExtrude(feature.extrude);
		if (feature.tessellate != undefined) geometry.setTessellate(feature.tessellate);
	},
	
	applyPointStyle: function(feature, calculatedStyle, coords) {
		var specificStyle = calculatedStyle.point,
			specificShapeStyle = cp.getSpecificShapeStyle(calculatedStyle.points, this.specificStyleIndex),
			placemark = feature.baseShapes[0],
			shapeType = cp.get("shape", calculatedStyle, specificStyle, specificShapeStyle),
			src = cp.getImgSrc(calculatedStyle, specificStyle, specificShapeStyle),
			isVectorShape = true,
			scale = cp.getScale(calculatedStyle, specificStyle, specificShapeStyle),
			normalStyle = getNormalStyle(placemark),
			// style has been already applied to the feature during a previous function call
			styleApplied = feature.state.kmlIconScale !== undefined ? true : false;

		if (!shapeType && src) isVectorShape = false;
		else if (!cp.shapes[shapeType] && !styleApplied)
			// set default value for the shapeType only if we haven't already styled the feature (!styleApplied)
			shapeType = cp.defaultShapeType;

		var iconStyle = normalStyle.getIconStyle();

		var url = isVectorShape && shapeType ? shapeIconsUrl + cp.shapes[shapeType] : this._getImageUrl(src);
		if (url) {
			var icon = this.ge.createIcon('');
			icon.setHref(url);
			iconStyle.setIcon(icon);
		}

		var size = isVectorShape ? cp.getSize(calculatedStyle, specificStyle, specificShapeStyle) : cp.getImgSize(calculatedStyle, specificStyle, specificShapeStyle),
			kmlIconScale;
		if (size) {
			var kmlIconScale = isVectorShape ? scale*Math.max(size[0],size[1])/shapeSize : scale;
			feature.state.kmlIconScale = kmlIconScale;
		}
		else if (styleApplied) {
			// check if we can apply relative scale (rScale)
			var rScale = cp.get("rScale", calculatedStyle, specificStyle, specificShapeStyle);
			if (rScale !== undefined) kmlIconScale = rScale * feature.state.kmlIconScale;
		}
		iconStyle.setScale(kmlIconScale);

		if (isVectorShape) applyFill(iconStyle, calculatedStyle, specificStyle, specificShapeStyle, true);
	},
	
	applyLineStyle: function(feature, calculatedStyle, coords) {
		var specificStyle = calculatedStyle.line,
			specificShapeStyle = cp.getSpecificShapeStyle(calculatedStyle.lines, this.specificStyleIndex),
			placemark = feature.baseShapes[0],
			normalStyle = getNormalStyle(placemark);
		applyStroke(normalStyle, calculatedStyle, specificStyle, specificShapeStyle);
		if (feature.extrude) {
			// set fill color for the extrusion
			applyFill(normalStyle, calculatedStyle, specificStyle, specificShapeStyle);
		}
	},

	applyPolygonStyle: function(feature, calculatedStyle, coords) {
		// no specific shape styles for a polygon!
		var specificStyle = calculatedStyle.polygon,
			placemark = feature.baseShapes[0],
			normalStyle = getNormalStyle(placemark);
		applyFill(normalStyle, calculatedStyle, specificStyle);
		applyStroke(normalStyle, calculatedStyle, specificStyle);
	},
	
	remove: function(feature) {
		dojo.forEach(feature.baseShapes, function(placemark){
			placemark.getParentNode().getFeatures().removeChild(placemark);
		});
	},
	
	show: function(feature, show) {
		feature.baseShapes[0].setVisibility(show);
	},
	
	createText: function(feature, textStyle) {
		var placemark = feature.baseShapes[0],
			label = this._getLabel(feature, textStyle);

		if (label) {
			placemark.setName(label);
			var labelStyle = getNormalStyle(placemark).getLabelStyle();
			if (textStyle.fill) {
				labelStyle.getColor().set(convertColor(textStyle.fill));
			}
			if (textStyle.scale) {
				labelStyle.setScale(textStyle.scale);
			}
			// give a hint for the feature that it has a label now
			feature.textShapes = true;
		}
	},
	
	translate: function(position, feature) {
		var placemark = feature.baseShapes[0];

		var kmlPoint = placemark.getGeometry();
		if (position.length == 3) kmlPoint.setLatLngAlt(position[1], position[0], position[2]);
		else kmlPoint.setLatLng(position[1], position[0]);
	},

	rotate: function(heading, feature) {
		var placemark = feature.baseShapes[0],
			iconStyle = placemark.getStyleSelector().getIconStyle();

		iconStyle.setHeading(u.radToDeg(heading));
	}
});

// make absolute path to the shape icons (square, star, etc)
// out of their relative path (something like ../../../somepath/)
// the conversion from relative path to the absolute path is performed via an anonymous function
var shapeIconsUrl = (function(relativePath) {
	// find the number of occurances of ../
	var depth = relativePath.match(/\.\.\//g);
	depth = depth ? depth.length : 0;
	var _depth = depth;
	var position = u.baseUrl.length-1; // omit trailing slash
	while(depth) {
		position--;
		if (u.baseUrl.charAt(position)=="/") depth--;
	}
	return u.baseUrl.substring(0,position) + "/" +relativePath.substring(3*_depth);
})(cp.shapeIconsUrl);

var convertColor = function(c, a) {
	rgba = new dojo.Color(c).toRgba();
	// convert alpha to [0..255] scale
	rgba[3] = Math.round(255*a);
	// convert to hex
	var rgbaHex = dojo.map(rgba, function(c){
		var s = c.toString(16);
		return s.length < 2 ? "0" + s : s;
	});
	return rgbaHex[3]+rgbaHex[2]+rgbaHex[1]+rgbaHex[0];
};

var getColor = function(c) {
	return [c.getR(), c.getG(), c.getB()];
};

var getOpacity = function(c) {
	return c.getA() / 255;
};

var getNormalStyle = function(placemark) {
	return placemark.getStyleSelector();
};

var applyFill = function(kmlStyle, calculatedStyle, specificStyle, specificShapeStyle, isIconStyle) {
	var fill = cp.get("fill", calculatedStyle, specificStyle, specificShapeStyle),
		fillOpacity = cp.get("fillOpacity", calculatedStyle, specificStyle, specificShapeStyle);

	if (fill || fillOpacity!==undefined) {
		kmlStyle = isIconStyle ? kmlStyle : kmlStyle.getPolyStyle();
		var kmlColor = kmlStyle.getColor();
		fill = fill ? fill : getColor(kmlColor);
		fillOpacity = fillOpacity!==undefined ? fillOpacity : getOpacity(kmlColor);
		kmlColor.set(convertColor(fill, fillOpacity));
	}
};

var applyStroke = function(kmlStyle, calculatedStyle, specificStyle, specificShapeStyle) {
	var stroke = cp.get("stroke", calculatedStyle, specificStyle, specificShapeStyle),
		strokeWidth = cp.get("strokeWidth", calculatedStyle, specificStyle, specificShapeStyle),
		strokeOpacity = cp.get("strokeOpacity", calculatedStyle, specificStyle, specificShapeStyle);

	if (stroke || strokeWidth!==undefined || strokeOpacity!==undefined) {
		var lineStyle = kmlStyle.getLineStyle(),
			kmlColor = lineStyle.getColor();
		stroke = stroke ? stroke : getColor(kmlColor);
		strokeOpacity = strokeOpacity!==undefined ? strokeOpacity : getOpacity(kmlColor);
		kmlColor.set(convertColor(stroke, strokeOpacity));
		if (strokeWidth !== undefined) lineStyle.setWidth(strokeWidth);
	}
};

var getAltitude = function(point) {
	return (point.length==3) ? point[2] : 0;
};

}());
