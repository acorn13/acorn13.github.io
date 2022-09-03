var htmlInteraction = {

	getElement: function(id) {
		return document.getElementById(id);
	},

	setElementVisibility: function(id, bool) {
        if (bool) this.getElement(id).style.visibility = "visible";
        else this.getElement(id).style.visibility = "hidden";
    },

	setInnerHtml: function(id, value) {
		this.getElement(id).innerHTML = value;
	},

	showButton: function(id) {
		this.setElementVisibility(id, true);
	},

	enableButton: function(id) {
		this.getElement(id).disabled = false;
	},

	disableButton: function(id) {
		this.getElement(id).disabled = true;
	},

}