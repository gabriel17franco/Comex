/*global location */
sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/MessagePopover",
    "sap/m/MessageBox",
    "sap/ui/core/MessageType",
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    MessagePopover,
    MessageBox,
    MessageType
  ) {
    "use strict";

    return BaseController.extend("comex.zcomexapp.controller.Detail", {
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      onInit: function () {
        // Model used to manipulate control states. The chosen values make sure,
        // detail page is busy indication immediately so there is no break in
        // between the busy indication for loading the view's meta data
        var oViewModel = new JSONModel({
          busy: false,
          delay: 0,
          lineItemListTitle: this.getResourceBundle().getText(
            "detailLineItemTableHeading"
          ),
          buttons: {
            laterDebts: {
              icon: "",
              enable: false,
            },
          },
        });

        this.getRouter()
          .getRoute("object")
          .attachPatternMatched(this._onObjectMatched, this);

        this.setModel(oViewModel, "detailView");

        this.getOwnerComponent()
          .getModel()
          .metadataLoaded()
          .then(this._onMetadataLoaded.bind(this));

        var oMessageProcessor =
          new sap.ui.core.message.ControlMessageProcessor();

        this._oMessageManager = sap.ui.getCore().getMessageManager();

        this._oMessageManager.registerMessageProcessor(oMessageProcessor);

        // this._oMessageManager.addMessages(
        //   new sap.ui.core.message.Message({
        //     message: "Something wrong happened",
        //     type: MessageType.Error,
        //     processor: oMessageProcessor,
        //   })
        // );
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      /**
       * Updates the item count within the line item table's header
       * @param {object} oEvent an event containing the total number of items in the list
       * @private
       */
      onTableLaterDebtsUpdateFinished: function (oEvent) {
        var sTitle,
          iTotalItems = oEvent.getParameter("total"),
          oViewModel = this.getModel("detailView");

        // only update the counter if the length is final
        if (this.byId("laterDebtsTable").getBinding("items").isLengthFinal()) {
          if (iTotalItems) {
            sTitle = this.getResourceBundle().getText(
              "detailLineItemTableHeadingCount",
              [iTotalItems]
            );
          } else {
            //Display 'Line Items' instead of 'Line items (0)'
            sTitle = this.getResourceBundle().getText(
              "detailLineItemTableHeading"
            );
          }
          oViewModel.setProperty("/lineItemListTitle", sTitle);
        }
      },

      onMessagesButtonPress: function (oEvent) {
        var oMessagesButton = oEvent.getSource();
        if (!this._messagePopover) {
          this._messagePopover = new MessagePopover({
            headerButton: new sap.m.Button({
              text: this.getResourceBundle().getText("deleteMessages"),
              press: function () {
                this._messagePopover.close();
                this._oMessageManager.removeAllMessages();
              }.bind(this),
            }),
            items: {
              path: "message>/",
              template: new sap.m.MessageItem({
                description: "{message>description}",
                type: "{message>type}",
                title: "{message>message}",
                subtitle: "{message>additionalText}",
                description: "{message>description}",
              }),
            },
          });
          oMessagesButton.addDependent(this._messagePopover);
        }
        this._messagePopover.toggle(oMessagesButton);
      },

      onInvoicePost: function (oEvent) {
        var oViewModel = this.getModel("detailView");
        oViewModel.setProperty("/busy", true);
        var payload = oEvent.getSource().getBindingContext().getObject();
        if (payload.VendorInvoice === "") {
          payload.Action = "B";
        } else {
          payload.Action = "F";
        }
        var oModel = this.getView().getModel();
        oModel.create("/InvoiceHeaderSet", payload, {
          success: function (oData, oResponse) {
            oViewModel.setProperty("/busy", false);
          }.bind(this),
          error: function (oError) {
            oViewModel.setProperty("/busy", false);
          }.bind(this),
        });
      },

      onLaterDebtsPost: function (oEvent) {
        var payload = oEvent.getSource().getBindingContext().getObject();
        var oModel = this.getView().getModel();
        oModel.create("/LaterDebtHeaderSet", payload, {
          success: function (oData, oResponse) {}.bind(this),
          error: function (oError) {}.bind(this),
        });
      },

      onLaterDebtsDetailPress: function (oEvent) {
        var that = this;
        var laterDebtPath = oEvent.getSource().getBindingContext().getPath();
        debugger;
        var oContex = oEvent.getSource().getElementBinding();
        var object = oContex.getBoundContext();
        var path = laterDebtPath + "/" + "GetLaterDebtItems";

        if (!this._oTableDetailDialog) {
          this._oTableDetailDialog = new sap.m.Dialog({
            title: this.getResourceBundle().getText("laterDebtsDetail"),
            resizable: true,
            draggable: true,
            content: [
              new sap.ui.comp.smarttable.SmartTable(
                this.createId("LaterDebtSmartTableDetail"),
                {
                  entitySet: "LaterDebtItemsSet",
                  tableBindingPath: "GetLaterDebtItems",
                  tableType: "Table",
                  useExportToExcel: true,
                  showRowCount: true,
                  enableAutoBinding: true,
                  initiallyVisibleFields: "InvoiceIssuer",
                }
              ),
            ],
            endButton: new sap.m.Button({
              text: "{i18n>close}",
              press: function () {
                this._oTableDetailDialog.close();
              }.bind(this),
            }),
          });

          this._oTableDetailDialog.addStyleClass("sapUiContentPadding");
          this.getView().addDependent(this._oTableDetailDialog);
        }
        debugger;
        this.byId("LaterDebtSmartTableDetail").bindContext(laterDebtPath);
        this._oTableDetailDialog.open();
      },

      onNfWritePost: function (oEvent) {
        var oViewModel = this.getModel("detailView");
        oViewModel.setProperty("/busy", true);
        var payload = oEvent.getSource().getBindingContext().getObject();
        if (payload.NfeDocument === "0000000000") {
          payload.Action = "D";
        } else {
          oViewModel.setProperty("/busy", false);
          return;
        }
        var oModel = this.getView().getModel();
        oModel.create("/InvoiceHeaderSet", payload, {
          success: function (oData, oResponse) {
            oViewModel.setProperty("/busy", false);
          }.bind(this),
          error: function (oError) {
            oViewModel.setProperty("/busy", false);
          }.bind(this),
        });
      },

      onAccountPost: function (oEvent) {
        debugger;
        var payload = oEvent.getSource().getBindingContext().getObject();
        if (payload.AccountDocument === "") {
          payload.Action = "E";
        } else {
          payload.Action = "I";
        }
        var oModel = this.getView().getModel();
        oModel.create("/InvoiceHeaderSet", payload, {
          success: function (oData, oResponse) {}.bind(this),
          error: function (oError) {}.bind(this),
        });
      },

      /* =========================================================== */
      /* begin: internal methods                                     */
      /* =========================================================== */

      /**
       * Binds the view to the object path and expands the aggregated line items.
       * @function
       * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
       * @private
       */
      _onObjectMatched: function (oEvent) {
        var Invoice = oEvent.getParameter("arguments").Invoice;
        var Vendor = oEvent.getParameter("arguments").Vendor;
        this.getModel()
          .metadataLoaded()
          .then(
            function () {
              var sObjectPath = this.getModel().createKey("InvoiceHeaderSet", {
                Invoice: Invoice,
                Vendor: Vendor,
              });
              this._bindView("/" + sObjectPath);
            }.bind(this)
          );
      },

      /**
       * Binds the view to the object path. Makes sure that detail view displays
       * a busy indicator while data for the corresponding element binding is loaded.
       * @function
       * @param {string} sObjectPath path to the object to be bound to the view.
       * @private
       */
      _bindView: function (sObjectPath) {
        // Set busy indicator during view binding
        var oViewModel = this.getModel("detailView");

        // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
        oViewModel.setProperty("/busy", false);

        this.getView().bindElement({
          path: sObjectPath,
          events: {
            change: this._onBindingChange.bind(this),
            dataRequested: function () {
              oViewModel.setProperty("/busy", true);
            },
            dataReceived: function () {
              oViewModel.setProperty("/busy", false);
            },
          },
        });
      },

      _onBindingChange: function () {
        var oView = this.getView(),
          oElementBinding = oView.getElementBinding();

        // No data for the binding
        if (!oElementBinding.getBoundContext()) {
          this.getRouter().getTargets().display("detailObjectNotFound");
          // if object could not be found, the selection in the master list
          // does not make sense anymore.
          this.getOwnerComponent().oListSelector.clearMasterListSelection();
          return;
        }

        var sPath = oElementBinding.getPath(),
          oResourceBundle = this.getResourceBundle(),
          oObject = oView.getModel().getObject(sPath),
          Invoice = oObject.Invoice,
          // sObjectName = oObject.Name,
          oViewModel = this.getModel("detailView");

        this.getOwnerComponent().oListSelector.selectAListItem(sPath);
      },

      _onMetadataLoaded: function () {
        // Store original busy indicator delay for the detail view
        var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
          oViewModel = this.getModel("detailView"),
          oLineItemTable = this.byId("InvoiceItemsSmartTable"),
          iOriginalLineItemTableBusyDelay =
            oLineItemTable.getBusyIndicatorDelay();

        // Make sure busy indicator is displayed immediately when
        // detail view is displayed for the first time
        oViewModel.setProperty("/delay", 0);
        oViewModel.setProperty("/lineItemTableDelay", 0);

        oLineItemTable.attachEventOnce("updateFinished", function () {
          // Restore original busy indicator delay for line item table
          oViewModel.setProperty(
            "/lineItemTableDelay",
            iOriginalLineItemTableBusyDelay
          );
        });

        // Binding the view will set it to not busy - so the view is always busy if it is not bound
        oViewModel.setProperty("/busy", true);
        // Restore original busy indicator delay for the detail view
        oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
      },
    });
  }
);
