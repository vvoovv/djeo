dojo.provide("djeo.Placemark");

dojo.require("djeo.Feature");
dojo.require("djeo.styling");

(function() {

var g = djeo,
	u = g.util,
	s = g.styling;

dojo.declare("djeo.Placemark", g.Feature, {
	
	type: "",

	isPlacemark: true,

	factory: null,

	// keep active handles
	handles: null,

	baseShapes: null,

	textShapes: null,

	// store dynamical or engine specific information here
	state: null,

	constructor: function(/* Object? */featureDef, /* Object? */kwArgs) {
		this.handles = {};
		this.baseShapes = [];
		this.state = {};
		
		this.setFactory();
	},
	
	setFactory: function() {
		this.factory = this.map.engine.factories.Placemark;
	},
	
	getType: function() {
		var type;
		if (this.coords) type = this.type;
		else {
			var geometry =  this.map.getGeometryById(this.geometryId || this.id);
			if (geometry) type = geometry.type;
		}
		return type;
	},
	
	getCoordsType: function() {
		return this.getType();
	},
	
	getCoords: function() {
		return this._getCoords();
	},

	_getCoords: function() {
		var coords = this.coords;
		if (!coords) {
			var geometry =  this.map.getGeometryById(this.geometryId || this.id);
			if (geometry) coords = geometry.coords;
		}
		return coords;
	},
	
	setCoords: function(coords) {
		delete this._coords, this._bbox;
		this.coords = coords;
	},
	
	render: function(stylingOnly, theme) {
		this.map.methods.Placemark.render.call(this, stylingOnly, theme);
	},

	_render: function(stylingOnly, theme) {
		if (!this.visible) return;
		//TODO: disconnect connections and then reconnect them
		var coords = this.getCoords();
		if (!coords) {
			this.invalid = true;
			return;
		}

		var factory = this.factory;

		// TODO: disconnect
		if (!stylingOnly) {
			// destroy base shapes
			for (var i=this.baseShapes.length-1; i>=0; i--) {
				this.map.engine.destroy(this.baseShapes.pop(), this);
			}
		}
		// destroy extra shapes
		// extra shapes are destroyed in an case (also if stylingOnly == true)
		if (this.extraShapes) for (var i=this.extraShapes.length-1; i>=0; i--) {
			this.map.engine.destroy(this.extraShapes.pop(), this);
		}
		
		var style = s.calculateStyle(this, theme);

		// apply style to the base geometry
		var type = this.getCoordsType(),
			styleType = "point";
		if (type == "Polygon" || type == "MultiPolygon") styleType = "polygon";
		else if (type == "LineString" || type == "MultiLineString") styleType = "line";
		if (stylingOnly) {
			applyStyle(styleType, this, coords, style, factory);
		}
		else {
			// create shape(s)
			if (factory.multipleSymbolizers && style[styleType]) { // we have a specific style
				dojo.forEach(style[styleType], function(_style) {
					var shape = factory.createShape(this, coords);
					if (shape) this.baseShapes.push(shape);
				}, this);
			}
			else {
				var shape = factory.createShape(this, coords);
				if (shape) this.baseShapes.push(shape);
			}
			
			// apply style to the shape(s)
			applyStyle(styleType, this, coords, style, factory);
			
			// add text label if the text style is specified
			if (style.text) {
				var textShape = factory.createText(this, style.text);
				if (textShape) {
					this.textShapes = textShape;
					this.map.engine.appendChild(textShape, this);
				}
			}
			
			// add shape(s) to the map
			dojo.forEach(this.baseShapes, function(shape) {
				this.map.engine.appendChild(shape, this);
			}, this);
		}
	},
	
	remove: function() {
		this.factory.remove(this);
		dojo.publish("djeo.placemark.remove", [this]);
		// remove feature from the feature container
		// remove from the registry of features
		// remove from style dependence
		// disconnect all events
	},
	
	show: function(show) {
		if (show === undefined) show = true;
		if (this.visible != show) {
			this.factory.show(this, show);
			this.visible = show;
		}
	},

	getBbox: function() {
		// summary:
		//		Returns the feature boundings box in the current map projection
		var bbox = this.bbox || this._bbox;
		if (!bbox) bbox = u.bbox.get(this);
		return bbox;
	},

	connectWithHandle: function(handle, /* String|Array? */events, /*Object|null*/ context, /*String|Function*/ method) {
		if (this.invalid) return handle;
		events = dojo.isString(events) ? [events] : events;
		
		// disconnect existing events for this handle
		var handleObj = this.handles[handle];
		if (handleObj) {
			var eventConnections = handleObj[3];
			dojo.forEach(eventConnections, function(eventConnection){
				if (eventConnection) this.map.engine.disconnect(eventConnection);
			}, this);
		}
		var eventConnections = [];
		// the format of handleObj is [events,context,method,eventConnections]
		var handleObj = [events, context, method, eventConnections];

		var numEvents = 0; // number of connected events
		dojo.forEach(events, function(event) {
			if (g.events[event]) {
				eventConnections.push(
					this.map.engine.connect(this, event, context, method)
				);
				numEvents++;
			}
			else eventConnections.push(null);
		}, this);
		if (!numEvents) return handle;
		handle = handle || u.uid();
		if (!this.handles[handle]) this.handles[handle] = handleObj;
		return handle;
	},

	disconnect: function(handle) {
		var handleObj = this.handles[handle];
		if (handleObj) {
			var eventConnections = handleObj[3];
			dojo.forEach(eventConnections, function(eventConnection){
				this.map.engine.disconnect(eventConnection);
			}, this);
			delete this.handles[handle];
		}
	},
	
	translate: function(position) {
		var factory = this.factory;
		if (factory.translate) {
			// convert coordinates to the map projection if it is relevant here
			position = this.map.getCoords(position, "Point");
			factory.translate(position, this);
			this.setCoords(position);
			dojo.publish("djeo.placemark.translate", [this, position]);
		}
	},

	rotate: function(orientation) {
		var factory = this.factory;
		if (factory.rotate) {
			if (this.heading === undefined) this.heading = 0;
			var heading = dojo.isObject(orientation) ? orientation.heading : orientation;
			if (heading !== undefined) {
				factory.rotate(heading, this);
				this.heading = heading;
			}
		}
	}
});


// default methods;
var p = g.Placemark.prototype;
if (!g.methods) g.methods = {};
g.methods.Placemark = {
	render: p._render
}


var applyStyle = function(styleType, feature, coords, style, factory) {
	switch(styleType) {
		case "point":
			factory.applyPointStyle(feature, style, coords);
			break;
		case "line":
			factory.applyLineStyle(feature, style, coords);
			break;
		case "polygon":
			factory.applyPolygonStyle(feature, style, coords);
			break;
	}
};

// register the constructor
var gp = g.Placemark,
	ft = g.featureTypes;
ft.Placemark = gp;
ft.Point = gp;
ft.LineString = gp;
ft.Polygon = gp;
ft.MultiLineString = gp;
ft.MultiPolygon = gp;
}());