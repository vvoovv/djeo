djeo
====

### Install ###
* Download dojo 1.7 from http://download.dojotoolkit.org/ and unpack it
* Download djeo and unpack it to the same directory where dojo, dijit, dojox reside. Rename the top level directory vvoovv-djeo-xxxxxxx to djeo. At the end you should get 4 directories at the same level: dojo, dijit, dojox, djeo.

### Code Sample ###
Place a file with the code sample in a directory next to dojo, dijit, dojox, djeo directories
	<html>
	<head>
	<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
	
	<link rel="stylesheet" href="../dijit/themes/claro/claro.css"/>
	
	<!-- uncomment it if you plan to use Google Maps
	<script src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>
	-->
	<!-- uncomment it if you plan to use Google Earth browser plugin and copy your own key; apply for a key at http://code.google.com/apis/maps/signup.html
	<script src="https://www.google.com/jsapi?key=ABQIAAAA-DMAtggvLwlIYlUJiASaAxRQnCpeV9jusWIeBw0POFqU6SItGxRWZhddpS8pIkVUd2fDQhzwPUWmMA"></script>
	-->
	<!-- uncomment it if you plan to use Yandex Maps and copy your own key; apply for a key at http://api.yandex.ru/maps/form.xml
	<script src="http://api-maps.yandex.ru/1.1/index.xml?key=AMOPgE4BAAAA9Y-BUwMAonjZ5NBRJDj54c-cDVPzQcYlLNAAAAAAAAAAAACPSuKS9WyCiMuXm9An1ZKCx5Pk-A=="></script>
	-->
	
	<!--
	Supported mapping engines (replace the value for djeoEngine parameter)
	dojo.gfx - djeoEngine:'gfx'
	Google Maps API - djeoEngine:'gmaps'
	Google Earth API - djeoEngine:'ge'
	Yandex Maps API - djeoEngine:'ymaps'
	-->
	<script src="../dojo/dojo.js" data-dojo-config="djeoEngine:'gfx', paths:{djeo:'../djeo'}"></script>
	
	<script>
	// always include the the next line if you plan to use Google Earth browser plugin
	if (dojo.config.djeoEngine=="ge") dojo.require("djeo.ge.Engine");
	
	dojo.require("djeo.Map");
	dojo.require("djeo.control.Navigation");
	dojo.require("djeo.control.Highlight");
	dojo.require("djeo.control.Tooltip");
	
	var features = [
		{
			name: "Bermuda triangle",
			type: "Polygon",
			coords: [[[-64.89,32.24], [-80.15,25.7], [-66.07,18.46], [-64.89,32.24]]],
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
			coords: [[2.36,48.88], [3.08,50.64], [1.81,50.90], [0.87,51.14], [-0.13,51.53]],
			style: {
				stroke: "red",
				strokeWidth: 2
			}
		},
		{
			name: "Dojo Toolkit",
			type: "Point",
			coords: [-30, 30],
			style: {
				size: [123,56],
				img: "http://dojotoolkit.org/images/logo.png"
			}
		}
	];
	
	dojo.ready(function(){
		map = new djeo.Map("map", {
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
