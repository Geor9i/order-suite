import { html } from "../../../node_modules/lit-html/lit-html.js";
import { restaurantTypes } from "../../constants/restaurantDetails.js";
import styles from "./storeSetupScreen.module.scss";

export const storeSetupTemplate = (
  showDeliveryDetails,
  toggleDay,
  weekdays,
  storeName
) => {
  return html`
    <div class=${styles["main-container"]}>
      <h1>Store Template</h1>
      <p class=${styles["section-title"]}>General Information</p>
      <div class=${styles["store-info-group"]}>
        <label for="storeName">Store name</label>
        <input type="text" name="storeName" value=${storeName} />
      </div>
      <div class=${styles["store-info-group"]}>
        <label for="imageUrl">Store image url</label>
        <input placeholder="http" type="text" name="imageUrl" />
      </div>
      <div class=${styles["store-info-group"]}>
        <label for="storeName">Restaurant type</label>
        <select class=${styles["type-select"]}>
          ${Object.keys(restaurantTypes).map(type => html`<option value=${type}>${restaurantTypes[type].name}</option>`)}
        </select>
      </div>
      <div data-id="store__details__container" class=${styles["section-title"]}>
        Opening Times & Delivery
      </div>

      <div class=${styles["week-container"]}>
        ${weekdays.map((weekday) =>
          weekdayTemplate(weekday, showDeliveryDetails, toggleDay, weekdays)
        )}
      </div>
      <div class=${styles["store__details-confirm-button__container"]}>
        <button class=${styles["store__details-confirm-button"]}>
          Confirm
        </button>
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
   <div class=${styles["weekday-container"]} id="weekday-container-${weekday}">
        <div @click=${toggleDay} class=${styles["weekday-button"]} data-id=${weekday}>${weekday}</div>
            <div class=${styles["opentimes-container"]} id="opentimes-container-${weekday}">
                    <div class=${styles["time-selectors-container"]}>
                        <div class=${styles["time-selector-group"]}>
                            <label for="${weekday}-open-selector">open</label>
                            <select id="${weekday}-open-selector">${generateHours()}</select>
                        </div>
                        <div class=${styles["time-selector-group"]}>
                            <label for="${weekday}-close-selector">close</label>
                            <select id="${weekday}-close-selector">${generateHours()}</select>
                            </div>
                        </div>
                       
                    <div class=${styles["delivery-checkbox-container"]}>
                        <label for="delivery-day-checkbox-${weekday}" >Store Delivery</label>
                        <input id="delivery-day-checkbox-${weekday}" data-id=${weekday} @change=${showDeliveryDetails} type="checkbox"></input>
                    </div>
                        <div id=${`delivery-info-container-${weekday}`}
                        class=${`${styles["delivery-info-container"]} ${styles["inactive"]}`}>
                            <div class=${styles["delivery-info-input-group"]}>
                                <label for="arrival-time-${weekday}">Expected Arrival</label>
                                <select id="arrival-time-${weekday}">${generateHours()}</select>
                            </div>
                        <div title="Day and time cuttoff for this delivery order" class=${styles["delivery-info-input-group"]}>
                        <label for="cutoff-weekday-${weekday}">Placement deadline</label>
                            <select id="cutoff-weekday-${weekday}">
                            ${weekdays.map(
                              (day) =>
                                html`<option value=${day}>${day}</option>`
                            )}
                          </select>
                            <select id="cutoff-weekday-${weekday}" class=${styles["delivery-arrival-cutoff-weekday"]}>${generateHours()}</select>
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
