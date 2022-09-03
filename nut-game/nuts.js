var nuts = {

	// Variables
	nbrOwned: 0,
	nbrNutsPerSecond: 1,

	// Functions
    onload: function() {
        this.setNbrOwned(0); // We first have 0 nuts
    },

	setNbrOwned: function(value) {
		this.nbrOwned = value;
		buttons.checkPeanutAvailable();
		if(this.nbrOwned != 1) {
			htmlInteraction.setInnerHtml("nuts", "You have " + this.nbrOwned + " nuts!");
		} else {
			htmlInteraction.setInnerHtml("nuts", "You have " + this.nbrOwned + " nut!");
		}
	}

};