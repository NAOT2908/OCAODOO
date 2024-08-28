/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useRef } from "@odoo/owl";

class GanttTimeLineInfo extends Component {
    constructor(parent) {
        super(parent);
    }

    genElement(eText, ePos) {
        let eClass = `task-gantt-bar-plan-info-${ePos}`;
        let barE = document.createElement('div');
        barE.classList.add(eClass);
        let barEText = document.createElement('a');
        barEText.textContent = eText;
        barE.appendChild(barEText);
        return barE;
    }

    start() {
        let self = this;
        let el = self.el;
        let parentG = self.getParent();
        let dataWidgets = parentG.gantt_timeline_data_widget;
        let taskInfo = parentG.Task_Info;

        dataWidgets.forEach(function (widget) {
            if (!widget.record.is_group) {
                let el = widget.el;
                let rowId = widget.record.id;
                let cpDetail = widget.record.cp_detail;
                let rowData = `.task-gantt-bar-plan-${rowId}`;
                let rowEl = el.querySelector(rowData);
                let infoData = {};

                let taskInfoTo = taskInfo.filter(info => info.task_id === rowId);
                taskInfoTo.forEach(function (info) {
                    if (info['show'] || cpDetail) {
                        Object.keys(info).forEach(function (key) {
                            if (info_data[key]) {
                                if (info[key]) {
                                    info_data[key] = info_data[key] + ', ' + info[key];
                                }
                            } else {
                                info_data[key] = info[key];
                            }
                        });
                    }
                });

                let infoList = {
                    start: infoData['start'] || '',
                    'left-up': infoData['left_up'] || '',
                    'left-down': infoData['left_down'] || '',
                    end: infoData['end'] || '',
                    'right-up': infoData['right_up'] || '',
                    'right-down': infoData['right_down'] || ''
                };

                Object.keys(infoList).forEach(function (key) {
                    rowEl.appendChild(self.genElement(infoList[key], key));
                });
            }
        });
    }
}

export default GanttTimeLineInfo;
