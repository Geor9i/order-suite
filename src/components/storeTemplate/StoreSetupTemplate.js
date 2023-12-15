import { html } from "../../../node_modules/lit-html/lit-html.js";

export const storeSetupTemplate = (slideOpen, showDeliveryDetails, dateUtil) => {
  const weekdays = dateUtil.getWeekdays([]);

  return html`
    <div class="inventory__main-container">
      <div class="store__open-times-container">
        <h1 class="store__open-times__form-header">Farnborough Express</h1>
        <div @click=${slideOpen} data-id="store__details__container" class="store__details__bar">Store Details</div>
        <div class="store__details__container" id="store__details__container">
          <div class="weekday__main__container">
            ${weekdays.map((weekday) => weekdayTemplate(weekday, showDeliveryDetails))}
          </div>
        </div>
        <div id="analysis-bar" class="store__details__bar">Analysis</div>
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

const weekdayTemplate = (weekday, showDeliveryDetails) => html`
   
   <div class="weekday__container" id="weekday__container-${weekday}">
        <div class="weekday-button__active" id="weekday-button__active-${weekday}">${weekday}</div>
            <div class="store-details__main-container__active">
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
                        <div class="sales-percentage-container">
                            <label for="sales-percentage-input-${weekday}" class="sales-percentage-label" >Daily Sales</label>
                            <input maxlength="5" class="sales-percentage-input" id="sales-percentage-input-${weekday}" placeholder="0"></input>
                            <p class="sales-percentage-input-sign">%</p>
                            
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
                            <select id="cutoff-weekday-${weekday}" class="delivery-arrival-cutoff-weekday">${generateHours()}</select>
                            <select id="cutoff-time-${weekday}" class="delivery-arrival-cutoff-time">${generateHours()}</select>
                        </div>
                </div>
            </div>
        </div>
`;

const generateHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const formattedHour = i < 10 ? `0${i}` : `${i}`;
    hours.push(html`<option value="${formattedHour}:00">${formattedHour}:00</option>`);
    hours.push(html`<option value="${formattedHour}:15">${formattedHour}:15</option>`);
    hours.push(html`<option value="${formattedHour}:30">${formattedHour}:30</option>`);
    hours.push(html`<option value="${formattedHour}:45">${formattedHour}:45</option>`);
  }
  return hours;
};
