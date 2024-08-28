/** @odoo-module **/

import { Component, onMounted, onPatched } from '@odoo/owl';
import { patch } from "@web/core/utils/patch";
import { useState } from '@web/core/utils/hooks';

class GanttPager extends Component {
    constructor() {
        super(...arguments);
        this.state = useState({
            size: this.props.size,
            limit: this.props.limit
        });
        this.disabled = false;
    }

    onMounted() {
        this._render();
    }

    onPatched() {
        this._render();
    }

    _render() {
        const size = parseInt(this.state.size);
        const limit = parseInt(this.state.limit);
        this.el.querySelector('.gantt_pager_info').style.display = 'inline';
        const sizeEl = this.el.querySelector('.o_pager_size');
        const limitEl = this.el.querySelector('.o_pager_limit');

        sizeEl.style.color = 'green';
        if (limit !== 0) {
            if (size > limit) {
                sizeEl.style.color = 'red';
            }
        }
        limitEl.innerHTML = limit;
        sizeEl.innerHTML = size;
    }

    refresh(size, limit) {
        this.state.size = size;
        this.state.limit = limit;
    }

    disable() {
        this.disabled = true;
    }

    enable() {
        this.disabled = false;
    }

    updateState(state) {
        Object.assign(this.state, state);
        this._render();
        this.trigger('pager_changed', { ...this.state });
    }

    _edit() {
        const limitEl = this.el.querySelector('.o_pager_limit');
        const inputEl = document.createElement('input');
        inputEl.className = 'o_input';
        inputEl.type = 'text';
        inputEl.value = limitEl.innerHTML;
        inputEl.style.width = '45px';
        this.el.querySelector('.gantt_pager_info').style.display = 'none';
        limitEl.innerHTML = '';
        limitEl.appendChild(inputEl);
        inputEl.focus();

        inputEl.addEventListener('click', (ev) => {
            ev.stopPropagation();
        });

        inputEl.addEventListener('blur', (ev) => {
            this._save(inputEl);
        });

        inputEl.addEventListener('keydown', (ev) => {
            ev.stopPropagation();
            if (ev.key === 'Enter') {
                this._save(inputEl);
            } else if (ev.key === 'Escape') {
                this._render();
            }
        });
    }

    _save(inputEl) {
        const value = inputEl.value;
        if (value) {
            this.state.limit = value;
            this.trigger('pager_changed', { ...this.state });
        }
    }

    _onEdit(event) {
        event.stopPropagation();
        if (!this.disabled) {
            this._edit();
        }
    }
}

GanttPager.template = 'GanttAPS.Pager';

patch(GanttPager.prototype, 'web_gantt_native.Pager', {
    events: {
        'click .o_pager_limit': '_onEdit'
    },
});

export default GanttPager;
