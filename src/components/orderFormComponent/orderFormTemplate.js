import { html } from "../../../node_modules/lit-html/lit-html.js";
import styles from './orderForm.module.scss';

export const orderFormTemplate = (controls, dateInputFieldStartingDate) => html`
 <section class=${styles['order-page__section']}>
    <div class=${styles['calendar-backdrop']} id="calendar-backdrop" class="calendar-backdrop" @click=${controls.closeCalendar}></div>
    <form novalidate id="form" class=${styles['order-form']} @submit="${controls.submitHandler}">
        <div title="Import last week's full Inventory Activity Report" class=${styles['form-group']}>
            <p class=${styles['form-group-title']} >Inventory Activity Report</p>
            <a @click=${controls.importInventory} class=${styles['inventory-import-btn']}>Import</a>
        </div>
        <div class=${styles['form-group']}>
            <p>Configure open orders</p>
            <a @click=${controls.editOpenOrders} class=${styles['open-order-btn']}>Edit</a>
        </div>
        <div class=${styles['form-group']}>
            <label id="date-label" for="date-input" >Order Date</label>
            <div id=${styles["calendar-input-container"]}>
                <input type="text" required="true" id="date-input" name="date" .value=${dateInputFieldStartingDate()}>
                <div id="date-button" @click=${controls.openCalendar}><i class="fa-solid fa-calendar fa-2x"></i></div>
            </div>
        <div id="calendar-container" class=${styles["calendar-container"]}></div>
        </div>
       <div class=${styles['form-group']}>
            <label for="previous-sales" >Last Week's Sales:</label>
            <input required type="text" id="previous-sales" name="previous-sales">
       </div>
       <div class=${styles['form-group']}>
            <label for="sales-forecast" >Weekly Sales Forecast:</label>
            <input required type="text" id="sales-forecast" name="sales-forecast">
       </div>
        <button id="create-button" class=${styles["create-button"]} type="submit">Create</button>
    </form>
    </div>
    <div id="warning-message" class=${styles["warning-message"]}></div>
        </section>
`;
