/** @odoo-module */

import { KanbanController } from '@web/views/kanban/kanban_controller';
import { useBus, useService } from '@web/core/utils/hooks';
import { onMounted } from "@odoo/owl";

export class StockBarcodeKanbanController extends KanbanController {
    setup() {
        super.setup(...arguments);
        this.barcodeService = useService('barcode');
        useBus(this.barcodeService.bus, 'barcode_scanned', (ev) => this._onBarcodeScannedHandler(ev.detail.barcode));
        onMounted(() => {
            document.activeElement.blur();
        });
    }

    openRecord(record) {
        console.log({record,resModel:record.resModel})
        if(record.resModel == 'stock.picking')
        {
            this.actionService.doAction('smartbiz_stock.stock_picking_client_action', {
                additionalContext: { active_id: record.resId,resModel: record.resModel
                 },
            });
        }
        if(record.resModel == 'stock.picking.batch')
        {
            this.actionService.doAction('smartbiz_stock.stock_picking_batch_client_action', {
                additionalContext: { active_id: record.resId,resModel: record.resModel
                 },
            });
        }
    }
    
    async createRecord() {
        if (this.props.resModel === 'stock.picking')
        {
            const id = await this.model.orm.call(
                'stock.picking',
                'open_new_picking_barcode',
                [], { context: this.props.context }
            );
            if (id) {
                return this.actionService.doAction('smartbiz_stock.stock_picking_client_action', {
                    additionalContext: { active_id: id,resModel: this.props.resModel
                     },
                });
            }
        }
        if (this.props.resModel === 'stock.picking.batch')
        {
            const id = await this.model.orm.call(
                'stock.picking',
                'open_new_batch_picking_barcode',
                [,], { context: this.props.context }
            );
            if (id) {
                return this.actionService.doAction('smartbiz_stock.stock_picking_batch_client_action', {
                    additionalContext: { active_id: id,resModel: this.props.resModel
                     },
                });
            }
        }
        return super.createRecord(...arguments);
    }

    // --------------------------------------------------------------------------
    // Handlers
    //--------------------------------------------------------------------------

    /**
     * Called when the user scans a barcode.
     *
     * @param {String} barcode
     */
    async _onBarcodeScannedHandler(barcode) {
        if (this.props.resModel != 'stock.picking') {
            return;
        }
        const kwargs = { barcode, context: this.props.context };
        const res = await this.model.orm.call(this.props.resModel, 'picking_filter_on_barcode', [], kwargs);
        if (res.action) {
            this.actionService.doAction(res.action);
        } else if (res.warning) {
            const params = { title: res.warning.title, type: 'danger' };
            this.model.notification.add(res.warning.message, params);
        }
    }
}
