import { html } from "lit-html";
import styles from './inventoryRecords.scss';
import { INVENTORY } from "../../../constants/db.js";

export const InventoryRecordsTemplate = (records, controls) => html`
<div class=${styles['container']}>
        ${Object.keys(INVENTORY).map(recordGroup => html`
                <section class=${styles['record-import-container']}>
                        <div class=${styles['record-import-header']}>
                                <p class=${styles['title']}>${INVENTORY[recordGroup].title}</p>
                                <a @click=${() => controls.importData(recordGroup)} class=${styles['import-btn']}>Import</a>
                        </div>
                    <div class=${styles['record-container']}>
                        <div class=${`${styles['record-item']} ${styles['header']}`}>
                                <p class=${styles['record-item-text']}>Import Date</p>        
                                <p class=${styles['record-item-text']}>Start date</p>        
                                <p class=${styles['record-item-text']}>End date</p>        
                                <a class=${styles['record-item-text']}>Delete</a>
                        </div>
                        ${Object.keys(records[INVENTORY[recordGroup].key]).map(record => recordItem(records[INVENTORY[recordGroup].key][record]))}
                    </div>
                </section>
        `)}
</div>
`

const recordItem = (item) => html`
<div class=${styles['record-item']}>
<p class=${styles['record-item-text']}>${item.importDate}</p>        
<p class=${styles['record-item-text']}>${item.startDate}</p>        
<p class=${styles['record-item-text']}>${item.endDate}</p>          
<a class=${styles['record-item-btn']}>X</a>
</div>
`