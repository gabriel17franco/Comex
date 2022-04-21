sap.ui.define([], function () {
  "use strict";

  return {
    /**
     * Rounds the currency value to 2 digits
     *
     * @public
     * @param {string} sValue value to be formatted
     * @returns {string} formatted currency value with 2 digits
     */
    currencyValue: function (sValue) {
      if (!sValue) {
        return "";
      }

      return parseFloat(sValue).toFixed(2);
    },

    getLaterButtonText: function (sValue) {
      var ResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();
      if (sValue === "") {
        return ResourceBundle.getText("post");
      } else {
        return ResourceBundle.getText("reverse");
      }
    },
    getLaterButtonType: function (sValue) {
      if (sValue === "") {
        return "Accept";
      } else {
        return "Reject";
      }
    },

	getLaterButtonIcon: function (sValue) {
		if (sValue === "") {
		  return "sap-icon://media-play";
		} else {
		  return "sap-icon://media-reverse";
		}
	  },

  };
});
