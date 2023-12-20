import { html } from "../../../node_modules/lit-html/lit-html.js";

export const storeSetupTemplate = (
  slideOpen,
  showDeliveryDetails,
  toggleDay,
  weekdays
) => {
  return html`
    <div class="inventory__main-container">

      <h1>Store Template</h1>
      <div class="store__open-times-container">
        <div class="store-info-container">
          <label for="storeName">StoreName</label>
          <input type="text" name="storeName" />
        </div>
        <div
          @click=${slideOpen}
          data-id="store__details__container"
          class="store__details__bar"
        >
          Opening Times & Delivery
        </div>
        <div class="store__details__container" id="store__details__container">
          <div class="weekday__main__container">
            ${weekdays.map((weekday) =>
              weekdayTemplate(weekday, showDeliveryDetails, toggleDay, weekdays)
            )}
          </div>
        </div>
        <div
          @click=${slideOpen}
          data-id="analysis-container"
          class="store__details__bar"
        >
          Analysis
        </div>
        ${dataAnalysis(slideOpen)}
        <div class="store__details-confirm-button__container">
          <button class="store__details-confirm-button">Confirm</button>
        </div>
      </div>

      <div class="inventory-template__create-form__inactive">
        <div class="inventory-template__main-container"></div>
      </div>
    </div>
  `;
};

const weekdayTemplate = (
  weekday,
  showDeliveryDetails,
  toggleDay,
  weekdays
) => html`
   
   <div class="weekday__container" id="weekday__container-${weekday}">
        <div @click=${toggleDay} class="weekday-button" data-id=${weekday}>${weekday}</div>
            <div class="store-details__main-container" id="store-details__main-container-${weekday}">
                    <div class="time-selector__main-container">
                        <div class="time-selector__inner-container">
                            <label class="time-selector-label" for="${weekday}-open-selector">open</label>
                            <select id="open-selector-${weekday}" class="time-selector">${generateHours()}</select>
                        </div>
                        <div class="time-selector__inner-container">
                            <label class="time-selector-label" for="${weekday}-close-selector">close</label>
                            <select id="close-selector-${weekday}" class="time-selector">${generateHours()}</select>
                            </div>
                        </div>
                       
                    <div class="delivery-day-input-container">
                        <label for="delivery-day-checkbox-${weekday}" class="delivery-day-label">Store Delivery</label>
                        <input id="delivery-day-checkbox-${weekday}" data-id=${weekday} class="delivery-day-checkbox" @change=${showDeliveryDetails} type="checkbox"></input>
                    </div>
                        <div id=${`delivery-day-info__container-${weekday}`} class="delivery-day-info__container inactive">
                            <div class="delivery-day-eta__container">
                                <label for="arrival-time-${weekday}" class="delivery-day-arrival-time-text">ETA</label>
                                <select id="arrival-time-${weekday}" class="delivery-arrival-selector">${generateHours()}</select>
                            </div>
                        <div class="order-cutoff-details__container">
                        <label for="cutoff-weekday-${weekday}" class="delivery-day-arrival-time-text">Order placement deadline</label>
                            <select id="cutoff-weekday-${weekday}" class="delivery-arrival-cutoff-weekday">
                            ${weekdays.map(
                              (day) =>
                                html`<option value=${day}>${day}</option>`
                            )}
                          </select>
                            <select id="cutoff-weekday-${weekday}" class="delivery-arrival-cutoff-weekday">${generateHours()}</select>
                        </div>
                </div>
            </div>
        </div>
`;

const generateHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const formattedHour = i < 10 ? `0${i}` : `${i}`;
    hours.push(
      html`<option value="${formattedHour}:00">${formattedHour}:00</option>`
    );
    hours.push(
      html`<option value="${formattedHour}:15">${formattedHour}:15</option>`
    );
    hours.push(
      html`<option value="${formattedHour}:30">${formattedHour}:30</option>`
    );
    hours.push(
      html`<option value="${formattedHour}:45">${formattedHour}:45</option>`
    );
  }
  return hours;
};


` <div class="sales-percentage-container">
<label for="sales-percentage-input-" class="sales-percentage-label" >Daily Sales</label>
<input maxlength="5" class="sales-percentage-input" id="sales-percentage-input-" placeholder="0"></input>
<p class="sales-percentage-input-sign">%</p>
</div>`

const dataAnalysis = (slideOpen) => html`
<div id="analysis-container" class="store__details__container">
    <div @click=${slideOpen} data-id="sales-summary-dropdown" class="analysis__inner-bar">Sales Summary
    </div>
    <div id="sales-summary-dropdown" class="analysis__inner-dropdown">
        <div class="analysis__inner-content">
        <label for="sales-summary-input" id="sales-summary-input">Paste a 30 day+ sales summary report</label>
        <input class="analysis__inner-content-input" id="sales-summary-input" name="sales-summary-input" type="text">
        </input>
        <button class="analysis__inner-content-button">Process</button>
        </div>
    </div>
    <div @click=${slideOpen} data-id="hourly-sales-dropdown" class="analysis__inner-bar">Hourly Sales
    </div>
    <div id="hourly-sales-dropdown" class="analysis__inner-dropdown">
        <div class="analysis__inner-content">
        <label for="hourly-sales-input">Paste a 30 day+ hourly sales report</label>
        <input id="hourly-sales-input" class="analysis__inner-content-input type="text">
        </input>
        <button class="analysis__inner-content-button">Process</button>
        </div>
    </div>
</div>
`;
