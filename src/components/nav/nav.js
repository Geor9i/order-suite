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
    const dropdownMenuElementStates = {
      normal: document.querySelector(".dropdown__menu"),
      dropped: document.querySelector(".dropdown__menu__active"),
    };
    let backDrop = document.querySelector(".menu-backdrop");
    this.domUtil.toggleVisibility(backDrop);
    let dropDownElement = this.domUtil.findActiveClass(
      dropdownMenuElementStates
    );
    this.domUtil.toggleClass(dropDownElement, [
      "dropdown__menu",
      "dropdown__menu__active",
    ]);
  }
}
