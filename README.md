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