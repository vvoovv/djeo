dojo.provide("djeo.coordArray");

(function() {
	
djeo.coordArray = {
	
	type: "CoordArray",
	
	push: function(feature, point) {
		var factory = this._getFactory(feature);
		if (!factory) return;
		factory.push(feature, point);
	},

	set: function(feature, index, point) {
		var factory = this._getFactory(feature);
		if (!factory) return;
		factory.set(feature, index, point);
	},

	_getFactory: function(feature) {
		var factory = feature.map.engine.factories.CoordArray;
		if (!factory) factory = feature.map.engine.getFactory(this.type);
		return factory;
	}

};

}());
