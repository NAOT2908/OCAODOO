/** @odoo-module **/

import {
    Component,
    EventBus,
    onPatched,
    onWillStart,
    useState,
    useSubEnv,
  } from "@odoo/owl";
import { useService, useBus } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";
import { View } from "@web/views/view";

class Move_line extends Component {
  setup() {
    
    
    this._scrollBehavior = "smooth";
  
    this.state = useState({
      lines: this.props.lines || [],
      view: "Move_line",
    });
    // console.log(lines)
  }
  selectedClass(id) {
    // console.log(id);
    if (id === this.state.selectedMove) {
      return "selectedMove list-group-item d-flex flex-row flex-nowrap ";
    }
    return "list-group-item d-flex flex-row flex-nowrap ";
  }
  select(id) {
    // ev.stopPropagation();
    this.state.selectedMove = id;
  }
  edit(){
    if (this.state.view === "Move_line") {
      this.state.view = "editline";
    } else {
      // this.toggleBarcodeLines();
      this.state.view = "Move_line";
    }
  }

}
// StockMoveLineBarcode.props = ["displayUOM", "line", "subline?", "editLine"];

Move_line.template = "smartbiz_stock.StockMoveLineBarcode";

export default Move_line;
