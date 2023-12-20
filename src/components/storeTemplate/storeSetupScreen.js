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

  _showView(ctx) {
    if (!ctx.user) {
      this.router.navigate("/404");
      return;
    }

    const weekdays = this.dateUtil
      .getWeekdays([])
      .map((weekday) => this.stringUtil.toPascalCase(weekday));

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
    const isRecorded = this.sliderContainers.find(
      (element) => element.id === id
    );
    if (!isRecorded) {
      this.sliderContainers.push(container);
    }

    let containerHierarchies = this.domUtil.getElementHierarchy(
      this.sliderContainers
    );
    const selectedHierarchy = containerHierarchies.find((arr) =>
      arr.find((element) => element.id === id)
    );
    const hierarchyHeightArr = selectedHierarchy.map(
      (el) => el.getBoundingClientRect().height
    );
    const startContainerIndex = selectedHierarchy.findIndex(
      (element) => element.id === id
    );
    const selectedContainer = selectedHierarchy[startContainerIndex];
    let containerHeight = hierarchyHeightArr[startContainerIndex];
    let toggleOpen = containerHeight <= 0 ? true : false;
    let cumulativeHeight = this.domUtil.getContentHeight(selectedContainer);
    selectedContainer.style.height = (toggleOpen ? cumulativeHeight : 0) + "px";
    for (let i = startContainerIndex - 1; i >= 0; i--) {
      if (selectedHierarchy[i].contains(selectedContainer)) {
        const currentParentContainer = selectedHierarchy[i];
        let currentParentContainerContentHeight = hierarchyHeightArr[i];
        cumulativeHeight = toggleOpen
          ? cumulativeHeight + currentParentContainerContentHeight
          : cumulativeHeight;
        currentParentContainer.style.height =
          (toggleOpen
            ? cumulativeHeight
            : currentParentContainerContentHeight - cumulativeHeight) + "px";
      }
    }
  }

  _showDeliveryDetails(e) {
    const weekday = e.currentTarget.dataset.id;
    const detailsContainer = document.getElementById(
      `delivery-day-info__container-${weekday}`
    );
    this.domUtil.addRemoveClass(detailsContainer, `inactive`);
  }

  _toggleDay(e) {
    const element = e.currentTarget;
    const weekday = element.dataset.id;
    const container = document.getElementById(
      `store-details__main-container-${weekday}`
    );
    this.domUtil.addRemoveClass(element, "weekday-button__inactive");
    this.domUtil.addRemoveClass(container, "inactive");
  }
}
