/** @odoo-module **/
import { Component, EventBus, onPatched, onWillStart, useState, useSubEnv,xml } from "@odoo/owl";
import { registry } from "@web/core/registry";
export class KeyPad extends Component{
    
    setup() {
      
    }
   
    
    keyClick(option)
      {
        console.log(this)
        this.props.keyClick(option);                
      }
      
    
}
KeyPad.props = ['detailMoveLine?','keyClick?'];
KeyPad.template = 'smartbiz_stock.keypad'//xml``;
KeyPad.components = { }



      