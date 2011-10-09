dojo.provide("djeo.ymaps.Placemark");

dojo.require("djeo.common.Placemark");

(function() {

var g = djeo,
	cp = g.common.Placemark,
	u = g.util,
	y = g.ymaps,
	Y = YMaps;

dojo.declare("djeo.ymaps.Placemark", djeo.common.Placemark, {

	constructor: function(kwArgs) {
		dojo.mixin(this, kwArgs);
	},

	makePoint: function(feature, coords) {
		return new Y.Placemark(new YMaps.GeoPoint(coords[0], coords[1]), {
			hasBalloon: false,
			hideIcon: false
		});
	},

	makeLineString: function(feature, coords) {
		return this._makeLineString(coords);
	},

	_makeLineString: function(coords) {
		var points = [];
		dojo.forEach(coords, function(point) {
			points.push(new Y.GeoPoint(point[0],point[1]));
		});
		return new Y.Polyline(points, {
			hasBalloon: false
		});
	},

	makePolygon: function(feature, coords) {
		return this._makePolygon(coords);
	},

	_makePolygon: function(coords) {
		var points = [],
			polygonOptions = {hasBalloon: false};
		dojo.forEach(coords[0], function(point) {
			points.push(new Y.GeoPoint(point[0],point[1]));
		});
		// treat the case of holes in the polygon
		if (coords.length > 1) {
			var interiors = [];
			for(var i=1; i<coords.length; i++) {
				var _points = [];
				dojo.forEach(coords[i], function(point){
					_points.push(new Y.GeoPoint(point[0],point[1]));
				});
				interiors.push(_points);
			}
			polygonOptions.interiors = interiors;
		}
		return new Y.Polygon(points, polygonOptions);
	},
	
	makeMultiLineString: function(feature, coords) {
		var collection = new Y.GeoObjectCollection();
		dojo.forEach(coords, function(lineStringCoords){
			collection.add( this._makeLineString(lineStringCoords) );
		}, this);
		return collection;
	},
	
	makeMultiPolygon: function(feature, coords) {
		var collection = new Y.GeoObjectCollection();
		dojo.forEach(coords, function(polygonCoords){
			collection.add( this._makePolygon(polygonCoords) );
		}, this);
		return collection;
	},
	
	applyPointStyle: function(feature, calculatedStyle, coords) {
		var specificStyle = calculatedStyle.point,
			specificShapeStyle = cp.getSpecificShapeStyle(calculatedStyle.points, this.specificStyleIndex),
			placemark = feature.baseShapes[0],
			shapeType = cp.get("shape", calculatedStyle, specificStyle, specificShapeStyle),
			src = cp.getImgSrc(calculatedStyle, specificStyle, specificShapeStyle),
			isVectorShape = true,
			scale = cp.getScale(calculatedStyle, specificStyle, specificShapeStyle),
			yStyle = placemark.getStyle() || new Y.Style(),
			iconStyle = yStyle.iconStyle || new Y.IconStyle();

		if (!shapeType && src) isVectorShape = false;
		else if (!cp.shapes[shapeType] && !iconStyle.href)
			// set default value for the shapeType only if we haven't already styled the feature (!iconStyle.href)
			shapeType = cp.defaultShapeType;

		// set size and offset
		var size = isVectorShape ? cp.getSize(calculatedStyle, specificStyle, specificShapeStyle) : cp.getImgSize(calculatedStyle, specificStyle, specificShapeStyle);
		if (size) {
			var anchor = isVectorShape ? [-size[0]/2, -size[1]/2] : cp.getAnchor(calculatedStyle, specificStyle, specificShapeStyle, size);
			iconStyle.size = new YMaps.Point(scale*size[0], scale*size[1]);
			iconStyle.offset = new YMaps.Point(scale*anchor[0], scale*anchor[1]);
		}
		else if (iconStyle.href) {
			// check if we can apply relative scale (rScale)
			var rScale = cp.get("rScale", calculatedStyle, specificStyle, specificShapeStyle);
			if (rScale !== undefined) {
				iconStyle.size.x *= rScale;
				iconStyle.size.y *= rScale;
				iconStyle.offset.x *= rScale;
				iconStyle.offset.y *= rScale;
			}
		}

		var url = this._getIconUrl(isVectorShape, shapeType, src);
		if (url) iconStyle.href = url;

		yStyle.iconStyle = iconStyle;
		placemark.setStyle(yStyle);
	},
	
	applyLineStyle: function(feature, calculatedStyle, coords) {
		var specificStyle = calculatedStyle.line,
			specificShapeStyle = cp.getSpecificShapeStyle(calculatedStyle.lines, this.specificStyleIndex),
			polyline = feature.baseShapes[0],
			style = polyline.getStyle() || new Y.Style(),
			lineStyle = style.lineStyle || new Y.LineStyle();

		applyStroke(lineStyle, calculatedStyle, specificStyle, specificShapeStyle);

		style.lineStyle = lineStyle;
		polyline.setStyle(style);
	},

	applyPolygonStyle: function(feature, calculatedStyle, coords) {
		// no specific shape styles for a polygon!
		var specificStyle = calculatedStyle.polygon,
			polygon = feature.baseShapes[0],
			fill = cp.get("fill", calculatedStyle, specificStyle),
			fillOpacity = cp.get("fillOpacity", calculatedStyle, specificStyle),
			style = polygon.getStyle() || new Y.Style(),
			polygonStyle = style.polygonStyle || new Y.PolygonStyle();

		if (fill || fillOpacity!==undefined) {
			fill = fill ? fill : getColor(polygonStyle.fillColor);
			fillOpacity = fillOpacity!==undefined ? fillOpacity : getOpacity(polygonStyle.fillColor);
			polygonStyle.fillColor = convertColor(fill, fillOpacity);
			
		}

		applyStroke(polygonStyle, calculatedStyle, specificStyle);

		style.polygonStyle  = polygonStyle ;
		polygon.setStyle(style);
	},
	
	remove: function(feature) {

	},
	
	show: function(feature, show) {
		if (show) this.engine.ymap.addOverlay(feature.baseShapes[0]);
		else this.engine.ymap.removeOverlay(feature.baseShapes[0]);
	},
	
	createText: function(feature, textStyle) {
	},
	
	translate: function(newPoint, feature) {

	},

	rotate: function(orientation, feature) {

	}
});

var convertColor = function(c, a) {
	rgba = new dojo.Color(c).toRgba();
	// convert alpha to [0..255] scale
	rgba[3] = Math.round(255*a);
	// convert to hex
	var rgbaHex = dojo.map(rgba, function(c){
		var s = c.toString(16);
		return s.length < 2 ? "0" + s : s;
	});
	return rgbaHex.join('');
};

var getColor = function(ymapsColor) {
	return "#" + ymapsColor.substring(0,6);
};

var getOpacity = function(ymapsColor) {
	return parseInt(ymapsColor.substring(6), 16) / 255;
};

var applyStroke = function(ymapsStyle, calculatedStyle, specificStyle, specificShapeStyle) {
	var stroke = cp.get("stroke", calculatedStyle, specificStyle, specificShapeStyle),
		strokeWidth = cp.get("strokeWidth", calculatedStyle, specificStyle, specificShapeStyle),
		strokeOpacity = cp.get("strokeOpacity", calculatedStyle, specificStyle, specificShapeStyle);

	if (stroke || strokeWidth!==undefined || strokeOpacity!==undefined) {
		stroke = stroke ? stroke : getColor(ymapsStyle.strokeColor);
		strokeOpacity = strokeOpacity!==undefined ? strokeOpacity : getOpacity(ymapsStyle.strokeColor);
		ymapsStyle.strokeColor = convertColor(stroke, strokeOpacity);
		if (strokeWidth !== undefined) ymapsStyle.strokeWidth = strokeWidth;
	}
};

}());
