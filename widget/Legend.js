dojo.provide("djeo.widget.Legend");

dojo.require("dijit._Widget");
dojo.require("dijit._TemplatedMixin");

// require for djeo._getIconLegend
dojo.require("djeo.gfx");

(function(){

dojo.declare("djeo.widget.Legend", [dijit._Widget, dijit._TemplatedMixin], {
	// summary: A legend for a map.
	
	templateString: "<table dojoAttachPoint='legendNode' class='dojoxLegendNode' role='group' aria-label='map legend'><tbody dojoAttachPoint='legendBody'></tbody></table>",
	legendNode: null,
	legendBody: null,

	postCreate: function() {
		if (!this.map) return;
		
		this.refresh();
	},

	refresh: function(){
		// summary: regenerates the legend to reflect changes to the map

		// cleanup
		while(this.legendBody.lastChild){
			dojo.destroy(this.legendBody.lastChild);
		}
		
		var m = this.map,
			styleByClass = m.styleByClass,
			styleByFid = m.styleByFid;
		
		// process styleByClass
		for (var styleClass in styleByClass) {
			this._processStyle(styleByClass[styleClass], m.featuresByClass[styleClass]);
		};

		// process styleByFid
		for (var fid in styleByFid) {
			var feature = m.getFeatureById(fid);
			if (feature) this._processStyle(styleByFid[fid], [feature]);
		};
		
		// process inline styles
		this._processInlineStyle(m.document);
	},
	
	_processInlineStyle: function(featureContainer) {
		if (featureContainer.style) this._processStyle(featureContainer.style, [featureContainer]);
		dojo.forEach(featureContainer.features, function(feature) {
			if (feature.isFeatureContainer) this._processInlineStyle(feature);
			else if (feature.style) this._processStyle(feature.style, [feature]);
		}, this);
	},
	
	_processStyle: function(styles, affectedFeatures) {
		dojo.forEach(styles, function(style) {
				var getLegend = style.legend;
				if (getLegend) {
					var tr = dojo.create("tr", null, this.legendBody),
						td = dojo.create("td", null, tr),
						name = (this.getName) ? this.getName(style) : style.name;
					getLegend = dojo.isString(getLegend) ? dojo.getObject(getLegend) : getLegend;
					getLegend(td, style, affectedFeatures, name);
				}
		}, this);
	}
});


var g = djeo,
	cp = g.common.Placemark;
	
g._getBreaksIconLegend = function(domContainer, style, features, name) {
	var kwArgs = style.styleFunction.options,
		// get calculateStyle function from the kwArgs
		calculateStyle = dojo.isString(kwArgs.calculateStyle) ? dojo.getObject(kwArgs.calculateStyle) : kwArgs.calculateStyle;

	dojo.forEach(features, function(feature){
		// calculate style for the first feature in the features array
		// this triggers _breaks calculation if it wasn't done before
		var calculatedStyle = g.styling.calculateStyle(feature.features[0]),
			breaks = dojo.isArray(kwArgs.breaks) ? kwArgs.breaks : feature._breaks;

		if (breaks) {
			var numClasses = dojo.isArray(kwArgs.breaks) ? kwArgs.breaks.length - 1 : kwArgs.numClasses,
				isVectorShape = true,
				shapeType = cp.get("shape", calculatedStyle),
				src = cp.getImgSrc(calculatedStyle)
				size = src ? cp.getImgSize(calculatedStyle) : cp.getSize(calculatedStyle);
	
			if (!shapeType && src) isVectorShape = false;
			else if (!g.shapes[shapeType]) shapeType = cp.defaultShapeType;
	
			if (name) dojo.create("div", {innerHTML: name+":"}, domContainer);
			var table = dojo.create("table", null, domContainer),
				tbody = dojo.create("tbody", null, table);
				
			for (var i=numClasses-1; i>=0; i--) {
				var tr = dojo.create("tr", null, tbody),
					td1 = dojo.create("td", null, tr),
					breakStyle = {},
					width, height;
	
				// calculate break specific styling parameters
				calculateStyle(breakStyle, i, kwArgs);
	
				if (breakStyle.fill) {
					// color is assigned depending on the break
					calculatedStyle.fill = breakStyle.fill;
					width = size[0];
					height = size[1];
				}
				else {
					// icon size is assigned depending on the break
					width = (size[0] > size[1]) ? breakStyle.size : breakStyle.size*size[0]/size[1];
					height = (size[0] > size[1]) ? breakStyle.size*size[1]/size[0] : breakStyle.size;
				}
				var maxWH = Math.max(width, height);
	
				if (isVectorShape) {
					var surface = dojox.gfx.createSurface(td1, width+2, height+2),
					shapeDef = g.shapes[shapeType],
					shapeSize = shapeType=="circle" ? Math.max(width, height) : Math.max(shapeDef.size[0], shapeDef.size[1]),
					shape = shapeType=="circle" ?
						surface.createCircle({cx:width/2+1, cy:height/2+1, r:Math.min(width, height)/2}) :
						surface.createPolyline(shapeDef.points).setTransform([
							dojox.gfx.matrix.translate(width/2+1, height/2+1),
							dojox.gfx.matrix.scale(maxWH/shapeSize)
						]);
					djeo.gfx.applyFill(shape, calculatedStyle);
					djeo.gfx.applyStroke(shape, calculatedStyle, null, null, shapeSize/maxWH);
				}
				else {
					dojo.create("img", {
						src: src,
						width: width,
						height: height
					}, td1);
				}
				
				dojo.create("td", {
					innerHTML: breaks[i]+"..."+breaks[i+1]
				}, tr);
			}
		}
	});
}

g._getBreaksAreaLegend = function(domContainer, style, features, name) {
	var kwArgs = style.styleFunction.options,
		calculateStyle = dojo.isString(kwArgs.calculateStyle) ? dojo.getObject(kwArgs.calculateStyle) : kwArgs.calculateStyle;

	dojo.forEach(features, function(feature){
		// calculate style for the first feature in the features array
		// this triggers _breaks calculation if it wasn't done before
		g.styling.calculateStyle(feature.features[0]);

		var breaks = dojo.isArray(kwArgs.breaks) ? kwArgs.breaks : feature._breaks;
		if (breaks) {
			var numClasses = dojo.isArray(kwArgs.breaks) ? kwArgs.breaks.length - 1 : kwArgs.numClasses;
	
			if (name) dojo.create("div", {innerHTML: name+":"}, domContainer);
			var table = dojo.create("table", null, domContainer),
				tbody = dojo.create("tbody", null, table);
				
			for (var i=numClasses-1; i>=0; i--) {
				var tr = dojo.create("tr", null, tbody),
					breakStyle = {};
	
				calculateStyle(breakStyle, i, kwArgs);
	
				dojo.create("td", {
					innerHTML: "&nbsp;&nbsp;&nbsp;&nbsp;",
					style: {backgroundColor: breakStyle.fill}
				}, tr),
				
				dojo.create("td", {
					innerHTML: breaks[i]+"..."+breaks[i+1]
				}, tr);
			}
		}
	});
}

}());
