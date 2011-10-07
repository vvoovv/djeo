dojo.provide("djeo.gmaps.Navigation");

dojo.declare("djeo.gmaps.Navigation", null, {

	enable: function(enable) {
		if (enable === undefined) enable = true;
		this.map.engine.gmap.setOptions({
			disableDoubleClickZoom: !enable,
			draggable: enable,
			scrollwheel: enable
		});
	}
});