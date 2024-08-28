/** @odoo-module **/

import { Component } from '@odoo/owl';

export class GanttTimeLineFirst extends Component {
    constructor(parent) {
        super(parent);
    }

    async willStart() {
        await super.willStart();
        this.dataWidgets = this.getParent().gantt_timeline_data_widget;
        this.barFirstData = this.getBarFirstData();
    }

    mounted() {
        this.dataWidgets.forEach(widget => {
            if (this.getParent().ItemsSorted && widget.record.is_group) {
                const rowId = widget.record.group_id[0];
                const linkFirstResult = this.barFirstData.find(data => data.data_row_id === rowId);
                if (linkFirstResult) {
                    const { date_start, date_end } = linkFirstResult;
                    if (date_start && date_end) {
                        const start_time = new Date(date_start).getTime();
                        const stop_time = new Date(date_end).getTime();
                        const start_pxscale = Math.round((start_time - this.getParent().firstDayScale) / this.getParent().pxScaleUTC);
                        const stop_pxscale = Math.round((stop_time - this.getParent().firstDayScale) / this.getParent().pxScaleUTC);
                        const bar_left = start_pxscale;
                        const bar_width = stop_pxscale - start_pxscale;

                        const firstBar = document.createElement('div');
                        firstBar.className = `task-gantt-bar-first task-gantt-bar-first-${rowId}`;
                        firstBar.style.left = `${bar_left}px`;
                        firstBar.style.width = `${bar_width}px`;

                        const heightM = parseInt(widget.record.task_count);
                        if (heightM) {
                            const firstBarStart = document.createElement('div');
                            firstBarStart.className = 'task-gantt-first task-gantt-first-start';
                            firstBarStart.style.height = `${(1 + heightM) * 30}px`;

                            const firstBarEnd = document.createElement('div');
                            firstBarEnd.className = 'task-gantt-first task-gantt-first-end';
                            firstBarEnd.style.height = `${(1 + heightM) * 30}px`;

                            firstBar.appendChild(firstBarStart);
                            firstBar.appendChild(firstBarEnd);
                        }

                        widget.$el.appendChild(firstBar);
                    }
                }
            }
        });
    }

    getBarFirstData() {
        const barfirsts = this.getParent().gantt.data.BarFirst;
        const dataBarFirst = barfirsts.map(barfirst => ({
            data_row_id: barfirst.id,
            name: barfirst.name,
            date_start: barfirst.date_start ? new Date(barfirst.date_start) : null,
            date_end: barfirst.date_end ? new Date(barfirst.date_end) : null,
        }));
        return dataBarFirst;
    }
}
