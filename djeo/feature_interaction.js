dojo.provide("djeo.djeo.feature_interaction");

(function() {
	var dd = djeo.djeo;
	dd.onpointeroutDelay = 100;
	dd._pointed = {
		cancelOnpointerout: false,
		onpointeroutTimeout: null,
		control: null
	};
})();