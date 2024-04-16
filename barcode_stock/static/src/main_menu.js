/** @odoo-module **/

import * as BarcodeScanner from "@web/webclient/barcode/barcode_scanner";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { registry } from "@web/core/registry";
import { useBus, useService } from "@web/core/utils/hooks";
import { session } from "@web/session";
import { serializeDate, today } from "@web/core/l10n/dates";
import { Component, onWillStart, useState } from "@odoo/owl";

export class AppsMenu extends Component {
  setup() {
    const displayDemoMessage = this.props.action.params.message_demo_barcodes;
    const user = useService("user");
    this.actionService = useService("action");
    this.dialogService = useService("dialog");
    this.home = useService("menu");
    this.notificationService = useService("notification");
    this.rpc = useService("rpc");
    this.state = useState({ displayDemoMessage });
    this.barcodeService = useService("barcode");
    useBus(this.barcodeService.bus, "barcode_scanned", (ev) =>
      this._onBarcodeScanned(ev.detail.barcode)
    );
    const orm = useService("orm");

    this.mobileScanner = BarcodeScanner.isBarcodeScannerSupported();
  }
  async openMobileScanner() {
    const barcode = await BarcodeScanner.scanBarcode(this.env);
    if (barcode) {
      this._onBarcodeScanned(barcode);
      if ("vibrate" in window.navigator) {
        window.navigator.vibrate(100);
      }
    } else {
      this.notificationService.add(_t("Please, Scan again!"), {
        type: "warning",
      });
    }
  }
  async _onBarcodeScanned(barcode) {
    const res = await this.rpc("/stock_barcode/scan_from_main_menu", {
      barcode,
    });
    if (res.action) {
      return this.actionService.doAction(res.action);
    }
    this.notificationService.add(res.warning, { type: "danger" });
  }
  async open_view(view_id) {
    const res = await this.rpc("/smartbiz/open_view", {
      name: "Kiểu điều chuyển",
      res_model: "stock.picking.type",
      view_id: view_id,
      view_mode: "kanban",
    });
    // console.log(res);

    //return res
    if (res) {
      return this.actionService.doAction(res.action);
    }
  }
}

AppsMenu.props = ["action", "actionId", "className"];
AppsMenu.props = {
  action: { Object },
  actionId: { type: Number, optional: true },
  className: String,
  globalState: { type: Object, optional: true },
};
AppsMenu.template = "MainMenu";

registry.category("actions").add("stock_barcode_main_menu", AppsMenu);
