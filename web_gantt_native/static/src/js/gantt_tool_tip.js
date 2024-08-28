/** @odoo-module **/

import { Component, hooks } from "@odoo/owl";
import { $ } from "@odoo/owl/dist/owl.utils";
import { _t } from "web.core";
import { time } from "web.time";
import moment from "moment";
import humanizeDuration from "humanize-duration";

class GanttToolTip extends Component {
    constructor(parent, ganttbar, event) {
        super(parent);
        this.record = ganttbar;
        this.event = event;
    }

    template = 'GanttToolTip';

    async willStart() {
        this.hintNames = [
            'Name:',
            'Start date:',
            'End date:',
            'Deadline:',
            'Progress:'
        ];
        return super.willStart();
    }

    async start() {
        await super.start();
        this.renderTipNames();
        this.renderTipValues();
    }

    renderTipNames() {
        let namesContainer = this.el.querySelector('.task-gantt-line-tip-names');
        this.hintNames.forEach(name => {
            $(namesContainer).append(`<div class="task-gantt-line-tip-name">${name}</div>`);
        });
    }

    renderTipValues() {
        let valuesContainer = this.el.querySelector('.task-gantt-line-tip-values');
        let recordData = this.record[0].record;

        let l10n = _t.database.parameters;
        let formatDate = time.strftime_to_moment_format(l10n.date_format + ' ' + l10n.time_format);

        let taskStart = moment(recordData['task_start']).format(formatDate);
        let taskStop = moment(recordData['task_stop']).format(formatDate);
        let dateDeadline = recordData['date_deadline'] ? moment(recordData['date_deadline']).format(formatDate) : '';
        let progress = recordData['progress'] ? recordData['progress'] + '%' : '';
        let dateDone = recordData['date_done'] ? moment(recordData['date_done']).format(formatDate) : '';
        let duration = recordData['duration'] ? humanizeDuration(parseInt(recordData['duration'], 10) * 1000, { round: true }) : '';
        let planDuration = recordData['plan_duration'] ? humanizeDuration(parseInt(recordData['plan_duration'], 10) * 1000, { round: true }) : '';
        let constrainType = recordData['constrain_type'] ? this.getConstrainType(recordData['constrain_type']) : '';
        let constrainDate = recordData['constrain_date'] ? moment(recordData['constrain_date']).format(formatDate) : '';

        [
            recordData['value_name'],
            taskStart,
            taskStop,
            dateDeadline,
            progress,
            dateDone,
            planDuration,
            duration,
            `${constrainType}: ${constrainDate}`
        ].forEach(value => {
            $(valuesContainer).append(`<div class="task-gantt-line-tip-value">${value}</div>`);
        });
    }

    getConstrainType(type) {
        let types = {
            'asap': 'As Soon As Possible',
            'alap': 'As Late As Possible',
            'fnet': 'Finish No Earlier Than',
            'fnlt': 'Finish No Later Than',
            'mso': 'Must Start On',
            'mfo': 'Must Finish On',
            'snet': 'Start No Earlier Than',
            'snlt': 'Start No Later Than'
        };
        return types[type] || '';
    }

    showTooltip() {
        if (this.record.offset()) {
            let oLeft = this.event.pageX;
            let oTop = this.record.el.offsetTop;
            let oRight = $(window).width() - (this.record.el.offsetLeft + this.record.el.offsetWidth);
            let tipLength = this.el.querySelector('.task-gantt-line-tip-names').children.length;
            let topNew = oTop - (15 * tipLength);

            if (oTop < 325) {
                topNew = oTop + 20;
            }

            if (oRight < 200) {
                oLeft = oLeft - 200;
            }

            this.el.style.top = `${topNew}px`;
            this.el.style.left = `${oLeft}px`;
        }
    }

    async mounted() {
        hooks.onMounted(() => {
            this.showTooltip();
        });
    }
}

export default GanttToolTip;
