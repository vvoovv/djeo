define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin, isObject
	"dojo/_base/array", // forEach
	"dojo/has",
	"../dojox/gfx",
	"../dojox/gfx/matrix",
	"../_base",
	"../common/Placemark",
	"../util/geometry",
	"../gfx"
], function(declare, lang, array, has, gfx, matrix, djeo, P, geom, dgfx) {
	
var patchStroke = function(shape) {
	if (gfx.renderer=="svg" && !has("mozilla")) {
		// non-scaling-stroke is supported by WebKit and Opera at the moment
		// Firefox also supports it since June, 2012: https://bugzilla.mozilla.org/show_bug.cgi?id=528332
		// However its behavior in Firefox is weird: strokes can't be selected
		shape.rawNode.setAttribute("vector-effect", "non-scaling-stroke");
	}
	return shape;
};

var fontAttrs = {
	family: 1,
	size: 1,
	weight: 1,
	style: 1,
	variant: 1
};

return declare([P], {
	
	multipleSymbolizers: true,
	
	constructor: function(kwArgs) {
		lang.mixin(this, kwArgs);
	},
	
	init: function() {
		this.group = this.engine.group;
		
		this.areas = this.group.createGroup();
		this.lines = this.group.createGroup();
		this.points = this.group.createGroup();
		this.text = this.group.createGroup();
	},
	
	prepare: function() {
		this.calculateLengthDenominator();
	},
	
	calculateLengthDenominator: function() {
		this.lengthDenominator = (this.group.getTransform()||{xx:1}).xx;
	},
	
	getX: function(x) {
		var result = x-this.engine.extent[0];
		if (this.engine.correctScale) result *= this.engine.correctionScale;
		return parseInt(result);
	},
	
	getY: function(y) {
		var result = this.engine.extent[3]-y;
		if (this.engine.correctScale) result *= this.engine.correctionScale;
		return parseInt(result);
	},
	
	makePoint: function(feature, coords) {
		// do nothing
		// point shape are created in this.applyPointStyle
		return null;
	},
	
	makeLineString: function(feature, coords) {
		return patchStroke( this.lines.createPath({path: this.makePathString(coords, 1)}) );
	},

	makePolygon: function(feature, coords) {
		return patchStroke( this.areas.createPath({path: this.makePathString(coords, 2)}) );
	},
	
	makeMultiLineString: function(feature, coords) {
		return patchStroke( this.lines.createPath({path: this.makePathString(coords, 2)}) );
	},
	
	makeMultiPolygon: function(feature, coords) {
		return patchStroke( this.areas.createPath({path: this.makePathString(coords, 3)}) );
	},
	
	applyPointStyle: function(feature, calculatedStyle, coords) {
		var specificStyle = calculatedStyle.point,
			specificShapeStyles = calculatedStyle.points,
			baseShapes = feature.baseShapes,
			numBaseShapes = baseShapes.length;

		if (specificShapeStyles) {
			this._updateShapes(feature, coords, calculatedStyle, specificShapeStyles, true);
			var recreateShapes = false;
			array.forEach(specificShapeStyles, function(specificShapeStyle, i){
				var currentShape = baseShapes[i];
				if (currentShape && recreateShapes) {
					// disconnect events and remove the shape
					this._removeShape(currentShape, feature);
					currentShape = null;
				}
				// index of specificShapeStyles corresponds to the index of feature.baseShapes
				var shape = this._applyPointStyle(coords, calculatedStyle, specificStyle, specificShapeStyle, feature, currentShape);
				if (currentShape && currentShape != shape) {
					// shape has been replaced!
					// we need to recreate all subsequent shapes
					recreateShapes = true;
					baseShapes[i] = shape;
				}
				if (i >= numBaseShapes) {
					baseShapes.push(shape);
				}
			}, this);
		}
		else {
			if (numBaseShapes > 1) {
				// apply the same style to all shapes
				array.forEach(baseShapes, function(shape, i) {
					var resultShape = this._applyPointStyle(coords, calculatedStyle, specificStyle, null, feature, shape);
					if (numBaseShapes == 0 || /* shape has been replaced*/resultShape != shape) {
						feature.baseShapes[i] = resultShape;
					}
				}, this);
			}
			else {
				var currentShape = baseShapes[0],
					shape = this._applyPointStyle(coords, calculatedStyle, specificStyle, null, feature, currentShape);
				if (numBaseShapes == 0 || /* shape has been replaced*/currentShape != shape) {
					feature.baseShapes[0] = shape;
				}
			}
		}
	},
	
	_applyPointStyle: function(coords, calculatedStyle, specificStyle, specificShapeStyle, feature, shape) {
		var shapeType = P.get("shape", calculatedStyle, specificStyle, specificShapeStyle),
			src = P.getImgSrc(calculatedStyle, specificStyle, specificShapeStyle),
			isVectorShape,
			size,
			rScale,
			scale = P.getScale(calculatedStyle, specificStyle, specificShapeStyle),
			transform = [matrix.translate(this.getX(coords[0]), this.getY(coords[1]))],
			applyTransform = true,
			// if we alreade have a shape, we don't need to connect events: the events are already connected to the shape
			connectEvents = !shape ? true : false;

		if (shapeType) {
			if (!djeo.shapes[shapeType]) shapeType = P.defaultShapeType;
			isVectorShape = true;
		}
		else if (src) isVectorShape = false;

		if (isVectorShape !== undefined) {
			size = isVectorShape ? P.getSize(calculatedStyle, specificStyle, specificShapeStyle) : P.getImgSize(calculatedStyle, specificStyle, specificShapeStyle);
		}
		if (size) {
			// store the size and the scale for possible future reference
			feature.reg.size = [size[0], size[1]];
			feature.reg.scale = scale;
		}
		else if (shape) {
			// check if we can apply relative scale (rScale)
			rScale = P.get("rScale", calculatedStyle, specificStyle, specificShapeStyle);
			if (isVectorShape !== undefined && rScale !== undefined) {
				size = feature.reg.size;
				scale = rScale * feature.reg.scale;
			}
		}

		if (isVectorShape) {
			var shapeDef = djeo.shapes[shapeType],
				shapeSize = shapeType=="circle" ? 2 : Math.max(shapeDef.size[0], shapeDef.size[1]),
				_scale = scale/this.lengthDenominator/shapeSize;

			transform.push(matrix.scale(_scale*size[0], _scale*size[1]));

			if (shapeType=="circle") {
				if (shape && (shape.shape.type != "circle")) {
					// can't use existing shape
					// disconnect events and remove the shape
					this._removeShape(shape, feature);
					// we need to reconnect events back to newly created shape
					connectEvents = true;
					shape = null;
				}
				var circleDef = {cx:0, cy:0, r:1};
				if (shape) shape.setShape(circleDef);
				else shape = patchStroke( this.points.createCircle(circleDef) );
			}
			else {
				if (shape && shape.shape.type != "polyline") {
					// can't use existing shape
					// disconnect events and remove the shape
					this._removeShape(shape, feature);
					// we need to reconnect events back to newly created shape
					connectEvents = true;
					shape = null;
				}
				if (shape) shape.setShape({points: shapeDef.points});
				else shape = patchStroke( this.points.createPolyline(shapeDef.points) );
			}
			dgfx.applyFill(shape, calculatedStyle, specificStyle, specificShapeStyle);
			dgfx.applyStroke(shape, calculatedStyle, specificStyle, specificShapeStyle, shapeSize/Math.max(size[0], size[1])/scale);
		}
		else if (isVectorShape === false) {
			if (shape && shape.shape.type != "image") {
				// can't use existing shape
				// disconnect events and remove the shape
				this._removeShape(shape, feature);
				// we need to reconnect events back to newly created shape
				connectEvents = true;
				shape = null;
			}
			var anchor = P.getAnchor(calculatedStyle, specificStyle, specificShapeStyle, size),
				imageDef = {
					type: "image",
					src: this._getImageUrl(src),
					width: size[0],
					height: size[1],
					x: -anchor[0],
					y: -anchor[1]
				};
			if (shape) shape.setShape(imageDef);
			else shape = this.points.createImage(imageDef);
			transform.push(matrix.scale(1/this.lengthDenominator*scale));
		}
		else if (shape) {
			if (shape.shape.type != "image") {
				// apply stroke and fill to the existing vector shape
				dgfx.applyFill(shape, calculatedStyle, specificStyle, specificShapeStyle);
				//dgfx.applyStroke(shape, calculatedStyle, specificStyle, specificShapeStyle, shapeSize/Math.max(size[0], size[1])/scale);
			}
			if (rScale !== undefined) {
				shape.applyRightTransform(matrix.scale(calculatedStyle.rScale));
				applyTransform = false;
			}
		}

		if (shape) {
			if (applyTransform) {
				// check if need to apply rotation
				var reg = feature.reg,
					heading = reg.heading
				;
				if (heading === undefined) {
					// check if have orientation directly in the feature (this is case of map initialization)
					heading = feature.orientation;
					if (lang.isObject(heading)) heading = heading.heading;
					reg.heading = heading;
				}
				if (heading !== undefined) {
					transform.push(matrix.rotate(heading));
				}
				shape.setTransform(transform);
			}
			if (connectEvents) {
				this._connectEvents(shape, feature);
			}
		}

		return shape;
	},
	
	applyLineStyle: function(feature, calculatedStyle, coords) {
		var specificStyle = calculatedStyle.line,
			specificShapeStyles = calculatedStyle.lines,
			baseShapes = feature.baseShapes;

		if (specificShapeStyles) {
			this._updateShapes(feature, coords, calculatedStyle, specificShapeStyles);
			array.forEach(specificShapeStyles, function(specificShapeStyle, i){
				// index of specificShapeStyles corresponds to the index of feature.baseShapes
				this._applyLineStyle(baseShapes[i], calculatedStyle, specificStyle, specificShapeStyle);
			}, this);
		}
		else {
			// apply the same style to all shapes
			array.forEach(baseShapes, function(shape) {
				this._applyLineStyle(shape, calculatedStyle, specificStyle)
			}, this);
		}
	},
	
	_applyLineStyle: function(shape, calculatedStyle, specificStyle, specificShapeStyle) {
		dgfx.applyStroke(shape, calculatedStyle, specificStyle, specificShapeStyle, 1/this.lengthDenominator);
	},
	
	applyPolygonStyle: function(feature, calculatedStyle, coords) {
		// no specific shape styles for a polygon!
		this._updateShapes(feature, coords, calculatedStyle);
		this._applyPolygonStyle(feature.baseShapes[0], calculatedStyle, calculatedStyle.area);
	},
	
	_applyPolygonStyle: function(shape, calculatedStyle, specificStyle) {
		dgfx.applyFill(shape, calculatedStyle, specificStyle);
		dgfx.applyStroke(shape, calculatedStyle, specificStyle, null, 1/this.lengthDenominator);
	},
	
	_updateShapes: function(feature, coords, calculatedStyle, specificStyles, preventAddingShapes) {
		var baseShapes = feature.baseShapes,
			numSpecificStyles = specificStyles ? specificStyles.length : 1,
			numBaseShapes = baseShapes.length;

		if (numSpecificStyles > numBaseShapes) {
			// add missing shapes
			// preventAddingShapes matters only for point features
			if (!preventAddingShapes)
			for (var i=numBaseShapes; i<numSpecificStyles; i++) {
				var shape = this.createShape(feature, coords);
				// connect events to the shape
				this._connectEvents(shape, feature);
				baseShapes.push(shape);
			}
		}
		else if (numSpecificStyles < numBaseShapes) {
			// remove excessive shapes
			for (var i=numBaseShapes-1; i>=numSpecificStyles; i--) {
				var shape = baseShapes.pop();
				this._removeShape(shape, feature);
			}
			
		}
	},
	
	_connectEvents: function(shape, feature) {
		var handles = feature.handles;
		for (var handle in handles) {
			var events = handles[handle][0],
				context = handles[handle][1],
				method = handles[handle][2],
				eventConnections = handles[handle][3];
			array.forEach(events, function(event, eventIndex){
				eventConnections[eventIndex].push( [shape, shape.connect(event, this.engine.normalizeCallback(feature, event, method, context))] );
			}, this);
		}
	},
	
	_removeShape: function(shape, feature) {
		var handles = feature.handles;
		shape.removeShape();
		// disconnect events from the shape
		for (var handle in handles) {
			var events = handles[handle][0],
				eventConnections = handles[handle][3];
			array.forEach(events, function(event, eventIndex){
				shape.disconnect( eventConnections[eventIndex].pop()[1] );
			});
		}
	},
	
	remove: function(feature) {
		if (feature.visible) {
			array.forEach(feature.baseShapes, function(shape){
				this._removeShape(shape, feature);
			}, this);
		}
	},
	
	show: function(feature, show) {
		if (show) {
			var container = feature.reg.gfxContainer;
			// we don't need the container anymore
			delete feature.reg.gfxContainer;

			array.forEach(feature.baseShapes, function(shape){
				container.add(shape);
			}, this);
		}
		else {
			if (feature.baseShapes.length) {
				// save shapes container for possible future use
				// all base shapes are supposed to be in the same gfx container
				feature.reg.gfxContainer = feature.baseShapes[0].getParent();
			}
			array.forEach(feature.baseShapes, function(shape){
				shape.removeShape();
			});
		}
	},

	makeText: function(feature, calculatedStyle) {
		// ignore VML due to problems with text scaling
		if (gfx.renderer == "vml") return;
		if (feature.textShapes) {
			array.forEach(feature.textShapes, function(t) {
				t.removeShape();
			});
		}

		var specificStyle;
		if (feature.isPoint()) {
			specificStyle = calculatedStyle.point;
		}
		else if (feature.isArea()) {
			specificStyle = calculatedStyle.area;
		}
		var textStyle = P.get("text", calculatedStyle, specificStyle);
		if (!textStyle) return;

		var label = textStyle.label || this._getLabel(feature, textStyle);

		if (label) {
			feature.textShapes = [];
			// ts states for "text style"
			feature.reg.ts = textStyle;

			// for halo effect we need two text shapes: the lower one with stroke and the upper one without stroke
			if (textStyle.haloFill && textStyle.haloRadius) {
				this._makeTextShape(feature, label, null, {color: textStyle.haloFill, width: 2*textStyle.haloRadius}, textStyle);
			}

			this._makeTextShape(feature, label, textStyle.fill, null, textStyle);
		}
	},
	
	_makeTextShape: function(feature, label, fill, stroke, textStyle) {
		var textDef = {},
			createShape = true
		;
	
		if (feature.isPoint()) {
			if (textStyle.hAlign) {
				textDef.align = textStyle.hAlign;
			}
		}
		else if (feature.isArea()) {
			textDef.align = "middle";
		}
		else {
			createShape = false;
		}
		
		if (createShape) {
			textDef.text = label;

			var transforms = this._calculateTextPosition(feature, textDef),
				textShape = this.text.createText(textDef).setTransform(transforms)
			;

			if (fill) textShape.setFill(fill);
			this._makeFont(textShape, textStyle, P.getScale(feature.reg.cs));
			if (stroke) textShape.setStroke(stroke);
			
			feature.textShapes.push(textShape);
		}
	},
	
	_calculateTextPosition: function(feature, textDef, coords) {
		// calculate transforms for the text shape
		// set x and y for the textDef if textDef is given
		
		var x,y;
		if (x === undefined) {
			if (!coords) {
				coords = feature.getCoords();
			}
			x = this.getX(coords[0]);
			y = this.getY(coords[1]);
		}
		else {
			var center = geom.center(feature);
			x = this.getX(center[0]);
			y = this.getY(center[1]);
		}
		
		var textStyle = feature.reg.ts,
			calculatedStyle = feature.reg.cs,
			scale = P.getScale(calculatedStyle),
			transforms = [matrix.scaleAt(1/this.lengthDenominator, x, y)],
			// determing label offset
			dx = ("dx" in textStyle) ? scale*textStyle.dx : 0,
			dy = ("dy" in textStyle) ? -scale*textStyle.dy : 0
		;
		if (dx || dy) {
			transforms.push(matrix.translate(dx, dy));
		}

		if (textDef) {
			textDef.x = x;
			textDef.y = y;
		}
		
		return transforms;
	},
	
	_makeFont: function(textShape, textStyle, scale) {
		var font;
		for (var attr in fontAttrs) {
			if (attr in textStyle) {
				if (!font) font = {};
				font[attr] = textStyle[attr];
			}
		}
		if (font) {
			if (font.size) {
				font.size *= scale;
			}
			textShape.setFont(font);
		}
	},

	setCoords: function(coords, feature) {
		var baseShapes = feature.baseShapes,
			textShapes = feature.textShapes,
			oldCoords = feature.getCoords(),
			transform = {dx:this.getX(coords[0])-this.getX(oldCoords[0]), dy:this.getY(coords[1])-this.getY(oldCoords[1])}
		;

		array.forEach(baseShapes, function(shape){
			shape.applyLeftTransform(transform);
		}, this);
		
		if (textShapes) {
			array.forEach(textShapes, function(t){
				var textDef = t.getShape(),
					transforms = this._calculateTextPosition(feature, textDef, coords)
				;
				t.setShape(textDef).setTransform(transforms);
			}, this);
		}
	},

	setOrientation: function(o, feature) {
		// orientation is actually heading
		var reg = feature.reg;
		if (reg.heading === undefined) {
			reg.heading = 0;
		}
		var baseShapes = feature.baseShapes,
			deltaHeading = -reg.heading + o
		;

		array.forEach(baseShapes, function(shape){
			shape.applyRightTransform(matrix.rotate(deltaHeading));
		}, this);
		
		reg.heading = o;
	},
	
	makePathString: function(entities, depth) {
		var pathString = "";
		if (depth == 1) {
			pathString = "M" + this.getX(entities[0][0]) + "," + this.getY(entities[0][1]);
			for(var i=1; i<entities.length; i++) {
				pathString += "L" + this.getX(entities[i][0]) + "," + this.getY(entities[i][1]) 
			}
		}
		else {
			array.forEach(entities, function(entity){
				pathString += this.makePathString(entity, depth-1);
			}, this);
		}
		return pathString;
	}
});

});
