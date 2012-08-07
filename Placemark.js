define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // isString, isObject
	"dojo/_base/array", // forEach
	"./_base",
	"./Feature",
	"./util/_base",
	"./util/bbox"
], function(declare, lang, array, djeo, Feature, u, bbox) {

var p = declare([Feature], {
	
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
	
	isPoint: function() {
		return (this.getCoordsType() == "Point");
	},
	
	isArea: function() {
		var type = this.getCoordsType();
		return (type == "Polygon" || type == "MultiPolygon");
	},
	
	isLine: function() {
		var type = this.getCoordsType();
		return (type == "LineString" || type == "MultiLineString");
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
	
	_set_coords: function(coords) {
		// convert coordinates to the map projection if it is relevant here
		var _coords = this.map.getCoords(coords);
		this.map.engine.factories.Placemark.setCoords(_coords, this);
		delete this._bb;
		this.coords = coords;
		this._coords = _coords;
	},
	
	_get_coords: function() {
		return this.getCoords();
	},
	
	render: function(stylingOnly, theme) {
		this.map.engine.factories.Placemark.render(this, stylingOnly, theme);
	},

	_render: function(stylingOnly, theme) {
		if (!stylingOnly) {
			this.parent._show(this, true, true);
		}
		this.map.engine.factories.Placemark._render(this, stylingOnly, theme);
	},
	
	remove: function() {
		this.map.engine.factories.Placemark.remove(this);
		// FIXME publish("djeo.placemark.remove", [this]);
		// remove feature from the feature container
		// remove from the registry of features
		// remove from style dependence
		// disconnect all events
	},
	
	show: function(show) {
		if (show === undefined) show = true;
		if (this.visible != show) {
			// delegate to the parent
			this.parent._show(this, show);
		}
	},
	
	_show: function(show) {
		this.map.engine.factories.Placemark.show(this, show);
		this.visible = show;
	},

	getBbox: function() {
		// summary:
		//		Returns the feature bounding box in the current map projection
		var bb = this._bbox || this.bbox;
		if (!bb) bb = bbox.get(this);
		return bb;
	},

	onForHandle: function(handle, /* Object */kwArgs) {
		if (this.invalid) return handle;
		var handleObj = this.handles[handle];
		
		if (!handleObj || !kwArgs.key) {
			var events = kwArgs.events;
			events = lang.isString(events) ? [events] : events;
			
			// disconnect existing events for this handle
			if (handleObj) {
				var eventConnections = handleObj[3];
				array.forEach(eventConnections, function(eventConnection){
					if (eventConnection) this.map.engine.disconnect(eventConnection);
				}, this);
			}
			var eventConnections = [];
			// the format of handleObj is [events,context,method,eventConnections]
			handleObj = [events, kwArgs.context, kwArgs.method, eventConnections];
	
			var numEvents = 0; // number of connected events
			array.forEach(events, function(event) {
				if (djeo.events[event]) {
					eventConnections.push(
						this.map.engine.onForFeature(this, event, kwArgs.method, kwArgs.context)
					);
					numEvents++;
				}
				else eventConnections.push(null);
			}, this);
			if (!numEvents) return handle;
			handle = handle || u.uid();
			if (!this.handles[handle]) this.handles[handle] = handleObj;
		}
		// attach key-value
		if (kwArgs.key) {
			if (handleObj.length == 4) {
				handleObj[4] = {}
			}
			handleObj[4][kwArgs.key] = kwArgs.value;
		}
		return handle;
	},

	disconnect: function(handle, key, removeEventListener) {
		var handleObj = this.handles[handle];
		if (!handleObj) return;

		var disconnect = true;
		
		if (key) {
			if (handleObj.length == 4) return;
			delete handleObj[4][key];
			if (removeEventListener) {
				// check if there are still keys attached to handleObj
				for (var k in handleObj[4]) {
					disconnect = false;
					break;
				}
			}
		}
		if (disconnect) {
			var eventConnections = handleObj[3];
			array.forEach(eventConnections, function(eventConnection){
				this.map.engine.disconnect(eventConnection);
			}, this);
			delete this.handles[handle];
		}
	},

	_set_orientation: function(o) {
		var factory = this.map.engine.factories.Placemark;
		if (factory.setOrientation) {
			var state = this.state;
			if (state.heading === undefined) {
				state.heading = 0;
			}
			var heading = lang.isObject(o) ? o.heading : o;
			if (heading !== undefined) {
				factory.setOrientation(heading, this);
				state.heading = heading;
			}
		}
	}
});

// register the constructor
var ft = djeo.featureTypes;
ft.Placemark = p;
ft.Point = p;
ft.LineString = p;
ft.Polygon = p;
ft.MultiLineString = p;
ft.MultiPolygon = p;

return p;
});