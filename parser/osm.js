define([
	"dojo/_base/lang", // getObject, mixin
	"dojo/_base/array", // forEach
	"djeo/dojox/xml/DomParser",
	"./osm/_defaultCallbacks",
	"./osm/_defaultFeatureTree"
], function(lang, array, domParser, defaultCallbacks, defaultFeatureTree) {

var osm = {};

var defaults = {
	// return an array of features or a single feature container
	returnArray: true,
	attachTags: true,
	useAttrs: false,
	idFromOsm: true,
	//nodes without tags are ignored
	//nodesWithoutTags: false,
	waysWithoutTags: false,
	featureTree: defaultFeatureTree // array of feature containers
};

lang.mixin(defaults, defaultCallbacks);

var Parser = function(elements, args) {
	this.elements = elements;
	lang.mixin(this, args);

	this.features = [];

	this.nodesById = {};
	this.waysById = {};
	
	this.parse = function() {
		var numElements=elements.length;
		// first pass
		for (var i=0; i<numElements; i++) {
			var e = elements[i],
				type = e.nodeName
			;
			if (type == "#text") continue;
			// action normally can be equal to "delete" or "modify"
			// we don't consider elements with action attribute
			if (e.getAttribute("action") == "delete") continue;

			var id = e.getAttribute("id");
			// save id for future reference
			e.id = id;
			if (type == "node") {
				// save coords for future reference
				e.lon = parseFloat(e.getAttribute("lon"));
				e.lat = parseFloat(e.getAttribute("lat"));
				this.nodesById[id] = e;
			}
			else if (type == "way") {
				this.waysById[id] = e;
			}
		}
		
		this.onBegin();
		// second pass
		for (var i=0; i<numElements; i++) {
			var e = elements[i],
				type = e.nodeName
			;
			if (type == "#text") continue;
			// action normally can be equal to "delete" or "modify"
			// we don't consider elements with action attribute
			if (e.getAttribute("action") == "delete") continue;

			var id = e.id,
				attrs = this.getAttrs(e),
				feature
			;
			switch (type) {
				case "node":
					if (attrs) {
						feature = this.createFeature(e, attrs);
						feature.type = "Point";
						feature.coords = [e.lon, e.lat];
						this.onNode(e, feature);
					}
					break;
				case "way":
					if (attrs || this.waysWithoutTags) {
						var feature = this.createFeatureFromWay(e, attrs);
						if (feature) {
							this.onWay(e, feature);
						}
					}
					break;
				case "relation":
					this.onRelation(e)
					break;
			}
		}
		this.onComplete();

		if (this.returnArray) {
			// set projection for each top level feature
			array.forEach(this.features, function(f){
				f.projection = "EPSG:4326";
			})
		}
		return this.returnArray ?
			this.features :
			{
				projection: "EPSG:4326",
				features: this.features
			};
	};
	
	this.getAttrs = function(element) {
		var attrs,
			tags = element.getElementsByTagName("tag"),
			numTags = tags.length
		;
		if (numTags > 0) {
			attrs = {};
			for (var i=0; i<numTags; i++) {
				var tag = tags[i],
					k = tag.getAttribute("k"),
					v = tag.getAttribute("v")
				;
				attrs[k] = v;
			}
		}
		return attrs;
	};
	
	this.createFeature = function(element, attrs) {
		var feature = (this.attachTags && attrs && !this.useAttrs) ? attrs : {};
		if (this.attachTags && attrs && this.useAttrs) feature.attrs = attrs;
		if (this.idFromOsm) {
			feature.id = element.id;
		}
		return feature;
	};
	
	this.createFeatureFromWay = function(way, attrs) {
		var nds = way.getElementsByTagName("nd"),
			numNodes = nds.length,
			type = "LineString",
			coords = []
		;
		if (numNodes<2) return null;
		var feature = this.createFeature(way, attrs);

		// check if we have a Polygon
		if (numNodes>2) {
			var firstId = nds[0].getAttribute("ref"),
				lastId = nds[numNodes-1].getAttribute("ref")
			;
			if (firstId == lastId) {
				type = "Polygon";
				feature.coords = [coords];
			}
		}

		feature.type = type;
		if (!feature.coords) feature.coords = coords;

		// compose coords array
		for (var i=0; i<numNodes; i++) {
			var id = nds[i].getAttribute("ref"),
				node = this.nodesById[id]	
			;
			coords.push([node.lon, node.lat])
		}
		return feature;
	};
	
	// The following 3 functions: isPoint, isArea, isLine are used as substitutions
	// for the same functions from djeo/Placemark
	
	this.isPoint = function(f) {
		return (f.type == "Point");
	};
	
	this.isArea = function(f) {
		return (f.type == "Polygon" || f.type == "MultiPolygon");
	};
	
	this.isLine = function(f) {
		return (f.type == "LineString" || f.type == "MultiLineString");
	};
};

osm.parse = function(str, args) {
	if (!str) {
		// TODO
	}
	args = lang.mixin(lang.clone(defaults), args ? args : {});
	var topElements = domParser.parse(str).childNodes,
		osmElement = (topElements[0].nodeName == "osm") ? topElements[0] : topElements[1],
		elements = osmElement.childNodes
	;

	var parser = new Parser(elements, args);
	return parser.parse();
};

osm.parseFromUrl = function(url, args) {
	var str;
	require.getText(url, true, function(_str){
		str = _str;
	});
	return osm.parse(str, args);
}

return osm;

});