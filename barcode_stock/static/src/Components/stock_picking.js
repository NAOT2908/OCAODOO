/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";

import { COMMANDS } from "@barcodes/barcode_handlers";

import { registry } from "@web/core/registry";
import { useService, useBus, router } from "@web/core/utils/hooks";
import * as BarcodeScanner from "@web/webclient/barcode/barcode_scanner";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { View } from "@web/views/view";

import Move_line from "./move_line";

import { ManualBarcodeScanner } from "./manual_barcode";
import { utils as uiUtils } from "@web/core/ui/ui_service";

import {
  Component,
  EventBus,
  onPatched,
  onWillStart,
  useState,
  useSubEnv,
} from "@odoo/owl";

// Lets `barcodeGenericHandlers` knows those commands exist so it doesn't warn when scanned.
COMMANDS["O-CMD.MAIN-MENU"] = () => {};
COMMANDS["O-CMD.cancel"] = () => {};

const bus = new EventBus();

/**
 * Main Component
 * Gather the line information.
 * Manage the scan and save process.
 */

class StockPicking extends Component {
  //--------------------------------------------------------------------------
  // Lifecycle
  //--------------------------------------------------------------------------

  setup() {
    this.rpc = useService("rpc");
    this.orm = useService("orm");
    this.notification = useService("notification");
    this.home = useService("menu");
    this.dialog = useService("dialog");
    this.action = useService("action");
    this.resModel = this.props.action.res_model;
    this.resId = this.props.action.context.active_id || false;

    this._scrollBehavior = "smooth";
    this.isMobile = uiUtils.isSmall();
    this.state = useState({
      view: "Move", // Could be also 'printMenu' or 'editFormView'.
      displayNote: false,
      inputValue: "",
      input: "",
      moves: [],
      lines: [],
      selectedPicking: 0,
      selectedMove: 0,
      selectedMoveLine: 0,
      pickingName: "",
      picking: {},
    });
    this.barcodeService = useService("barcode");
    useBus(this.barcodeService.bus, "barcode_scanned", (ev) =>
      this.onBarcodeScanned(ev.detail.barcode)
    );

    onWillStart(async () => {
      // console.log(this.props);
      await this.getData(this.props.action.context.active_id);
    });

    onPatched(() => {
      this._scrollToSelectedLine();
    });
  }
  constructor(...args) {
    super(...args);
  }
  onMount() {
    this.env.move_line = new Move_line(this.env, { lines: this.state.lines });
    this.env.move_line.mount(this.el);
  }

  //--------------------------------------------------------------------------
  // Public
  //--------------------------------------------------------------------------
  async cancel() {
    await this.env.model.save();
    const action = await this.orm.call(
      this.resModel,
      "action_cancel_from_barcode",
      [[this.resId]]
    );
    const onClose = (res) => {
      if (res && res.cancelled) {
        this.env.model._cancelNotification();
        this.env.config.historyBack();
      }
    };
    this.action.doAction(action, {
      onClose: onClose.bind(this),
    });
  }

  async getData(picking_id) {
    var t = await this.orm.call("stock.picking", "get_data", [picking_id], {
      picking_id,
    });
    this.state.moves = t.moves;
    this.state.pickingName = t.picking_name;
    this.data = t;
    console.log(t);
  }
  edit(id) {
    // this.state.view = "Move_line";

    if (this.state.view === "Move") {
      this.state.view = "Move_line";
      // var move = this.data.moves.find((x) => x.id === id);
      // console.log(this.data.move_lines);
      this.state.lines = this.data.move_lines.filter((x) => x.move_id === id);
    } else {
      this.state.view = "Move";
    }
  }
  selectedClass(id) {
    console.log(id);
    if (id === this.state.selectedMove) {
      return "selectedMove list-group-item d-flex flex-row flex-nowrap ";
    }
    return "list-group-item d-flex flex-row flex-nowrap ";
  }

  onBarcodeScanned(barcode) {
    if (barcode) {
      this.env.model.processBarcode(barcode);
      if ("vibrate" in window.navigator) {
        window.navigator.vibrate(100);
      }
    } else {
      const message = _t("Please, Scan again!");
      this.env.services.notification.add(message, { type: "warning" });
    }
  }

  async openMobileScanner() {
    const barcode = await BarcodeScanner.scanBarcode(this.env);
    this.onBarcodeScanned(barcode);
  }

  openManualScanner() {
    this.dialog.add(ManualBarcodeScanner, {
      openMobileScanner: async () => {
        await this.openMobileScanner();
      },
      onApply: (barcode) => {
        barcode = this.env.model.cleanBarcode(barcode);
        this.onBarcodeScanned(barcode);
        return barcode;
      },
    });
  }

  toggleBarcodeActions() {
    this.state.view = "actionsView";
  }

  async toggleInformation() {
    await this.env.model.save();
    this.state.view = "infoFormView";
  }

  async _onDoAction(ev) {
    this.action.doAction(ev.detail, {
      onClose: this._onRefreshState.bind(this),
    });
  }

  _scrollToSelectedLine() {
    var navBarHeight = document.querySelector(".o_main_navbar").offsetHeight;
    var header = document.querySelector(".o_move_header");

    header.style.top = navBarHeight + "px";

    window.addEventListener("scroll", function () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      header.style.top = navBarHeight - scrollTop + "px";
    });
  }

  async _onDoAction(ev) {
    this.action.doAction(ev.detail, {
      onClose: this._onRefreshState.bind(this),
    });
  }

  async exit(ev) {
    if (this.state.view === "Move") {
      //   await this.env.model.save();
      this.env.config.historyBack();
      //   console.log("true");
    } else if (this.state.view === "Move_line") {
      this.state.view = "Move";
    } else {
      this.toggleBarcodeLines();
    }
  }

  async toggleBarcodeLines(lineId) {
    // await this.env.model.displayBarcodeLines(lineId);
    // this._editedLineParams = undefined;
    this.state.move = "Move";
  }

  _onBarcodeScanned(barcode) {
    if (this.state.view === "Move") {
      this.env.model.processBarcode(barcode);
    }
  }

  saveFormView(lineRecord) {
    const lineId =
      (lineRecord && lineRecord.resId) ||
      (this._editedLineParams && this._editedLineParams.currentId);
    const recordId = lineRecord.resModel === this.resModel ? lineId : undefined;
    this._onRefreshState({ recordId, lineId });
  }

  openInput() {
    this.state.input = "openInput";
  }

  handleInputChange(event) {
    this.state.inputValue = event.target.value;
  }

  select(id) {
    // ev.stopPropagation();
    this.state.selectedMove = id;
  }
}
StockPicking.props = [
  "action?",
  "actionId?",
  "className?",
  "globalState?",
  "resId?",
];
StockPicking.template = "smartbiz_stock.StockPicking";
StockPicking.components = {
  Move_line,
};



registry
  .category("actions")
  .add("smartbiz_picking_barcode", StockPicking);

export default StockPicking;
