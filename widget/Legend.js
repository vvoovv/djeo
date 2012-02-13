define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // isString, isArray, getObject
	"dojo/_base/array", // forEach
	"dojo/dom-construct", // create, destroy
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"djeo/dojox/gfx",
	"djeo/dojox/gfx/matrix",
	"djeo/_base",
	"djeo/common/Placemark",
	"djeo/gfx", //_getIconLegend
	"djeo/Style"
], function(declare, lang, array, domConstruct, _Widget, _TemplatedMixin, gfx, matrix, djeo, P, dx) {

var Legend = declare([_Widget, _TemplatedMixin], {
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
			domConstruct.destroy(this.legendBody.lastChild);
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
		array.forEach(featureContainer.features, function(feature) {
			if (feature.isContainer) this._processInlineStyle(feature);
			else if (feature.style) this._processStyle(feature.style, [feature]);
		}, this);
	},
	
	_processStyle: function(styles, affectedFeatures) {
		array.forEach(styles, function(style) {
				var getLegend = style.legend;
				if (getLegend) {
					var tr = domConstruct.create("tr", null, this.legendBody),
						td = domConstruct.create("td", null, tr),
						name = (this.getName) ? this.getName(style) : style.name;
					getLegend = lang.isString(getLegend) ? lang.getObject(getLegend) : getLegend;
					getLegend(td, style, affectedFeatures, name);
				}
		}, this);
	}
});
	
Legend._getBreaksIconLegend = function(domContainer, style, features, name) {
	var kwArgs = style.composerOptions,
		// get composeStyle function from the kwArgs
		composeStyle = lang.isString(kwArgs.composeStyle) ? lang.getObject(kwArgs.composeStyle) : kwArgs.composeStyle;

	array.forEach(features, function(feature){
		// calculate style for the first feature in the features array
		// this triggers _breaks calculation if it wasn't done before
		var calculatedStyle = djeo.calculateStyle(feature.features[0]),
			breaks = lang.isArray(kwArgs.breaks) ? kwArgs.breaks : feature._breaks;

		if (breaks) {
			var numClasses = lang.isArray(kwArgs.breaks) ? kwArgs.breaks.length - 1 : kwArgs.numClasses,
				isVectorShape = true,
				shapeType = P.get("shape", calculatedStyle),
				src = P.getImgSrc(calculatedStyle)
				size = src ? P.getImgSize(calculatedStyle) : P.getSize(calculatedStyle);
	
			if (!shapeType && src) isVectorShape = false;
			else if (!djeo.shapes[shapeType]) shapeType = P.defaultShapeType;
	
			if (name) domConstruct.create("div", {innerHTML: name+":"}, domContainer);
			var table = domConstruct.create("table", null, domContainer),
				tbody = domConstruct.create("tbody", null, table);
				
			for (var i=numClasses-1; i>=0; i--) {
				var tr = domConstruct.create("tr", null, tbody),
					td1 = domConstruct.create("td", null, tr),
					breakStyle = {},
					width, height;
	
				// calculate break specific styling parameters
				composeStyle(breakStyle, i, kwArgs);
	
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
					var surface = gfx.createSurface(td1, width+2, height+2),
					shapeDef = djeo.shapes[shapeType],
					shapeSize = shapeType=="circle" ? Math.max(width, height) : Math.max(shapeDef.size[0], shapeDef.size[1]),
					shape = shapeType=="circle" ?
						surface.createCircle({cx:width/2+1, cy:height/2+1, r:Math.min(width, height)/2}) :
						surface.createPolyline(shapeDef.points).setTransform([
							matrix.translate(width/2+1, height/2+1),
							matrix.scale(maxWH/shapeSize)
						]);
					dx.applyFill(shape, calculatedStyle);
					dx.applyStroke(shape, calculatedStyle, null, null, shapeSize/maxWH);
				}
				else {
					domConstruct.create("img", {
						src: src,
						width: width,
						height: height
					}, td1);
				}
				
				domConstruct.create("td", {
					innerHTML: breaks[i]+"..."+breaks[i+1]
				}, tr);
			}
		}
	});
}

Legend._getBreaksAreaLegend = function(domContainer, style, features, name) {
	var kwArgs = style.composerOptions,
		composeStyle = lang.isString(kwArgs.composeStyle) ? lang.getObject(kwArgs.composeStyle) : kwArgs.composeStyle;

	array.forEach(features, function(feature){
		// calculate style for the first feature in the features array
		// this triggers _breaks calculation if it wasn't done before
		djeo.calculateStyle(feature.features[0]);

		var breaks = lang.isArray(kwArgs.breaks) ? kwArgs.breaks : feature._breaks;
		if (breaks) {
			var numClasses = lang.isArray(kwArgs.breaks) ? kwArgs.breaks.length - 1 : kwArgs.numClasses;
	
			if (name) domConstruct.create("div", {innerHTML: name+":"}, domContainer);
			var table = domConstruct.create("table", null, domContainer),
				tbody = domConstruct.create("tbody", null, table);
				
			for (var i=numClasses-1; i>=0; i--) {
				var tr = domConstruct.create("tr", null, tbody),
					breakStyle = {};
	
				composeStyle(breakStyle, i, kwArgs);
	
				domConstruct.create("td", {
					innerHTML: "&nbsp;&nbsp;&nbsp;&nbsp;",
					style: {backgroundColor: breakStyle.fill}
				}, tr),
				
				domConstruct.create("td", {
					innerHTML: breaks[i]+"..."+breaks[i+1]
				}, tr);
			}
		}
	});
}

return Legend;
});
