import styles from './nav.module.css'

export default class NavComponent {
  constructor(
    guestNavTemplate,
    userNavTemplate,
    renderHandler,
    router,
    fireService,
    utils
  ) {
    this.domUtil = utils.domUtil;
    this.renderHandler = renderHandler;
    this.userNavTemplate = userNavTemplate;
    this.guestNavTemplate = guestNavTemplate;
    this.fireService = fireService;
    this.router = router;
    this.showView = this._showView.bind(this);
    this.navDropdown = this._navDropdown.bind(this);
    this.logoutHandler = this._logoutHandler.bind(this);
  }

  _showView(ctx, next) {
    this.fireService.auth.onAuthStateChanged((user) => {
      let template;
      if (user) {
        template = this.userNavTemplate(
          this.navDropdown,
          this.logoutHandler
          );
      } else {
        template = this.guestNavTemplate();
      }
      this.renderHandler(template);
      next();
    });
  }

  _navDropdown() {
    const element = document.getElementById("dropdown__menu");
    let backDrop = document.querySelector(`.${styles['menu-backdrop']}`);
    this.domUtil.toggleVisibility(backDrop);
    const menuClasses = [
      styles["dropdown__menu"],
      `${styles["dropdown__menu"]} ${styles["dropdown__menu__active"]}`,
    ];
    this.domUtil.toggleClass(element, menuClasses);
  }

  _logoutHandler() {
    this.fireService.logout();
    this.router.navigate('/');
  }
}
