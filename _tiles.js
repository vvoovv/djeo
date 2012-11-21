define([], function(){
	
var _osm = ["WebTiles", {url: "http://[a,b,c].tile.openstreetmap.org"}],
	// MapQuest-OSM Tiles
	_mqOsm = ["WebTiles", {url: "http://otile[1,2,3,4].mqcdn.com/tiles/1.0.0/osm"}],
	// MapQuest Open Aerial Tiles
	_mqOa = ["WebTiles", {url: "http://oatile[1,2,3,4].mqcdn.com/tiles/1.0.0/sat"}]
;

return {
	"webtiles": ["WebTiles", {}],
	"roadmap": _osm,
	"osm": _osm,
	"openstreetmap": _osm,
	"osm.org": _osm,
	"openstreetmap.org": _osm,
	"mapquest-osm": _mqOsm,
	"mapquest-oa": _mqOa,
	"arcgis_webtiles": ["WebTiles", {}]
};

});