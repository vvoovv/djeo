dojo.require("djeo.tests.data.usa_geometries");
dojo.require("djeo.tests.data.usa_features");
dojo.require("djeo.tests.data.usa_some_railways");

var style = [
	{
		// all style attributes from this style block are applied to all map features;
		// some attributes may be overriden by next style blocks
		stroke: "black",
		strokeWidth: 1,
		fill: "lightgrey",
		// size is applicable to point features only
		size: 20
	},
	{
		// the following style attributes are applied to features
		// that have styleClass attribute equal to "styleForAreas"
		styleClass: "styleForAreas",
		// in addition, the style attributes are applied only if
		// the filter is evaluated to true for the map feature;
		// "pd" (i.e. population density) is supposed to be an attribute of the map feature
		filter: "this.pd<=52.38",
		// if applied, the style attributes override the attributes from the previous style block;
		// in this case fill="orange" overrides fill="lightgrey" from the previous style block
		fill: "white"
	},
	{
		// see explanations in the previous style block
		styleClass: "styleForAreas",
		filter: "this.pd>52.38 && this.pd<=188.64",
		fill: "lime",
		stroke: "blue",
		strokeWidth: 2
	},
	{
		// the following style attributes are applied to the feature with id="US-CA" (California)
		fid: "US-CA",
		polygon: {
			// the attributes inside polygon block are applied to polygon map features only;
			// this is referred to as "specific" style;
			// use "line" for line strings;
			// use "point" for point map features
			fillOpacity: 0.5,
			fill: "blue",
			stroke: "brown"
		}
	},
	{
		// the following style attributes are applied to the features
		// with id="US-IL" (Illinois) or id="US-OH" (Ohio)
		fid: ["US-IL","US-OH"],
		polygon: {
			fill: "green",
			stroke: "cyan"
		}
	}
]

var features = [
	{
		id: "areas",
		// define styleClass for the feature
		styleClass: "styleForAreas",
		features: djeo.tests.data.usa_features,
		style: {
			// it's possible to define styling themes for map features;
			// if "theme" attribute is not set for a style block, a default theme is assumed;
			// otherwise the style block is applied if the feature is rendered with the specified theme
			theme: "highlight",
			stroke: "red",
			strokeWidth: 4,
			// it's possible to supply a javascript function
			// that injects styling attributes to the calculated style for the given feature;
			// the function accepts 3 parameters:
			//   feature: the feature under consideration
			//   style: a javascript object that represent the current state of the feature's calculated style
			//   styleFunctionDef: the value of styleFunction attribute of the style block
			// getStyle attribute of the styleFunction javascript object is mandatory;
			// getStyle attribute could be also a string specifying the actual function name
			styleFunction: {
				getStyle: function(feature, style, styleFunctionDef) {
					if (feature.id == "US-PA") style.fill = "yellow";
				}
			}
		}
	},
	{
		// inline style always overrides styling attributes defined with styleClass and
		// inline styles located before in the map feature hierarchy
		style: {
			fill: "lime",
			stroke: "green",
			strokeWidth: 4
		},
		features: {
			name: "A polygon with a hole",
			type: "Polygon",
			coords: [
				// define outer polygon ring
				[[-170,45],[-160,45],[-160,35],[-170,35],[-170,45]],
				// define inner polygon ring
				[[-168,43],[-168,37],[-162,37],[-162,43],[-168,43]]
			]
		}
	},
	{
		id: "railways",
		style: [
			{
				stroke: "red",
				strokeWidth: 3
			},
			{
				// there are 2 features in the current container:
				// the first one with type="LineString";
				// the second one with type="MultiLineString";
				// this style block is applied to the first feature only
				filter: "this.type=='LineString'",
				// it's possible to render several lines (e.g. to simulate line casing);
				// in this case we get yellow line with red casing;
				// use "lines" attribute to define multiple lines for a LineString or a MultiLineString;
				// only gfx mapping engine supports this;
				// the other mapping engines will render only one line
				lines: [
					{
						// define lower line
						// the color for the line ("red") is taken from the previous styling block
						strokeWidth: 10
					},
					{
						// define upper line
						strokeWidth: 6,
						stroke: "yellow"
					}
				]
			}
		],
		features: djeo.tests.data.usa_some_railways
	},
	{
		// define point map features in this feature container
		features: [
			{
				type: "Point",
				coords: [-122.42, 37.77],
				style: {
					// define vector shape "cross";
					// the other vector shapes defined are "circle", "star", "square", "triangle", "x";
					// the size (30) of the shape is inherited from previous style blocks;
					// only gfx mapping engine supports vector shapes;
					// white bitmap images are used as proxies for the other mapping engines;
					// however Google Earth can apply color to bitmap images
					shape:"cross",
					fill:"brown"
				},
				name: "San Francisco"
			},
			{
				type: "Point",
				coords: [-122.33, 47.61],
				style: {
					// define specific style for the point map feature
					point:{
						shape:"star",
						fill:"green",
						size:50,
						stroke: "red"
					}
				},
				name: "Seattle"
			},
			{
				type: "Point",
				coords:[-74, 40.71],
				style: [
					{
						size: 30,
						// use "points" attribute to define multiple point shapes for a point feature;
						// only gfx mapping engine supports this;
						// see the comments above for the "lines" attribute
						points: [
							{
								// define lower point shape
								shape: "circle",
								fill: "blue"
							},
							{
								// define upper point shape
								shape: "cross",
								strokeWidth: 0,
								fill: "red"
							}
						]
					},
					{
						// define style for the "highlight" theme
						theme: "highlight",
						points: [
							{
								// red color will be applied the lower shape
								fill: "red"
							},
							{
								// blue color will be applied to the upper shape
								fill: "blue"
							}
						]
					}
				],
				name: "New York City"
			},
			{
				type: "Point",
				coords: [-118.24, 34.05],
				style: {
					shape:"triangle",
					fill:"yellow"
				},
				name: "Los Angeles"
			},
			{
				type: "Point",
				coords: [-104.98, 39.74],
				style: {
					shape:"x",
					fill:"red"
				},
				name: "Denver"
			},
			{
				type: "Point",
				coords: [-96.8, 32.78],
				style: {
					// fill color, line color, line width and other applicable attributes are
					// inherited from previous style blocks 
					shape: "square"
				},
				name: "Dallas"
			},
			{
				type: "Point",
				coords: [-87.65, 41.85],
				style: {
					fill: "pink",
					stroke: "yellow",
					strokeWidth: 3,
					shape: "circle"
				},
				name: "Chicago"
			},
			{
				type: "Point",
				coords: [-90.05, 35.15],
				style: {
					// define a bitmap image for the point map feature
					// it is mandatory to specify a size for the image
					size: [28, 22],
					// it's also possible to define an image like this:
					// img: {src: "resources/icons/load.png", size: [28, 22]}
					img: "resources/icons/load.png",
					// magnify the image by factor of 2
					scale: 2
				},
				name: "Memphis"
			}
		]
	}
];