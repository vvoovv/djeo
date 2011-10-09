dojo.require("djeo.tests.data.usa_geometries");
dojo.require("djeo.tests.data.usa_features");
dojo.require("djeo.tests.data.usa_some_railways");

var style = [
	{
		stroke: "black",
		strokeWidth: 1,
		fill: "lightgrey",
		size: 20
	},
	{
		styleClass: "styleForAreas",
		filter: "this.pd<=52.38",
		fill: "orange"
	},
	{
		styleClass: "styleForAreas",
		filter: "this.pd>52.38 && this.pd<=188.64",
		fill: "lime",
		stroke: "blue",
		strokeWidth: 2
	},
	{
		fid: "US-CA",
		polygon: {
			fillOpacity: 0.5,
			fill: "blue",
			stroke: "brown"
		}
	},
	{
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
		styleClass: "styleForAreas",
		features: djeo.tests.data.usa_features,
		style: {
			theme: "highlight",
			reset: true,
			stroke: "red",
			strokeWidth: 4,
			styleFunction: {
				getStyle: function(feature, style, styleFunctionDef) {
					if (feature.id == "US-PA") style.fill = "yellow";
				}
			}
		}
	},
	{
		style: {
			fill: "lime",
			stroke: "green",
			strokeWidth: 4
		},
		features: {
			name: "A polygon with a hole",
			type: "Polygon",
			coords: [
				[[-170,45],[-160,45],[-160,35],[-170,35],[-170,45]],
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
				filter: "this.type=='LineString'",
				lines: [
					{
						strokeWidth: 10
					},
					{
						strokeWidth: 6,
						stroke: "yellow"
					}
				]
			}
		],
		features: djeo.tests.data.usa_some_railways
	},
	{
		features: [
			{
				type: "Point",
				coords:[-74, 40.71],
				style: [
					{
						size: 30,
						points: [
							{
								shape: "circle",
								fill: "blue"
							},
							{
								shape: "cross",
								strokeWidth: 0,
								fill: "red"
							}
						]
					},
					{
						theme: "highlight",
						points: [
							{
								fill: "red"
							},
							{
								fill: "blue"
							}
						]
					}
				],
				name: "New York City"
			},
			{
				type: "Point",
				coords: [-122.33, 47.61],
				style: {
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
				coords: [-122.42, 37.77],
				style: {
					shape:"cross",
					fill:"brown"
				},
				name: "San Francisco"
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
					size: [28, 22],
					img: "resources/icons/load.png",
					scale: 2
				},
				name: "Memphis"
			}
		]
	}
];