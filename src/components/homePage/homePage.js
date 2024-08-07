import { homePageTemplate } from "./homePageTemplate.js";
import { guestHomeTemplate } from './guestHomeTemplate';
import { bus } from '../../constants/busEvents.js';
import { routes } from "../../constants/routing.js";
import { db_main_collections } from "../../constants/db.js";
import BaseComponent from "../../framework/baseComponent.js";
import styles from './homePage.module.scss';
import stylesGuest from './guestHome.scss';

export default class HomeComponent extends BaseComponent {
  constructor({ renderBody, router, utils, services }) {
    super();
    this.jsEventBusSubscriberId = 'HomeComponent';
    this.jsEventBus = services.jsEventBus;
    this.eventBus = services.eventBus;
    this.renderHandler = renderBody;
    this.firestoreService = services.firestoreService;
    this.authService = services.authService;
    this.router = router;
    this.objUtil = utils.objUtil;
    this.showView = this._showView.bind(this);
    this.userData = null;
    this.subscriberId = 'HomeComponent';
    this.userDataSubscription = null;
  }

  _showView(ctx) {
    this.userData = this.firestoreService.userData;
    if (!this.userData) {
      this.renderHandler(guestHomeTemplate());
    } else {
      const { completion, progressReport } = this.profileCompletionReport();
      this.renderHandler(homePageTemplate(completion, progressReport, this.userData))
    }
    this.container = document.querySelector(`.${styles['container']}`) || document.querySelector(`.${stylesGuest['container']}`);
  }

    init() {
    if (this.authService.user) {
      this.userDataSubscription = this.eventBus.on(bus.USERDATA, this.subscriberId, () => this.showView())
    }
  }

  destroy() {
    this.userDataSubscription && this.userDataSubscription();
  }

  profileCompletionReport() {
    const completionFactors = 
    {}; 
    Object.keys(db_main_collections).forEach(key => completionFactors[key] = this.userData[key])
    const progressReport = { ...db_main_collections };

    const profileCompletionsShare = Math.round(1 / Object.keys(completionFactors).length);
    let completion = 0;
    for (let factor in completionFactors) {
      if (!completionFactors[factor])  {
        progressReport[factor] = {...progressReport[factor], untouched: true, link: routes[factor]}
        continue;
      }
        const profileArea = completionFactors[factor];
        const profileAreaLenght = Object.keys(profileArea).length;
        let profileAreaCompletion = 0;
        for (let field in profileArea) {
          let fieldShare = Math.ceil(1 / profileAreaLenght);
          if (!this.objUtil.isEmpty(profileArea[field])) {
            profileAreaCompletion += fieldShare;
          }
        }
        profileAreaCompletion = Math.max(100, profileAreaCompletion);
        completion += profileCompletionsShare * (profileAreaCompletion / 100);
    }
    return { completion, progressReport };
  }
}
