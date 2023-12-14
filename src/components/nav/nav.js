export default class NavComponent {
  constructor(templateFunction, renderHandler, router, utils) {
    this.domUtil = utils.domUtil;
    this.renderHandler = renderHandler;
    this.templateFunction = templateFunction;
    this.router = router;
    this.showView = this._showView.bind(this);
    this.navDropdown = this._navDropdown.bind(this);
  }

  _showView(ctx, next) {
    let template = this.templateFunction(this.navDropdown);
    this.renderHandler(template);
    next();
  }

  _navDropdown() {
    const element = document.getElementById('dropdown__menu');
    let backDrop = document.querySelector(".menu-backdrop");
    this.domUtil.toggleVisibility(backDrop);
    const menuClasses = ['dropdown__menu', 'dropdown__menu dropdown__menu__active']
    this.domUtil.toggleClass(element, menuClasses)
  }
}
