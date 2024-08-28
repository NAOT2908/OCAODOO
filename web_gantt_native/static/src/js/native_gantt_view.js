/** @odoo-module **/

import { _lt } from "@odoo/owl";
import AbstractView from "web.AbstractView";
import core from "web.core";
import NativeGanttModel from "web_gantt_native.NativeGanttModel";
import NativeGanttRenderer from "web_gantt_native.NativeGanttRenderer";
import NativeGanttController from "web_gantt_native.NativeGanttController";
import view_registry from "web.view_registry";

const { config } = core;

const GanttContainer = AbstractView.extend({
    display_name: _lt('Native Gantt'),
    icon: 'fa-tasks',
    viewType: 'ganttaps',
    config: Object.assign({}, AbstractView.prototype.config, {
        Model: NativeGanttModel,
        Controller: NativeGanttController,
        Renderer: NativeGanttRenderer,
    }),
    init: function (viewInfo, params) {
        this._super.apply(this, arguments);

        // Setting renderer and controller params
        this.rendererParams.viewType = this.viewType;
        this.controllerParams.confirmOnDelete = true;
        this.controllerParams.archiveEnabled = 'active' in this.fields;
        this.controllerParams.hasButtons = 'action_buttons' in params ? params.action_buttons : true;

        // Setting load parameters
        this.loadParams.fieldsInfo = this.fieldsInfo;
        this.loadParams.fields = viewInfo.fields;
        this.loadParams.context = params.context || {};
        this.loadParams.limit = parseInt(this.arch.attrs.limit, 10) || params.limit;
        this.loadParams.viewType = this.viewType;
        this.loadParams.parentID = params.parentID;
        this.recordID = params.recordID;
        this.model = params.model;
        this.loadParams.fieldsView = viewInfo;
        this.loadParams.fieldsView.arch = this.arch;
        this.loadParams.mapping = this.arch.attrs;
    },
});

view_registry.add('ganttaps', GanttContainer);

export default GanttContainer;
