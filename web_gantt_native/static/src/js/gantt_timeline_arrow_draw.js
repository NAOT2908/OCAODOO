/** @odoo-module **/

import { Component, useState } from '@odoo/owl';
import { registry } from '@web/core/registry';

function LinkWrapper(prop) {
    const linkWrapper = document.createElement('div');
    linkWrapper.className = `gantt_timeline_link_wrapper gantt_timeline_link_wrapper_${prop.dir}`;
    linkWrapper.style.top = `${prop.top}px`;
    linkWrapper.style.left = `${prop.left}px`;
    linkWrapper.style.width = `${prop.width}px`;
    linkWrapper.style.height = `${prop.height}px`;

    if (prop.align_center) {
        linkWrapper.style.textAlign = 'center';
        prop.left -= 2;
    }

    if (prop.align) {
        linkWrapper.style.textAlign = 'left';
    }

    if (!prop.align_center && !prop.align && prop.critical_path) {
        linkWrapper.style.boxShadow = '0 0 2px 1px #b4aaaa6e';
    }

    linkWrapper.style.left = `${prop.left}px`;
    return linkWrapper;
}

function LinkCircle(path) {
    const circle = document.createElement('i');
    circle.className = 'fa fa-circle';
    circle.style.fontSize = '8px';
    circle.style.verticalAlign = '4px';
    circle.style.color = path.critical_path ? '#f36952' : path.color;
    return circle;
}

function LinkLine(prop, type) {
    const px = document.createElement('div');
    px.className = `gantt_timeline_link_${prop.dir}`;
    px.style.backgroundColor = prop.color;
    px.style.width = `${prop.width}px`;
    px.style.height = `${prop.height}px`;

    if (prop.mark) {
        const pType = document.createElement('div');
        pType.className = 'gantt_timeline_link_type';
        if (prop.p_loop) {
            pType.className = 'fa fa-undo';
            pType.style.color = '#f39a27';
        } else {
            pType.style.color = prop.color;
        }
        px.appendChild(pType);
    }

    return px;
}

function LinkArrow(path) {
    const arrow = document.createElement('i');
    arrow.className = `fa fa-caret-${path.dir}`;
    arrow.style.fontSize = '12px';
    arrow.style.verticalAlign = '1px';
    arrow.style.color = path.critical_path ? '#f36952' : path.color;
    return arrow;
}

function LinkStartPoint(prop) {
    return {
        top: prop.from_obj_top + 8,
        left: prop.type === 'FF' || prop.type === 'FS' ? prop.from_obj_left + prop.margin_stop + 2 : prop.from_obj_left - prop.margin_start,
        width: 8,
        height: 16,
        color: prop.color,
        type: prop.type,
        dir: 'S1',
        align_center: 1,
        critical_path: prop.critical_path,
    };
}

function LinkEndPoint(prop) {
    const path = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        color: prop.color,
        type: prop.type,
        dir: 0,
        align_center: 0,
        dirY: prop.directionY,
        critical_path: prop.critical_path,
    };

    if (prop.type === 'FF' || prop.type === 'SF') {
        path.left = prop.to_obj_left + prop.margin_stop + 7;
        path.width = 10;
        path.height = 16;
        path.align = 1;
        path.dir = 'left';
        path.top = prop.directionY === 'up' ? prop.to_obj_top + prop.margin_arrow_down : prop.to_obj_top + prop.margin_arrow_top;
    } else if (prop.type === 'SS' || prop.type === 'FS') {
        path.left = prop.to_obj_left - prop.margin_start - 7;
        path.width = 10;
        path.height = 16;
        path.dir = 'right';
        path.align = 1;
        path.top = prop.directionY === 'up' ? prop.to_obj_top + prop.margin_arrow_down : prop.to_obj_top + prop.margin_arrow_top;
    }

    return path;
}

function CalcStep(prop, from, to) {
    if (to.top < from.top) {
        if (to.left - from.left > 10) {
            if (prop.type === 'SS') {
                return ['up', 'right'];
            } else if (prop.type === 'SF') {
                return ['up', 'right', 'up', 'left'];
            } else if (prop.type === 'FS') {
                return ['up', 'right'];
            }
        } else {
            if (prop.type === 'SS') {
                return ['up', 'left', 'up', 'right'];
            } else if (prop.type === 'SF') {
                return ['up', 'left'];
            } else if (prop.type === 'FS') {
                return ['up', 'left', 'up', 'right'];
            }
        }

        if (to.left > from.left) {
            if (prop.type === 'FF') {
                return ['up', 'right', 'up', 'left'];
            }
        } else {
            if (prop.type === 'FF') {
                return ['up', 'left'];
            }
        }
    } else if (to.top > from.top) {
        if (to.left > from.left) {
            if (prop.type === 'SS') {
                return ['down', 'right'];
            } else if (prop.type === 'SF') {
                return ['down', 'right', 'down', 'left'];
            } else if (prop.type === 'FS') {
                return ['down', 'right'];
            } else if (prop.type === 'FF') {
                return ['down', 'right', 'down', 'left'];
            }
        } else {
            if (prop.type === 'SS') {
                return ['down', 'left', 'down', 'right'];
            } else if (prop.type === 'SF') {
                return ['down', 'left'];
            } else if (prop.type === 'FS') {
                return ['down', 'left', 'down', 'right'];
            } else if (prop.type === 'FF') {
                return ['down', 'left'];
            }
        }
    }
    return [];
}

function CalcPath(prop, from, to, dir, step, mark) {
    const path = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        color: prop.color,
        type: prop.type,
        dir: 0,
        align_center: 0,
        mark: mark,
        critical_path: prop.critical_path,
        p_loop: prop.p_loop,
    };

    if (path.critical_path) {
        path.color = '#f36952';
    }

    if (dir === 'up') {
        if (to) {
            if (step === 0) {
                path.top = to.top + 7;
                path.left = from.left + 3;
                path.height = from.top - path.top + 4;
            } else {
                path.top = to.top + 7;
                path.left = to.left - 7;
                if (prop.type === 'FF' || prop.type === 'SF') {
                    path.left = to.left + 10;
                }
                path.height = from.top - path.top + 2;
            }
        } else {
            path.top = from.top - 10;
            path.left = from.left + 3;
            path.width = prop.line_size;
            path.height = 20;
        }
        path.width = prop.line_size;
    } else if (dir === 'down') {
        if (to) {
            if (step === 0) {
                path.top = from.top + 10;
                path.left = from.left + 3;
                path.height = to.top - path.top + 7;
            } else {
                path.top = from.top;
                path.left = to.left - 7;
                if (prop.type === 'FF' || prop.type === 'SF') {
                    path.left = to.left + 10;
                }
                path.height = to.top - path.top + 7;
            }
        } else {
            path.top = from.top + 10;
            path.left = from.left + 3;
            path.width = prop.line_size;
            path.height = 10;
        }
        path.width = prop.line_size;
    } else if (dir === 'right') {
        path.top = from.top;
        if (prop.directionY === 'down') {
            path.top = from.top + from.height;
        }
        path.left = from.left;
        if (step === 0) {
            path.width = to.left - from.left;
        } else {
            path.width = to.left - from.left + 10;
        }
        path.height = prop.line_size;
    } else if (dir === 'left') {
        path.top = from.top;
        if (prop.directionY === 'down') {
            path.top = from.top + from.height;
        }
        path.left = to.left - 7;
        if (prop.type === 'FF' || prop.type === 'SF') {
            path.left = to.left + 10;
        }
        if (step === 0) {
            path.left = to.left;
        }
        path.width = from.left - path.left;
        path.height = prop.line_size;
    }
    return path;
}

export function TimeLineArrowDraw(links, group_links) {
    for (let link_id in links) {
        let prop = links[link_id];
        const from = LinkStartPoint(prop);
        const to = LinkEndPoint(prop);

        const pathContainer = [];
        const step = CalcStep(prop, from, to);

        for (let i in step) {
            const path = CalcPath(prop, from, to, step[i], i, i === step.length - 1 ? true : false);
            from.top = path.top;
            from.left = path.left;
            pathContainer.push(path);
        }

        const linkWrapper = LinkWrapper(from);

        linkWrapper.appendChild(LinkCircle(prop));

        for (let i in pathContainer) {
            const path = pathContainer[i];
            linkWrapper.appendChild(LinkLine(path, pathContainer.length - 1 === parseInt(i) ? 'arrow' : ''));
        }

        linkWrapper.appendChild(LinkArrow(prop));

        group_links.appendChild(linkWrapper);
    }
}

registry.category('services').add('gantt.timeline.arrow.draw', TimeLineArrowDraw);
