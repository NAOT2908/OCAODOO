/** @odoo-module **/

import { Component } from '@odoo/owl';

export class GanttTimeLineDocs extends Component {
    constructor(parent) {
        super(parent);
    }

    async willStart() {
        await super.willStart();
        this.dataWidgets = this.getParent().gantt_timeline_data_widget;
    }

    mounted() {
        this.dataWidgets.forEach(widget => {
            if (!widget.record.is_group) {
                let el, findEl, docBar;
                const docEl = document.createElement('i');
                docEl.className = 'fa fa-paperclip';
                docEl.setAttribute('aria-hidden', 'false');

                const docCount = widget.record.doc_count;
                if (docCount && docCount.length) {
                    if (widget.bar_widget?.done_slider) {
                        el = widget.bar_widget.done_slider[0];
                        findEl = el.querySelector('.task-gantt-done-info');
                        docBar = document.createElement('div');
                        docBar.className = 'task-gantt-docs task-gantt-docs-slider';
                        docBar.appendChild(docEl);
                        if (findEl) {
                            findEl.appendChild(docBar);
                        } else {
                            el.appendChild(docBar);
                        }
                    } else if (widget.bar_widget?.deadline_bar) {
                        el = widget.bar_widget.deadline_bar[0];
                        const width = parseInt(window.getComputedStyle(el).getPropertyValue('width'));
                        docBar = document.createElement('div');
                        docBar.className = 'task-gantt-docs task-gantt-docs-slider';
                        docBar.appendChild(docEl);
                        docBar.style.left = `${width + 10}px`;
                        docBar.style.position = 'absolute';
                        el.appendChild(docBar);
                    } else {
                        docBar = document.createElement('div');
                        docBar.className = 'task-gantt-docs task-gantt-docs-bar';
                        docBar.appendChild(docEl);
                        el = this.el;
                        findEl = el.querySelector('.task-gantt-bar-plan-info-end');
                        if (findEl) {
                            findEl.parentNode.insertBefore(docBar, findEl);
                        }
                    }
                }
            }
        });
    }
}

