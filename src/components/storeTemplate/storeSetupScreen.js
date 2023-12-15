export default class StoreTemplateScreen {
  constructor(templateFunction, render, router, utils) {
    this.templateFunction = templateFunction;
    this.render = render;
    this.router = router;
    this.dateUtil = utils.dateUtil;
    this.domUtil = utils.domUtil;
    this.showView = this._showView.bind(this);
    this.slideOpen = this._slideOpen.bind(this);
    this.showDeliveryDetails = this._showDeliveryDetails.bind(this);
  }

  _showView() {
    this.render(
      this.templateFunction(
        this.slideOpen,
        this.showDeliveryDetails,
        this.dateUtil
      )
    );
  }

  _slideOpen(e) {
    const element = e.currentTarget;
    const id = element.dataset.id;
    const container = document.getElementById(id);
    const className = `slider-active`;
    this.domUtil.addRemoveClass(container, className);
  }

  _showDeliveryDetails(e) {
    const weekday = e.currentTarget.dataset.id
    const detailsContainer = document.getElementById(`delivery-day-info__container-${weekday}`);
    this.domUtil.addRemoveClass(detailsContainer, `inactive`);
  }
}
