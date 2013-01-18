var copyOnly = function(mid) {
	return mid in {};
};

var miniExclude = function(filename, mid) {
	return mid == "djeo/djeo.profile" ||
		/^djeo\/tests/.test(mid) ||
		/package.json$/.test(filename) ||
		/README.md$/.test(filename)
	;
};

var profile = {
	releaseDir: "../release",
	basePath: "..",
	action: "release",
	cssOptimize: "comments",
	mini: true,
	optimize: "closure",
	layerOptimize: "closure",
	stripConsole: "all",
	selectorEngine: "lite",
	staticHasFeatures: {
		"djeo-built": 1
	},
	layers: {
		"dojo/dojo": {
			include: [
				"dojo/dojo",
				"dojo/domReady",
				"dojo/i18n",
				
				"djeo/Map",
				// djeo/Engine is used by all engines
				"djeo/Engine",
				"djeo/control/Navigation",
				"djeo/control/Highlight",
				"djeo/control/Tooltip",
				"djeo/widget/Legend",
				"djeo/parser/osm",

				// seems to be loaded in runtime by gfx
				"djeo/dojox/gfx/path",
				// basic gfx renderers
				"djeo/dojox/gfx/svg",
				"djeo/dojox/gfx/canvasWithEvents",
				"djeo/dojox/gfx/vml"
			],
			customBase: true,
			boot: true
		},
		"djeo/native": {
			include: [
				"djeo/djeo/Engine",
				"djeo/djeo/Placemark",
				"djeo/djeo/Navigation"
			]
		},
		"djeo-gmaps/gmaps": {
			include: [
				"djeo-gmaps/Engine",
				"djeo-gmaps/Placemark",
				"djeo-gmaps/Navigation"
			]
		},
		"djeo-ymaps/ymaps": {
			include: [
				"djeo-ymaps/Engine",
				"djeo-ymaps/Placemark",
				"djeo-ymaps/Navigation"
			]
		},
		"djeo-ge/ge": {
			include: [
				"djeo-ge/Engine",
				"djeo-ge/Placemark",
				"djeo-ge/Navigation",
				"djeo-ge/Tooltip"
			]
		}
	},
	resourceTags: {
		copyOnly: function (filename, mid) {
			return copyOnly(mid);
		},
		amd: function(filename, mid) {
			return !copyOnly(mid) && /\.js$/.test(filename);
		},
		miniExclude: function(filename, mid) {
			return miniExclude(filename, mid);
		}
	}
};