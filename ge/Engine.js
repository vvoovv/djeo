dojo.provide("djeo.ge.Engine");

dojo.require("djeo.Engine");
dojo.require("djeo.util");

(function(){
	
google.load("earth", "1");

var g = djeo,
	u = g.util,
	e = g.ge;

e.altitudeModes = {
	clampToGround: "ALTITUDE_CLAMP_TO_GROUND",
	relativeToGround: "ALTITUDE_RELATIVE_TO_GROUND",
	absolute: "ALTITUDE_ABSOLUTE"
};

var engineEvents = {onmouseover: "mouseover", onmouseout: "mouseout", onclick: "click"};

// default methods;
e.methods = {
	Map: {
		addStyle: function(styles) {
			google.earth.executeBatch(this.engine.ge, dojo.hitch(this, function(){
				this._addStyle(styles);
			}));
		},

		render: function(stylingOnly, theme, features) {
			google.earth.executeBatch(this.engine.ge, dojo.hitch(this, function(){
				this._render(stylingOnly, theme, features);
			}));
		},

		renderFeatures: function(features, stylingOnly, theme) {
			google.earth.executeBatch(this.engine.ge, dojo.hitch(this, function(){
				this._renderFeatures(features, stylingOnly, theme);
			}));
		}
	}
}

dojo.declare("djeo.ge.Engine", djeo.Engine, {
	
	type: "ge",
	
	canRenderModels: true,

	// the result of google.earth.createInstance
	ge: null,
	
	constructor: function(kwArgs) {
		// initialize basic factories
		this._initBasicFactories(new djeo.ge.Placemark({
			map: this.map
		}));
	},
	
	initialize: function(/* Function */readyFunction) {
		google.earth.createInstance(this.map.container, dojo.hitch(this, function(instance){
			this.map.projection = "EPSG:4326";
			this.ge = instance;
			this.ge.getOptions().setMouseNavigationEnabled(false);
			this.ge.getWindow().setVisibility(true);
			
			this.patchMethods();
			
			this.initialized = true;
			readyFunction();
		}), function(){/*failure*/});
	},

	createContainer: function(feature) {
		var container = this.ge.createFolder('');
		this.appendChild(container, feature);
		return container;
	},
	
	prepare: function() {
		this.factories.Placemark.init();
		this.zoomTo(this.map.extent);
	},
	
	appendChild: function(child, feature) {
		var parentContainer = feature.parent.getContainer();
		parentContainer.getFeatures().appendChild(child);
	},
	
	getTopContainer: function() {
		var features = this.ge.getFeatures();
		return this.ge;
	},
	
	patchMethods: function() {
		dojo.mixin(this.map.methods, e.methods);
	},
	
	connect: function(feature, event, context, method) {
		var placemark = feature.baseShapes[0];
		// normalize the callback function
		method = this.normalizeCallback(feature, event, context, method);
		event = engineEvents[event];
		google.earth.addEventListener(placemark, event, method);
		return [placemark, event, method];
	},
	
	disconnect: function(connection) {
		google.earth.removeEventListener(/* placemark */connection[0], /* engineEvent */connection[1], /* method */connection[2]);
	},
	
	zoomTo: function(extent) {
		// The following code is derived from earth-api-utility-library (http://code.google.com/p/earth-api-utility-library/)
		// The earth-api-utility-library is licensed under the Apache License, Version 2.0

		var lookAtRange = 500, // the default lookat range to use when creating a view for a degenerate, single-point extent
			scaleRange = 1.5,
			aspectRatio = this.map.width/this.map.height,
			centerX = (extent[0]+extent[2])/2,
			centerY = (extent[1]+extent[3])/2,
			extentWidth = extent[2] - extent[0],
			extentHeight = extent[3] - extent[1];
		
		if (extentWidth || extentHeight) {
			var distEW = distance([extent[2], centerY], [extent[0], centerY]);
			var distNS = distance([centerX, extent[3]], [centerX, extent[1]]);
			aspectRatio = Math.min(Math.max(aspectRatio, distEW/distNS), 1.0);
			
			//experimentally derived distance formula
			var alpha = u.degToRad(45.0 / (aspectRatio + 0.4) - 2.0),
				expandToDistance = Math.max(distNS, distEW),
				beta = Math.min(u.degToRad(90), alpha + expandToDistance/(2*EARTH_RADIUS));
			lookAtRange = scaleRange * EARTH_RADIUS * (Math.sin(beta) * Math.sqrt(1 + 1 / Math.pow(Math.tan(alpha), 2)) - 1);
		}
		
		// get the current view
		var lookAt = this.ge.getView().copyAsLookAt(this.ge.ALTITUDE_RELATIVE_TO_GROUND);
		// set the position values
		lookAt.setLongitude(centerX);
		lookAt.setLatitude(centerY);
		lookAt.setAltitude(0);
		lookAt.setRange(lookAtRange);

		// update the view in Google Earth
		this.ge.getView().setAbstractView(lookAt);
	},
	
	destroy: function() {
		
	},
	
	executeBatch: function(batchFunction) {
		google.earth.executeBatch(this.ge, batchFunction);
	},
	
	enableLayer: function(layerId, enabled) {
		var ge = this.ge,
			lr = ge.getLayerRoot();
		switch (layerId) {
			case "ROADMAP":
			case "HYBRID":
				lr.enableLayerById(ge.LAYER_BORDERS, enabled);
				lr.enableLayerById(ge.LAYER_ROADS, enabled);
				break;
			case "TERRAIN":
				lr.enableLayerById(ge.LAYER_TERRAIN, enabled);
				break;
		}
	}
});

var EARTH_RADIUS = 6378135;

var distance = function(point1, point2) {
	// The following code is derived from geojs library (http://code.google.com/p/geojs/)
	// The geojs library is licensed under the Apache License, Version 2.0
	
	// calculate angular distance between two points using the Haversine formula
	var phi1 = u.degToRad(point1[1]),
		phi2 = u.degToRad(point2[1]),
		d_phi = u.degToRad(point2[1] - point1[1]),
		d_lmd = u.degToRad(point2[0] - point1[0]),
		A = Math.pow(Math.sin(d_phi/2), 2) + Math.cos(phi1) * Math.cos(phi2) * Math.pow(Math.sin(d_lmd/2), 2),
		angularDistance = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
	return EARTH_RADIUS * angularDistance;
};

}());

dojo.require("djeo.ge.Placemark");