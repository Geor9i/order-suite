import { storeSetupTemplate } from "./StoreSetupTemplate.js";
import styles from './storeSetupScreen.module.scss';
import BaseComponent from '../../framework/baseComponent.js';
export default class StoreTemplateScreen extends BaseComponent {
  constructor({ renderBody, router, authService, firestoreService, utils }) {
    super();
    this.render = renderBody;
    this.router = router;
    this.authService = authService;
    this.firestoreService = firestoreService;
    this.stringUtil = utils.stringUtil;
    this.dateUtil = utils.dateUtil;
    this.domUtil = utils.domUtil;
    this.showView = this._showView.bind(this);
    this.toggleDay = this._toggleDay.bind(this);
    this.showDeliveryDetails = this._showDeliveryDetails.bind(this);
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
        this.showDeliveryDetails,
        this.toggleDay,
        weekdays,
        this.firestoreService.state.STORE_NAME
      )
    );
  }


  _showDeliveryDetails(e) {
    const weekday = e.currentTarget.dataset.id;
    const detailsContainer = document.getElementById(
      `delivery-info-container-${weekday}`
    );
    this.domUtil.addRemoveClass(detailsContainer, styles['inactive']);
  }

  _toggleDay(e) {
    const element = e.currentTarget;
    const weekday = element.dataset.id;
    const container = document.getElementById(
      `opentimes-container-${weekday}`
    );
    this.domUtil.addRemoveClass(element, styles["weekday-button__inactive"]);
    this.domUtil.addRemoveClass(container, styles["inactive"]);
  }
}
