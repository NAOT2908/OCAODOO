/** @odoo-module **/




odoo.define('web_gantt_native.TimeLineData', function (require) {
  'use strict';
  var core = require('web.core');
  var Dialog = require('web.Dialog');
  var Widget = require('web.Widget');
  var time = require('web.time');
  var _t = core._t;
  var GanttToolTip = require('web_gantt_native.ToolTip');
  var GanttToolHint = require('web_gantt_native.ToolHint');
  var GanttHeaderHint = require('web_gantt_native.HeaderHint');
  var NativeGanttData = require('web_gantt_native.NativeGanttData');
  var GanttTimeLineData = Widget.extend({
    template: 'GanttTimeLine.data',
    events: {
      'mouseover  .task-gantt-bar-plan': 'HandleTipOver',
      'mouseout   .task-gantt-bar-plan': 'HandleTipOut',
    },
    init: function (parent, timeScale, timeType, record, options) {
      this._super(parent);
      this.parent = parent;
      this.record = record;
      this.record_id = this.record['id'];
      this.BarRecord = undefined;
      this.BarClickDiffX = undefined;
      this.BarClickX = undefined;
      this.BarClickDown = false;
      this.items_sorted = options.items_sorted;
      this.tree_view = options.tree_view;
    },
    get_position_x: function (gantt_date_start, gantt_date_stop, any_date) {
      var task_start_time = gantt_date_start.getTime();
      var task_stop_time = gantt_date_stop.getTime();
      var task_start_pxscale = Math.round((task_start_time - this.parent.firstDayScale) / this.parent.pxScaleUTC);
      var task_stop_pxscale = Math.round((task_stop_time - this.parent.firstDayScale) / this.parent.pxScaleUTC);
      var bar_left = task_start_pxscale;
      var bar_width = task_stop_pxscale - task_start_pxscale;
      var any_status = false;
      if (any_date) {
        var any_date_time = any_date.getTime();
        var any_date_pxscale = Math.round((any_date_time - this.parent.firstDayScale) / this.parent.pxScaleUTC);
        var bar_any_left = false;
        var bar_any_width = false;
        if (any_date_pxscale >= task_stop_pxscale) {
          bar_any_left = bar_width;
          bar_any_width = any_date_pxscale - task_stop_pxscale;
          any_status = 'after_stop';
        }
        if (any_date_pxscale < task_stop_pxscale) {
          bar_any_left = bar_width - (task_stop_pxscale - any_date_pxscale);
          bar_any_width = task_stop_pxscale - any_date_pxscale;
          any_status = 'before_stop'
        }
        if (any_date_pxscale <= task_start_pxscale) {
          bar_any_left = bar_width - (task_stop_pxscale - any_date_pxscale);
          bar_any_width = task_start_pxscale - any_date_pxscale;
          any_status = 'before_start'
        }
      }
      return {
        bar_left: bar_left,
        bar_width: bar_width,
        bar_any_left: bar_any_left,
        bar_any_width: bar_any_width,
        any_status: any_status
      };
    },
    deadline_slider_gen: function (get_possition, not_render, id, gantt_bar) {
      bar_deadline_slider = false;
      if (!not_render) {
        var bar_deadline_left = get_possition.bar_any_left;
        var bar_deadline_width = get_possition.bar_any_width;
        var bar_deadline_status = get_possition.any_status;
        if (bar_deadline_left && bar_deadline_width) {
          var bar_deadline_slider = $('<div class="task-gantt-deadline-slider"></div>');
          var bar_deadline_slider_left = bar_deadline_left + bar_deadline_width;
          if (bar_deadline_status === 'before_stop' || bar_deadline_status === 'before_start') {
            bar_deadline_slider_left = bar_deadline_left
          }
          bar_deadline_slider.css({
            'left': bar_deadline_slider_left + 'px'
          });
        }
      }
      this.DragDeadLine(id, gantt_bar, bar_deadline_slider);
      return bar_deadline_slider
    },
    deadline_bar_gen: function (get_possition, deadline_lag) {
      var deadline_bar = false;
      if (!deadline_lag && this.record.date_deadline) {
        var bar_deadline_left = get_possition.bar_any_left;
        var bar_deadline_width = get_possition.bar_any_width;
        var bar_deadline_status = get_possition.any_status;
        var deadline_today = get_possition;
        var text_margin = 20;
        if (this.parent.isTODAYline) {
          deadline_today = this.get_position_x(moment().toDate(), moment().toDate(), this.record.date_deadline);
          text_margin = 5;
        }
        deadline_bar = $('<div class="task-gantt-bar-deadline"></div>');
        var bar_today_left = bar_deadline_left;
        var bar_today_width = deadline_today.bar_any_width;
        var bar_today_status = deadline_today.any_status;
        var gantt_bar_size = get_possition.bar_left + get_possition.bar_width;
        var lag_calc = 0;
        deadline_bar.css({
          'background': 'rgba(255, 190, 190, 0.33)'
        });
        var text_align = 'right';
        if (bar_today_status === 'after_stop') {
          deadline_bar.css({
            'background': 'rgba(167, 239, 62, 0.33)'
          });
          text_align = 'left';
        }
        if (bar_today_status === 'after_stop') {
          bar_today_left = bar_deadline_left - bar_today_width;
        }
        if (bar_today_status === 'after_stop' && bar_deadline_status === 'after_stop') {
          bar_today_left = bar_deadline_left - (bar_today_width - bar_deadline_width);
        }
        if ((bar_today_status === 'before_start' || bar_today_status === 'before_stop') && bar_deadline_status === 'after_stop') {
          bar_today_left = bar_deadline_left + bar_deadline_width;
        }
        deadline_bar.css({
          'left': bar_today_left + 'px'
        });
        deadline_bar.css({
          'width': bar_today_width + 'px'
        });
        var deadline_left = this.lag_any(moment(), this.record.date_deadline, '-  ', '+ ', true);
        if (deadline_left) {
          var bar_dl = $('<div class="task-gantt-bar-deadline-info"/>');
          bar_dl.css({
            'text-align': text_align
          });
          bar_dl.css('margin-' + text_align.toString(), lag_calc + text_margin + 'px');
          bar_dl.text(deadline_left);
          deadline_bar.append(bar_dl);
        }
      }
      return deadline_bar
    },
    done_bar_gen: function (deadline_lag) {
      var done_append = true;
      var done_slider = false;
      if (this.parent.fields_view.arch.attrs.state_status) {
        done_append = false;
        if (this.record.state === this.parent.fields_view.arch.attrs.state_status) {
          done_append = true;
        }
      }
      if (done_append) {
        var get_upossition_done = this.get_position_x(this.record.task_start, this.record.task_stop, this.record.date_done);
        var done_status = get_upossition_done.any_status;
        if (done_status) {
          done_slider = $('<div class="task-gantt-done-slider fa fa-check-circle-o"></div>');
          var done_left = get_upossition_done.bar_any_left;
          var done_width = get_upossition_done.bar_any_width;
          var done_slider_left = done_left + done_width;
          if (done_status === 'before_stop' || done_status === 'before_start') {
            done_slider_left = done_left;
          }
          done_slider.css({
            'left': done_slider_left + 'px'
          });
          var bar_d = $('<div class="task-gantt-done-info"/>');
          var bar_d_text = $('<a/>');
          if (deadline_lag) {
            bar_d_text.text(deadline_lag);
          }
          bar_d.append(bar_d_text);
          done_slider.append(bar_d);
        }
      }
      return done_slider
    },
    progress_bar_gen: function (get_possition) {
      var bar_progress = false;
      if (this.record.progress) {
        var progress_value = (get_possition.bar_width / 100) * this.record.progress;
        if (progress_value < 0) {
          progress_value = - progress_value + get_possition.bar_width
        }
        bar_progress = $('<div class="task-gantt-progress"></div>');
        bar_progress.css({
          'width': progress_value + 'px'
        });
      }
      return bar_progress
    },
    progress_bar_on_gantt_gen: function (get_possition, gantt_bar) {
      var bar_progress = false;
      if (this.record.progress && !this.record.on_gantt) {
        bar_progress = $('<div class="task-gantt-progress2">' + this.record.progress + '%</div>');
        bar_progress.css({
          'left': get_possition.bar_width / 3 + 'px'
        });
        if (gantt_bar.width() > 40) {
          var d_k = 3;
          if (gantt_bar.width() < 65) {
            d_k = 10;
          }
          bar_progress.css({
            'left': get_possition.bar_width / d_k + 'px'
          });
        }
      }
      return bar_progress
    },
    lag_any: function (first_date, second_date, lag_pos, lag_neg, left_position) {
      var lag_result = false;
      if (first_date && second_date) {
        var m_diff = moment(first_date).diff(moment(second_date));
        var m_duration = moment.duration(m_diff);
        var duration_seconds = parseInt(m_duration.asSeconds());
        if (duration_seconds) {
          lag_result = humanizeDuration(duration_seconds * 1000, {
            units: 'd',
            maxDecimalPoints: 2
          });
          var pos_neg = lag_pos;
          if (duration_seconds < 0) {
            pos_neg = lag_neg
          }
          if (left_position) {
            lag_result = pos_neg + lag_result;
          } 
          else {
            lag_result = lag_result + pos_neg;
          }
        }
      }
      return lag_result
    },
    start: function () {
      var self = this;
      var id = this.record_id;
      if (!this.record.is_group) {
        var color_gantt = false;
        if (this.record['color_gantt_set']) {
          color_gantt = this.record['color_gantt']
        }
        if (!color_gantt) {
          color_gantt = 'rgba(242, 197, 116, 0.6)';
          if (this.record.schedule_mode === 'auto') {
            color_gantt = 'rgba(111, 197, 242, 0.6)';
          }
          if (this.record.constrain_type !== 'asap' && this.record.constrain_type !== undefined && this.record.schedule_mode === 'auto') {
            color_gantt = 'rgba(242, 133, 113, 0.6)';
          }
        }
        var color_rgba = color_gantt.replace(/[^\d.,]/g, '').split(',');
        if (self.tree_view) {
          var isParent = this.record['isParent'];
          if (isParent) {
            color_rgba[3] = 0.2;
          }
        } else {
          var subtask_count = this.record['subtask_count'];
          if (subtask_count) {
            color_rgba[3] = 0.2;
          }
        }
        color_gantt = 'rgba(' + color_rgba[0] + ',' + color_rgba[1] + ',' + color_rgba[2] + ',' + color_rgba[3] + ')';
        var gantt_bar = $('<div class="task-gantt-bar-plan"></div>');
        var get_possition = this.get_position_x(this.record.task_start, this.record.task_stop, this.record.date_deadline);
        gantt_bar.css({
          'left': get_possition.bar_left + 'px'
        });
        gantt_bar.css({
          'width': get_possition.bar_width + 'px'
        });
        var bar_start = $('<div class="ui-resizable-handle ui-resizable-w task-gantt-bar-plan-start"></div>');
        var bar_end = $('<div class="ui-resizable-handle ui-resizable-e task-gantt-bar-plan-end"></div>');
        if (get_possition.bar_width === 0) {
          bar_start.addClass('task-gantt-bar-plan-start-zero');
          bar_end.addClass('task-gantt-bar-plan-end-zero');
        }
        gantt_bar.append(bar_start);
        gantt_bar.append(bar_end);
        var deadline_lag = this.lag_any(this.record.date_deadline, this.record.date_done, '+ ', '- ', true);
        var gantt_bar_widget = {
        };
        gantt_bar_widget['done_slider'] = this.done_bar_gen(deadline_lag);
        gantt_bar_widget['deadline_slider'] = this.deadline_slider_gen(get_possition, deadline_lag, id, gantt_bar);
        gantt_bar_widget['deadline_bar'] = this.deadline_bar_gen(get_possition, deadline_lag);
        gantt_bar_widget['progress_bar'] = this.progress_bar_gen(get_possition);
        gantt_bar_widget['progress_bar_on_gantt'] = this.progress_bar_on_gantt_gen(get_possition, gantt_bar);
        if (this.record.on_gantt) {
          var bar_name = $('<div class="task-gantt-name">' + this.record.value_name + '</div>');
          bar_name.css({
            'width': get_possition.bar_width - 5 + 'px'
          });
          gantt_bar.append(bar_name);
        }
        var color_gantt_milestone = false;
        if (this.record.is_milestone) {
          bar_end.addClass('fa fa-flag fa-1x');
          color_gantt_milestone = 'rgba(242, 197, 116, 0.1';
          if (this.record.schedule_mode === 'auto') {
            color_gantt_milestone = 'rgba(111, 197, 242, 0.1)'
          }
          if (this.record.constrain_type !== 'asap' && this.record.schedule_mode === 'auto') {
            color_gantt_milestone = 'rgba(242, 133, 113, 0.1)';
          }
        }
        if (id !== undefined) {
          this.$el.prop('id', 'task-gantt-timeline-row-' + id + '');
          this.$el.prop('data-id', id);
          this.$el.prop('allowRowHover', true);
          this.$el.prop('record', this.record);
          this.$el.prop('record_id', id);
          gantt_bar.prop('record_id', id);
          gantt_bar.prop('record', this.record);
          gantt_bar.addClass('task-gantt-bar-plan-' + id + '');
        }
        var critical_path = this.record['critical_path'];
        var cp_shows = this.record['cp_shows'];
        var p_loop = this.record['p_loop'];
        if (p_loop) {
          gantt_bar.addClass('task-gantt-items-p-loop');
        } 
        else if (critical_path && cp_shows) {
          gantt_bar.addClass('task-gantt-items-critical-path');
        }
        if (color_gantt_milestone) {
          color_gantt = color_gantt_milestone
        }
        this.record.color_gantt = color_gantt;
        gantt_bar.css({
          'background': color_gantt
        });
        this.bar_widget = gantt_bar_widget;
        _.each(gantt_bar_widget, function (widget, key) {
          gantt_bar.append(widget);
        });
        this.$el.append(gantt_bar);
      } 
      else {
        var group_id = this.record.group_id[0];
        this.$el.prop('id', 'task-gantt-timeline-group-row-' + group_id + '');
        this.$el.prop('group-data-id', group_id);
      }
      this.DragGantt(self, id, gantt_bar, this.record);
      this.ChangeSizeStart(self, id, gantt_bar, this.record);
      var fold = self.record['fold'];
      if (fold) {
        this.$el.css({
          'display': 'none'
        });
      }
    },
    DragDeadLine: function (id, gantt_el, element) {
      if (element) {
        var record = this.record;
        var self = this;
        var drag_el = element;
        var containment_el = 'task-gantt-timeline-row-' + id + '';
        drag_el.draggable({
          axis: 'x',
          containment: containment_el,
          scroll: false,
          start: async function (event, ui) {
            self.BarRecord = record;
            self.HintDestroy(self.parent);
            self.TipDestroy(self.parent);
            var gantt_line_hint = await new GanttToolHint(self.parent);
            gantt_line_hint.appendTo(self.parent.$('.task-gantt-line-hints'));
            self.parent.hint_move_widget = gantt_line_hint;
            self.HideDeadline('deadline');
            self.$el.prop('allowRowHover', false);
          },
          drag: function (event, ui) {
            var bar_info = self.GetGanttBarPlanPxTime();
            if (self.parent.hint_move_widget) {
              self.parent.hint_move_widget.show_hint(drag_el, bar_info, ui, 'deadline');
            }
          },
          stop: function (event, ui) {
            self.BarSave(self.BarRecord.id, 'deadline');
            self.HintDestroy(self.parent);
            self.BarRecord = undefined;
          }
        }).css('position', 'absolute');
      }
    },
    ChangeSizeStart: function (self, id, gantt_bar, record) {
      if (id !== undefined) {
        if (record['schedule_mode'] === 'manual' || record['schedule_mode'] === undefined) {
          var containment_el = 'task-gantt-timeline-row-' + id + '';
          gantt_bar.resizable({
            handles: {
              'e': '.task-gantt-bar-plan-end',
              'w': '.task-gantt-bar-plan-start'
            },
            start: async function (event, ui) {
              self.BarRecord = event.currentTarget.record;
              self.HintDestroy(self.parent);
              self.TipDestroy(self.parent);
              var gantt_line_hint = await new GanttToolHint(self.parent);
              gantt_line_hint.appendTo(self.parent.$('.task-gantt-line-hints'));
              self.parent.hint_move_widget = gantt_line_hint;
              self.HideDeadline();
              self.$el.prop('allowRowHover', false);
              gantt_bar.css({
                'background': 'rgba(98, 196, 51, 0.38)'
              });
            },
            resize: function (event, ui) {
              var bar_info = self.GetGanttBarPlanPxTime();
              if (self.parent.hint_move_widget) {
                self.parent.hint_move_widget.show_hint(gantt_bar, bar_info);
              }
            },
            stop: function (event, ui) {
              self.BarSave(self.BarRecord.id, 'bar');
              self.HintDestroy(self.parent);
              self.BarRecord = undefined;
              self.ScrollToTop = $('.task-gantt').scrollTop();
            }
          });
        }
      }
    },
    ChangeSizeEnd: function (self, id, element, gantt_bar, record) {
      if (id !== undefined) {
        if (record['schedule_mode'] === 'manual' || record['schedule_mode'] === undefined) {
          var drag_el = element;
          var containment_el = 'task-gantt-timeline-row-' + id + '';
          drag_el.draggable({
            axis: 'x',
            containment: containment_el,
            scroll: false,
            zIndex: 1000,
            start: async function (event, ui) {
              self.BarRecord = event.currentTarget.parentElement.record;
              self.BarClickDiffX = event.target.offsetLeft - event.clientX;
              self.BarClickX = event.clientX;
              self.HintDestroy(self.parent);
              self.TipDestroy(self.parent);
              var gantt_line_hint = await new GanttToolHint(self.parent);
              gantt_line_hint.appendTo(self.parent.$('.task-gantt-line-hints'));
              self.parent.hint_move_widget = gantt_line_hint;
              self.HideDeadline();
              self.$el.prop('allowRowHover', false);
              drag_el.css({
                'position': 'relative'
              });
              drag_el.css({
                'opacity': 0.8
              });
              drag_el.css({
                'background': 'rgb(76, 92, 246)'
              });
              gantt_bar.css({
                'background': 'rgba(98, 196, 51, 0.38)'
              });
            },
            drag: function (event, ui) {
              var bar_info = self.GetGanttBarPlanPxTime();
              if (self.parent.hint_move_widget) {
                self.parent.hint_move_widget.show_hint(gantt_bar, bar_info, ui);
                var offsetWidth = event.target.offsetParent.offsetWidth;
                var DiffForMove = self.BarClickX - event.clientX;
                var BarNewPos = offsetWidth - DiffForMove;
                var NewBarClickDiffX = offsetWidth - event.clientX;
                var Kdiff = self.BarClickDiffX - NewBarClickDiffX + 5;
                var new_width = BarNewPos + Kdiff + DiffForMove;
                if (new_width > 0) {
                  gantt_bar.css({
                    'width': (new_width) + 'px'
                  });
                }
              }
            },
            stop: function (event, ui) {
              self.BarSave(self.BarRecord.id, 'bar');
              self.HintDestroy(self.parent);
              self.BarRecord = undefined;
              self.$el.prop('allowRowHover', true);
              drag_el.css({
                'position': 'absolute'
              });
            }
          }).css('position', 'absolute');
        }
      }
    },
    DragGantt: function (self, id, element, record) {
      if (id !== undefined) {
        if (record['schedule_mode'] === 'manual' || record['schedule_mode'] === undefined) {
          var drag_el = element;
          var containment_el = 'task-gantt-timeline-row-' + id + '';
          drag_el.draggable({
            axis: 'x',
            containment: containment_el,
            scroll: false,
            start: async function (event, ui) {
              self.BarRecord = event.currentTarget.record;
              self.HintDestroy(self.parent);
              self.TipDestroy(self.parent);
              var gantt_line_hint = await new GanttToolHint(self.parent);
              gantt_line_hint.appendTo(self.parent.$('.task-gantt-line-hints'));
              self.parent.hint_move_widget = gantt_line_hint;
              self.HideDeadline();
              self.$el.prop('allowRowHover', false);
              drag_el.css({
                'background': 'rgba(98, 196, 51, 0.38)'
              });
            },
            drag: function (event, ui) {
              var bar_info = self.GetGanttBarPlanPxTime();
              if (self.parent.hint_move_widget) {
                self.parent.hint_move_widget.show_hint(drag_el, bar_info);
              }
            },
            stop: function (event, ui) {
              self.BarSave(self.BarRecord.id, 'bar');
              self.HintDestroy(self.parent);
              self.BarRecord = undefined;
            }
          }).css('position', 'absolute');
        }
      }
    },
    HintDestroy: function (parent) {
      if (parent.hint_move_widget) {
        parent.hint_move_widget.destroy();
        parent.hint_move_widget = undefined;
      }
    },
    TipDestroy: function (parent) {
      if (parent.tip_move_widget) {
        parent.tip_move_widget.destroy();
        parent.tip_move_widget = undefined;
      }
    },
    HandleTipOver: function (event) {
      var self = this;
      if (self.parent.tip_move_widget) {
        self.parent.tip_move_widget.destroy();
        self.parent.tip_move_widget = undefined;
      }
      if (!self.parent.hint_move_widget) {
        var gantt_bar = this.$el.children('.task-gantt-bar-plan');
        var gantt_line_tip = new GanttToolTip(self.parent, gantt_bar, event);
        gantt_line_tip.appendTo(self.parent.$('.task-gantt-line-tips'));
        self.parent.tip_move_widget = gantt_line_tip;
        var record_id = gantt_bar[0].record.id;
        if (record_id) {
          var rowdata = $('#task-gantt-bar-intersection-' + record_id);
          rowdata.addClass('task-gantt-bar-intersection-hover');
        }
      }
    },
    HandleTipOut: function () {
      var self = this;
      if (self.parent.tip_move_widget) {
        var record_id = self.parent.tip_move_widget.record[0].record_id
        if (record_id) {
          var rowdata = $('#task-gantt-bar-intersection-' + record_id);
          rowdata.removeClass('task-gantt-bar-intersection-hover');
        }
        self.parent.tip_move_widget.destroy();
        self.parent.tip_move_widget = undefined;
      }
    },
    HideDeadline: function (type) {
      var gantt_bar = this.$el.children('.task-gantt-bar-plan');
      var gantt_bardeadline = gantt_bar.children('.task-gantt-bar-deadline');
      if (gantt_bardeadline) {
        gantt_bardeadline.hide();
      }
      if (type !== 'deadline') {
        var gantt_done_slider = gantt_bar.children('.task-gantt-done-slider');
        if (gantt_done_slider) {
          gantt_done_slider.hide();
        }
        var bar_deadline_slider = gantt_bar.children('.task-gantt-deadline-slider');
        if (bar_deadline_slider) {
          bar_deadline_slider.hide();
        }
      }
    },
    BarSave: function (r_id, type) {
      var self = this;
      var data = {
      };
      var bar_info = this.GetGanttBarPlanPxTime();
      var model_fields_dict = this.parent.model_fields_dict;
      var parent = this.parent;
      var $zTree = parent.widget_ztree.$zTree;
      var match_task_id = $zTree.getNodeByParam('id', r_id);
      if (type === 'bar') {
        var f_data_start = model_fields_dict['date_start'];
        var f_date_stop = model_fields_dict['date_stop'];
        data[f_data_start] = time.datetime_to_str(bar_info.task_start);
        data[f_date_stop] = time.datetime_to_str(bar_info.task_end);
        this.parent.TimeToLeft = $('.task-gantt-timeline').scrollLeft();
        this.parent.ScrollToTop = $('.task-gantt').scrollTop();
        var check_fieds = [
          f_data_start,
          f_date_stop
        ];
        var readonly = NativeGanttData.CheckReadOnly(check_fieds, self.parent.fields, self.BarRecord);
        var check_readonly = _.findWhere(readonly, {
          readonly: true
        });
        if (check_readonly) {
          Dialog.alert(this, _.str.sprintf(_t('You are trying to write on a read-only field! : \'%s\' '), check_readonly['field']));
          return self.trigger_up('gantt_refresh_after_change');
        }
        var l10n = _t.database.parameters;
        var formatDate = time.strftime_to_moment_format(l10n.date_format + ' ' + l10n.time_format);
        var duration = moment.duration(moment(bar_info.task_start).diff(moment(bar_info.task_end)));
        var duration_seconds = duration.asSeconds();
        if (match_task_id) {
          match_task_id.task_start = bar_info.task_start;
          match_task_id.task_stop = bar_info.task_end;
          match_task_id.duration = duration_seconds;
        }
        $zTree.selectNode(match_task_id);
      }
      if (type === 'deadline') {
        var f_date_deadline = model_fields_dict['date_deadline'];
        data[f_date_deadline] = time.datetime_to_str(bar_info.deadline_time);
        this.parent.TimeToLeft = $('.task-gantt-timeline').scrollLeft();
        this.parent.ScrollToTop = $('.task-gantt').scrollTop();
        var check_field_deadline = [
          f_date_deadline
        ];
        var readonly_deadline = NativeGanttData.CheckReadOnly(check_field_deadline, self.parent.fields, self.BarRecord);
        var check_readonly_deadline = _.findWhere(readonly_deadline, {
          readonly: true
        });
        if (check_readonly_deadline) {
          Dialog.alert(this, _.str.sprintf(_t('You are trying to write on a read-only field! : \'%s\' '), check_readonly_deadline['field']));
          return self.trigger_up('gantt_refresh_after_change');
        }
        if (match_task_id) {
          match_task_id.date_deadline = bar_info.deadline_time;
        }
      }
      parent._rpc({
        model: parent.state.modelName,
        method: 'write',
        args: [
          [r_id],
          data
        ],
        context: parent.state.contexts
      }).then(function (ev) {
        self.trigger_up('warning', {
          title: _t('Bar Data Update'),
          message: _t('Data updated : ') + ev
        });
      });
      self.trigger_up('gantt_fast_refresh_after_change');
    },
    GetGanttBarPlanPxTime: function () {
      var gantt_bar = this.$el.children('.task-gantt-bar-plan');
      var tleft = parseInt(gantt_bar.css('left'), 10);
      var twidth = parseInt(gantt_bar.css('width'), 10);
      var tright = tleft + twidth;
      var task_start = (tleft * this.parent.pxScaleUTC) + this.parent.firstDayScale;
      var task_end = (tright * this.parent.pxScaleUTC) + this.parent.firstDayScale;
      var new_task_start = new Date(0);
      new_task_start.setTime(task_start);
      var new_task_end = new Date(0);
      new_task_end.setTime(task_end);
      var gantt_bar_deadline = gantt_bar.children('.task-gantt-deadline-slider');
      if (gantt_bar_deadline) {
        var deadline_px1 = parseInt(gantt_bar_deadline.css('left'), 10);
        var deadline_px = deadline_px1 + tleft;
        if (deadline_px1 < 0) {
          deadline_px = tleft + deadline_px1;
        }
        var deadline_time = (deadline_px * this.parent.pxScaleUTC) + this.parent.firstDayScale;
        var new_deadline_time = new Date(0);
        new_deadline_time.setTime(deadline_time);
        new_deadline_time.setUTCHours(0, 0, 0, 0)
      }
      return {
        task_start: new_task_start,
        task_end: new_task_end,
        deadline_time: new_deadline_time
      };
    }
  });
  return GanttTimeLineData;
}); ;
