import { html } from "lit-html";
import styles from './inventoryItemsRecordPicker.scss';

export const inventoryItemsRecordPickerTemplate = (records, controls) => html`
<div class=${styles['container']}>
        <div class=${styles['container-header']}>
            <p>Inventory Records Selector</p>
            <a class=${styles['import-btn']} @click=${controls.addRecord}>+</a>
        </div>
        <div class=${styles['record-container']}>
                <div class=${`${styles['record-item']} ${styles['record-item-header']}`}>
                        <p class=${styles['record-item-text']}></p>        
                        <p class=${styles['record-item-text']}>Start Date</p>        
                        <p class=${styles['record-item-text']}>End Date</p>        
                        <p class=${styles['record-item-text']}>Import Date</p>        
                        <a class=${styles['record-item-text']}>Delete</a>
                </div>
                ${Object.keys(records).map(key => recordItem(records[key], controls))}
        </div>
        <button @click=${controls.buildInventory} class=${styles['submit-btn']}>Build Inventory</button>
</div>
`

const recordItem = (record, controls) => {
const { importDate, startDate, endDate } = record.reportData;

return html`
<div class=${styles['record-item']}>
<input class=${styles['record-item-text']} @change=${(e) => controls.selectReport(e, record)} type="checkbox" />
<p class=${styles['record-item-text']}>${startDate}</p>        
<p class=${styles['record-item-text']}>${endDate}</p>        
<p class=${styles['record-item-text']}>${importDate}</p>        
<a @click=${() => controls.deleteRecord(record)} class=${styles['record-item-btn']}>X</a>
</div>
`
}