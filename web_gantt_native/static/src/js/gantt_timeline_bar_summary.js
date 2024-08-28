/** @odoo-module **/

import { Component, useState } from owl;
import { useBus } from "@web/core/utils/hooks";

class GanttTimeLineSummary extends Component {
    setup() {
        this.parentg = this.props.parentg;
        this.data_widgets = this.parentg.gantt_timeline_data_widget;
        this.renderSummaries();
    }

    renderSummaries() {
        this.data_widgets.forEach(widget => {
            if (!widget.record.is_group) {
                const row_id = widget.record.id;
                if (widget.record.isParent) {
                    let start_time = widget.record.summary_date_start ? widget.record.summary_date_start.getTime() : false;
                    let stop_time = widget.record.summary_date_end ? widget.record.summary_date_end.getTime() : false;
                    if (start_time && stop_time) {
                        const start_pxscale = Math.round((start_time - this.parentg.firstDayScale) / this.parentg.pxScaleUTC);
                        const stop_pxscale = Math.round((stop_time - this.parentg.firstDayScale) / this.parentg.pxScaleUTC);
                        const bar_left = start_pxscale;
                        const bar_width = stop_pxscale - start_pxscale;
                        
                        const summary_bar = document.createElement('div');
                        summary_bar.className = `task-gantt-bar-summary task-gantt-bar-summary-${row_id}`;
                        summary_bar.style.left = `${bar_left}px`;
                        summary_bar.style.width = `${bar_width}px`;
                        
                        const bar_summary_start = document.createElement('div');
                        bar_summary_start.className = 'task-gantt-summary task-gantt-summary-start';
                        const bar_summary_end = document.createElement('div');
                        bar_summary_end.className = 'task-gantt-summary task-gantt-summary-end';
                        
                        summary_bar.appendChild(bar_summary_start);
                        summary_bar.appendChild(bar_summary_end);
                        
                        const bar_summary_width = document.createElement('div');
                        bar_summary_width.className = 'task-gantt-summary-width';
                        bar_summary_width.style.width = `${bar_width}px`;
                        summary_bar.appendChild(bar_summary_width);
                        
                        const row_data = this.parentg.gantt_timeline_data_widget.find(o => o.record_id === row_id);
                        row_data.el.appendChild(summary_bar);
                    }
                }
            }
        });
    }
}

GanttTimeLineSummary.template = 'GanttTimeLine.summary';

export default GanttTimeLineSummary;
