define(["dojo/has"], function(has){

// module object
var u = {},
	idCounter = 0;

u.earthRadius = 6378137; // meters

var location = window.location,
	// href without search
	url = location.protocol + "//" + location.host + location.pathname
;
u.baseUrl = has("host-browser") ? url.substring(0, url.lastIndexOf('/')+1) : "";

u.uid = function() {
	idCounter += 1;
	return idCounter;
}

u.degToRad = function(degree){
	return Math.PI * degree / 180;
};

u.radToDeg = function(radian){
	return radian / Math.PI * 180;
};

u.isRelativeUrl = function(url) {
	return url.substr(0,4)=="http" ? false : true;
};

return u;
});