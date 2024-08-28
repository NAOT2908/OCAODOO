/** @odoo-module **/

import { Component } from "@odoo/owl";
import { _ } from "@odoo/owl/dist/owl.utils";

class GanttTimeLineResBar extends Component {
    constructor(parent) {
        super(parent);
    }

    async willStart() {
        await super.willStart();
        this.parentG = this.getParent();
        this.dataWidgets = this.parentG.ganttTimelineDataWidget;
        this.taskLoadData = this.parentG.Task_Load_Data;
    }

    async start() {
        await super.start();
        if (this.taskLoadData) {
            let ganttAttrs = this.parentG.arch.attrs;
            let loadId = ganttAttrs['load_id'];
            let loadIdFrom = ganttAttrs['load_id_from'];
            let loadBarRecordRow = ganttAttrs['load_bar_record_row'];
            let loadDataId = ganttAttrs['load_data_id'];

            let dataLoadS1 = _.map(this.taskLoadData, function(resData) {
                let activeId = resData[loadId] ? resData[loadId][0] : -1;
                let activeIdFrom = resData[loadIdFrom] ? resData[loadIdFrom][0] : -1;
                return {
                    dataFrom: resData['data_from'],
                    dataTo: resData['data_to'],
                    activeId: activeId,
                    activeIdFrom: activeIdFrom
                };
            });

            let dataLoadS2 = _.groupBy(dataLoadS1, 'activeId');

            for (let widget of this.dataWidgets) {
                if (!widget.record.is_group) {
                    let rowId = widget.record['id'];
                    if (loadBarRecordRow) {
                        rowId = widget.record[loadBarRecordRow];
                    }
                    let colorGantt = widget.record['color_gantt'];
                    let dataLoad = dataLoadS2[rowId];
                    let rowData = widget.el;
                    let activeIdFromData = widget.record['load_data_id'] ? widget.record['load_data_id'][0] : -1;
                    if (loadDataId === 'id') {
                        activeIdFromData = widget.record['id'];
                    }

                    for (let linkLoad of dataLoad) {
                        if (activeIdFromData === linkLoad.activeIdFrom) {
                            let dtStart = new Date(linkLoad.dataFrom);
                            let timeStart = dtStart.getTime();
                            let dtTo = new Date(linkLoad.dataTo);
                            let timeTo = dtTo.getTime();
                            let loadStartPxScale = Math.round((timeStart - this.parentG.firstDayScale) / this.parentG.pxScaleUTC);
                            let loadStopPxScale = Math.round((timeTo - this.parentG.firstDayScale) / this.parentG.pxScaleUTC);
                            let loadBarLeft = loadStartPxScale;
                            let loadBarWidth = loadStopPxScale - loadStartPxScale;
                            let loadBarX = document.createElement('div');
                            loadBarX.classList.add('task-gantt-bar-load-task');
                            loadBarX.style.left = loadBarLeft + 'px';
                            loadBarX.style.width = loadBarWidth + 'px';
                            let ganttBar = rowData.querySelector('.task-gantt-bar-plan');
                            ganttBar.style.background = colorGantt.replace(/[^,]+(?=\))/, '0.4');
                            loadBarX.style.background = colorGantt;
                            rowData.appendChild(loadBarX);
                        }
                    }
                }
            }
        }
    }
}

export default GanttTimeLineResBar;
