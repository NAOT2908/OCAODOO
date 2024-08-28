/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useRef, useState } from "@odoo/owl";

class GanttHeaderHint extends Component {
    static template = 'GanttHeaderHint';

    constructor(parent) {
        super(parent);
        this.hintStartValue = useRef();
        this.hintElement = useRef();
    }

    async willStart() {
        await super.willStart();
        this.renderHintElements();
    }

    renderHintElements() {
        this.hintElement.el.innerHTML = `
            <div class="task-gantt-line-hint-names">
                <div class="task-gantt-line-hint-name"></div>
            </div>
            <div class="task-gantt-line-hint-values">
                <div class="hint-start-value task-gantt-line-hint-value"></div>
            </div>
        `;
        this.el.appendChild(this.hintElement.el);
    }

    showHint(target, ex, ey) {
        const hintStartValueEl = this.hintStartValue.el;
        hintStartValueEl.textContent = target.dataset.id;
        this.hintElement.el.style.top = `${ey + 30}px`;
        this.hintElement.el.style.left = `${ex}px`;
    }
}

export default GanttHeaderHint;
