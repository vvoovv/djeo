dojo.provide("djeo.gfx.feature_interaction");

(function() {
	var gg = djeo.gfx;
	gg.onpointeroutDelay = 100;
	gg._pointed = {
		cancelOnpointerout: false,
		onpointeroutTimeout: null,
		control: null
	};
})();