/** @odoo-module **/

import { Component, onWillStart, onMounted, onWillUnmount, onWillRender, useEffect, xml, useState, useRef } from "@odoo/owl";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { parseInteger } from "@web/views/fields/parsers";
import { useInputField } from "@web/views/fields/input_field_hook";
import {_lt, _t} from "@web/core/l10n/translation";
import { loadJS } from "@web/core/assets";

// Import the registry
import {registry} from "@web/core/registry";

export class TimeDeltaField extends Component {

    static template = "web_widget_time_delta.FieldTimeDelta";

    static props = {
        ...standardFieldProps,
        options: { type: Object, optional: true },
    };

    elRef = useRef("el");
    inputRef = useRef("timeDecimal");
    setup() {
        useInputField({
            getValue: () => this.formattedValue,
            refName: "timeDecimal",
            parse: (v) => parseInteger(v),
        });

        this.mask_humanize = undefined;
        this.showDays = false;
        this.showSeconds = false;

        if ("mask_humanize_string" in this.props.options) {
            this.mask_humanize = this.this.props.options["mask_humanize_string"];
        }

        if ("mask_humanize_field" in this.props.options) {
            this.mask_humanize = this.props.record.data[this.props.options["mask_humanize_field"]];
        }

        let mask_picker = "";

        if ("mask_picker_string" in this.props.options) {
            mask_picker = this.props.options["mask_picker_string"];
        }

        if ("mask_picker_field" in this.props.options) {
            mask_picker = this.props.record.data[this.props.options["mask_picker_field"]];
        }

        if (mask_picker === "day_second"){
            this.showDays = true;
            this.showSeconds = true;
        } else if (mask_picker === "day"){
            this.showDays = true;
        } else if (mask_picker === "second"){
            this.showSeconds = true;
        }

        onWillStart(async () => {
            await loadJS('/web_widget_time_delta/static/src/lib/duration-picker/jquery-duration-picker.js');
            await loadJS('/web_widget_time_delta/static/src/lib/duration-humanize/humanize-duration.js');
        });

        // useEffect(() => {
        //     console.log("date", this.state.date)
        //     console.log("name", this.props.name)
        //     console.log("value", this.props.record)
        // });


        onMounted(()=>{

            this.el = this.elRef.el;
            this.$el = $(this.el);


            var show_value = parseInt(this.value, 10);

            var $input = this.$el.find('input');
            $input.val(show_value);
            var $inputRef = this.inputRef
            var $saveDvalue = this.saveDvalue
            var self = this;
            $input.durationPicker({
              translations: {
                    day: _t('day'),
                    hour:  _t('hour'),
                    minute:  _t('minute'),
                    second:  _t('second'),
                    days:  _t('days'),
                    hours:  _t('hours'),
                    minutes:  _t('minutes'),
                    seconds:  _t('seconds')
                  },

                showSeconds: self.showSeconds,
                showDays:  self.showDays,
                $self: self,
                onChanged: function (newVal) {
                    $input.val(newVal);
                    $inputRef.el.value = newVal;
                    $saveDvalue(this.$self, newVal);
                }
            });
        });

        super.setup();
    };

    saveDvalue($self, newValue) {
        $self.props.record.update({ [$self.props.name]: newValue });
    }

    get formattedValue() {

        if (this.props.readonly) {
            if (this.mask_humanize) {
                return humanizeDuration(this.value*1000,{ units: this.mask_humanize.split(","),  round: true});
            } else {
                return humanizeDuration(this.value*1000);
            }
        } else {
            return this.value;
        }
    }

    get value() {
        return this.props.record.data[this.props.name];
    }
}

export const timeDeltaField = {
    component: TimeDeltaField,
    displayName: _lt("Time Delta Field"),
    extractProps: ({ attrs, options }) => ({
        options: options,
    }),
    supportedTypes: ["float", "integer"]

}

// Add the field to the correct category
registry.category("fields").add("time_delta", timeDeltaField);
registry.category("fields").add("time_delta_list", timeDeltaField);





