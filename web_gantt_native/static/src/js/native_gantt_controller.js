odoo.define('web_gantt_native.NativeGanttController', function (require) {
  'use strict';
  var AbstractController = require('web.AbstractController');
  var core = require('web.core');
  var config = require('web.config');
  var Dialog = require('web.Dialog');
  var dialogs = require('web.view_dialogs');
  var time = require('web.time');
  var GanttPager = require('web_gantt_native.Pager');
  var _t = core._t;
  var QWeb = core.qweb;
  var NativeGanttController = AbstractController.extend({
    custom_events: _.extend({
    }, AbstractController.prototype.custom_events, {
      gantt_refresh_after_change: '_onGanttRefresh',
      gantt_fast_refresh_after_change: '_refresh_after_change',
      gantt_add_hover: '_add_hover',
      gantt_remove_hover: '_remove_hover',
      'sort_item': function (event) {
        this.sort_item(event.target);
      },
    }),
    events: _.extend({
    }, AbstractController.prototype.events, {
      'mouseover  .task-gantt-info, .task-gantt-timeline-row': 'HandleHoverOver',
      'mouseout   .task-gantt-info, .task-gantt-timeline-row': 'HandleHoverOut',
    }),
    init: function (parent, model, renderer, params) {
      this._super.apply(this, arguments);
      this.set('title', params.title);
      this.context = params.context;
      this.initialState = params.initialState;
    },
    _onOpenRecord: function (event) {
      event.stopPropagation();
      this.trigger_up('switch_view', {
        view_type: 'form',
        res_id: event.data.res_id,
        mode: event.data.mode || 'readonly',
        model: event.data.model
      });
    },
    _onGanttRefresh: function (event) {
      var self = this;
      this.model._do_load().then(function (ev) {
        self.reload();
      });
    },
    _refresh_after_change: function () {
      this.renderer.fast_update = true;
      var def = this._update(this.initialState, {
        shouldUpdateSearchComponents: false
      });
      return Promise.all([def]);
    },
    _update: async function (state, params) {
      var self = this;
      var def = undefined;
      if (this.renderer.timeType === 'month_day') {
        await self.ZoomDaysClick();
      }
      if (this.renderer.timeType === 'day_1hour') {
        await self.Zoom1hClick();
      }
      if (this.renderer.timeType === 'day_2hour') {
        await self.Zoom2hClick();
      }
      if (this.renderer.timeType === 'day_4hour') {
        await self.Zoom4hClick();
      }
      if (this.renderer.timeType === 'day_8hour') {
        await self.Zoom8hClick();
      }
      if (this.renderer.timeType === 'year_month') {
        await self.ZoomMonthClick();
      }
      if (this.renderer.timeType === 'month_week') {
        await self.ZoomWeeksClick();
      }
      if (this.renderer.timeType === 'quarter') {
        await self.ZoomQuarterClick();
      }
      $('.task-gantt-list').width(this.renderer.local_storage.getItem('gantt_offset') || this.renderer.gutterOffset);
      $('.timeline-gantt-items').width(this.renderer.local_storage.getItem('gantt_offset') || this.renderer.gutterOffset);
      $('.task-gantt-items').width(this.renderer.local_storage.getItem('items_offset') || this.renderer.itemsOffset);
      var rowdata = '#task-gantt-timeline-row-' + this.renderer.hover_id;
      var rowitem = '#task-gantt-item-' + this.renderer.hover_id;
      $(rowdata).addClass('task-gantt-timeline-row-hover');
      $(rowitem).addClass('task-gantt-item-hover');
      if (this.renderer.TimeToLeft) {
        var task_left = this.renderer.TimeToLeft;
        $('.task-gantt-timeline').animate({
          scrollLeft: task_left
        }, 0, function () {
        });
        $('.timeline-gantt-head').animate({
          scrollLeft: task_left
        }, 0, function () {
        });
        this.renderer.gantt_timeline_scroll_widget.scrollOffset(task_left);
      }
      if (this.renderer.ScrollToTop) {
        var panel_top = this.renderer.ScrollToTop;
        $('.task-gantt').animate({
          scrollTop: panel_top
        }, 0, function () {
        });
      }
      if (this.pager) {
        this.pager.refresh(this.renderer.state.pager.records, this.renderer.state.pager.limit);
      }
    },
    renderPager: function ($node, options) {
      var self = this;
      var data = [
      ];
      data['size'] = this.renderer.state.pager.records;
      data['limit'] = this.renderer.state.pager.limit;
      this.pager = new GanttPager(this, data.size, data.limit, options);
      this.pager.on('pager_changed', this, function (newState) {
        self.pager.disable();
        self.renderer.state.pager.limit = parseInt(newState.limit);
        self.reload().then(self.pager.enable.bind(self.pager));
      });
      this.pager.appendTo($node);
    },
    renderButtons: function ($node) {
      var context = {
        measures: _.pairs(_.omit(this.measures, '__count__'))
      };
      this.$buttons = $(QWeb.render('APSGanttView.buttons', context));
      this.$buttons.click(this.on_button_click.bind(this));
      this.renderPager(this.$buttons)
    },
    on_button_click: function (event) {
      this.renderer.fast_update = true;
      let $target = $(event.target);
      if ($target.hasClass('task-gantt-today')) {
        return this.ClickToday();
      }
      if ($target.hasClass('task-gantt-zoom-1h')) {
        this.renderer.timeType = 'day_1hour';
      }
      if ($target.hasClass('task-gantt-zoom-2h')) {
        this.renderer.timeType = 'day_2hour';
      }
      if ($target.hasClass('task-gantt-zoom-4h')) {
        this.renderer.timeType = 'day_4hour';
      }
      if ($target.hasClass('task-gantt-zoom-8h')) {
        this.renderer.timeType = 'day_8hour';
      }
      if ($target.hasClass('task-gantt-zoom-days')) {
        this.renderer.timeType = 'month_day';
      }
      if ($target.hasClass('task-gantt-zoom-month')) {
        this.renderer.timeType = 'year_month';
      }
      if ($target.hasClass('task-gantt-zoom-weeks')) {
        this.renderer.timeType = 'month_week'
      }
      if ($target.hasClass('task-gantt-zoom-quarter')) {
        this.renderer.timeType = 'quarter'
      }
      return this._refresh_after_change();
    },
    ModificateAfterRender: function () {
      if (this.renderer.TimeToLeft) {
        var task_left = this.renderer.TimeToLeft;
        $('.task-gantt-timeline').animate({
          scrollLeft: task_left
        }, 0, function () {
        });
        $('.timeline-gantt-head').animate({
          scrollLeft: task_left
        }, 0, function () {
        });
        this.renderer.gantt_timeline_scroll_widget.scrollOffset(task_left);
      }
    },
    Zoom1hClick: async function () {
      await this.ZoomHoursClick(1, 'day_1hour');
    },
    Zoom2hClick: async function () {
      await this.ZoomHoursClick(2, 'day_2hour');
    },
    Zoom4hClick: async function () {
      await this.ZoomHoursClick(4, 'day_4hour');
    },
    Zoom8hClick: async function () {
      await this.ZoomHoursClick(8, 'day_8hour');
    },
    ZoomHoursClick: async function (div_hour, timeType) {
      this.renderer.firstDayDate = moment(this.renderer.GtimeStart).clone().startOf('month');
      this.renderer.lastDayDate = moment(this.renderer.GtimeStop).clone().endOf('month');
      this.renderer.timeScaleUTC = this.renderer.lastDayDate.valueOf() - this.renderer.firstDayDate.valueOf();
      this.renderer.firstDayScale = this.renderer.firstDayDate.valueOf();
      var iter = moment(this.renderer.firstDayDate).twix(this.renderer.lastDayDate).iterate(div_hour, 'hours');
      var hour2Range = [
      ];
      while (iter.hasNext()) {
        hour2Range.push(iter.next().toDate())
      }
      var daysGroup = _(hour2Range).groupBy(function (day) {
        return moment(day).format('YYYY MM DD');
      });
      this.renderer.timeType = timeType;
      this.renderer.timeScale = 40;
      var iter_k = moment(this.renderer.firstDayDate).twix(this.renderer.lastDayDate).iterate(1, 'hours');
      var K_scale = 0;
      while (iter_k.hasNext()) {
        iter_k.next();
        K_scale = K_scale + 1;
      }
      K_scale = K_scale / div_hour;
      this.renderer.timeline_width = this.renderer.timeScale * K_scale;
      this.renderer.pxScaleUTC = Math.round(this.renderer.timeScaleUTC / this.renderer.timeline_width);
      await this.renderer.AddItemList();
      await this.renderer.AddItemsData();
      await this.renderer.AddTimeLineHead(this.renderer.timeScale, this.renderer.timeType, daysGroup, false);
      await this.renderer.AddTimeLineData(this.renderer.timeScale, this.renderer.timeType, this.renderer.rows_to_gantt);
      await this.renderer.AddTimeLineArrow(this.renderer.timeline_width);
      await this.renderer.AddTimeLineGhost();
      await this.renderer.AddTimeLineSummary();
      await this.renderer.AddTimeLineFirst();
      await this.renderer.DivResize();
      await this.renderer.ModeActive();
      this.ModificateAfterRender()
    },
    ZoomDaysClick: async function () {
      this.renderer.firstDayDate = moment(this.renderer.GtimeStart).clone().startOf('month');
      this.renderer.lastDayDate = moment(this.renderer.GtimeStop).clone().endOf('month');
      this.renderer.timeScaleUTC = this.renderer.lastDayDate.valueOf() - this.renderer.firstDayDate.valueOf();
      this.renderer.firstDayScale = this.renderer.firstDayDate.valueOf();
      var currentLocaleData = moment.localeData();
      var iter = moment(this.renderer.firstDayDate).twix(this.renderer.lastDayDate).iterate('days');
      var dayRange = [
      ];
      while (iter.hasNext()) {
        dayRange.push(iter.next().toDate())
      }
      var iter_first = moment(this.renderer.firstDayDate).twix(this.renderer.lastDayDate).iterate('month');
      var monthRange = [
      ];
      while (iter_first.hasNext()) {
        var mt_month = iter_first.next();
        var month = [
        ];
        month['year'] = mt_month.year();
        month['month'] = currentLocaleData.months(mt_month);
        month['days'] = mt_month.daysInMonth();
        monthRange.push(month)
      }
      this.renderer.timeScale = 24;
      this.renderer.timeType = 'month_day';
      this.renderer.timeline_width = this.renderer.timeScale * dayRange.length;
      this.renderer.pxScaleUTC = Math.round(this.renderer.timeScaleUTC / this.renderer.timeline_width);
      await this.renderer.AddItemList();
      await this.renderer.AddItemsData();
      await this.renderer.AddTimeLineHead(this.renderer.timeScale, this.renderer.timeType, monthRange, dayRange);
      await this.renderer.AddTimeLineData(this.renderer.timeScale, this.renderer.timeType, this.renderer.rows_to_gantt);
      await this.renderer.AddTimeLineArrow(this.renderer.timeline_width);
      await this.renderer.AddTimeLineGhost();
      await this.renderer.AddTimeLineSummary();
      await this.renderer.AddTimeLineFirst();
      await this.renderer.DivResize();
      await this.renderer.ModeActive();
      this.ModificateAfterRender()
    },
    ZoomMonthClick: async function () {
      this.renderer.firstDayDate = moment(this.renderer.GtimeStart).clone().startOf('month');
      this.renderer.lastDayDate = moment(this.renderer.GtimeStop).clone().endOf('month');
      this.renderer.timeScaleUTC = this.renderer.lastDayDate.valueOf() - this.renderer.firstDayDate.valueOf();
      this.renderer.firstDayScale = this.renderer.firstDayDate.valueOf();
      var iter = moment(this.renderer.firstDayDate).twix(this.renderer.lastDayDate).iterate('month');
      var month2Range = [
      ];
      while (iter.hasNext()) {
        month2Range.push(iter.next().toDate())
      }
      var monthGroup = _(month2Range).groupBy(function (month) {
        return moment(month).format('YYYY');
      });
      this.renderer.timeScale = 30;
      this.renderer.timeType = 'year_month';
      this.renderer.timeline_width = this.renderer.timeScale * month2Range.length;
      this.renderer.pxScaleUTC = Math.round(this.renderer.timeScaleUTC / this.renderer.timeline_width);
      await this.renderer.AddItemList();
      await this.renderer.AddItemsData();
      await this.renderer.AddTimeLineHead(this.renderer.timeScale, this.renderer.timeType, monthGroup, false);
      await this.renderer.AddTimeLineData(this.renderer.timeScale, this.renderer.timeType, this.renderer.rows_to_gantt);
      await this.renderer.AddTimeLineArrow(this.renderer.timeline_width);
      await this.renderer.AddTimeLineGhost();
      await this.renderer.AddTimeLineSummary();
      await this.renderer.AddTimeLineFirst();
      await this.renderer.DivResize();
      await this.renderer.ModeActive();
      this.ModificateAfterRender()
    },
    ZoomWeeksClick: async function () {
      let firstDayDate = moment(this.renderer.GtimeStart).clone().startOf(this.renderer.week_type).add( - 3, 'weeks');
      let lastDayDate = moment(this.renderer.GtimeStop).clone().endOf(this.renderer.week_type).add(3, 'weeks');
      var iter = moment(firstDayDate).twix(lastDayDate).iterate('Week');
      var week2Range = [
      ];
      while (iter.hasNext()) {
        week2Range.push(iter.next().toDate())
      }
      this.renderer.firstDayDate = moment(week2Range[0]).startOf(this.renderer.week_type)
      this.renderer.lastDayDate = moment(week2Range[week2Range.length - 1])
      this.renderer.timeScaleUTC = this.renderer.lastDayDate.valueOf() - this.renderer.firstDayDate.valueOf();
      this.renderer.firstDayScale = this.renderer.firstDayDate.valueOf();
      var weeksGroup = _(week2Range).groupBy(function (week) {
        return moment(week).format('YYYY');
      });
      this.renderer.timeScale = 30;
      this.renderer.timeType = 'month_week';
      this.renderer.timeline_width = this.renderer.timeScale * week2Range.length;
      this.renderer.pxScaleUTC = Math.round(this.renderer.timeScaleUTC / this.renderer.timeline_width);
      await this.renderer.AddItemList();
      await this.renderer.AddItemsData();
      await this.renderer.AddTimeLineHead(this.renderer.timeScale, this.renderer.timeType, weeksGroup, false);
      await this.renderer.AddTimeLineData(this.renderer.timeScale, this.renderer.timeType, this.renderer.rows_to_gantt);
      await this.renderer.AddTimeLineArrow(this.renderer.timeline_width);
      await this.renderer.AddTimeLineGhost();
      await this.renderer.AddTimeLineSummary();
      await this.renderer.AddTimeLineFirst();
      await this.renderer.DivResize();
      await this.renderer.ModeActive();
      this.ModificateAfterRender()
    },
    ZoomQuarterClick: async function () {
      this.renderer.firstDayDate = moment(this.renderer.GtimeStart).clone().startOf('Quarter');
      this.renderer.lastDayDate = moment(this.renderer.GtimeStop).clone().endOf('Quarter');
      this.renderer.timeScaleUTC = this.renderer.lastDayDate.valueOf() - this.renderer.firstDayDate.valueOf();
      this.renderer.firstDayScale = this.renderer.firstDayDate.valueOf();
      var iter = moment(this.renderer.firstDayDate).twix(this.renderer.lastDayDate).iterate('Quarter');
      var quarter2Range = [
      ];
      while (iter.hasNext()) {
        quarter2Range.push(iter.next().toDate())
      }
      var quarterGroup = _(quarter2Range).groupBy(function (quarter) {
        return moment(quarter).format('YYYY');
      });
      this.renderer.timeScale = 80;
      this.renderer.timeType = 'quarter';
      this.renderer.timeline_width = this.renderer.timeScale * quarter2Range.length;
      this.renderer.pxScaleUTC = Math.round(this.renderer.timeScaleUTC / this.renderer.timeline_width);
      await this.renderer.AddItemList();
      await this.renderer.AddItemsData();
      await this.renderer.AddTimeLineHead(this.renderer.timeScale, this.renderer.timeType, quarterGroup, false);
      await this.renderer.AddTimeLineData(this.renderer.timeScale, this.renderer.timeType, this.renderer.rows_to_gantt);
      await this.renderer.AddTimeLineArrow(this.renderer.timeline_width);
      await this.renderer.AddTimeLineGhost();
      await this.renderer.AddTimeLineSummary();
      await this.renderer.AddTimeLineFirst();
      await this.renderer.DivResize();
      await this.renderer.ModeActive();
      this.ModificateAfterRender()
    },
    ClickToday: function (event) {
      var today = new Date();
      var toscale = this.TimeToScale(today.getTime());
      this.renderer.TimeToLeft = toscale;
      this.Focus_Gantt(toscale);
    },
    Focus_Gantt: function (task_start) {
      $('.timeline-gantt-head').animate({
        scrollLeft: task_start - 500
      }, 1000);
      $('.task-gantt-timeline').animate({
        scrollLeft: task_start - 500
      }, 1000);
      this.renderer.gantt_timeline_scroll_widget.scrollOffset(task_start - 500);
    },
    TimeToScale: function (time) {
      if (time) {
        return Math.round((time - this.renderer.firstDayScale) / this.renderer.pxScaleUTC);
      }
    },
    _add_hover: function (ev) {
      var rowdata = '#task-gantt-timeline-row-' + ev.data['data_id'];
      $(rowdata).addClass('task-gantt-timeline-row-hover');
      var item_info = '#item-info-' + ev.data['data_id'];
      $(item_info).addClass('item-info-hover');
    },
    _remove_hover: function (ev) {
      var rowdata = '#task-gantt-timeline-row-' + ev.data['data_id'];
      $(rowdata).removeClass('task-gantt-timeline-row-hover');
      var item_info = '#item-info-' + ev.data['data_id'];
      $(item_info).removeClass('item-info-hover');
    },
    HandleHoverOver: function (ev) {
      if (ev.target.allowRowHover)
      {
        var rowdata = '#task-gantt-timeline-row-' + ev.target['data-id'];
        var z_item = '.task-gantt-item-' + ev.target['data-id'];
        $(rowdata).addClass('task-gantt-timeline-row-hover');
        $(z_item).addClass('task-gantt-item-hover');
        var item_info = '#item-info-' + ev.target['data-id'];
        $(item_info).addClass('item-info-hover');
      }
    },
    HandleHoverOut: function (ev) {
      var item_info = '#item-info-' + ev.target['data-id'];
      $(item_info).removeClass('item-info-hover');
      var rowdata = '#task-gantt-timeline-row-' + ev.target['data-id'];
      var z_item = '.task-gantt-item-' + ev.target['data-id'];
      $(rowdata).removeClass('task-gantt-timeline-row-hover');
      $(z_item).removeClass('task-gantt-item-hover');
    }
  });
  return NativeGanttController;
}); ;
