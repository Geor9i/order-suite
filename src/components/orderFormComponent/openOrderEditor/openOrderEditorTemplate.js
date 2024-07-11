import { html } from "lit-html";
import styles from './openOrderEditor.scss';
import { INVENTORY } from "../../../constants/db.js";

export const openOrderEditor = (records, controls) => html`
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
                        ${Object.keys(records?.[recordGroup]).map(record => recordItem(records[recordGroup][record], recordGroup, controls))}
                    </div>
                </section>
        `)}
</div>
`
const recordItem = (record, recordGroup, controls) => {
const { importDate, startDate, endDate } = record.reportData;

return html`
<div class=${styles['record-item']}>
<p class=${styles['record-item-text']}>${importDate}</p>        
<p class=${styles['record-item-text']}>${startDate ?? importDate}</p>        
<p class=${styles['record-item-text']}>${endDate ?? importDate}</p>          
<a @click=${() => controls.deleteRecord(record, recordGroup)} class=${styles['record-item-btn']}>X</a>
</div>
`
}