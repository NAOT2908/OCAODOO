/** @odoo-module **/
import { Component, useState, xml } from '@odoo/owl';

export class Selector extends Component {
    setup() {
        this.state = useState({
            searchQuery: "",
            selectedRecords: [],
            quantity:false,
        });
    }

    get filteredRecords() {
        const searchLower = this.state.searchQuery.toLowerCase();
        return this.props.records.filter(record => 
            (record.display_name ? record.display_name.toLowerCase() : record.name.toLowerCase()).includes(searchLower)
        );
    }
    

    selectRecord(recordId) {
        const index = this.state.selectedRecords.indexOf(recordId);
        if (this.props.multiSelect) {
            if (index > -1) {
                this.state.selectedRecords.splice(index, 1); // Remove if already selected
            } else {
                this.state.selectedRecords.push(recordId); // Add to selection
            }
        } else {
            if(this.props.title == "Chọn sản phẩm")
            {
                var record = this.props.records.find(x=>x.id ==recordId)
                var data = {
                    product_id: recordId,
                    quantity: this.state.quantity,
                    display_name:record.display_name,
                }
                this.props.closeSelector(data);
            }
            else{
                this.props.closeSelector(this.props.records.find(x=>x.id ==recordId));
            }
            
        }
    }
    

    confirmSelection() {
        this.props.closeSelector(Object.values(this.state.selectedRecords));
        console.log({recordsxxx:this.props.records,records:this.props.records.filter(x=>x.id in this.state.selectedRecords),data:Object.values(this.state.selectedRecords)})
    }

    cancelSelection() {
        this.props.closeSelector(false);
    }
    createNew() {
        this.props.closeSelector(this.state.searchQuery);
    }
}

Selector.props = ['records', 'multiSelect?', 'closeSelector','title'];
Selector.template = xml`
<div class="s_selector-modal">
    <div class="s_selector-modal-content">
        <div class="s_selector-header">
            <h2><t t-esc="props.title" /></h2>
        </div>
        <input t-model="state.searchQuery" placeholder="Tìm kiếm..." class="s_selector-search-input"/>
        <input t-model="state.quantity" t-if="props.title == 'Chọn sản phẩm'" placeholder="Nhập số lượng sản phẩm" class="s_selector-search-input"/>
        <ul class="s_selector-record-list">
            <t t-foreach="filteredRecords" t-as="record" t-key="record.id">
                <li t-on-click="()=>this.selectRecord(record.id)" t-att-class="{'s_selector-selected': state.selectedRecords.includes(record.id)}">
                    <span class="record-name"><t t-esc="record.display_name || record.name"/></span>
                    <span t-if="state.selectedRecords.includes(record.id)" class="record-checkmark">&#10003;</span>
                </li>
            </t>
        </ul>
        <div class="s_selector-action-buttons">
            <button t-on-click="confirmSelection" t-if="props.multiSelect">Đồng ý</button>
            <button t-on-click="createNew" t-if="state.searchQuery &amp;&amp; props.title == 'Chọn số Lô/Sê-ri'">Tạo Mới</button>
            <button t-on-click="cancelSelection">Hủy</button>       
        </div>
    </div>
</div>

`;
