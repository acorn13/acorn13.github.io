var buttons = {
	
	// functions
	checkPeanutAvailable: function() {
		if(nuts.nbrOwned >=100) {
			htmlInteraction.showButton("buyPeanut10");
			htmlInteraction.enableButton("buyPeanut10");
		} else {
			htmlInteraction.disableButton("buyPeanut10");
		}
		if(nuts.nbrOwned >= 10) {
			htmlInteraction.showButton("buyPeanut");
			htmlInteraction.enableButton("buyPeanut");
		} else {
			htmlInteraction.disableButton("buyPeanut");
		}
	},

	checkTicketsAvailable: function() {
		if(peanuts.nbrOwned >= tickets.priceForOne) {
			htmlInteraction.showButton("buyTicket");
			htmlInteraction.enableButton("buyTicket");
		} else {
			htmlInteraction.disableButton("buyTicket");
		}
	},

	checkScratchCommonAvailable: function() {
		if(tickets.nbrOwnedCommon > 0) {
			htmlInteraction.showButton("scratchCommon");
			htmlInteraction.enableButton("scratchCommon");
		} else {
			htmlInteraction.disableButton("scratchCommon")
		}
	},

	checkScratchShinyAvailable: function() {
		if(tickets.nbrOwnedShiny > 0) {
			htmlInteraction.showButton("scratchShiny");
			htmlInteraction.enableButton("scratchShiny");
		} else {
			htmlInteraction.disableButton("scratchShiny")
		}
	},

	checkScratchGoldenAvailable: function() {
		if(tickets.nbrOwnedGolden > 0) {
			htmlInteraction.showButton("scratchGolden");
			htmlInteraction.enableButton("scratchGolden");
		} else {
			htmlInteraction.disableButton("scratchGolden")
		}
	},



};