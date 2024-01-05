import { salesAnalysisPageTemplate } from "./salesAnalysisPageTemplate";
import styles from "./salesAnalysisPage.module.css";

export default class SalesAnalysis {
  constructor({ renderBody, router, fireService, utils }) {
    this.render = renderBody;
    this.router = router;
    this.fireService = fireService;
    this.stringUtil = utils.stringUtil;
    this.timeUtil = utils.timeUtil;
    this.dateUtil = utils.dateUtil;
    this.domUtil = utils.domUtil;
    this.hourlySalesChangeHandler = this._hourlySalesChangeHandler.bind(this);
    this.showView = this._showView.bind(this);
    this.slideOpen = this._slideOpen.bind(this);
    this.hourlySales = this.workHours({});
    this.sliderContainers = [];
  }

  _slideOpen(e) {
    const barElement = e.currentTarget;
    const id = barElement.dataset.id;
    const container = document.getElementById(id);
    const isRecorded = this.sliderContainers.some(
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
    if (toggleOpen) {
      barElement.classList.remove(styles["section__bar-closed"]);
    } else {
      barElement.classList.add(styles["section__bar-closed"]);
    }
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

  getRestaurantData() {
    return {
      openTimes: {
        monday: { startTime: "11:00", endTime: "23:00" },
        tuesday: { startTime: "11:00", endTime: "23:00" },
        wednesday: { startTime: "11:00", endTime: "23:00" },
        thursday: { startTime: "11:00", endTime: "23:00" },
        friday: { startTime: "11:00", endTime: "23:00" },
        saturday: { startTime: "11:00", endTime: "23:00" },
        sunday: { startTime: "11:00", endTime: "23:00" },
      },
    };
  }

  submitHandler(e) {
    e.preventDefault();
  }

  _showView() {
    if (!this.fireService.user) {
      this.router.redirect("/");
      return;
    }
    const weekGuide = this.dateUtil.getWeekdays([]);
    const workHours = this.workHours();
    this.render(
      salesAnalysisPageTemplate(
        this.slideOpen,
        weekGuide,
        workHours,
        this.hourlySalesChangeHandler,
        this.submitHandler
      )
    );
  }

  workHours(dataType = []) {
    let { openTimes } = this.getRestaurantData();
    return Object.keys(openTimes).reduce((obj, weekday) => {
      const { startTime, endTime } = openTimes[weekday];
      obj[weekday] = this.timeUtil.hourlyTimeWindow(
        startTime,
        endTime,
        dataType
      );
      return obj;
    }, {});
  }

  _hourlySalesChangeHandler(e) {
    if (e.target.tagName === "INPUT") {
      const { name, value } = e.target;
      const [weekday, hour] = name.split("-");
      let filteredValue = this.stringUtil.filterString(value, [
        { symbol: "\\d" },
        { symbol: "\\.", matchLimit: 1 },
      ]);
      console.log(filteredValue);
    }
  }
}
