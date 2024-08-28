import { Component, useState } from "@odoo/owl";
import { Tooltip } from "@web/core/tooltip/tooltip";
import { ToolHint } from "@web/core/toolhint/toolhint";
import { formatDate } from "@web/core/l10n/formatters";

class GanttTimeLineGhost extends Component {
    constructor() {
        super(...arguments);
        this.parent = this.getParent();
        this.dataWidgets = this.parent.gantt_timeline_data_widget;
        this.dataGhosts = this.parent.Ghost_Data;
    }

    async willStart() {
        await this._super();
        this.renderGhosts();
    }

    async renderGhosts() {
        for (const widget of this.dataWidgets) {
            if (!widget.record.is_group) {
                const rowId = widget.record.id;
                const linkGhosts = this.dataGhosts.filter(ghost => ghost.data_row_id === rowId);
                if (linkGhosts.length > 0) {
                    const dataMin = _.min(linkGhosts, ghost => ghost.date_start.getTime());
                    const dataMax = _.max(linkGhosts, ghost => ghost.date_end.getTime());
                    const startTime = dataMin.date_start.getTime();
                    const stopTime = dataMax.date_end.getTime();
                    const startPxScale = Math.round((startTime - this.parent.firstDayScale) / this.parent.pxScaleUTC);
                    const stopPxScale = Math.round((stopTime - this.parent.firstDayScale) / this.parent.pxScaleUTC);
                    const barLeft = startPxScale;
                    const barWidth = stopPxScale - startPxScale;
                    const ghostBar = $('<div class="task-gantt-bar-ghosts"></div>');
                    ghostBar.addClass('task-gantt-bar-ghosts-' + rowId);
                    ghostBar.css({
                        'left': barLeft + 'px',
                        'width': barWidth + 'px'
                    });
                    const rowData = widget.el;
                    for (const linkGhost of linkGhosts) {
                        const ghostBarX = $('<div class="task-gantt-bar-ghost"></div>');
                        const ghostStartTime = linkGhost.date_start.getTime();
                        const ghostStopTime = linkGhost.date_end.getTime();
                        const ghostStartPxScale = Math.round((ghostStartTime - this.parent.firstDayScale) / this.parent.pxScaleUTC);
                        const ghostStopPxScale = Math.round((ghostStopTime - this.parent.firstDayScale) / this.parent.pxScaleUTC);
                        const ghostBarLeft = ghostStartPxScale;
                        const ghostBarWidth = ghostStopPxScale - ghostStartPxScale;
                        ghostBarX.css({
                            'left': ghostBarLeft + 'px',
                            'width': ghostBarWidth + 'px'
                        });
                        $(rowData).append(ghostBarX);
                    }
                    $(rowData).append(ghostBar);
                }
            }
        }
    }
}

export default GanttTimeLineGhost;
