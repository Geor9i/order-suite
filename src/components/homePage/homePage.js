import { homePageTemplate } from "./homePageTemplate.js";
import { eventBus } from '../../services/eventbus.js';
import { bus } from '../../constants/busEvents.js';
import BaseComponent from "../../framework/baseComponent.js";

export default class HomeComponent extends BaseComponent {
  constructor({ renderBody, router, utils }) {
    super();
    this.renderHandler = renderBody;
    this.router = router;
    this.objUtil = utils.objUtil;
    this.showView = this._showView.bind(this);
    this.userData = null;
    this.subscriberId = 'HomeComponent';
    this.eventBusUnsubscribe = null;
  }

  _showView(ctx) {
    this.renderHandler(homePageTemplate(0));
  }

  init() {
    this.eventBusUnsubscribe = eventBus.on(bus.USERDATA, this.subscriberId, this._displayProfileCompletion.bind(this))
  }

  destroy() {
    this.eventBusUnsubscribe && this.eventBusUnsubscribe();
  }

  _displayProfileCompletion(userData) {
    console.log('userData: ', userData);
    const { profile, storeSettings, products } = userData;
    const completionFactors = { profile, storeSettings, products };
    const progressReport = {profile: [], storeSettings: [], products: []};

    const profileCompletionsShare = Math.round(1 / Object.keys(completionFactors).length);
    let completion = 0;
    for (let factor in completionFactors) {
      if (completionFactors[factor] === null)  break;
        const profileArea = completionFactors[factor];
        const profileAreaLenght = Object.keys(profileArea).length;
        let profileAreaCompletion = 0;
        for (let field in profileArea) {
          let fieldShare = Math.ceil(1 / profileAreaLenght);
          if (!this.objUtil.isEmpty(profileArea[field])) {
            profileAreaCompletion += fieldShare;
          } else {
            progressReport[factor].push(field)
          }
        }
        profileAreaCompletion = Math.max(100, profileAreaCompletion);
        completion += profileCompletionsShare * (profileAreaCompletion / 100);
    }
    console.log(completion);
    this.showView(completion, progressReport);
  }
}
