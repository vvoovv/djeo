var dojoConfig = {
	async: true,
	packages: [
		{name: "dojo", location: "./dojo"},
		{name: "dijit", location: "./dijit"},
		{name: "dojox", location: "./dojox"}, // needed by djeo-esri
		{name: "djeo", location: "./djeo"},
		{name: "tiles", location: "./tiles"},
		{name: "djeo-gmaps", location: "./djeo-gmaps"},
		{name: "djeo-ge", location: "./djeo-ge"},
		{name: "djeo-ymaps", location: "./djeo-ymaps"},
		{name: "djeo-leaflet", location: "./djeo-leaflet"},
		{name: "djeo-esri", location: "./djeo-esri"},
		{name: "xstyle", location: "./xstyle"} // needed by djeo-leaflet
	]
};