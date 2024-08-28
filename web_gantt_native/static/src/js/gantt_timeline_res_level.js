/** @odoo-module **/

import { Component } from "@odoo/owl";
import { _ } from "@odoo/owl/dist/owl.utils";

function secondsToTime(secs) {
    const pad = function(num, size) {
        return ('000' + num).slice(size * -1);
    };
    let time = parseFloat(secs).toFixed(3);
    let hours = Math.floor(time / 60 / 60);
    let minutes = Math.floor(time / 60) % 60;
    let seconds = Math.floor(time - minutes * 60);
    let milliseconds = time.slice(-3);
    return {
        'h': pad(hours, 2),
        'm': pad(minutes, 2),
        's': pad(seconds, 2)
    };
}

class GanttTimeLineResLevel extends Component {
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
            let dataLoadS1 = _.map(this.taskLoadData, function(resData) {
                return {
                    dataAggr: resData['data_aggr'],
                    duration: resData['duration'],
                    loadId: resData['resource_id'] ? resData['resource_id'][0] : -1
                };
            });

            let dataLoadS2 = _.groupBy(dataLoadS1, 'loadId');

            let dataLoadS3 = _.map(dataLoadS2, function(value, key) {
                let dataGroup = _.groupBy(value, 'dataAggr');
                return {
                    loadId: parseInt(key) || -1,
                    dataGroup: dataGroup
                };
            });

            for (let widget of this.dataWidgets) {
                if (widget.record.is_group) {
                    let rowId = widget.record['group_id'] ? widget.record['group_id'][0] : -1;
                    let dataLoadW = _.where(dataLoadS3, { loadId: rowId });
                    
                    if (typeof dataLoadW !== 'undefined' && dataLoadW.length > 0) {
                        let dataGroup = dataLoadW[0]['dataGroup'];
                        let gpLoad = _.map(dataGroup, function(dataLoadValue, key) {
                            let duration = _.reduce(dataLoadValue, function(memoizer, value) {
                                return memoizer + value.duration;
                            }, 0);
                            return {
                                date: key,
                                duration: duration
                            };
                        });

                        let rowData = widget.el;

                        for (let linkLoad of gpLoad) {
                            let datePoint = new Date(linkLoad.date);
                            let startTime = datePoint.getTime();
                            let leftPoint = Math.round((startTime - this.parentG.firstDayScale) / this.parentG.pxScaleUTC);
                            let loadBarX = document.createElement('div');
                            loadBarX.classList.add('task-gantt-bar-load');

                            let duration_ = secondsToTime(linkLoad.duration);
                            let barW = 20;
                            let oneLine = false;

                            if (this.parentG.timeType === 'day_1hour') {
                                barW = 2 * barW * 24;
                                oneLine = true;
                            } else if (this.parentG.timeType === 'day_2hour') {
                                barW = 2 * barW * 12;
                                oneLine = true;
                            } else if (this.parentG.timeType === 'day_4hour') {
                                barW = 2 * barW * 6;
                                oneLine = true;
                            } else if (this.parentG.timeType === 'day_8hour') {
                                barW = 2 * barW * 3;
                                oneLine = true;
                            }

                            if (oneLine) {
                                barW = barW - 10;
                                leftPoint = leftPoint + 5;
                                let _m = '';
                                if (duration_.m !== '00') {
                                    _m = ' : ' + duration_.m;
                                }
                                let barOneLine = document.createElement('div');
                                barOneLine.classList.add('task-gantt-load-duration_l');
                                barOneLine.textContent = duration_.h + _m;
                                barOneLine.style.fontSize = '1.0em';
                                loadBarX.style.background = 'rgba(223, 224, 222, 0.3)';
                                loadBarX.appendChild(barOneLine);
                            } else {
                                loadBarX.innerHTML = '<div class="task-gantt-load-duration">' + duration_.h + '</div>';
                                if (duration_.m !== '00') {
                                    loadBarX.innerHTML += '<div class="task-gantt-load-duration-m">' + duration_.m + '</div>';
                                }
                            }

                            loadBarX.style.left = leftPoint + 'px';
                            loadBarX.style.width = barW + 'px';
                            rowData.appendChild(loadBarX);
                        }
                    }
                }
            }
        }
    }
}

GanttTimeLineResLevel.template = 'GanttTimeLine.reslevel';

export default GanttTimeLineResLevel;
