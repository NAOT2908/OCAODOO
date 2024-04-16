/** @odoo-module **/
/*
 * #  Copyright (c) by The UniCube, 2023.
 * #  License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 * #  These code are maintained by The UniCube.
 */

import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";
import {useService} from "@web/core/utils/hooks";
import {standardFieldProps} from "@web/views/fields/standard_field_props";
import {Component, useState} from "@odoo/owl";
import {useRecordObserver} from "@web/model/relational_model/utils";
// var JsonField = AbstractField.extend({
//     className: 'o_json_field',
//     template: "JsonField",
//     start: function(){
//         this._super.apply(this, arguments);
//         if (this.recordData[this.nodeOptions.currentValue]){
//             this.value = this.recordData[this.nodeOptions.currentValue]
//         }
//     },
//     _render: function() {
//         var self = this;
//         var value = this.value;
//
//         let json_data = value.replace("'","")
//         console.log(json_data)
//         json_data = JSON.parse(json_data)
//         console.log("Json obj:",json_data)
//         // let qrcodeimg = dynamicQrcode(qrcodearray[0],qrcodearray[1],qrcodearray[2],qrcodearray[3],'',"TT "+ qrcodearray[4]+" cua Bean Bakery")
//         this.$('.json_holder').html(json_data);
//         // this.$('.progress-bar-inner').css('width', widthComplete + '%');
//     },
// })

export class JsonField extends Component {
    static template = "JsonField";
    static props = {
        // ...standardFieldProps,
        jsonData: {type: Object, optional: true},
    };


    setup() {

        this.field = this.props.record.fields[this.props.name];
        this.notification = useService("notification");
        // make widget state

        this.state = useState({
            // src: this.props.record.data[this.props.name],
            src: this.jsonData
        })
        // Load record data to widget
        useRecordObserver((record) => {
            console.log("record value: ", record )
            this.jsonData = JSON.parse(record.data[this.props.name])
            delete this.jsonData['apikey']
            console.log("json_data: ", this.jsonData )

            this.state.src = JSON.stringify( this.jsonData)
            // record.data[this.props.name]

            this.props.jsonData = JSON.stringify( this.jsonData)
            // record.data['data']

            // this.props.jsonData.replaceAll("'",'"').replace('{"', "").replace('"}', "")
            //     .replaceAll('": "',": ").split('", "')
            console.log("json_data in useRecordObserver: ", this.props.jsonData)
        });

        console.log("this.props",this.props)
    }


    onLoadFailed() {
        this.state.src = this.constructor.fallbackSrc;
        this.notification.add(_t("Could not display the specified json data."), {
            type: "info",
        });
    }
}

export const jsonField = {
    component: JsonField,
    displayName: _t("JsonField"),
    supportedOptions: [],
    supportedTypes: ["char"],
    extractProps: ({attrs, options}) => ({
        jsonData: options.size ? options['jsonData'] : attrs.jsonData,
        // width: options.size ? options.size[0] : attrs.width,
        // height: options.size ? options.size[1] : attrs.height,
    }),
};
registry.category("fields").add('json_field', jsonField);