/*global history */
sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
  function (Controller, History) {
    "use strict";

    return Controller.extend("comex.zcomexapp.controller.BaseController", {
      /**
       * Convenience method for accessing the router in every controller of the application.
       * @public
       * @returns {sap.ui.core.routing.Router} the router for this component
       */
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      /**
       * Convenience method for getting the view model by name in every controller of the application.
       * @public
       * @param {string} sName the model name
       * @returns {sap.ui.model.Model} the model instance
       */
      getModel: function (sName) {
        return this.getView().getModel(sName);
      },

      /**
       * Convenience method for setting the view model in every controller of the application.
       * @public
       * @param {sap.ui.model.Model} oModel the model instance
       * @param {string} sName the model name
       * @returns {sap.ui.mvc.View} the view instance
       */
      setModel: function (oModel, sName) {
        return this.getView().setModel(oModel, sName);
      },

      /**
       * Convenience method for getting the resource bundle.
       * @public
       * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
       */
      getResourceBundle: function () {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
      },

      /**
       * Event handler for navigating back.
       * It there is a history entry we go one step back in the browser history
       * If not, it will replace the current entry of the browser history with the master route.
       * @public
       */
      onNavBack: function () {
        var sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          history.go(-1);
        } else {
          this.getRouter().navTo("master", {}, true);
        }
      },

      onTemplateDownloadPress: function (oEvent) {
        var oModel = this.getView().getModel();
        if (!this._oList) {
          var SelectedContext = oEvent.getSource().getBindingContext();
          var sPath = SelectedContext.getPath() + "/" + "GetAttachments";
        } else {
          SelectedContext = this._oList.getSelectedItem().getBindingContext();
          sPath = this._oList.getSelectedContextPaths() + "/" + "GetAttachments";
        };
        var Invoice = SelectedContext.getProperty("Invoice");
        oModel.read(sPath, {
          success: function (oData, oResponse) {
            // var blob = window.atob(oData.results[0].CsvContent);
            var link = document.createElement("a");
            if (link.download !== undefined) {
              link.href = oData.results[0].CsvContent;
              link.target = "_blank";
              link.download = Invoice + ".csv";
              link.click();
            }
          },
          error: function (oError) {
          },
        });

        // $.get("utils/templatebase64.txt", function (csvContent) {
        //   var blob;
        //   blob = window.atob(csvContent);
        //   var link = document.createElement("a");
        //   if (link.download !== undefined) {
        //     link.href = "data:text/csv;charset=utf-8," + encodeURI(blob);
        //     link.target = "_blank";
        //     link.download = "template.csv";
        //     link.click();
        //   }
        // });
      },
    });
  }
);
