import { html } from "../../../node_modules/lit-html/lit-html.js";
import styles from './orderForm.module.scss';

export const orderFormTemplate = (
  submitHandler,
  openCalendar,
  dateInputFieldStartingDate,
  closeCalendar,
  receivedToday
) => html`
 <section class=${styles['order-page__section']}>
    <div class=${styles['calendar-backdrop']} id="calendar-backdrop" class="calendar-backdrop" @click=${closeCalendar}></div>
    <form novalidate id="form" class=${styles['order-form']} @submit="${submitHandler}">
        <div class="form-group">
            <label for="RMF-data-dump">Paste RMF order page</label>
            <textarea name="RMF-data-dump" class=${styles['rmf-data-dump']} placeholder="Paste RMF page here!" id="RMF-data-dump" cols="30" rows="10"></textarea>
        </div>
        <div class="form-group">
            <h3 class=${styles['input__order__invoiced']}>All food orders invoiced?</h3>
            <div id="radio-container" class=${styles["radio-container"]}>
                <label class=${styles['radio-label']} for="previous-invoiced-yes" >Yes</label>
                <input @click=${receivedToday} class=${styles['radio-button']} type="radio" id="previous-invoiced-yes"
                    name="previous-invoiced">
                <label class=${styles['radio-label']} for="previous-invoiced-no">No</label>
                <input @click=${receivedToday} class=${styles['radio-button']} type="radio" id="previous-invoiced-no" name="previous-invoiced">
            </div>
            <div class=${styles['received-today__container']} id="received-today">
                <label class=${styles['received-today__label']} for="received_today" >Received my order today?</label>
                <input class=${styles['check-box']} type="checkbox" id="received_today" name="received-today">
            </div>
        </div>
        <div class="form-group">
            <label id="date-label" for="date-input" >Order Date</label>
            <div id="calendar-input-container">
                <input type="text" required="true" id="date-input" name="date" .value=${dateInputFieldStartingDate()}>
                <button id="date-button" class=${styles["date-button"]} @click=${openCalendar}>📆</button>
            </div>
        <div id="calendar-container" class=${styles["calendar-container"]}></div>
        </div>
       <div class="form-group">
            <label for="previous-sales" >Last Week's Sales:</label>
            <input required type="text" id="previous-sales" name="previous-sales">
       </div>
       <div class="form-group">
            <label for="sales-forecast" >Weekly Sales Forecast:</label>
            <input required type="text" id="sales-forecast" name="sales-forecast">
       </div>
        <button id="create-button" class=${styles["create-button"]} type="submit">Create</button>
    </form>
    </div>
    <div id="warning-message" class=${styles["warning-message"]}></div>
        </section>
`;
