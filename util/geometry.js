define(["./bbox"], function(bbox){

// module object
var g = {};

g.center = function(feature) {
	var bb = bbox.get(feature),
		center;
	if (bb) {
		center = [ (bb[0]+bb[2])/2, (bb[1]+bb[3])/2 ];
	}
	return center;
};

return g;
});