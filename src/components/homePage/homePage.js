import { homePageTemplate } from "./homePageTemplate.js";
import { guestHomeTemplate } from './guestHomeTemplate';
import { eventBus } from '../../services/eventbus.js';
import { bus } from '../../constants/busEvents.js';
import { routes } from "../../constants/routing.js";
import BaseComponent from "../../framework/baseComponent.js";
export default class HomeComponent extends BaseComponent {
  constructor({ renderBody, router, utils, firestoreService, authService }) {
    super();
    this.renderHandler = renderBody;
    this.firestoreService = firestoreService;
    this.authService = authService;
    this.router = router;
    this.objUtil = utils.objUtil;
    this.showView = this._showView.bind(this);
    this.userData = null;
    this.subscriberId = 'HomeComponent';
    this.userDataSubscription = null;
  }

  _showView(ctx) {
    this.userData = this.firestoreService.state;
    if (!this.userData) {
      this.renderHandler(guestHomeTemplate());
    } else {
      const { completion, progressReport } = this._profileCompletionReport();
      this.renderHandler(homePageTemplate(completion, progressReport, this.userData))
    }
  }

    init() {
    if (this.authService.user) {
      this.userDataSubscription = eventBus.on(bus.USERDATA, this.subscriberId, () => this.showView())
    }
    this.showView();
  }

  destroy() {
    this.userDataSubscription && this.userDataSubscription();
  }

  _profileCompletionReport() {
    const { salesData, storeSettings, products } = this.userData;
    const completionFactors = { salesData, storeSettings, products };
    const progressReport = {storeSettings: {}, products: {}, salesData: {}};

    const profileCompletionsShare = Math.round(1 / Object.keys(completionFactors).length);
    let completion = 0;
    for (let factor in completionFactors) {
      if (completionFactors[factor] === null)  {
        progressReport[factor] = {untouched: true, route: routes[factor]}
        break;
      }
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
    return { completion, progressReport };
  }
}
