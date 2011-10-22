dojo.provide("djeo.ge.Model");

(function() {

var g = djeo,
	u = g.util,
	e = g.ge;

dojo.declare("djeo.ge.Model", null, {
	
	constructor: function(kwArgs) {
		dojo.mixin(this, kwArgs);
	},

	render: function(feature) {
		var engine = this.engine,
			ge = engine.ge,
			modelHref = feature.href;

		modelHref = u.isRelativeUrl(modelHref) ? u.baseUrl+engine.map.modelBasePath+modelHref : modelHref;

		google.earth.fetchKml(ge, modelHref, dojo.hitch(this, function(kmlFeature) {
			if (kmlFeature) {
				var kmlModel;
				// derived from KmlContainer
				if ( kmlFeature.getElementsByType) {
					kmlModel = kmlFeature.getElementsByType("KmlModel");
					kmlModel = kmlModel.getLength() ? kmlModel.item(0) : null;
				}
				else if (kmlFeature.getType()=="KmlPlacemark") {
					kmlModel = kmlFeature.getGeometry();
				}
				if (kmlModel) {
					if (e.altitudeModes[feature.altitudeMode]) kmlModel.setAltitudeMode(ge[e.altitudeModes[feature.altitudeMode]]);
					if (location) this.setLocation(feature.location, kmlModel);
					feature.model = kmlModel;
					ge.getFeatures().appendChild(kmlModel.getParentNode());
				}
			}
		}));
	},
	
	translate: function(position, feature) {
		if (feature.map.renderModels) {
			if (feature.model) this.setLocation(position, feature.model);
		}
		else {
			this.engine.factories.Placemark.translate(position, feature);
		}
	},
	
	rotate: function(orientation, feature) {
		if (feature.map.renderModels) {
			if (feature.model) this.setOrientation(orientation, feature.model);
		}
		else {
			var heading = this.orientation.heading;
			if (heading !== undefined) this.engine.factories.Placemark.rotate(heading, feature);
		}
	},
	
	setLocation: function(location, kmlModel) {
		if (!location) return;
		var kmlLocation = kmlModel.getLocation(),
			altitude = 0;
		if (location.length==3) altitude = location[2];
		kmlLocation.setLatLngAlt(location[1], location[0], altitude);
	},
	
	setOrientation: function(orientation, kmlModel) {
		var kmlOrientation = kmlModel.getOrientation();
		if (orientation.heading !== undefined) {
			kmlOrientation.setHeading( u.radToDeg(orientation.heading) );
		}
	},
	
	remove: function(feature) {
		if (feature.map.renderModels) {
			var placemark = feature.model.getParentNode();
			placemark.getParentNode().getFeatures().removeChild(placemark);
		}
		else {
			this.engine.factories.Placemark.remove(feature);
		}
	}

});

}());
