/** @odoo-module **/

import { Component } from "@odoo/owl";

class GanttTimeLineInterSection extends Component {
    constructor(parent) {
        super(parent);
    }

    get_position_x(ganttDateStart, ganttDateStop, parent) {
        let taskStartTime = ganttDateStart.getTime();
        let taskStopTime = ganttDateStop.getTime();
        let taskStartPxScale = Math.round((taskStartTime - parent.firstDayScale) / parent.pxScaleUTC);
        let taskStopPxScale = Math.round((taskStopTime - parent.firstDayScale) / parent.pxScaleUTC);
        let barLeft = taskStartPxScale;
        let barWidth = taskStopPxScale - taskStartPxScale;
        return {
            barLeft: barLeft,
            barWidth: barWidth,
        };
    }

    async start() {
        let parentG = this.getParent();
        if (parentG.industryShow) {
            let getPositionX = this.get_position_x;
            let $zTree = parentG.widgetZtree.$zTree;
            let dataWidgets = parentG.ganttTimelineDataWidget;

            for (let widget of dataWidgets) {
                if (widget.record.is_group) {
                    let el = widget.el;
                    let node = $zTree.getNodeByParam('zt_id', widget.record.zt_id, null);
                    let beforeLeft = false;
                    let beforeTop = 0;
                    let childNodes = $zTree.transformToArray(node);
                    let sortedChildNodes = childNodes.sort((a, b) => a.task_start - b.task_start);

                    for (let child of sortedChildNodes) {
                        if (child.id !== undefined) {
                            let id = child.id;
                            let ganttBar = document.createElement('div');
                            ganttBar.classList.add('task-gantt-bar-intersection');
                            ganttBar.id = 'task-gantt-bar-intersection-' + id;

                            let position = getPositionX(child.task_start, child.task_stop, parentG);

                            let barName = document.createElement('div');
                            barName.classList.add('task-gantt-name');
                            barName.textContent = child.value_name;
                            barName.style.width = position.barWidth - 5 + 'px';
                            ganttBar.appendChild(barName);

                            if (beforeLeft && beforeLeft > position.barLeft) {
                                beforeTop = (beforeTop === 0) ? 16 : 0;
                            }
                            beforeLeft = position.barLeft + position.barWidth;

                            ganttBar.style.top = beforeTop + 'px';
                            ganttBar.style.left = position.barLeft + 'px';
                            ganttBar.style.width = position.barWidth + 'px';
                            ganttBar.style.background = 'rgba(242, 133, 113, 0.6)';
                            
                            el.appendChild(ganttBar);
                        }
                    }
                }
            }
        }
    }
}

export default GanttTimeLineInterSection;
