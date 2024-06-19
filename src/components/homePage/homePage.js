import { homePageTemplate } from "./homePageTemplate.js";
import { eventBus } from '../../services/eventbus.js';
import { bus } from '../../constants/busEvents.js';
import BaseComponent from "../../framework/baseComponent.js";

export default class HomeComponent extends BaseComponent {
  constructor({ renderBody, router, utils }) {
    this.renderHandler = renderBody;
    this.router = router;
    this.showView = this._showView.bind(this);
    this.userData = null;
    this.subscriberId = 'HomeComponent';
    this.eventBusUnsubscribe = null;
  }

  _showView(ctx) {
    this.renderHandler(homePageTemplate());
  }

  init() {
    this.eventBusUnsubscribe = eventBus.on(bus.USERDATA, this.subscriberId, (userData) => {this.userData = userData; console.log('userData: ', userData);})
  }

  destroy() {
    this.eventBusUnsubscribe && this.eventBusUnsubscribe();
  }
}
