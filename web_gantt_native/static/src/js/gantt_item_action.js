/** @odoo-module **/

import { Component, onMounted } from '@odoo/owl';
import { patch } from '@web/core/utils';
import { useState } from '@web/core/utils/hooks';

class GanttListAction extends Component {
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
        nodes.forEach((node) => {
            const childNodes = $zTree.transformToArray(node);
            childNodes.forEach((child) => {
                const item_action = document.createElement('div');
                item_action.className = 'item-action';
                const id = child['zt_id'];
                if (id !== undefined) {
                    item_action.id = 'item-action-' + id;
                    item_action.setAttribute('data-id', id);
                }
                item_action.innerHTML = '<span class="action-focus"><i class="fa fa-crosshairs fa-1x"></i></span>';
                if (child['plan_action']) {
                    item_action.innerHTML += '<span class="action-plan"><i class="fa fa-exclamation"></i></span>';
                }
                const fold = child['fold'];
                if (fold) {
                    item_action.style.display = 'none';
                }
                this.el.appendChild(item_action);
            });
        });
        this.renderElement();
    }

    renderElement() {
        this.el.addEventListener('click', this.onGlobalClick.bind(this));
    }

    focusGanttLine(event) {
        const self = this.parent.__parentedParent;
        const $zTree = this.$zTree;
        const record = $zTree.getNodeByParam('zt_id', event.detail.id);
        $zTree.selectNode(record);
        if (!record.is_group) {
            const toscale = Math.round((record.task_start.getTime() - self.renderer.firstDayScale) / self.renderer.pxScaleUTC);
            self.renderer.TimeToLeft = toscale;
            let new_toscale = toscale - 500;
            if (new_toscale < 0) {
                new_toscale = 0;
            }
            document.querySelector('.timeline-gantt-head').scrollTo({ left: new_toscale, behavior: 'smooth' });
            document.querySelector('.task-gantt-timeline').scrollTo({ left: new_toscale, behavior: 'smooth' });
            self.renderer.gantt_timeline_scroll_widget.scrollOffset(new_toscale);
        }
    }

    onGlobalClick(ev) {
        if (!ev.isTrusted) {
            const id = ev.target.closest('.item-action').dataset.id;
            if (ev.target.classList.contains('fa-crosshairs')) {
                this.el.dispatchEvent(new CustomEvent('focus_gantt_line', {
                    detail: { id: id },
                    bubbles: true
                }));
            }
        }
    }
}

GanttListAction.template = 'GanttList.action';

patch(GanttListAction.prototype, 'web_gantt_native.ItemAction', {
    custom_events: {
        'focus_gantt_line': 'focusGanttLine'
    },
});

export default GanttListAction;
