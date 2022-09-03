var main = {
	// Functions
	onload: function() {
		nuts.onload();

		window.setInterval(this.secInterval.bind(this), 1000);
	},
	secInterval: function() {
		// Nuts
		nuts.setNbrOwned(nuts.nbrOwned + nuts.nbrNutsPerSecond);
	}

}


// attempting to fix load problems
window.onload = function() {
	main.onload()
}