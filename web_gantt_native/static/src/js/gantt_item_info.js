/** @odoo-module **/

import { Component, onMounted } from '@odoo/owl';
import { useState } from '@web/core/utils/hooks';
import { _t, _lt } from '@web/core/l10n/translation';
import time from 'web.time';

class GanttListInfo extends Component {
    setup() {
        this.parent = this.props.parent;
        this.items_sorted = this.props.items_sorted;
        this.export_wizard = this.props.export_wizard;
        this.main_group_id_name = this.props.main_group_id_name;
        this.action_menu = this.props.action_menu;
        this.tree_view = this.props.tree_view;
        this.$zTree = this.parent.widget_ztree.$zTree;
        this.state = useState({});

        onMounted(() => {
            this.start();
        });
    }

    start() {
        const $zTree = this.$zTree;
        const nodes = $zTree.getNodes();
        const items_start = document.createElement('div');
        items_start.className = 'item-list';
        const items_stop = document.createElement('div');
        items_stop.className = 'item-list';
        const l10n = _t.database.parameters;
        const formatDate = time.strftime_to_moment_format(l10n.date_format + ' ' + l10n.time_format);
        const items_duration = document.createElement('div');
        items_duration.className = 'item-info';
        const items_more = document.createElement('div');
        items_more.className = 'item-info';

        nodes.forEach((node) => {
            const childNodes = $zTree.transformToArray(node);
            childNodes.forEach((child) => {
                const item_info = document.createElement('div');
                item_info.className = 'item-info';
                const id = child['id'];
                if (id !== undefined) {
                    item_info.id = 'item-info-' + id;
                    item_info.dataset.id = id;
                    item_info.dataset.allowRowHover = true;
                }
                const fold = child['fold'];
                if (fold) {
                    item_info.style.display = 'none';
                }
                const child_text = child['child_text'];
                const more_info_text = item_info.cloneNode(true);
                if (child_text) {
                    more_info_text.textContent = child_text;
                    more_info_text.style.opacity = 0.6;
                }
                items_more.appendChild(more_info_text);
                const item_duration = item_info.cloneNode(true);
                const duration = child['duration'];
                let duration_units = undefined;
                if (duration) {
                    const duration_scale = child['duration_scale'];
                    if (duration_scale) {
                        duration_units = duration_scale.split(',');
                    }
                    let duration_humanize = humanizeDuration(duration * 1000, { round: true });
                    if (duration_units) {
                        duration_humanize = humanizeDuration(duration * 1000, {
                            units: duration_units,
                            round: true
                        });
                    }
                    if (this.parent.list_show !== -1) {
                        const infoDiv = document.createElement('div');
                        infoDiv.className = 'task-gantt-item-info';
                        infoDiv.style.float = 'right';
                        infoDiv.textContent = duration_humanize;
                        if (child['isParent']) {
                            infoDiv.className += ' task-gantt-items-subtask';
                        }
                        item_duration.appendChild(infoDiv);
                    }
                }
                items_duration.appendChild(item_duration);
                if (this.parent.list_show === 1) {
                    const item_start = item_info.cloneNode(true);
                    const task_start = child['task_start'];
                    if (task_start) {
                        const start_date_html = moment(task_start).format(formatDate);
                        const infoDiv = document.createElement('div');
                        infoDiv.className = 'task-gantt-item-info';
                        infoDiv.style.float = 'right';
                        infoDiv.textContent = start_date_html;
                        if (child['isParent']) {
                            infoDiv.className += ' task-gantt-items-subtask';
                        }
                        item_start.appendChild(infoDiv);
                    }
                    const item_stop = item_info.cloneNode(true);
                    const task_stop = child['task_stop'];
                    if (task_stop) {
                        const stop_date_html = moment(task_stop).format(formatDate);
                        const infoDiv = document.createElement('div');
                        infoDiv.className = 'task-gantt-item-info';
                        infoDiv.style.float = 'right';
                        infoDiv.textContent = stop_date_html;
                        if (child['isParent']) {
                            infoDiv.className += ' task-gantt-items-subtask';
                        }
                        item_stop.appendChild(infoDiv);
                    }
                    items_start.appendChild(item_start);
                    items_stop.appendChild(item_stop);
                }
            });
        });

        this.el.appendChild(items_duration);
        this.el.appendChild(items_start);
        this.el.appendChild(items_stop);
    }
}

GanttListInfo.template = 'GanttList.info';

export default GanttListInfo;
