import { storeSetupTemplate } from "./StoreSetupTemplate.js";
import styles from './storeSetupScreen.module.scss';
import BaseComponent from '../../framework/baseComponent.js';
import { routes } from "../../constants/routing.js";
export default class StoreTemplateScreen extends BaseComponent {
  constructor({ renderBody, router, services, utils }) {
    super();
    this.render = renderBody;
    this.router = router;
    this.authService = services.authService;
    this.errorRelay = services.errorRelay;
    this.firestoreService = services.firestoreService;
    this.stringUtil = utils.stringUtil;
    this.dateUtil = utils.dateUtil;
    this.domUtil = utils.domUtil;
    this.showView = this._showView.bind(this);
  }

  _showView(ctx) {
    if (!this.authService.user) {
      this.router.redirect("/");
      return;
    }

    const weekdays = this.dateUtil
      .getWeekdays([])
      .map((weekday) => this.stringUtil.toPascalCase(weekday));

    this.render(
      storeSetupTemplate(
        this.showDeliveryDetails.bind(this),
        this.toggleDay.bind(this),
        weekdays,
        this.firestoreService.userData.STORE_NAME,
        this.submitHandler.bind(this)
      )
    );
  }

  async submitHandler() {
    const formData = this.getFormData();
    console.log(formData);
        try {
          await this.firestoreService.setStoreTemplate(formData);
          this.router.redirect(routes.HOME);
        } catch (err) {
          this.errorRelay.send(err);
        }
  }

  getFormData() {
    const formContainer = document.querySelector(`.${styles['main-container']}`);
    const infoInputs = [...formContainer.querySelectorAll(`.${styles['store-info-group']} input`),
    ...formContainer.querySelectorAll(`.${styles['store-info-group']} select`)]
    .reduce((acc, element) => {
      acc[element.name] = element.value;
      return acc;
    }, {})

    const weekdayContainers = [...document.querySelectorAll(`.${styles['weekday-container']}`)]
    .reduce((acc, element) => {
      const weekday = element.dataset.id.toLowerCase();
      const isClosed = element.dataset.state ?? null;
      if (isClosed) {
        acc[weekday] = {state: 'closed'};
        return acc;
      }
      const dataObj = {};
      const openTimesSelectors= [...element.querySelectorAll(`.${styles['time-selector-group']}  select`)];
      openTimesSelectors.forEach(select => dataObj[select.name] = select.value);
      const deliveryCheckbox = element.querySelector(`.${styles['delivery-checkbox-container']}  input`);
      const hasDelivery = deliveryCheckbox.checked;
      dataObj.hasDelivery = hasDelivery;
      if (!hasDelivery) {
        acc[weekday] = dataObj;
        return acc;
      }
      const deliveryInfoSelectors = [...element.querySelectorAll(`.${styles['delivery-info-container']} select`)]
      .reduce((obj, selector) => {
        obj[selector.name] = selector.value;
        return obj;
      }, {});
      acc[weekday] = {
        ...dataObj,
        ...deliveryInfoSelectors
      }
      return acc;

    }, {});
    return {...infoInputs, weekdays: weekdayContainers};
  }

  showDeliveryDetails(e) {
    const weekday = e.currentTarget.dataset.id;
    const detailsContainer = document.getElementById(
      `delivery-info-container-${weekday}`
    );
    this.domUtil.addRemoveClass(detailsContainer, styles['inactive']);
  }

  toggleDay(e) {
    const element = e.currentTarget;
    const weekday = element.dataset.id;
    const closedTextContainer = document.getElementById(`closed-day-container-${weekday}`);
    const container = document.getElementById(
      `opentimes-container-${weekday}`
    );
    this.domUtil.addRemoveClass(element, styles["weekday-button__inactive"]);
    this.domUtil.addRemoveAttribute(element, 'data-state', 'closed');
    this.domUtil.addRemoveClass(container, styles["inactive"]);
    this.domUtil.addRemoveClass(closedTextContainer, styles["inactive"]);
  }
}

// class=${styles[inactive]}