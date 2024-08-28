/** @odoo-module **/

import { _ } from "@odoo/owl";

function CheckReadOnly(check_fields, parent_fields, record) {
    let readonly_fields = [];

    _.each(check_fields, (field, field_key) => {
        let readonly_status = false;
        let check_field = parent_fields[field];
        let check_state = record['state'];
        let states = check_field['states'];

        if (check_state && states) {
            let where_state = [];

            _.each(states, (state, key) => {
                let param1 = false;
                let param2 = false;

                if (state[0].length === 2) {
                    param1 = state[0][0];
                    param2 = state[0][1];
                }

                if (param1 === 'readonly') {
                    where_state.push({
                        state: key,
                        param: param2
                    });
                }

                if (param2 === true) {
                    readonly_status = true;
                }
            });

            let check_readonly = _.findWhere(where_state, {
                state: check_state
            });

            if (readonly_status) {
                if (!check_readonly) {
                    readonly_status = false;
                }
            } else {
                if (!check_readonly) {
                    readonly_status = true;
                }
            }
        } else {
            readonly_status = check_field.readonly;
        }

        readonly_fields.push({
            field: field,
            readonly: readonly_status
        });
    });

    return readonly_fields;
}

export default {
    CheckReadOnly: CheckReadOnly,
};
