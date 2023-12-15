export default class StoreTemplateScreen {
  constructor(templateFunction, render, router, utils) {
    this.templateFunction = templateFunction;
    this.render = render;
    this.router = router;
    this.stringUtil = utils.stringUtil;
    this.dateUtil = utils.dateUtil;
    this.domUtil = utils.domUtil;
    this.showView = this._showView.bind(this);
    this.slideOpen = this._slideOpen.bind(this);
    this.toggleDay = this._toggleDay.bind(this);
    this.showDeliveryDetails = this._showDeliveryDetails.bind(this);
    this.sliderContainers = [];
  }

  _showView() {
  const weekdays = this.dateUtil.getWeekdays([]).map(weekday => this.stringUtil.toPascalCase(weekday));
    
    this.render(
      this.templateFunction(
        this.slideOpen,
        this.showDeliveryDetails,
        this.toggleDay,
        weekdays
      )
    );
  }

  _slideOpen(e) {
    const element = e.currentTarget;
    const id = element.dataset.id;
    const container = document.getElementById(id);
    const isRecorded = this.sliderContainers.find(element => element.id === id);
    if (!isRecorded) {
      this.sliderContainers.push(container)
    }
    const containerHeight = container.getBoundingClientRect().height;
    if (containerHeight <= 0) {
      const contentHeight = this.domUtil.getContentHeight(container);
      container.style.height = contentHeight + 'px';
    } else {
      container.style.height = 0 + 'px';
    }
    console.log(this.domUtil.getElementHierarchy(this.sliderContainers));
  }

  _showDeliveryDetails(e) {
    const weekday = e.currentTarget.dataset.id
    const detailsContainer = document.getElementById(`delivery-day-info__container-${weekday}`);
    this.domUtil.addRemoveClass(detailsContainer, `inactive`);
  }

  _toggleDay(e) {
    const element = e.currentTarget;
    const weekday = element.dataset.id;
    const container = document.getElementById(`store-details__main-container-${weekday}`);
    this.domUtil.addRemoveClass(element, 'weekday-button__inactive');
    this.domUtil.addRemoveClass(container, 'inactive');

  }
}
