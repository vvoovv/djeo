djeo
====

## Twitter
[@djeonews](http://twitter.com/djeonews)

## Demos
Please see [Demos wiki page](https://github.com/vvoovv/djeo/wiki/demos)

## Installation

### Built version

If you never worked with Dojo Toolkit, we recommend to download the latest built version of the djeo library from [here](https://github.com/vvoovv/djeo/downloads).
Unpack the archive and start from helloworld/helloworld.html

### Automatic Download with CPM

djeo can be installed via [CPM](https://github.com/kriszyp/cpm) using the following command:

    cpm install djeo

If you are going to use alternative engines for djeo (Leaflet, Google Maps API, Google Earth Javascript API, ArcGIS API for JavaScript, Yandex Maps API),
execute one or several of the following commands:
    
	cpm install djeo-leaflet
	cpm install djeo-gmaps
	cpm install djeo-ge
	cpm install djeo-esri
	cpm install djeo-ymaps

### Manual Download

Alternatively, djeo and its dependencies can be downloaded individually:

* [djeo](https://github.com/vvoovv/djeo)
* [The Dojo Toolkit](http://dojotoolkit.org/download/) SDK version 1.7.3

If you are going to use alternative engines for djeo (Leaflet, Google Maps API, Google Earth Javascript API, ArcGIS API for JavaScript, Yandex Maps API),
then download one or several of the following items:

* [djeo-leaflet](https://github.com/vvoovv/djeo-leaflet)
* [djeo-gmaps](https://github.com/vvoovv/djeo-gmaps)
* [djeo-ge](https://github.com/vvoovv/djeo-ge)
* [djeo-esri](https://github.com/vvoovv/djeo-esri)
* [djeo-ymaps](https://github.com/vvoovv/djeo-ymaps)

Arrange all items as siblings, resulting in a directory structure like the following:

* `djeo`
* `dojo`
* `dijit`
* `djeo-leaflet` (optional, Leaflet)
* `djeo-gmaps` (optional, Google Maps API)
* `djeo-ge` (optional, Google Earth Javascript API)
* `djeo-esri` (optional, ArcGIS API for JavaScript)
* `djeo-ymaps` (optional, Yandex Maps API)


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