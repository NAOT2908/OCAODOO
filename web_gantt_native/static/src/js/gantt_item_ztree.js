/** @odoo-module **/

import { Component, useState } from owl;
import { useService } from '@web/core/utils/hooks';
import { registry } from '@web/core/registry';
import { Dialog } from '@web/core/dialog/dialog';
import { Model, ModelField } from '@web/core/model/model';
import { GanttNativeData } from 'web_gantt_native.GanttNativeData';

export class ItemzTree extends Component {
    setup() {
        this.orm = useService('orm');
        this.dialog = useService('dialog');
        this.notification = useService('notification');
        this.records = this.props.records || [];
        this.state = useState({
            items_sorted: this.props.items_sorted,
            export_wizard: this.props.export_wizard,
            main_group_id_name: this.props.main_group_id_name,
            action_menu: this.props.action_menu,
            tree_view: this.props.tree_view,
        });

        this.setting = {
            edit: {
                enable: this.props.items_sorted,
                showRemoveBtn: false,
                showRenameBtn: this.showRenameBtn,
                drag: {
                    next: true,
                    inner: true,
                    prev: true,
                    isCopy: false,
                },
            },
            view: {
                selectedMulti: false,
                fontCss: this.getFont,
                nameIsHTML: true,
                showIcon: false,
                txtSelectedEnable: false,
                addHoverDom: this.addHoverDom,
                removeHoverDom: this.removeHoverDom,
            },
            data: {
                key: {
                    name: 'value_name',
                },
                simpleData: {
                    enable: true,
                    idKey: 'zt_id',
                    pIdKey: 'zt_pId',
                },
            },
            callback: {
                beforeDrag: this.beforeDrag,
                beforeDrop: this.beforeDrop,
                onDrop: this.onDrop,
                onClick: this.zTreeOnClick,
                onCollapse: this.onCollapse,
                onExpand: this.onExpand,
                beforeCollapse: this.beforeCollapse,
                beforeEditName: this.beforeEditName,
                onRename: this.OnRename,
            },
        };

        if (this.records) {
            this.records = this.props.records;
        }
    }

    getFont(treeId, node) {
        return node['subtask_count'] ? { 'font-weight': 'bold' } : {};
    }

    showRenameBtn(treeId, treeNode) {
        return !treeNode.is_group;
    }

    async beforeEditName(treeId, treeNode) {
        const check_field = ['name'];
        const _read_only = await GanttNativeData.CheckReadOnly(check_field, this.props.fields, treeNode);
        const check_readonly = _read_only.find((field) => field.readonly);
        if (check_readonly) {
            this.notification.add(
                this.env._t('You are trying to edit a read-only field!'),
                {
                    type: 'warning',
                }
            );
            return false;
        }
    }

    async OnRename(event, treeId, treeNode, isCancel) {
        if (!isCancel) {
            const data = { name: treeNode.value_name };
            await this.orm.write(this.props.modelName, [treeNode.id], data, { context: this.props.context });
            this.notification.add(this.env._t('Data updated'), {
                type: 'success',
            });
            const match_item = this.props.rows_to_gantt.find((item) => item.id === treeNode.id);
            match_item.value_name = treeNode.value_name;
            if (treeNode.on_gantt) {
                this.trigger('gantt_fast_refresh_after_change');
            }
        } else {
            this.$zTree.cancelEditName();
        }
    }

    beforeCollapse(treeId, treeNode) {
        return treeNode.collapse !== false;
    }

    getChildNodes(treeNode) {
        const childNodes = this.$zTree.transformToArray(treeNode);
        return childNodes.filter((child) => treeNode.zt_id !== child.zt_id);
    }

    fold_bar(node, childs, fold) {
        childs.forEach((child) => {
            const match_task_id = this.props.rows_to_gantt.find((item) => item.id === child.id);
            match_task_id.fold = fold;
            child.fold = fold;
        });
        this.trigger('gantt_fast_refresh_after_change');
        if (node.widget.tree_view) {
            const fold_dic = {};
            if (node['id']) {
                fold_dic[node['id']] = fold;
                this.orm.call(this.props.modelName, 'fold_update', [fold_dic], { context: this.props.context });
            }
        }
    }

    onCollapse(event, treeId, treeNode) {
        const node = this.$zTree.getNodeByTId(treeNode.tId);
        const childs = this.getChildNodes(node);
        this.fold_bar(node, childs, true);
    }

    onExpand(event, treeId, treeNode) {
        const node = this.$zTree.getNodeByTId(treeNode.tId);
        const childs = this.getChildNodes(node);
        this.fold_bar(node, childs, false);
    }

    addHoverDom(treeId, treeNode) {
        if (!$('.item-button_' + treeNode.tId).length) {
            const aObj = $('#' + treeNode.tId + '_a');
            if (this.state.tree_view) {
                const add_bar = $('<span class="button custom task-gantt-add"/>')
                    .addClass('item-button_' + treeNode.tId)
                    .append('<i class="fa fa-plus fa-1x"></i>')
                    .attr('title', 'Add Record');
                aObj.append(add_bar);
            }
            if (treeNode.group_field && treeNode.group_field === this.state.action_menu) {
                const refresh_bar = $('<span class="button custom task-gantt-refresh"/>')
                    .addClass('item-button_' + treeNode.tId)
                    .append('<i class="fa fa-refresh fa-1x"></i>')
                    .attr('title', 'Rescheduling');
                aObj.append(refresh_bar);
                if (this.state.export_wizard) {
                    const export_bar = $('<span class="button custom task-gantt-wizard"/>')
                        .addClass('item-button_' + treeNode.tId)
                        .append('<i class="fa fa-arrow-right fa-arrow-click fa-1x"></i>')
                        .attr('title', 'Record to PDF');
                    aObj.append(export_bar);
                }
            }
        }
    }

    removeHoverDom(treeId, treeNode) {
        $('.item-button_' + treeNode.tId).remove();
    }

    async open_record(event, options) {
        if (event.data.is_group === false && event.data.id) {
            this.open_form(event.data.id, this.props.modelName);
        } else if (event.data.is_group) {
            const res_id = event.data.group_id;
            const name_model = this.props.modelName;
            const name_field = event.data.group_field;
            const res_model = await this.orm.call('gantt.native.tool', 'open_model', [name_model, name_field], { context: this.props.context });
            this.open_form(res_id, res_model, event.data.is_group, res_model !== 'project.project');
        }
    }

    open_form(res_id, res_model, is_group = false, readonly = false) {
        const context = this.props.context;
        const options = {
            size: 'large',
            res_model,
            res_id,
            context,
            readonly,
            on_saved: () => this.trigger('gantt_refresh_after_change'),
        };
        if (!is_group) {
            options.buttons = [
                {
                    text: this.env._t('Edit in Form View'),
                    classes: 'btn-primary',
                    close: true,
                    click: () => {
                        this.trigger('open_record', {
                            res_id,
                            mode: 'edit',
                            model: res_model,
                        });
                    },
                },
                {
                    text: this.env._t('Delete'),
                    classes: 'btn-default',
                    close: true,
                    click: async () => {
                        await this.orm.unlink(res_model, [res_id]);
                        this.trigger('gantt_refresh_after_change');
                    },
                },
                {
                    text: this.env._t('Close'),
                    classes: 'btn-default',
                    close: true,
                    click: () => this.trigger('gantt_refresh_after_change'),
                },
            ];
        }
        this.dialog.open(options);
    }

    remember_position(res_id) {
        const rowdata = `#task-gantt-timeline-row-${res_id}`;
        const rowitem = `#task-gantt-item-${res_id}`;
        $(rowdata).addClass('task-gantt-timeline-row-hover');
        $(rowitem).addClass('task-gantt-item-hover');
        this.hover_id = res_id;
        this.TimeToLeft = $('.task-gantt-timeline').scrollLeft();
        this.ScrollToTop = $('.task-gantt').scrollTop();
    }

    edit_record(event) {
        this.open_record(event, { mode: 'edit' });
    }

    zTreeOnClick(ev, treeId, treeNode) {
        const is_group = treeNode.is_group || false;
        if ($(ev.target).hasClass('node_name')) {
            this.trigger('item_record_edit', {
                id: treeNode.id,
                is_group,
                group_id: is_group ? treeNode.group_id[0] : false,
                group_field: is_group ? treeNode.group_field : false,
                group_model: is_group ? treeNode.group_model : false,
                active_id: treeNode.id,
            });
        }
        if ($(ev.target).hasClass('task-gantt-wizard')) {
            this.props.call_tool('export', treeNode.id, treeNode.group_field);
        }
        if ($(ev.target).hasClass('task-gantt-refresh')) {
            this.props.call_tool('refresh', treeNode.id);
        }
        if ($(ev.target).hasClass('task-gantt-add')) {
            this.trigger('item_add', {
                group_id: treeNode.group_id[0],
                group_field: treeNode.group_field,
            });
        }
    }

    beforeDrag(treeId, treeNodes) {
        for (const node of treeNodes) {
            if (node.drag === false) {
                return false;
            }
        }
        return true;
    }

    beforeDrop(treeId, treeNodes, targetNode, moveType, isCopy) {
        if (targetNode && targetNode.drop === false) {
            return false;
        }
        return true;
    }

    onDrop(event, treeId, treeNodes, targetNode, moveType, isCopy) {
        if (moveType === 'prev' || moveType === 'next') {
            const target_item = this.props.rows_to_gantt.find((item) => item.id === targetNode.id);
            const source_item = this.props.rows_to_gantt.find((item) => item.id === treeNodes[0].id);
            const field_order = this.props.fields_order;
            const model = this.props.modelName;
            const options = {
                context: this.props.context,
            };
            const list_order = this.props.rows_to_gantt
                .filter((item) => item.group_id === target_item.group_id)
                .map((item) => item.id);
            const old_index = list_order.indexOf(source_item.id);
            const new_index = list_order.indexOf(target_item.id);
            if (moveType === 'prev') {
                list_order.splice(old_index, 1);
                list_order.splice(new_index, 0, source_item.id);
            } else {
                list_order.splice(old_index, 1);
                list_order.splice(new_index + 1, 0, source_item.id);
            }
            const order_val = list_order.indexOf(source_item.id) + 1;
            const data = {
                [field_order]: order_val,
            };
            this.orm.write(model, [source_item.id], data, options).then(() => {
                this.trigger('gantt_fast_refresh_after_change');
            });
        }
    }
}

registry.category('items_tree').add('ItemsTree', ItemzTree);
