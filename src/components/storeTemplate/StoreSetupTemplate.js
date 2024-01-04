import { html } from "../../../node_modules/lit-html/lit-html.js";
import styles from "./storeSetupScreen.module.css";

export const storeSetupTemplate = (
  slideOpen,
  showDeliveryDetails,
  toggleDay,
  weekdays
) => {
  return html`
    <div class=${styles["template-container"]}>
      <h1>Store Template</h1>
      <div class=${styles["store__open-times-container"]}>
        <div
          @click=${slideOpen}
          data-id="restaurant-info-container"
          class=${styles["section__bar"]}
        >
          General Information
        </div>
        <div
          class=${styles["expand__container"]}
          id="restaurant-info-container"
        >
          <div class=${styles["restaurant-info-content-container"]}>
            <div class=${styles["store-info-container"]}>
              <label for="storeName">StoreName</label>
              <input type="text" name="storeName" />
            </div>
            <div class=${styles["store-info-container"]}>
              <label for="imageUrl">Image Url</label>
              <input type="text" name="imageUrl" />
            </div>
            <div class=${styles["store-info-container"]}>
              <label for="storeName">Restaurant Type</label>
              <select class=${styles["type-select"]}>
                <option value="Express">Express</option>
                <option value="Conventional">Conventional</option>
                <option value="Drive Thru">Drive Thru</option>
                <option value="Delivery Only">Delivery only</option>
              </select>
            </div>
          </div>
        </div>
        <div
          @click=${slideOpen}
          data-id="store__details__container"
          class=${styles["section__bar"]}
        >
          Opening Times & Delivery
        </div>
        <div
          class=${styles["expand__container"]}
          id="store__details__container"
        >
          <div class=${styles["weekday__main__container"]}>
            ${weekdays.map((weekday) =>
              weekdayTemplate(weekday, showDeliveryDetails, toggleDay, weekdays)
            )}
          </div>
        </div>

        <div class=${styles["store__details-confirm-button__container"]}>
          <button class=${styles["store__details-confirm-button"]}>
            Confirm
          </button>
        </div>
      </div>

      <div class=${styles["inventory-template__create-form__inactive"]}>
        <div class=${styles["inventory-template__main-container"]}></div>
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
   <div class=${
     styles["weekday__container"]
   } id="weekday__container-${weekday}">
        <div @click=${toggleDay} class=${
  styles["weekday-button"]
} data-id=${weekday}>${weekday}</div>
            <div class=${
              styles["store-details__main-container"]
            } id="store-details__main-container-${weekday}">
                    <div class=${styles["time-selector__main-container"]}>
                        <div class=${styles["time-selector__inner-container"]}>
                            <label class=${
                              styles["time-selector-label"]
                            } for="${weekday}-open-selector">open</label>
                            <select id="open-selector-${weekday}" class=${
  styles["time-selector"]
}>${generateHours()}</select>
                        </div>
                        <div class=${styles["time-selector__inner-container"]}>
                            <label class=${
                              styles["time-selector-label"]
                            } for="${weekday}-close-selector">close</label>
                            <select id="close-selector-${weekday}" class=${
  styles["time-selector"]
}>${generateHours()}</select>
                            </div>
                        </div>
                       
                    <div class=${styles["delivery-day-input-container"]}>
                        <label for="delivery-day-checkbox-${weekday}" class=${
  styles["delivery-day-label"]
}>Store Delivery</label>
                        <input id="delivery-day-checkbox-${weekday}" data-id=${weekday} class=${
  styles["delivery-day-checkbox"]
} @change=${showDeliveryDetails} type="checkbox"></input>
                    </div>
                        <div id=${`delivery-day-info__container-${weekday}`} class=${`${styles["delivery-day-info__container"]} ${styles["inactive"]}`}>
                            <div class=${styles["delivery-day-eta__container"]}>
                                <label for="arrival-time-${weekday}" class=${
  styles["delivery-day-arrival-time-text"]
}>ETA</label>
                                <select id="arrival-time-${weekday}" class=${
  styles["delivery-arrival-selector"]
}>${generateHours()}</select>
                            </div>
                        <div class=${styles["order-cutoff-details__container"]}>
                        <label for="cutoff-weekday-${weekday}" class=${
  styles["delivery-day-arrival-time-text"]
}>Order placement deadline</label>
                            <select id="cutoff-weekday-${weekday}" class=${
  styles["delivery-arrival-cutoff-weekday"]
}>
                            ${weekdays.map(
                              (day) =>
                                html`<option value=${day}>${day}</option>`
                            )}
                          </select>
                            <select id="cutoff-weekday-${weekday}" class=${
  styles["delivery-arrival-cutoff-weekday"]
}>${generateHours()}</select>
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
