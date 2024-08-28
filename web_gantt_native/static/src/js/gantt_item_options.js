/** @odoo-module **/

import { Component, onMounted } from '@odoo/owl';
import { useState } from '@web/core/utils/hooks';
import { _t, _lt } from '@web/core/l10n';
import time from 'web.time';
import { Dialog } from '@web/core/dialog/dialog';
import { rpc } from '@web/core/rpc';

class GanttListOptionsItem extends Component {
    setup() {
        this.parent = this.props.parent;
        this.$zTree = this.parent.widget_ztree.$zTree;
        this.state = useState({
            ItemsSorted: this.parent.ItemsSorted,
            orderedBy: this.parent.state.orderedBy,
            list_show: this.parent.list_show,
            industry_show: this.parent.industry_show,
            week_type: this.parent.week_type,
            Predecessor: this.parent.Predecessor,
            timeType: this.parent.timeType,
            contexts: this.parent.state.contexts,
        });

        onMounted(() => {
            this.start();
        });
    }

    start() {
        const { orderedBy } = this.state;
        if (!this.state.ItemsSorted && orderedBy && orderedBy.length) {
            const div_ = document.createElement('div');
            div_.className = 'text-left gantt-list-options-item';
            const _text = 'Sort - ' + this.parent.fields[orderedBy[0].name].string;
            let div_typer = document.createElement('div');
            div_typer.className = 'fa fa-sort-amount-desc gantt-list-options-item-sort';
            div_typer.setAttribute('aria-hidden', 'false');
            div_typer.setAttribute('title', 'desc ' + _text);

            if (orderedBy[0].asc) {
                div_typer.className = 'fa fa-sort-amount-asc gantt-list-options-item-sort';
                div_typer.setAttribute('title', 'asc ' + _text);
            }
            div_.appendChild(div_typer);
            this.el.appendChild(div_);
        }

        this.createOptionItem('list', this.state.list_show);
        this.createOptionItem('export-to-file');
        this.createOptionItem('industry', this.state.industry_show);
        this.createOptionItem('week', this.state.week_type);
    }

    createOptionItem(type, state) {
        const div = document.createElement('div');
        div.className = 'text-left gantt-list-options-item';
        let div_inner = document.createElement('div');

        switch (type) {
            case 'list':
                div_inner.className = 'fa fa-list gantt-list-options-item-check';
                if (state === 1) {
                    div_inner.className += ' gantt-list-options-item-check-active';
                    div_inner.setAttribute('title', 'Show All');
                } else if (state === -1) {
                    div_inner.className += ' gantt-list-options-item-check-inactive';
                    div_inner.setAttribute('title', 'Show Disable');
                } else {
                    div_inner.className += ' gantt-list-options-item-check-basic';
                    div_inner.setAttribute('title', 'Show Basic');
                }
                div_inner.dataset.key = type;
                break;
            case 'export-to-file':
                div_inner.className = 'fa fa-file-text-o gantt-list-options-export-to-file';
                div_inner.setAttribute('title', 'Screen to PDF');
                break;
            case 'industry':
                div_inner.className = 'fa fa-industry gantt-list-options-industry';
                if (state === 1) {
                    div_inner.className += ' gantt-list-options-industry-show';
                    div_inner.setAttribute('title', 'Time Line');
                } else {
                    div_inner.className += ' gantt-list-options-industry-hide';
                    div_inner.setAttribute('title', 'Time Line');
                }
                div_inner.dataset.key = type;
                break;
            case 'week':
                div_inner.className = 'fa fa-building gantt-list-options-week';
                if (state === 'week') {
                    div_inner.className += ' gantt-list-options-week-week';
                    div_inner.setAttribute('title', 'Week');
                } else {
                    div_inner.className += ' gantt-list-options-week-isoweek';
                    div_inner.setAttribute('title', 'Iso Week');
                }
                div_inner.dataset.key = type;
                break;
        }
        div.appendChild(div_inner);
        this.el.appendChild(div);
    }

    onClick(ev) {
        const { target } = ev;
        if (!ev.isTrigger) {
            if (target.classList.contains('gantt-list-options-item-sort')) {
                this.orderAction();
            } else if (target.classList.contains('gantt-list-options-item-check')) {
                this.listAction(target.dataset.key);
            } else if (target.classList.contains('gantt-list-options-export-to-file')) {
                this.exportAction();
            } else if (target.classList.contains('gantt-list-options-industry')) {
                this.industryAction(target.dataset.key);
            } else if (target.classList.contains('gantt-list-options-week')) {
                this.weekAction(target.dataset.key);
            }
        }
    }

    orderAction() {
        const { orderedBy } = this.state;
        if (orderedBy.length) {
            orderedBy[0].asc = !orderedBy[0].asc;
            this.trigger('gantt_refresh_after_change');
        }
    }

    listAction(key) {
        let list_show = 0;
        if (key === 'active') {
            list_show = -1;
        } else if (key === 'inactive') {
            list_show = 0;
        } else if (key === 'basic') {
            list_show = 1;
        }
        this.state.list_show = list_show;
        this.parent.local_storage.setItem('gantt_list_show', list_show);
        this.trigger('gantt_fast_refresh_after_change');
    }

    industryAction(key) {
        let industry_show = 0;
        if (key === 'hide') {
            industry_show = 1;
        }
        this.state.industry_show = industry_show;
        this.parent.local_storage.setItem('gantt_industry_show', industry_show);
        this.trigger('gantt_fast_refresh_after_change');
    }

    weekAction(key) {
        let week_type = 'week';
        if (key === 'week') {
            week_type = 'isoweek';
        }
        this.state.week_type = week_type;
        this.parent.local_storage.setItem('gantt_week_type', week_type);
        this.trigger('gantt_fast_refresh_after_change');
    }

    async exportAction() {
        const zTree = this.$zTree;
        const nodes = zTree.getNodes();
        const rows_to_gantt = nodes.reduce((acc, node) => {
            const childNodes = zTree.transformToArray(node);
            return acc.concat(childNodes.map(row => ({
                id: row.id,
                name: row.value_name,
                duration: row.duration,
                date_start: row.task_start ? time.auto_date_to_str(row.task_start, 'datetime') : undefined,
                date_end: row.task_stop ? time.auto_date_to_str(row.task_stop, 'datetime') : undefined,
                sorting_level: row.level,
                subtask_count: row.isParent ? 1 : 0,
                wbs: undefined,
                stuff: '',
                separate: row.is_group,
            })));
        }, []);

        const pre_data = this.state.Predecessor.map(predecessor => ({
            task_id: predecessor.task_id[0],
            parent_task_id: predecessor.parent_task_id[0],
            type: predecessor.type
        }));

        const context = {
            ...this.state.contexts,
            time_type: this.state.timeType || false,
            default_screen: true,
            default_data_json: JSON.stringify(rows_to_gantt),
            default_pre_json: JSON.stringify(pre_data)
        };

        const res_model = 'project.native.report';
        const exists = await rpc.query({
            model: 'gantt.native.tool',
            method: 'exist_model',
            args: ['project_native_report_advance'],
            context: this.state.contexts
        });

        if (exists) {
            this.exportOpen(res_model, context);
        }
    }

    exportOpen(res_model, context) {
        new Dialog(this, {
            title: _t('PDF Report for Screen'),
            res_model,
            context,
        }).open();
    }
}

GanttListOptionsItem.template = 'GanttList.options';

export default GanttListOptionsItem;
