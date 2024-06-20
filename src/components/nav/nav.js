import { guestNavTemplate } from "./guestNavTemplate.js";
import { userNavTemplate } from "./userNavTemplate.js";
import { eventBus } from '../../services/eventbus.js';
import { bus } from '../../constants/busEvents.js'
import styles from "./nav.module.scss";
import BaseComponent from "../../framework/baseComponent.js";

export default class NavComponent{
  constructor(renderHandler, router, authService, firestoreService, utils) {
    this.domUtil = utils.domUtil;
    this.renderHandler = renderHandler;
    this.authService = authService;
    this.firestoreService = firestoreService;
    this.router = router;
    this.showView = this._showView.bind(this);
    this.navDropdown = this._navDropdown.bind(this);
    this.logoutHandler = this._logoutHandler.bind(this);
    this.subscriberId = 'NavComponent';
    this.authSubscription = null;
    this.userDataSubscription = null;
  }

  _showView(ctx, next) {
    let toggleNav = this._toggleNav.bind(this);
    this.authSubscription && this.authSubscription();
    this.authSubscription = eventBus.on(bus.AUTH_STATE_CHANGE, this.subscriberId, (user) => {
      this.userDataSubscription && this.userDataSubscription();
      if (user) {
        this.userDataSubscription = eventBus.on(bus.USERDATA, this.subscriberId, () => toggleNav(user, next));
      }
      toggleNav(user, next)
    });
    toggleNav(this.authService.user, next);
  }

  _toggleNav(user, next) {
    let template;
    if (user) {
      template = userNavTemplate(this.navDropdown, this.logoutHandler, this.firestoreService.state?.storeName);
    } else {
      template = guestNavTemplate();
    }
    this.renderHandler(template);
    next();
  }

  _navDropdown() {
    const element = document.getElementById("dropdown__menu");
    let backDrop = document.querySelector(`.${styles["menu-backdrop"]}`);
    this.domUtil.toggleVisibility(backDrop);
    const menuClasses = [
      styles["dropdown__menu"],
      `${styles["dropdown__menu"]} ${styles["dropdown__menu__active"]}`,
    ];
    this.domUtil.toggleClass(element, menuClasses);
  }

  async _logoutHandler() {
    await this.authService.logout();
    this.router.redirect("/");
  }
}
