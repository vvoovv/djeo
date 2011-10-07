dojo.provide("djeo.ge.Navigation");

dojo.declare("djeo.ge.Navigation", null, {

	enable: function(enable) {
		if (enable === undefined) enable = true;
		this.map.engine.ge.getOptions().setMouseNavigationEnabled(enable);
	}
});