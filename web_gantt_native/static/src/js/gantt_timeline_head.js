/** @odoo-module **/

import { Component } from "@odoo/owl";

class GanttTimeLineHead extends Component {
    constructor(parent, timeScale, timeType, firstScale, secondScale) {
        super(parent);
        this.timeScale = timeScale;
        this.timeType = timeType;
        this.firstScale = firstScale;
        this.secondScale = secondScale;
        this.TODAY = moment();
    }

    async willStart() {
        await super.willStart();
        this.renderScales();
    }

    async renderScales() {
        const elScaleSecondary = this.el.querySelector('.task-gantt-scale-secondary');
        switch (this.timeType) {
            case 'year_month':
            case 'quarter':
                this.renderYearMonthQuarter(elScaleSecondary);
                break;
            case 'month_week':
                this.renderMonthWeek(elScaleSecondary);
                break;
            case 'month_day':
                this.renderMonthDay(elScaleSecondary);
                break;
            case 'day_1hour':
            case 'day_2hour':
            case 'day_4hour':
            case 'day_8hour':
                this.renderDayHour(elScaleSecondary);
                break;
            default:
                break;
        }
    }

    renderYearMonthQuarter(elScaleSecondary) {
        const self = this;
        _.each(this.firstScale, function (rangeDate) {
            _.each(rangeDate, function (quarter) {
                const divCell = $('<span class="task-gantt-bottom-column"></span>');
                divCell.css({
                    width: self.timeScale + 'px',
                    'margin-top': -52 + 'px'
                });
                elScaleSecondary.append(divCell);
            });
        });
    }

    renderMonthWeek(elScaleSecondary) {
        const self = this;
        _.each(this.firstScale, function (rangeDate) {
            _.each(rangeDate, function (hour) {
                const divCell = $('<span class="task-gantt-bottom-column"></span>');
                divCell.css({
                    width: self.timeScale + 'px',
                    'margin-top': -52 + 'px'
                });
                if (moment(hour).isSame(self.TODAY, 'week')) {
                    divCell.addClass('task-gantt-today-column');
                }
                elScaleSecondary.append(divCell);
            });
        });
    }

    renderMonthDay(elScaleSecondary) {
        const self = this;
        _.each(this.secondScale, function (day) {
            const divCell = $('<span class="task-gantt-bottom-column"></span>');
            divCell.css({
                width: self.timeScale + 'px'
            });
            if (moment(day).isoWeekday() === 6 || moment(day).isoWeekday() === 7) {
                divCell.addClass('task-gantt-weekend-column');
            }
            self.parent.isTODAYline = false;
            if (moment(day).isSame(self.TODAY, 'day')) {
                divCell.addClass('task-gantt-today-column');
                self.parent.isTODAYline = true;
            }
            divCell.css({
                'margin-top': -52 + 'px'
            });
            elScaleSecondary.append(divCell);
        });
    }

    renderDayHour(elScaleSecondary) {
        const self = this;
        _.each(this.firstScale, function (rangeDate) {
            _.each(rangeDate, function (hour) {
                const divCell = $('<span class="task-gantt-bottom-column"></span>');
                divCell.css({
                    width: self.timeScale + 'px'
                });
                if (moment(hour).isoWeekday() === 6 || moment(hour).isoWeekday() === 7) {
                    divCell.addClass('task-gantt-weekend-column');
                }
                if (moment(hour).isSame(self.TODAY, 'day')) {
                    divCell.addClass('task-gantt-today-column');
                }
                divCell.css({
                    'margin-top': -52 + 'px'
                });
                elScaleSecondary.append(divCell);
            });
        });
    }
}

export default GanttTimeLineHead;
