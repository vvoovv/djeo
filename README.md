djeo
====

## Twitter
[@djeonews](http://twitter.com/djeonews)

## Demos
Please see [Demos wiki page](https://github.com/vvoovv/djeo/wiki/demos)

## Installation

### Built version

If you never worked with Dojo Toolkit, we recommend to download the latest built version of the djeo library from [here](https://www.dropbox.com/sh/gmaxzy6sr02zewj/6GUGBUFsbl/djeo_0.3.0.zip).
Unpack the archive and start from _helloworld/helloworld.html_. There are examples from the djeo [tutorial](https://github.com/vvoovv/djeo-tutorial) in the _djeo-tutorial_ directory.

If you want to play with demos available online [here](https://github.com/vvoovv/djeo/wiki/demos), download an extra [pack](https://www.dropbox.com/sh/gmaxzy6sr02zewj/PSgPea26az/demos.zip) and unzip the archive directories next to _djeo_ and _dojo_ directories. The demos are located in the _djeo-demos_ directory.

### For advanced development
If you are an experienced Dojo Toolkit developer or you would like to make a custom djeo build, read [the article](https://github.com/vvoovv/djeo/wiki/Advanced-Development-with-djeo).

## Learning djeo
The "Hello World!" application is more or less self explaining. It can be found in the built version of djeo (see above). The code of the application is also presented below.

A tutorial (under development) is located [here](https://github.com/vvoovv/djeo/wiki/Tutorial). Examples from the tutorial can be found in the built version under _djeo-tutorial_ directory or in the [djeo-tutorial](https://github.com/vvoovv/djeo-tutorial) repo.

## Code Sample
Place a file with the code sample in a directory next to dojo, dijit, djeo directories

	<html>
	<head>
	<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
	
	<link rel="stylesheet" href="../dijit/themes/claro/claro.css"/>
	
	<!--
	Supported mapping engines (replace the value for djeoEngine parameter)
	Leaflet - djeoEngine:'leaflet'
	Google Maps API - djeoEngine:'gmaps'
	Google Earth API - djeoEngine:'ge'
	ArcGIS API for JavaScript - djeoEngine: 'esri'
	Yandex Maps API - djeoEngine:'ymaps'
	native djeo engine - djeoEngine:'djeo'
	-->
	<script src="../dojo/dojo.js" data-dojo-config="
		djeoEngine: 'leaflet'
	"></script>
	
	<script>
	var features = [
		{
			name: "Bermuda triangle",
			type: "Polygon",
			coords: [ [ [-64.89,32.24], [-80.15,25.7], [-66.07,18.46], [-64.89,32.24] ] ],
			style: {
				fill: "lime",
				fillOpacity: 0.6,
				stroke: "green",
				strokeWidth: 3
			}
		},
		{
			name: "Paris-London railway",
			type: "LineString",
			coords: [ [2.36,48.88], [3.08,50.64], [1.81,50.90], [0.87,51.14], [-0.13,51.53] ],
			style: {
				stroke: "red",
				strokeWidth: 2
			}
		},
		{
			name: "Hello world!",
			type: "Point",
			coords: [-30, 30],
			style: {
				size: [49, 60],
				img: "http://djeo.github.com/ship.png"
			}
		}
	];
	
	require([
		"djeo/Map",
		"djeo/control/Navigation",
		"djeo/control/Highlight",
		"djeo/control/Tooltip",
		"dojo/domReady!"
	],
	function(Map, Navigation, Highlight, Tooltip){
		var map = new Map("map", {
			features: features,
			layers: "roadmap",
			//layers: "webtiles:http://[a,b,c].tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/1/256"
		});
		map.ready(function(){
			new Navigation(map);
			new Highlight(map);
			new Tooltip(map);
		});
	});
	</script>
	
	</head>
	
	<body class="claro">
	
	<div id="map" style="width:800px;height:400px;"></div>
	
	</body>
	</html>


## License
The "New" BSD License or The Academic Free License, v. 2.1.

All contributors are required to sign a Contributors License Agreement (CLA). See <http://dojotoolkit.org/license> for the details.
