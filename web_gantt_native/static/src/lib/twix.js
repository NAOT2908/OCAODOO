(function () {
  var hasModule,
  isArray,
  makeTwix,
  slice = [
  ].slice;
  hasModule = (typeof module !== 'undefined' && module !== null) && (module.exports != null);
  isArray = function (input) {
    return Object.prototype.toString.call(input) === '[object Array]';
  };
  makeTwix = function (moment) {
    var Twix;
    if (moment == null) {
      throw new Error('Can\'t find moment');
    }
    Twix = (function () {
      function Twix(start, end, parseFormat, options) {
        var ref;
        if (options == null) {
          options = {
          };
        }
        if (typeof parseFormat !== 'string') {
          options = parseFormat != null ? parseFormat : {
          };
          parseFormat = null;
        }
        if (typeof options === 'boolean') {
          options = {
            allDay: options
          };
        }
        this._oStart = moment(start, parseFormat, options.parseStrict);
        this._oEnd = moment(end, parseFormat, options.parseStrict);
        this.allDay = (ref = options.allDay) != null ? ref : false;
        this._mutated();
      }
      Twix._extend = function () {
        var attr,
        first,
        j,
        len,
        other,
        others;
        first = arguments[0],
        others = 2 <= arguments.length ? slice.call(arguments, 1) : [
        ];
        for (j = 0, len = others.length; j < len; j++) {
          other = others[j];
          for (attr in other) {
            if (typeof other[attr] !== 'undefined') {
              first[attr] = other[attr];
            }
          }
        }
        return first;
      };
      Twix.prototype.start = function () {
        return this._start.clone();
      };
      Twix.prototype.end = function () {
        return this._end.clone();
      };
      Twix.prototype.isSame = function (period) {
        return this._start.isSame(this._end, period);
      };
      Twix.prototype.length = function (period) {
        return this._displayEnd.diff(this._start, period);
      };
      Twix.prototype.count = function (period) {
        var end,
        start;
        start = this.start().startOf(period);
        end = this.end().startOf(period);
        return end.diff(start, period) + 1;
      };
      Twix.prototype.countInner = function (period) {
        var end,
        ref,
        start;
        ref = this._inner(period),
        start = ref[0],
        end = ref[1];
        if (start >= end) {
          return 0;
        }
        return end.diff(start, period);
      };
      Twix.prototype.iterate = function (intervalAmount, period, minHours) {
        var end,
        hasNext,
        ref,
        start;
        ref = this._prepIterateInputs(intervalAmount, period, minHours),
        intervalAmount = ref[0],
        period = ref[1],
        minHours = ref[2];
        start = this.start().startOf(period);
        end = this.end().startOf(period);
        if (this.allDay) {
          end = end.add(1, 'd');
        }
        hasNext = (function (_this) {
          return function () {
            return (!_this.allDay && start <= end && (!minHours || !start.isSame(end) || _this._end.hours() > minHours)) || (_this.allDay && start < end);
          };
        }) (this);
        return this._iterateHelper(period, start, hasNext, intervalAmount);
      };
      Twix.prototype.iterateInner = function (intervalAmount, period) {
        var end,
        hasNext,
        ref,
        ref1,
        start;
        ref = this._prepIterateInputs(intervalAmount, period),
        intervalAmount = ref[0],
        period = ref[1];
        ref1 = this._inner(period, intervalAmount),
        start = ref1[0],
        end = ref1[1];
        hasNext = function () {
          return start < end;
        };
        return this._iterateHelper(period, start, hasNext, intervalAmount);
      };
      Twix.prototype.humanizeLength = function () {
        if (this.allDay) {
          if (this.isSame('d')) {
            return 'all day';
          } else {
            return this._start.from(this.end().add(1, 'd'), true);
          }
        } else {
          return this._start.from(this._end, true);
        }
      };
      Twix.prototype.asDuration = function (units) {
        var diff;
        diff = this._end.diff(this._start);
        return moment.duration(diff);
      };
      Twix.prototype.isPast = function () {
        return this._lastMilli < moment();
      };
      Twix.prototype.isFuture = function () {
        return this._start > moment();
      };
      Twix.prototype.isCurrent = function () {
        return !this.isPast() && !this.isFuture();
      };
      Twix.prototype.contains = function (mom) {
        if (!moment.isMoment(mom)) {
          mom = moment(mom);
        }
        return this._start <= mom && this._lastMilli >= mom;
      };
      Twix.prototype.isEmpty = function () {
        return this._start.isSame(this._displayEnd);
      };
      Twix.prototype.overlaps = function (other) {
        return this._displayEnd.isAfter(other._start) && this._start.isBefore(other._displayEnd);
      };
      Twix.prototype.engulfs = function (other) {
        return this._start <= other._start && this._displayEnd >= other._displayEnd;
      };
      Twix.prototype.union = function (other) {
        var allDay,
        newEnd,
        newStart;
        allDay = this.allDay && other.allDay;
        newStart = this._start < other._start ? this._start : other._start;
        newEnd = this._lastMilli > other._lastMilli ? (allDay ? this._end : this._displayEnd) : (allDay ? other._end : other._displayEnd);
        return new Twix(newStart, newEnd, allDay);
      };
      Twix.prototype.intersection = function (other) {
        var allDay,
        newEnd,
        newStart;
        allDay = this.allDay && other.allDay;
        newStart = this._start > other._start ? this._start : other._start;
        newEnd = this._lastMilli < other._lastMilli ? (allDay ? this._end : this._displayEnd) : (allDay ? other._end : other._displayEnd);
        return new Twix(newStart, newEnd, allDay);
      };
      Twix.prototype.xor = function () {
        var allDay,
        arr,
        endTime,
        i,
        item,
        j,
        k,
        last,
        len,
        len1,
        o,
        open,
        other,
        others,
        ref,
        results,
        start,
        t;
        others = 1 <= arguments.length ? slice.call(arguments, 0) : [
        ];
        open = 0;
        start = null;
        results = [
        ];
        allDay = ((function () {
          var j,
          len,
          results1;
          results1 = [
          ];
          for (j = 0, len = others.length; j < len; j++) {
            o = others[j];
            if (o.allDay) {
              results1.push(o);
            }
          }
          return results1;
        }) ()).length === others.length;
        arr = [
        ];
        ref = [
          this
        ].concat(others);
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          item = ref[i];
          arr.push({
            time: item._start,
            i: i,
            type: 0
          });
          arr.push({
            time: item._displayEnd,
            i: i,
            type: 1
          });
        }
        arr = arr.sort(function (a, b) {
          return a.time - b.time;
        });
        for (k = 0, len1 = arr.length; k < len1; k++) {
          other = arr[k];
          if (other.type === 1) {
            open -= 1;
          }
          if (open === other.type) {
            start = other.time;
          }
          if (open === (other.type + 1) % 2) {
            if (start) {
              last = results[results.length - 1];
              if (last && last._end.isSame(start)) {
                last._oEnd = other.time;
                last._mutated();
              } else {
                endTime = allDay ? other.time.clone().subtract(1, 'd') : other.time;
                t = new Twix(start, endTime, allDay);
                if (!t.isEmpty()) {
                  results.push(t);
                }
              }
            }
            start = null;
          }
          if (other.type === 0) {
            open += 1;
          }
        }
        return results;
      };
      Twix.prototype.difference = function () {
        var j,
        len,
        others,
        ref,
        results1,
        t;
        others = 1 <= arguments.length ? slice.call(arguments, 0) : [
        ];
        ref = this.xor.apply(this, others).map((function (_this) {
          return function (i) {
            return _this.intersection(i);
          };
        }) (this));
        results1 = [
        ];
        for (j = 0, len = ref.length; j < len; j++) {
          t = ref[j];
          if (!t.isEmpty() && t.isValid()) {
            results1.push(t);
          }
        }
        return results1;
      };
      Twix.prototype.split = function () {
        var args,
        dur,
        end,
        final,
        i,
        mom,
        start,
        time,
        times,
        vals;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [
        ];
        end = start = this.start();
        if (moment.isDuration(args[0])) {
          dur = args[0];
        } else if ((!moment.isMoment(args[0]) && !isArray(args[0]) && typeof args[0] === 'object') || (typeof args[0] === 'number' && typeof args[1] === 'string')) {
          dur = moment.duration(args[0], args[1]);
        } else if (isArray(args[0])) {
          times = args[0];
        } else {
          times = args;
        }
        if (times) {
          times = (function () {
            var j,
            len,
            results1;
            results1 = [
            ];
            for (j = 0, len = times.length; j < len; j++) {
              time = times[j];
              results1.push(moment(time));
            }
            return results1;
          }) ();
          times = ((function () {
            var j,
            len,
            results1;
            results1 = [
            ];
            for (j = 0, len = times.length; j < len; j++) {
              mom = times[j];
              if (mom.isValid() && mom >= start) {
                results1.push(mom);
              }
            }
            return results1;
          }) ()).sort();
        }
        if ((dur && dur.asMilliseconds() === 0) || (times && times.length === 0)) {
          return [this];
        }
        vals = [
        ];
        i = 0;
        final = this._displayEnd;
        while (start < final && ((times == null) || times[i])) {
          end = dur ? start.clone().add(dur) : times[i].clone();
          end = moment.min(final, end);
          if (!start.isSame(end)) {
            vals.push(moment.twix(start, end));
          }
          start = end;
          i += 1;
        }
        if (!end.isSame(this._displayEnd) && times) {
          vals.push(moment.twix(end, this._displayEnd));
        }
        return vals;
      };
      Twix.prototype.divide = function (parts) {
        return this.split(this.length() / parts, 'ms').slice(0, + (parts - 1) + 1 || 9000000000);
      };
      Twix.prototype.isValid = function () {
        return this._start.isValid() && this._end.isValid() && this._start <= this._displayEnd;
      };
      Twix.prototype.equals = function (other) {
        return (other instanceof Twix) && this.allDay === other.allDay && this._start.valueOf() === other._start.valueOf() && this._end.valueOf() === other._end.valueOf();
      };
      Twix.prototype.toString = function () {
        return '{start: ' + (this._start.format()) + ', end: ' + (this._end.format()) + ', allDay: ' + (this.allDay ? 'true' : 'false') + '}';
      };
      Twix.prototype.toArray = function (intervalAmount, period, minHours) {
        var itr,
        range;
        itr = this.iterate(intervalAmount, period, minHours);
        range = [
        ];
        while (itr.hasNext()) {
          range.push(itr.next());
        }
        return range;
      };
      Twix.prototype.simpleFormat = function (momentOpts, inopts) {
        var options,
        s;
        options = {
          allDay: '(all day)',
          template: Twix.formatTemplate
        };
        Twix._extend(options, inopts || {
        });
        s = options.template(this._start.format(momentOpts), this._end.format(momentOpts));
        if (this.allDay && options.allDay) {
          s += ' ' + options.allDay;
        }
        return s;
      };
      Twix.prototype.format = function (inopts) {
        var atomicMonthDate,
        common_bucket,
        end_bucket,
        fold,
        format,
        fs,
        global_first,
        goesIntoTheMorning,
        j,
        len,
        momentHourFormat,
        needDate,
        needsMeridiem,
        options,
        process,
        start_bucket,
        together;
        if (this.isEmpty()) {
          return '';
        }
        momentHourFormat = this._start.localeData()._longDateFormat['LT'][0];
        options = {
          groupMeridiems: true,
          spaceBeforeMeridiem: true,
          showDayOfWeek: false,
          hideTime: false,
          hideYear: false,
          implicitMinutes: true,
          implicitDate: false,
          implicitYear: true,
          yearFormat: 'YYYY',
          monthFormat: 'MMM',
          weekdayFormat: 'ddd',
          dayFormat: 'D',
          meridiemFormat: 'A',
          hourFormat: momentHourFormat,
          minuteFormat: 'mm',
          allDay: 'all day',
          explicitAllDay: false,
          lastNightEndsAt: 0,
          template: Twix.formatTemplate
        };
        Twix._extend(options, inopts || {
        });
        fs = [
        ];
        needsMeridiem = options.hourFormat && options.hourFormat[0] === 'h';
        goesIntoTheMorning = options.lastNightEndsAt > 0 && !this.allDay && this.end().startOf('d').valueOf() === this.start().add(1, 'd').startOf('d').valueOf() && this._start.hours() > 12 && this._end.hours() < options.lastNightEndsAt;
        needDate = !options.hideDate && (!options.implicitDate || this.start().startOf('d').valueOf() !== moment().startOf('d').valueOf() || !(this.isSame('d') || goesIntoTheMorning));
        atomicMonthDate = !(this.allDay || options.hideTime);
        if (this.allDay && this.isSame('d') && (options.implicitDate || options.explicitAllDay)) {
          fs.push({
            name: 'all day simple',
            fn: function () {
              return options.allDay;
            },
            pre: ' ',
            slot: 0
          });
        }
        if (needDate && !options.hideYear && (!options.implicitYear || this._start.year() !== moment().year() || !this.isSame('y'))) {
          fs.push({
            name: 'year',
            fn: function (date) {
              return date.format(options.yearFormat);
            },
            pre: ', ',
            slot: 4
          });
        }
        if (atomicMonthDate && needDate) {
          fs.push({
            name: 'month-date',
            fn: function (date) {
              return date.format(options.monthFormat + ' ' + options.dayFormat);
            },
            ignoreEnd: function () {
              return goesIntoTheMorning;
            },
            pre: ' ',
            slot: 2
          });
        }
        if (!atomicMonthDate && needDate) {
          fs.push({
            name: 'month',
            fn: function (date) {
              return date.format(options.monthFormat);
            },
            pre: ' ',
            slot: 2
          });
        }
        if (!atomicMonthDate && needDate) {
          fs.push({
            name: 'date',
            fn: function (date) {
              return date.format(options.dayFormat);
            },
            pre: ' ',
            slot: 3
          });
        }
        if (needDate && options.showDayOfWeek) {
          fs.push({
            name: 'day of week',
            fn: function (date) {
              return date.format(options.weekdayFormat);
            },
            pre: ' ',
            slot: 1
          });
        }
        if (options.groupMeridiems && needsMeridiem && !this.allDay && !options.hideTime) {
          fs.push({
            name: 'meridiem',
            fn: function (t) {
              return t.format(options.meridiemFormat);
            },
            slot: 6,
            pre: options.spaceBeforeMeridiem ? ' ' : ''
          });
        }
        if (!this.allDay && !options.hideTime) {
          fs.push({
            name: 'time',
            fn: function (date) {
              var str;
              str = date.minutes() === 0 && options.implicitMinutes && needsMeridiem ? date.format(options.hourFormat) : date.format(options.hourFormat + ':' + options.minuteFormat);
              if (!options.groupMeridiems && needsMeridiem) {
                if (options.spaceBeforeMeridiem) {
                  str += ' ';
                }
                str += date.format(options.meridiemFormat);
              }
              return str;
            },
            slot: 5,
            pre: ', '
          });
        }
        start_bucket = [
        ];
        end_bucket = [
        ];
        common_bucket = [
        ];
        together = true;
        process = (function (_this) {
          return function (format) {
            var end_str,
            start_group,
            start_str;
            start_str = format.fn(_this._start);
            end_str = format.ignoreEnd && format.ignoreEnd() ? start_str : format.fn(_this._end);
            start_group = {
              format: format,
              value: function () {
                return start_str;
              }
            };
            if (end_str === start_str && together) {
              return common_bucket.push(start_group);
            } else {
              if (together) {
                together = false;
                common_bucket.push({
                  format: {
                    slot: format.slot,
                    pre: ''
                  },
                  value: function () {
                    return options.template(fold(start_bucket), fold(end_bucket, true).trim());
                  }
                });
              }
              start_bucket.push(start_group);
              return end_bucket.push({
                format: format,
                value: function () {
                  return end_str;
                }
              });
            }
          };
        }) (this);
        for (j = 0, len = fs.length; j < len; j++) {
          format = fs[j];
          process(format);
        }
        global_first = true;
        fold = function (array, skip_pre) {
          var k,
          len1,
          local_first,
          ref,
          section,
          str;
          local_first = true;
          str = '';
          ref = array.sort(function (a, b) {
            return a.format.slot - b.format.slot;
          });
          for (k = 0, len1 = ref.length; k < len1; k++) {
            section = ref[k];
            if (!global_first) {
              if (local_first && skip_pre) {
                str += ' ';
              } else {
                str += section.format.pre;
              }
            }
            str += section.value();
            global_first = false;
            local_first = false;
          }
          return str;
        };
        return fold(common_bucket);
      };
      Twix.prototype._iterateHelper = function (period, iter, hasNext, intervalAmount) {
        return {
          next: function () {
            var val;
            if (!hasNext()) {
              return null;
            } else {
              val = iter.clone();
              iter.add(intervalAmount, period);
              return val;
            }
          },
          hasNext: hasNext
        };
      };
      Twix.prototype._prepIterateInputs = function () {
        var inputs,
        intervalAmount,
        minHours,
        period,
        ref,
        ref1;
        inputs = 1 <= arguments.length ? slice.call(arguments, 0) : [
        ];
        if (typeof inputs[0] === 'number') {
          return inputs;
        }
        if (typeof inputs[0] === 'string') {
          period = inputs.shift();
          intervalAmount = (ref = inputs.pop()) != null ? ref : 1;
          if (inputs.length) {
            minHours = (ref1 = inputs[0]) != null ? ref1 : false;
          }
        }
        if (moment.isDuration(inputs[0])) {
          period = 'ms';
          intervalAmount = inputs[0].as(period);
        }
        return [intervalAmount,
        period,
        minHours];
      };
      Twix.prototype._inner = function (period, intervalAmount) {
        var durationCount,
        durationPeriod,
        end,
        modulus,
        start;
        if (period == null) {
          period = 'ms';
        }
        if (intervalAmount == null) {
          intervalAmount = 1;
        }
        start = this.start();
        end = this._displayEnd.clone();
        if (start > start.clone().startOf(period)) {
          start.startOf(period).add(intervalAmount, period);
        }
        if (end < end.clone().endOf(period)) {
          end.startOf(period);
        }
        durationPeriod = start.twix(end).asDuration(period);
        durationCount = durationPeriod.get(period);
        modulus = durationCount % intervalAmount;
        end.subtract(modulus, period);
        return [start,
        end];
      };
      Twix.prototype._mutated = function () {
        this._start = this.allDay ? this._oStart.clone().startOf('d') : this._oStart;
        this._lastMilli = this.allDay ? this._oEnd.clone().endOf('d') : this._oEnd;
        this._end = this.allDay ? this._oEnd.clone().startOf('d') : this._oEnd;
        return this._displayEnd = this.allDay ? this._end.clone().add(1, 'd') : this._end;
      };
      return Twix;
    }) ();
    Twix._extend(moment.locale(), {
      _twix: Twix.defaults
    });
    Twix.formatTemplate = function (leftSide, rightSide) {
      return leftSide + ' - ' + rightSide;
    };
    moment.twix = function () {
      return (function (func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor,
        result = func.apply(child, args);
        return Object(result) === result ? result : child;
      }) (Twix, arguments, function () {
      });
    };
    moment.fn.twix = function () {
      return (function (func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor,
        result = func.apply(child, args);
        return Object(result) === result ? result : child;
      }) (Twix, [
        this
      ].concat(slice.call(arguments)), function () {
      });
    };
    moment.fn.forDuration = function (duration, allDay) {
      return new Twix(this, this.clone().add(duration), allDay);
    };
    if (moment.duration.fn) {
      moment.duration.fn.afterMoment = function (startingTime, allDay) {
        return new Twix(startingTime, moment(startingTime).clone().add(this), allDay);
      };
      moment.duration.fn.beforeMoment = function (startingTime, allDay) {
        return new Twix(moment(startingTime).clone().subtract(this), startingTime, allDay);
      };
    }
    moment.twixClass = Twix;
    return Twix;
  };
  if (hasModule) {
    return module.exports = makeTwix(require('moment'));
  }
  if (typeof define === 'function') {
    define('twix', [
      'moment'
    ], function (moment) {
      return makeTwix(moment);
    });
  }
  if (this.moment) {
    this.Twix = makeTwix(this.moment);
  } else if (typeof moment !== 'undefined' && moment !== null) {
    this.Twix = makeTwix(moment);
  }
}).call(this); ;
