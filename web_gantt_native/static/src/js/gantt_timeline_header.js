/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useRef } from "@odoo/owl";
import moment from "moment";

class GanttTimeLineHeader extends Component {
    static template = 'TimelineGantt.header';

    constructor(parent, timeScale, timeType, firstScale, secondScale) {
        super(parent);
        this.timeScale = timeScale;
        this.timeType = timeType;
        this.firstScale = firstScale;
        this.secondScale = secondScale;
        this.TODAY = moment();
    }

    start() {
        let self = this;
        let el = self.$el;
        let renderer = self.__parentedParent;

        let elScalePrimary = el.querySelector('.timeline-gantt-scale-primary');
        let elScaleSecondary = el.querySelector('.timeline-gantt-scale-secondary');
        let tipEl = self.__parentedParent.el.querySelector('.task-gantt-line-tips');

        let ganttHeaderHint = new renderer.HeaderHint(self.__parentedParent);
        ganttHeaderHint.appendTo(tipEl);
        self.__parentedParent.header_hint_widget = ganttHeaderHint;

        if (this.timeType === 'day_1hour' || this.timeType === 'day_2hour' || this.timeType === 'day_4hour' || this.timeType === 'day_8hour') {
            this.firstScale.forEach(function (rangeDate) {
                let dm = moment(rangeDate).format('Do MMM dd - YY');
                let monthScale = self.timeScale * rangeDate.length;
                let divCell = document.createElement('span');
                divCell.classList.add('task-gantt-top-column');
                divCell.style.width = monthScale + 'px';
                divCell.innerHTML = `<span class="task-gantt-scale-month-text">${dm}</span>`;
                elScalePrimary.appendChild(divCell);

                rangeDate.forEach(function (hour) {
                    let hoursString = moment(hour).format('HH:mm');
                    let divCell = document.createElement('span');
                    divCell.classList.add('task-gantt-bottom-column');
                    divCell.textContent = hoursString;
                    divCell.style.width = self.timeScale + 'px';
                    if (moment(hour).isoWeekday() === 6 || moment(hour).isoWeekday() === 7) {
                        divCell.classList.add('task-gantt-weekend-column');
                    }
                    if (moment(hour).isSame(self.TODAY, 'day')) {
                        divCell.classList.add('task-gantt-today-column');
                    }
                    elScaleSecondary.appendChild(divCell);
                });
            });
        }

        if (this.timeType === 'month_day') {
            this.secondScale.forEach(function (day) {
                let dayOfMonth = moment(day).date();
                let divCell = document.createElement('span');
                divCell.classList.add('task-gantt-bottom-column');
                divCell.textContent = dayOfMonth;
                divCell.style.width = self.timeScale + 'px';
                if (moment(day).isoWeekday() === 6 || moment(day).isoWeekday() === 7) {
                    divCell.classList.add('task-gantt-weekend-column');
                }
                if (moment(day).isSame(self.TODAY, 'day')) {
                    divCell.classList.add('task-gantt-today-column');
                }
                let dayString = moment(day).format('Do MMM dd (YY)');
                divCell.setAttribute('data-id', dayString);
                elScaleSecondary.appendChild(divCell);
            });

            this.firstScale.forEach(function (month) {
                let monthScale = self.timeScale * month.days;
                let divCell = document.createElement('span');
                divCell.classList.add('task-gantt-top-column');
                divCell.style.width = monthScale + 'px';
                divCell.innerHTML = `<span class="task-gantt-scale-month-text">${month.year} - ${month.month}</span>`;
                elScalePrimary.appendChild(divCell);
            });
        }

        if (this.timeType === 'month_week') {
            this.firstScale.forEach(function (rangeDate) {
                let dm = moment(rangeDate, 'YYYY').format('YYYY');
                let monthScale = self.timeScale * rangeDate.length;
                let divCell = document.createElement('span');
                divCell.classList.add('task-gantt-top-column');
                divCell.style.width = monthScale + 'px';
                divCell.innerHTML = `<span class="task-gantt-scale-month-text">${dm}</span>`;
                elScalePrimary.appendChild(divCell);

                rangeDate.forEach(function (weekNum) {
                    let weekString = moment(weekNum).format('W');
                    let marker = 'iW';
                    if (renderer.weekType === 'week') {
                        marker = 'W';
                    }
                    let divCell = document.createElement('span');
                    divCell.classList.add('task-gantt-bottom-column');
                    divCell.textContent = weekString;
                    divCell.style.width = self.timeScale + 'px';
                    let weekStart = moment(weekNum).startOf(renderer.weekType).format('Do MMM dd (YY)');
                    let weekEnd = moment(weekNum).endOf(renderer.weekType).format('Do MMM dd (YY)');
                    divCell.setAttribute('data-id', `${marker}: ${weekString}: ${weekStart} - ${weekEnd}`);
                    if (moment(weekNum).isSame(self.TODAY, 'week')) {
                        divCell.classList.add('task-gantt-today-column');
                    }
                    elScaleSecondary.appendChild(divCell);
                });
            });
        }

        if (this.timeType === 'quarter') {
            this.firstScale.forEach(function (rangeDate) {
                let dm = moment(rangeDate, 'YYYY').format('YYYY');
                let monthScale = self.timeScale * rangeDate.length;
                let divCell = document.createElement('span');
                divCell.classList.add('task-gantt-top-column');
                divCell.style.width = monthScale + 'px';
                divCell.innerHTML = `<span class="task-gantt-scale-month-text">${dm}</span>`;
                elScalePrimary.appendChild(divCell);

                rangeDate.forEach(function (quarter) {
                    let weekString = moment(quarter).format('Q');
                    let divCell = document.createElement('span');
                    divCell.classList.add('task-gantt-bottom-column');
                    divCell.textContent = weekString;
                    divCell.style.width = self.timeScale + 'px';
                    elScaleSecondary.appendChild(divCell);
                });
            });
        }

        if (this.timeType === 'year_month') {
            this.firstScale.forEach(function (rangeDate) {
                let dm = moment(rangeDate, 'YYYY').format('YYYY');
                let monthScale = self.timeScale * rangeDate.length;
                let divCell = document.createElement('span');
                divCell.classList.add('task-gantt-top-column');
                divCell.style.width = monthScale + 'px';
                divCell.innerHTML = `<span class="task-gantt-scale-month-text">${dm}</span>`;
                elScalePrimary.appendChild(divCell);

                rangeDate.forEach(function (month) {
                    let weekString = moment(month).format('MMM');
                    let divCell = document.createElement('span');
                    divCell.classList.add('task-gantt-bottom-column');
                    divCell.textContent = weekString;
                    divCell.style.width = self.timeScale + 'px';
                    elScaleSecondary.appendChild(divCell);
                });
            });
        }
    }

    HandleTipOver(ev) {
        let self = this;
        if (ev.target.dataset.id) {
            if (self.__parentedParent.header_hint_widget) {
                self.__parentedParent.header_hint_widget.doShow();
            }
            self.__parentedParent.header_hint_widget.showHint(ev.target, ev.pageX, ev.pageY);
        }
    }

    HandleTipOut(ev) {
        let self = this;
        if (self.__parentedParent.header_hint_widget) {
            self.__parentedParent.header_hint_widget.doHide();
        }
    }
}

export default GanttTimeLineHeader;
