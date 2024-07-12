import { html } from "lit-html";
import styles from './openOrderEditor.scss';

export const openOrderEditorTemplate = (openOrders, deliveryDate, controls) => html`
<div class=${styles['container']}>
        <div class=${styles['container-header']}>
                <label id="date-label" for="date-input">Delivery Date</label>
                <input type="text" required="true" id="date-input" name="date" .value=${deliveryDate}>
                <div class=${styles['date-btn']} @click=${controls.openCalendar}><i class="fa-solid fa-calendar fa-2x"></i></div>
                <div id="calendar-container" class=${styles["calendar-container"]}></div>
                <a @click=${() => controls.importOrder()} class=${styles['import-btn']}>Import</a>
        </div>
        <div class=${styles['record-container']}>
                <div class=${`${styles['record-item']} ${styles['record-item-header']}`}>
                        <p class=${styles['record-item-text']}>Import Date</p>        
                        <p class=${styles['record-item-text']}>Delivery Date</p>        
                        <a class=${styles['record-item-text']}>Delete</a>
                </div>
                ${Object.keys(openOrders).map(deliveryDate => openOrders[deliveryDate].map((orderConfig, i) => recordItem(orderConfig,i , deliveryDate, controls)))}
        </div>
</div>
`
const recordItem = (orderConfig, i, deliveryDate, controls) => {
const { importDate } = orderConfig.reportData;

return html`
<div class=${styles['record-item']}>
<p class=${styles['record-item-text']}>${importDate}</p>        
<p class=${styles['record-item-text']}>${deliveryDate}</p>        
<a @click=${() => controls.deleteRecord(deliveryDate, i)} class=${styles['record-item-btn']}>X</a>
</div>
`
}