djeo
====

### Twitter
[@djeonews](http://twitter.com/djeonews)

### Demos
Please see [Demos wiki page](https://github.com/vvoovv/djeo/wiki/demos)

### Install
* Download dojo 1.7 from http://download.dojotoolkit.org/ and unpack it
* Download djeo and unpack it to the same directory where dojo, dijit, dojox reside. Rename the top level directory vvoovv-djeo-xxxxxxx to djeo. At the end you should get 4 directories at the same level: dojo, dijit, dojox, djeo.

### Code Sample
Place a file with the code sample in a directory next to dojo, dijit, dojox, djeo directories

	<html>
	<head>
	<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
	
	<link rel="stylesheet" href="../dijit/themes/claro/claro.css"/>
	
	<!--
	Supported mapping engines (replace the value for djeoEngine parameter)
	djeo native mapping engine - djeoEngine:'djeo'
	Google Maps API - djeoEngine:'gmaps'
	Google Earth API - djeoEngine:'ge' - apply for a key at http://code.google.com/apis/maps/signup.html
	Yandex Maps API - djeoEngine:'ymaps' - apply for a key at http://api.yandex.ru/maps/form.xml
	-->
	<script src="../dojo/dojo.js" data-dojo-config="
		djeoEngine: 'djeo',
		geKey: 'ABQIAAAA-DMAtggvLwlIYlUJiASaAxRQnCpeV9jusWIeBw0POFqU6SItGxRWZhddpS8pIkVUd2fDQhzwPUWmMA',
		ymapsKey: 'AMOPgE4BAAAA9Y-BUwMAonjZ5NBRJDj54c-cDVPzQcYlLNAAAAAAAAAAAACPSuKS9WyCiMuXm9An1ZKCx5Pk-A==',
		paths: {djeo:'../djeo'}">
	</script>
	
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
				img: "http://vvoovv.github.com/ship.png"
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
	function(){
		var map = new djeo.Map("map", {
			features: features
		});
		map.ready(function(){
			new djeo.control.Navigation(map);
			new djeo.control.Highlight(map);
			new djeo.control.Tooltip(map);
		});
	});
	</script>
	
	</head>
	
	<body class="claro">
	
	<div id="map" style="width:800px;height:400px;"></div>
	
	</body>
	</html>


### Licensing Information
All the code in the **master** branch is released under Dojo Toolkit licensing terms (The "New" BSD License or The Academic Free License, v. 2.1) with some exceptions listed below.
All contributors have signed and submitted Contributors License Agreement (CLA) as required by Dojo Toolkit licensing procedure.
See <http://dojotoolkit.org/license> for the details.

The question remains open how to release Google Maps API, Google Earth Javascript API and Yandex Maps API code? It is not possible to develop a code for them without studing official documentation with code samples.

Exceptions:

1) The folder **djeo/demo/data**  
Description: Map geometries based on OpenStreetMap data.  
Original license: CC-BY-SA

2) The file **djeo/util/proj4js.js** and the folder **djeo/util/proj4js**  
Description: The library performs projection transformations; based on [Proj4js](http://trac.osgeo.org/proj4js/) library.  
Original license: LGPL

3) The file **djeo/util/jenks.js**  
Description: Javascript port of Jenks Natural Breaks Optimization in Java (Geotools library).  
Given an array of values this function splits the array into the specified number of classes in a nice way. Ported from [here](https://stat.ethz.ch/pipermail/r-sig-geo/2006-March/000811.html).  
Original license: LGPL

4) The function **zoomTo(extent)** in the file **djeo/ge/Engine.js**  
Description: Code to zoom Google Earth plugin on a specific region. The related code was derived from [earth-api-utility-library](http://code.google.com/p/earth-api-utility-library/) and [geojs library](http://code.google.com/p/geojs/).  
Both libraries are backed by Google.  
Original license: Apache License 2.0

5) The file **djeo/util/colorbrewer_data.js**  
Description: Color schemes by Cynthia A. Brewer, Geography, Pennsylvania State University. Source: <http://www.ColorBrewer2.org>  
Original license: Apache License, Version 2.0