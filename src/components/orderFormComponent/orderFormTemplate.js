import { html } from "../../../node_modules/lit-html/lit-html.js";


export const orderFormTemplate = (submitHandler, openCalendar, dateInputFieldStartingDate, closeCalendar) => html`
 <section class="order-page__section">
            <div class="order__form__main__container">
                <div class="order__form__container" id="order__form__container">
                        <form novalidate class="order__form__area" @click=${closeCalendar} @submit="${submitHandler}">

                            <label for="RMF-data-dump">Paste RMF order page</label>
                            <textarea name="RMF-data-dump" class="rmf-data-dump" placeholder="Paste RMF page here!"
                                id="rmf-data-dump" cols="30" rows="10"></textarea>
                            <label class="input__order__invoiced" for="previous-invoiced" >All food orders invoiced?</label>
                            <div id="radio-container">
                                <label class="radio-label" for="previous-invoiced" >Yes</label>
                                <input class="radio-button" type="radio" id="previous-invoiced-yes"
                                    name="previous-invoiced">
                                <label class="radio-label" for="previous-invoiced">No</label>
                                <input class="radio-button" type="radio" id="previous-invoiced-no" name="previous-invoiced">
                            </div>
                            <div class="received-today__container">
                                <label class="received-today__label" for="received-today" >Received my order today?</label>
                                <input class="check-box" type="checkbox" id="received-today" name="received-today">
                            </div>

                            <label id="date-label" for="date-input" >Order Date</label>
                            <div id="calendar-input-container">
                                <input type="text" required="true" id="date-input" name="date-input" .value=${dateInputFieldStartingDate()}>
                                <button id="date-button" @click=${openCalendar}>📆</button>
                            </div>
                            <div id="calendar-container"></div>
                            <label for="previous-sales" >Last Week's Sales:</label>
                            <input type="text" required="true" id="previous-sales" name="previous-sales">

                            <label for="sales-forecast" >Weekly Sales Forecast:</label>
                            <input type="text" id="sales-forecast" name="sales-forecast" required="true">

                            <button id="create-button" type="submit">Create</button>

                            <div id="warning-message"></div>

                        </form>
                    
                </div>
            </div>
            </div>
        </section>
`;