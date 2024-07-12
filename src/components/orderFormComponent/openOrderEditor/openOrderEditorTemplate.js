import { html } from "lit-html";
import styles from './openOrderEditor.scss';

export const openOrderEditorTemplate = (openOrders, controls) => html`
<div class=${styles['container']}>
        <div class=${styles['container-header']}>
                <label id="date-label" for="date-input">Delivery Date</label>
                <input type="text" required="true" id="date-input" name="date">
                <div class=${styles['date-btn']} @click=${controls.openCalendar}><i class="fa-solid fa-calendar fa-2x"></i></div>
                <div id="calendar-container" class=${styles["calendar-container"]}></div>
                <a @click=${() => controls.importData()} class=${styles['import-btn']}>Import</a>
        </div>
        <div class=${styles['record-container']}>
                <div class=${`${styles['record-item']} ${styles['record-item-header']}`}>
                        <p class=${styles['record-item-text']}>Import Date</p>        
                        <p class=${styles['record-item-text']}>Start date</p>        
                        <p class=${styles['record-item-text']}>End date</p>        
                        <a class=${styles['record-item-text']}>Delete</a>
                </div>
                ${openOrders && Object.keys(openOrders).map(order => recordItem(openOrders[order], recordGroup, controls))}
        </div>
</div>
`
const recordItem = (openOrder, controls) => {
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