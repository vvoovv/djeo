dojo.provide("djeo.djeo.Placemark");

dojo.require("djeo.common.Placemark");
dojo.require("djeo.gfx");

(function() {

var d = djeo,
	dx = d.gfx,
	cp = d.common.Placemark,
	s = d.styling,
	matrix = dojox.gfx.matrix;

dojo.declare("djeo.djeo.Placemark", cp, {
	
	multipleSymbolizers: true,
	
	constructor: function(kwArgs) {
		dojo.mixin(this, kwArgs);
	},
	
	init: function() {
		this.group = this.engine.group;
		
		this.polygons = this.group.createGroup();
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
		var result = x-this.map.extent[0];
		if (this.engine.correctScale) result *= this.engine.correctionScale;
		return parseInt(result);
	},
	
	getY: function(y) {
		var result = this.map.extent[3]-y;
		if (this.engine.correctScale) result *= this.engine.correctionScale;
		return parseInt(result);
	},
	
	makePoint: function(feature, coords) {
		// do nothing
		// point shape are created in this.applyPointStyle
		return null;
	},
	
	makeLineString: function(feature, coords) {
		return this.lines.createPath({path: this.makePathString(coords, 1)});
	},

	makePolygon: function(feature, coords) {
		return this.polygons.createPath({path: this.makePathString(coords, 2)});
	},
	
	makeMultiLineString: function(feature, coords) {
		return this.lines.createPath({path: this.makePathString(coords, 2)});
	},
	
	makeMultiPolygon: function(feature, coords) {
		return this.polygons.createPath({path: this.makePathString(coords, 3)});
	},
	
	applyPointStyle: function(feature, calculatedStyle, coords) {
		var specificStyle = calculatedStyle.point,
			specificShapeStyles = calculatedStyle.points,
			baseShapes = feature.baseShapes,
			numBaseShapes = baseShapes.length;

		if (specificShapeStyles) {
			this._updateShapes(feature, coords, calculatedStyle, specificShapeStyles, true);
			var recreateShapes = false;
			dojo.forEach(specificShapeStyles, function(specificShapeStyle, i){
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
				dojo.forEach(baseShapes, function(shape, i) {
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
		var shapeType = cp.get("shape", calculatedStyle, specificStyle, specificShapeStyle),
			src = cp.getImgSrc(calculatedStyle, specificStyle, specificShapeStyle),
			isVectorShape,
			size,
			rScale,
			scale = cp.getScale(calculatedStyle, specificStyle, specificShapeStyle),
			transform = [matrix.translate(this.getX(coords[0]), this.getY(coords[1]))],
			applyTransform = true,
			// if we alreade have a shape, we don't need to connect events: the events are already connected to the shape
			connectEvents = !shape ? true : false;

		if (shapeType) {
			if (!d.shapes[shapeType]) shapeType = cp.defaultShapeType;
			isVectorShape = true;
		}
		else if (src) isVectorShape = false;

		if (isVectorShape !== undefined) {
			size = isVectorShape ? cp.getSize(calculatedStyle, specificStyle, specificShapeStyle) : cp.getImgSize(calculatedStyle, specificStyle, specificShapeStyle);
		}
		if (size) {
			// store the size and the scale for possible future reference
			feature.state.size = [size[0], size[1]];
			feature.state.scale = scale;
		}
		else if (shape) {
			// check if we can apply relative scale (rScale)
			rScale = cp.get("rScale", calculatedStyle, specificStyle, specificShapeStyle);
			if (isVectorShape !== undefined && rScale !== undefined) {
				size = feature.state.size;
				scale = rScale * feature.state.scale;
			}
		}

		if (isVectorShape) {
			var shapeDef = d.shapes[shapeType],
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
				else shape = this.points.createCircle(circleDef);
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
				else shape = this.points.createPolyline(shapeDef.points);
			}
			dx.applyFill(shape, calculatedStyle, specificStyle, specificShapeStyle);
			dx.applyStroke(shape, calculatedStyle, specificStyle, specificShapeStyle, shapeSize/Math.max(size[0], size[1])/scale);
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
			var anchor = cp.getAnchor(calculatedStyle, specificStyle, specificShapeStyle, size),
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
				dx.applyFill(shape, calculatedStyle, specificStyle, specificShapeStyle);
				//dx.applyStroke(shape, calculatedStyle, specificStyle, specificShapeStyle, shapeSize/Math.max(size[0], size[1])/scale);
			}
			if (rScale !== undefined) {
				shape.applyRightTransform(matrix.scale(calculatedStyle.rScale));
				applyTransform = false;
			}
		}

		if (shape) {
			if (applyTransform) {
				// check if need to apply rotation
				var state = feature.state,
					heading = state.orientation ? state.orientation.heading : state.heading;
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
			dojo.forEach(specificShapeStyles, function(specificShapeStyle, i){
				// index of specificShapeStyles corresponds to the index of feature.baseShapes
				this._applyLineStyle(baseShapes[i], calculatedStyle, specificStyle, specificShapeStyle);
			}, this);
		}
		else {
			// apply the same style to all shapes
			dojo.forEach(baseShapes, function(shape) {
				this._applyLineStyle(shape, calculatedStyle, specificStyle)
			}, this);
		}
	},
	
	_applyLineStyle: function(shape, calculatedStyle, specificStyle, specificShapeStyle) {
		dx.applyStroke(shape, calculatedStyle, specificStyle, specificShapeStyle, 1/this.lengthDenominator);
	},
	
	applyPolygonStyle: function(feature, calculatedStyle, coords) {
		// no specific shape styles for a polygon!
		this._updateShapes(feature, coords, calculatedStyle);
		this._applyPolygonStyle(feature.baseShapes[0], calculatedStyle, calculatedStyle.polygon);
	},
	
	_applyPolygonStyle: function(shape, calculatedStyle, specificStyle) {
		dx.applyFill(shape, calculatedStyle, specificStyle);
		dx.applyStroke(shape, calculatedStyle, specificStyle, null, 1/this.lengthDenominator);
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
			dojo.forEach(events, function(event, eventIndex){
				eventConnections[eventIndex].push( [shape, shape.connect(event, this.engine.normalizeCallback(feature, event, context, method))] );
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
			dojo.forEach(events, function(event, eventIndex){
				shape.disconnect( eventConnections[eventIndex].pop()[1] );
			});
		}
	},
	
	remove: function(feature) {
		if (feature.visible) {
			dojo.forEach(feature.baseShapes, function(shape){
				this._removeShape(shape, feature);
			}, this);
		}
	},
	
	show: function(feature, show) {
		if (show) {
			var container = feature.state.gfxContainer;
			// we don't need the container anymore
			delete feature.state.gfxContainer;

			dojo.forEach(feature.baseShapes, function(shape){
				container.add(shape);
			}, this);
		}
		else {
			if (feature.baseShapes.length) {
				// save shapes container for possible future use
				// all base shapes are supposed to be in the same gfx container
				feature.state.gfxContainer = feature.baseShapes[0].getParent();
			}
			dojo.forEach(feature.baseShapes, function(shape){
				shape.removeShape();
			});
		}
	},

	makeText: function(feature, calculatedStyle) {
		// ignore VML due to problems with text scaling
		if (dojox.gfx.renderer == "vml") return;
		if (feature.textShapes) {
			dojo.forEach(feature.textShapes, function(t) {
				t.removeShape();
			});
		}
		feature.textShapes = [];

		var specificStyle,
			type = feature.getCoordsType();
		switch (type) {
			case "Point":
				specificStyle = calculatedStyle.point;
				break
			case "Polygon":
			case "MultiPolygon":
				specificStyle = calculatedStyle.polygon;
		}
		var textStyle = cp.get("text", calculatedStyle, specificStyle);
		if (!textStyle) return;

		var label = textStyle.label || this._getLabel(feature, textStyle);

		if (label) {
			var shape = feature.baseShapes[0],
				coords = feature.getCoords(),
				halo = textStyle.halo;

			// for halo effect we need two text shapes: the lower one with stroke and the upper one without stroke
			if (halo && halo.fill && halo.radius) {
				this._makeTextShape(feature, type, label, null, textStyle.font, {color: halo.fill, width: 2*halo.radius});
			}

			this._makeTextShape(feature, type, label, textStyle.fill, textStyle.font);
		}
	},
	
	_makeTextShape: function(feature, type, label, fill, font, stroke) {
		var shape = feature.baseShapes[0],
			textDef = {},
			textShape,
			coords = feature.getCoords(),
			x,
			y;
	
		if (type == "Point") {
			var x = this.getX(coords[0]),
				y = this.getY(coords[1]);
		}
		else if (type == "Polygon" || type == "MultiPolygon") {
			var center = djeo.util.center(feature),
				x = this.getX(center[0]),
				y = this.getY(center[1]);
	
			textDef.align = "middle";
		}
		
		if (x!==undefined) {
			textDef.x = x;
			textDef.y = y;
			textDef.text = label;
			
			console.debug(x,y,this.lengthDenominator);
			textShape = this.text.createText(textDef).setTransform(matrix.scaleAt(1/this.lengthDenominator, x, y ));

			if (fill) textShape.setFill(fill);
			if (font) textShape.setFont(font);
			if (stroke) textShape.setStroke(stroke);
			
			feature.textShapes.push(textShape);
		}
	},

	translate: function(position, feature) {
		var baseShapes = feature.baseShapes,
			textShapes = feature.textShapes,
			oldPosition = feature.getCoords(),
			transform = {dx:this.getX(position[0])-this.getX(oldPosition[0]), dy:this.getY(position[1])-this.getY(oldPosition[1])};

		dojo.forEach(baseShapes, function(shape){
			shape.applyLeftTransform(transform);
		}, this);
		
		if (textShapes) {
			dojo.forEach(textShapes, function(t){
				t.applyLeftTransform(transform);
			});
		}
	},

	rotate: function(orientation, feature) {
		var baseShapes = feature.baseShapes,
			heading = dojo.isObject(orientation) ? orientation.heading : orientation,
			state = feature.state,
			oldHeading = state.orientation ? state.orientation.heading : state.heading,
			deltaHeading = -oldHeading + heading;

		dojo.forEach(baseShapes, function(shape){
			shape.applyRightTransform(matrix.rotate(deltaHeading));
		}, this);
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
			dojo.forEach(entities, function(entity){
				pathString += this.makePathString(entity, depth-1);
			}, this);
		}
		return pathString;
	}
});

}());
