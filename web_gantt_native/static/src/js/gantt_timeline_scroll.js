/** @odoo-module **/

import { Component } from "@odoo/owl";
import { $ } from "@odoo/owl/dist/owl.utils";

class TimeLineGanttScroll extends Component {
    constructor(parent, timeScale, timeType, firstScale, secondScale) {
        super(parent);
        this.timeScale = timeScale;
        this.timeType = timeType;
        this.firstScale = firstScale;
        this.secondScale = secondScale;
        this.TODAY = moment();
    }

    scrollOffset(ganttDataOffset) {
        let scaleWidth = this.el.querySelector('.timeline-gantt-scroll-scale').offsetWidth - 50;
        if (scaleWidth) {
            let x1 = this.el.querySelector('.task-gantt-timeline').offsetWidth;
            let x2 = this.el.querySelector('.task-gantt-timeline-data').offsetWidth;
            let scrollWidth = x2 - x1;
            let scale = scrollWidth / scaleWidth;
            let offsetLeft = ganttDataOffset / scale;
            if (offsetLeft > scaleWidth) {
                offsetLeft = scaleWidth;
            }
            if (offsetLeft <= 0) {
                offsetLeft = 0;
            }
            this.el.querySelector('.timeline-gantt-scroll-slider').style.left = offsetLeft + 'px';
        }
    }

    updateCounterStatus(eventCounter, scaleWidth, scrollWidth) {
        let self = this.getParent();
        let offsetLeft = eventCounter.offsetLeft;
        let scale = scrollWidth / (scaleWidth - 50);
        let scaleX = offsetLeft * scale;
        this.el.querySelector('.timeline-gantt-head').scrollLeft = scaleX;
        this.el.querySelector('.task-gantt-timeline').scrollLeft = scaleX;
        self.TimeToLeft = scaleX;
    }

    async start() {
        await super.start();
        let self = this;
        let scaleWidth = 0;
        let scrollWidth = 0;
        let divCell = document.createElement('div');
        divCell.classList.add('timeline-gantt-scroll-slider');
        divCell.addEventListener('mousedown', function() {
            let timeline = self.el.querySelector('.task-gantt-timeline');
            scaleWidth = self.el.querySelector('.timeline-gantt-scroll-scale').offsetWidth;
            let x1 = timeline.offsetWidth;
            let x2 = self.el.querySelector('.task-gantt-timeline-data').offsetWidth;
            scrollWidth = x2 - x1;
            let x13 = timeline.scrollLeft;
        });
        divCell.addEventListener('mousemove', function() {
            self.updateCounterStatus(divCell, scaleWidth, scrollWidth);
        });
        divCell.addEventListener('mouseup', function() {
            self.updateCounterStatus(divCell, scaleWidth, scrollWidth);
        });

        let parent = this.getParent();
        let scrollStartDt = new Date(0);
        scrollStartDt.setTime(parent.firstDayDate);
        let scrollEndDt = new Date(0);
        scrollEndDt.setTime(parent.lastDayDate);
        let l10n = _t.database.parameters;
        let formatDate = time.strftime_to_moment_format(l10n.date_format + ' ' + l10n.time_format);
        let scrollStartStr = moment(scrollStartDt).format(formatDate);
        let scrollEndStr = moment(scrollEndDt).format(formatDate);

        let barStart = document.createElement('div');
        barStart.classList.add('timeline-gantt-scroll-scale-start');
        barStart.innerHTML = '<div class="timeline-gantt-scroll-scale-start-date">' + scrollStartStr + '</div>';

        let barEnd = document.createElement('div');
        barEnd.classList.add('timeline-gantt-scroll-scale-end');
        barEnd.innerHTML = '<div class="timeline-gantt-scroll-scale-end-date">' + scrollEndStr + '</div>';

        this.el.appendChild(barStart);
        this.el.appendChild(barEnd);
        this.el.appendChild(divCell);
    }
}

TimeLineGanttScroll.template = 'TimelineGantt.scroll';

export default TimeLineGanttScroll;
