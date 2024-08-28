/** @odoo-module **/

import { Component, useState } from '@odoo/owl';
import { registry } from '@web/core/registry';

export class GanttTimeLineArrow extends Component {
    constructor(parent, timelineWidth) {
        super(parent);
        this.canvasWidth = timelineWidth;
    }

    async willStart() {
        await super.willStart();
        const parentWidget = this.getParent();
        const dataWidget = parentWidget.gantt_timeline_data_widget.filter(widget => {
            if (widget.items_sorted && widget.record.fold) {
                return false;
            }
            return true;
        });

        const new_data_widget = dataWidget.map((widget, key) => {
            let task_start_pxscale = 0;
            let task_stop_pxscale = 0;

            if (!widget.record.is_group) {
                const task_start_time = widget.record.task_start.getTime();
                const task_stop_time = widget.record.task_stop.getTime();
                task_start_pxscale = Math.round((task_start_time - parentWidget.firstDayScale) / parentWidget.pxScaleUTC);
                task_stop_pxscale = Math.round((task_stop_time - parentWidget.firstDayScale) / parentWidget.pxScaleUTC);
            }

            return {
                key: key,
                y: 30 * key,
                record_id: widget.record.id,
                group: widget.record.is_group,
                task_start_pxscale: task_start_pxscale,
                task_stop_pxscale: task_stop_pxscale,
                fold: widget.record.fold,
                critical_path: widget.record.critical_path,
                cp_shows: widget.record.cp_shows,
                p_loop: widget.record.p_loop,
            };
        });

        const filtered_data_widget = new_data_widget.filter(Boolean);
        const canvasHeight = 30 * filtered_data_widget.length;
        const canvasWidth = this.canvasWidth;

        this.state = {
            canvasHeight: canvasHeight,
            canvasWidth: canvasWidth,
            predecessors: parentWidget.Predecessor,
            new_data_widget: filtered_data_widget,
        };
    }

    mounted() {
        const el = this.el;
        const GanttDrawLink = document.createElement('div');
        GanttDrawLink.id = 'gantt_draw_timeline_link';
        GanttDrawLink.className = 'task-gantt-timeline-arrow-canvas';
        GanttDrawLink.style.width = `${this.state.canvasWidth}px`;
        GanttDrawLink.style.height = `${this.state.canvasHeight}px`;

        const predecessors = this.state.predecessors;

        predecessors.forEach(predecessor => {
            const to = predecessor.task_id[0];
            const from = predecessor.parent_task_id[0];

            const fromObj = this.state.new_data_widget.find(obj => obj.record_id === from);
            const toObj = this.state.new_data_widget.find(obj => obj.record_id === to);

            if (!fromObj || !toObj) {
                return;
            }

            const GanttTimelineLink = document.createElement('div');
            GanttTimelineLink.className = 'gantt_timeline_link';
            GanttTimelineLink.id = `gantt_timeline_link-${predecessor.id}`;

            ArrowDraw.drawLink(fromObj, toObj, predecessor.type).forEach(line => {
                GanttTimelineLink.appendChild(line);
            });

            GanttDrawLink.appendChild(GanttTimelineLink);
        });

        el.appendChild(GanttDrawLink);
    }
}

registry.category('widgets').add('gantt_timeline_arrow', GanttTimeLineArrow);
