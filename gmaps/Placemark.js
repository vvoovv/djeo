dojo.provide("djeo.gmaps.Placemark");

dojo.require("djeo.common.Placemark");

(function() {

var g = djeo,
	cp = g.common.Placemark,
	u = g.util,
	gm = g.gmaps,
	GM = google.maps;

dojo.declare("djeo.gmaps.Placemark", djeo.common.Placemark, {

	constructor: function(kwArgs) {
		dojo.mixin(this, kwArgs);
	},

	makePoint: function(feature, coords) {
		return new GM.Marker({
			position: new GM.LatLng(coords[1], coords[0])
		});
	},

	makeLineString: function(feature, coords) {
		return this._makeLineString(coords);
	},

	_makeLineString: function(coords) {
		var path = [];
		dojo.forEach(coords, function(point) {
			path.push(new GM.LatLng(point[1],point[0]));
		});
		return new GM.Polyline({
			path: path
		});
	},

	makePolygon: function(feature, coords) {
		return new GM.Polygon({
			paths: this._makePolygonPaths(coords, [])
		});
	},

	_makePolygonPaths: function(coords, paths) {
		dojo.forEach(coords, function(lineStringCoords) {
			var path = [];
			dojo.forEach(lineStringCoords, function(point){
				path.push(new GM.LatLng(point[1],point[0]));
			});
			paths.push(path);
		});
		return paths;
	},

	makeMultiLineString: function(feature, coords) {
		dojo.forEach(coords, function(lineStringCoords){
			// add features here (not in djeo.Placemark) and return null
			feature.baseShapes.push( this._makeLineString(lineStringCoords) );
		}, this);
		
		return null;
	},

	makeMultiPolygon: function(feature, coords) {
		var paths = [];
		dojo.forEach(coords, function(polygonCoords){
			this._makePolygonPaths(polygonCoords, paths);
		}, this);
		return new GM.Polygon({
			paths: paths
		});
	},
	
	applyPointStyle: function(feature, calculatedStyle, coords) {
		var specificStyle = calculatedStyle.point,
			specificShapeStyle = cp.getSpecificShapeStyle(calculatedStyle.points, this.specificStyleIndex),
			marker = feature.baseShapes[0],
			shapeType = cp.get("shape", calculatedStyle, specificStyle, specificShapeStyle),
			src = cp.getImgSrc(calculatedStyle, specificStyle, specificShapeStyle),
			isVectorShape = true,
			scale = cp.getScale(calculatedStyle, specificStyle, specificShapeStyle),
			mi = marker.getIcon(), // mi stands for markerImage
			miExists = mi ? true : false;

		if (!mi) mi = new GM.MarkerImage();

		if (!shapeType && src) isVectorShape = false;
		else if (!cp.shapes[shapeType] && !miExists)
			// set default value for the shapeType only if we haven't already styled the feature (!miExists)
			shapeType = cp.defaultShapeType;

		var url = this._getIconUrl(isVectorShape, shapeType, src);
		if (url) mi.url = url;

		var size = isVectorShape ? cp.getSize(calculatedStyle, specificStyle, specificShapeStyle) : cp.getImgSize(calculatedStyle, specificStyle, specificShapeStyle);
		if (size) {
			var anchor = isVectorShape ? [-size[0]/2, -size[1]/2] : cp.getAnchor(calculatedStyle, specificStyle, specificShapeStyle, size);
			mi.size = new GM.Size(scale*size[0], scale*size[1]);
			mi.anchor = new GM.Point(-scale*anchor[0], -scale*anchor[1]);
			mi.scaledSize = new GM.Size(scale*size[0], scale*size[1])
		}
		else if (miExists) {
			// check if we can apply relative scale (rScale)
			var rScale = cp.get("rScale", calculatedStyle, specificStyle, specificShapeStyle);
			if (rScale !== undefined) {
				mi.size.width *= rScale;
				mi.size.height *= rScale;
				mi.anchor.x *= rScale;
				mi.anchor.y *= rScale;
				mi.scaledSize.width *= rScale;
				mi.scaledSize.height *= rScale;
			}
		}

		marker.setIcon(mi);
	},
	
	applyLineStyle: function(feature, calculatedStyle, coords) {
		var specificStyle = calculatedStyle.line,
			specificShapeStyle = cp.getSpecificShapeStyle(calculatedStyle.lines, this.specificStyleIndex),
			polylines = feature.baseShapes,
			stroke = cp.get("stroke", calculatedStyle, specificStyle, specificShapeStyle),
			strokeOpacity = cp.get("strokeOpacity", calculatedStyle, specificStyle, specificShapeStyle),
			strokeWidth = cp.get("strokeWidth", calculatedStyle, specificStyle, specificShapeStyle);

		// if polylines.length>1 we have a MultiLineString 
		dojo.forEach(polylines, function(polyline){
			var polylineOptions = {};
			if (stroke) polylineOptions.strokeColor = getColor(stroke);
			if (strokeOpacity !== undefined) polylineOptions.strokeOpacity = strokeOpacity;
			if (strokeWidth !== undefined) polylineOptions.strokeWeight = strokeWidth;
			polyline.setOptions(polylineOptions);
		});
	},

	applyPolygonStyle: function(feature, calculatedStyle, coords) {
		// no specific shape styles for a polygon!
		var specificStyle = calculatedStyle.polygon,
			polygon = feature.baseShapes[0],
			fill = cp.get("fill", calculatedStyle, specificStyle),
			fillOpacity = cp.get("fillOpacity", calculatedStyle, specificStyle),
			stroke = cp.get("stroke", calculatedStyle, specificStyle),
			strokeOpacity = cp.get("strokeOpacity", calculatedStyle, specificStyle),
			strokeWidth = cp.get("strokeWidth", calculatedStyle, specificStyle),
			polygonOptions = {};

		if (fill) polygonOptions.fillColor = getColor(fill);
		if (fillOpacity !== undefined) polygonOptions.fillOpacity = fillOpacity;

		if (stroke) polygonOptions.strokeColor = getColor(stroke);
		if (strokeOpacity !== undefined) polygonOptions.strokeOpacity = strokeOpacity;
		if (strokeWidth !== undefined) polygonOptions.strokeWeight = strokeWidth;

		polygon.setOptions(polygonOptions);
	},
	
	remove: function(feature) {
		dojo.forEach(feature.baseShapes, function(placemark){
			placemark.setMap(null);
		});
	},
	
	show: function(feature, show) {
		dojo.forEach(feature.baseShapes, function(placemark){
			placemark.setMap(show ? feature.map.engine.gmap : null);
		});
	},

	createText: function(feature, calculatedStyle) {
	},
	
	translate: function(position, feature) {
		feature.baseShapes[0].setPosition(new GM.LatLng(position[1], position[0]));
	},

	rotate: function(orientation, feature) {

	}
});

var getColor = function(c) {
	// Google Maps API doesn't support CSS3 colors for IE
	return dojo.isIE ? (new dojo.Color(c)).toHex() : c;
}

}());
