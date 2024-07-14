import { html } from "../../../node_modules/lit-html/lit-html.js";
import styles from './orderForm.scss';

export const orderFormTemplate = (controls, nextOrderDate, orderForm) => html`
    <section class=${styles['order-page__section']}>
        <form novalidate id="form" class=${styles['order-form']} @submit="${controls.submitHandler}">
            <div title="Import last week's full Inventory Activity Report" class=${styles['form-group']}>
                <p class=${styles['form-group-title']} >Inventory Activity Report</p>
                <a @click=${controls.importInventory} class=${orderForm?.currentInventory ? `${styles['inventory-import-btn']} ${styles['inventory-import-btn-done']}` : styles['inventory-import-btn']}>Import</a>
            </div>
            <div class=${styles['form-group']}>
                <p>Configure open orders</p>
                <a @click=${controls.editOpenOrders} class=${styles['open-order-btn']}>Edit</a>
            </div>
            <div class=${styles['form-group']}>
                <label id="date-label" for="date-input" >Order Date</label>
                <div class=${styles["calendar-input-container"]}>
                    <input type="text" required="true" id="date-input" name="date" .value=${nextOrderDate}>
                    <div id=${styles['date-btn']} @click=${(e) => controls.openCalendar(e)}><i class="fa-solid fa-calendar fa-2x"></i></div>
                </div>
            </div>
        <div class=${styles['form-group']}>
                <label for="previous-sales" >Last Week's Sales:</label>
                <input required type="text" id="previous-sales" name="previousSales">
        </div>
        <div class=${styles['form-group']}>
                <label for="sales-forecast" >Weekly Sales Forecast:</label>
                <input required type="text" id="sales-forecast" name="salesForecast">
        </div>
            <button id="create-button" class=${styles["create-button"]} type="submit">Create</button>
        </form>
    </section>
`;
