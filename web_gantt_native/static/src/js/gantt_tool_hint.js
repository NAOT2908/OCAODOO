/** @odoo-module **/

import { Component } from "@odoo/owl";
import { $ } from "@odoo/owl/dist/owl.utils";
import { _t } from "web.core";
import { time } from "web.time";
import moment from "moment";
import humanizeDuration from "humanize-duration";

class GanttToolHint extends Component {
    constructor(parent) {
        super(parent);
    }

    async willStart() {
        this.hintNames = [
            'Start date:',
            'End date:',
            'Duration:',
            'Deadline:'
        ];
        return super.willStart();
    }

    async start() {
        await super.start();
        this.renderHintNames();
        this.renderHintValues();
    }

    template = 'GanttToolHint';

    renderHintNames() {
        let namesContainer = this.el.querySelector('.task-gantt-line-hint-names');
        this.hintNames.forEach(name => {
            $(namesContainer).append(`<div class="task-gantt-line-hint-name">${name}</div>`);
        });
    }

    renderHintValues() {
        let valuesContainer = this.el.querySelector('.task-gantt-line-hint-values');
        ['hint-start-value', 'hint-end-value', 'hint-duration-value', 'hint-deadline-value'].forEach(className => {
            $(valuesContainer).append(`<div class="${className} task-gantt-line-hint-value"></div>`);
        });
    }

    showHint(ganttBar, startEnd, ui, type) {
        let l10n = _t.database.parameters;
        let formatDate = time.strftime_to_moment_format(l10n.date_format + ' ' + l10n.time_format);

        let taskStart = moment(startEnd.task_start).format(formatDate);
        let taskEnd = moment(startEnd.task_end).format(formatDate);
        let duration = moment.duration(moment(startEnd.task_start).diff(moment(startEnd.task_end)));
        let durationSeconds = humanizeDuration(parseInt(duration.asSeconds(), 10) * 1000, {
            round: true
        });

        let offsetLeft = ganttBar.el.offsetLeft;
        let offsetTop = ganttBar.el.offsetTop;

        if (ui) {
            offsetLeft = ui.offset.left;
            offsetTop = ui.offset.top;
        }

        this.el.querySelector('.hint-start-value').textContent = taskStart;
        this.el.querySelector('.hint-end-value').textContent = taskEnd;
        this.el.querySelector('.hint-duration-value').textContent = durationSeconds;

        if (type === 'deadline') {
            let formatDateOnly = time.strftime_to_moment_format(l10n.date_format);
            let deadlineTime = moment(startEnd.deadline_time).format(formatDateOnly);
            this.el.querySelector('.hint-deadline-value').textContent = deadlineTime;
        }

        this.el.style.top = `${offsetTop - 55}px`;
        this.el.style.left = `${offsetLeft}px`;
    }
}

export default GanttToolHint;
