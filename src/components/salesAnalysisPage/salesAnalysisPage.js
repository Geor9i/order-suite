import { salesAnalysisPageTemplate } from "./salesAnalysisPageTemplate";
import styles from "./salesAnalysisPage.module.scss";
import BaseComponent from "../../framework/baseComponent";

export default class SalesAnalysis extends BaseComponent {
  constructor({ renderBody, router, services, utils, harvester }) {
    super();
    this.render = renderBody;
    this.router = router;
    this.harvester = harvester;
    this.authService = services.authService;
    this.stringUtil = utils.stringUtil;
    this.timeUtil = utils.timeUtil;
    this.dateUtil = utils.dateUtil;
    this.domUtil = utils.domUtil;
    this.mathUtil = utils.mathUtil;
    this.hourlySalesInputHandler = this._hourlySalesInputHandler.bind(this);
    this.hourlySalesChangeHandler = this._hourlySalesChangeHandler.bind(this);
    this.hourlySalesDumpHandler = this._hourlySalesDumpHandler.bind(this);
    this.hourlySalesReportHandler = this._hourlySalesReportHandler.bind(this);
    this.showView = this._showView.bind(this);
    this.slideOpen = this._slideOpen.bind(this);
    this.hourlySales = this.getHourlySalesTemplate();
    this.weeklyTotal = 0;
    this.hourlySalesReport = null;
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
    // selectedContainer.style.overflow = toggleOpen ? 'auto' : 'hidden';
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

  salesGraph() {
    const canvas = document.getElementById('salesGraph');
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight / 2;
    const c = canvas.getContext('2d');
    
    c.beginPath();
    c.fillStyle = 'blue'
    c.arc(100, 100, 50, 0, Math.PI * 2);
    c.fill()

    console.log(c);
  }

  _showView() {
    if (!this.authService.user) {
      this.router.redirect("/");
      return;
    }
    this.render(
      salesAnalysisPageTemplate(
        this.slideOpen,
        this.hourlySales,
        this.hourlySalesInputHandler,
        this.hourlySalesChangeHandler,
        this.weeklyTotal,
        this.hourlySalesDumpHandler,
        this.hourlySalesReportHandler,
        this.submitHandler
      )
    );
    this.salesGraph()
  }

  getHourlySalesTemplate() {
    let workHours = this.workHours({});
    Object.keys(workHours).forEach(
      (weekday) =>
        (workHours[weekday] = {
          hours: { ...workHours[weekday] },
          totals: {
            total: 0,
            share: 0,
          },
        })
    );
    return workHours;
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

  _hourlySalesInputHandler(e) {
    const { value, name, id } = e.target;
    let filteredValue = this.stringUtil.filterString(value, [
      { symbol: "\\d" },
      { symbol: "\\.", matchLimit: 1 },
    ]);
    filteredValue = filteredValue || 0;
    if (e.target.tagName === "INPUT" && (id.includes('total') || id.includes('share'))) {
      const [field, weekday] = e.target.id.split("-");
      console.log(weekday);
      this.hourlySales[weekday].totals[field] = filteredValue;
    } else if (e.target.tagName === "INPUT") {
      const [weekday, hour] = name.split("-");
      this.hourlySales[weekday].hours[hour] = filteredValue;
    }
    e.target.value = filteredValue;
    this.showView();
  }

  _hourlySalesChangeHandler(e) {
    let { name, value, id } = e.target;
    if (e.target.tagName === "INPUT" && (id.includes('total') || id.includes('share'))) {
      const [field, weekday] = e.target.id.split("-");
      this.hourlySales[weekday].totals[field] = Number(value);
      this.calcFromTotals(field, weekday);
    } else if (e.target.tagName === "INPUT") {
      const [weekday, hour] = name.split("-");
      this.hourlySales[weekday].hours[hour] = Number(value);
      const weeklyTotal = this.getWeeklyTotal();
      this.updateTotals();
      this.updateWeeklyShare(weeklyTotal);
    }
    this.weeklyTotal = this.getWeeklyTotal(true);
    this.showView();
  }

  calcFromTotals(field, weekday) {
    let weeklyTotal = this.getWeeklyTotal(true);
    if (field === "total") {
      this.updateHours(weekday);
      this.updateWeeklyShare(weeklyTotal);
    } else if (field === "share") {
      if (weeklyTotal === 0) return;

      let currentShareTotal = 0;
      Object.keys(this.hourlySales).forEach((day) => {
        currentShareTotal += this.hourlySales[day].totals.share;
      });
      let shareDifference = 100 - currentShareTotal;
      const sharesArr = [];
      let selectedShareIndex;
      Object.keys(this.hourlySales).forEach((day, i) => {
        if (weekday === day) {
          selectedShareIndex = i;
        }
        sharesArr.push(this.hourlySales[day].totals.share);
      });
      let adjustedShares = this.mathUtil.spreadProportionateValueArr(
        sharesArr,
        shareDifference,
        selectedShareIndex
      );
      Object.keys(this.hourlySales).forEach((day, i) => {
        this.hourlySales[day].totals.share = adjustedShares[i];
        this.hourlySales[day].totals.total =
          weeklyTotal * (adjustedShares[i] / 100);
        this.updateHours(day);
      });
    }
    this.showView();
  }

  updateHours(weekday) {
    const { total } = this.hourlySales[weekday].totals;
    const hourValuesArr = Object.values(this.hourlySales[weekday].hours);
    const hourKeysArr = Object.keys(this.hourlySales[weekday].hours);
    let adjustedValuesArr = this.mathUtil.evenArrRatioToSum(
      hourValuesArr,
      total,
      -1,
      true
    );
    for (let hour of hourKeysArr) {
      this.hourlySales[weekday].hours[hour] = adjustedValuesArr.shift();
    }
  }

  updateWeeklyShare(weeklyTotal) {
    if (weeklyTotal === 0) return null;
    Object.keys(this.hourlySales).forEach((weekday) => {
      this.hourlySales[weekday].totals.share =
        (this.hourlySales[weekday].totals.total / weeklyTotal) * 100;
    });
  }

  getWeeklyTotal(fromTotal = false) {
    let weeklyTotal = 0;
    Object.keys(this.hourlySales).forEach((weekday) => {
      let total = 0;
      if (fromTotal) {
        total = Number(this.hourlySales[weekday].totals.total);
      } else {
        total = Object.keys(this.hourlySales[weekday].hours).reduce(
          (total, hour) =>
            (total += Number(this.hourlySales[weekday].hours[hour])),
          0
        );
      }
      weeklyTotal += total;
    });
    return weeklyTotal;
  }

  updateTotals() {
    Object.keys(this.hourlySales).forEach((weekday) => {
      let total = Object.keys(this.hourlySales[weekday].hours).reduce(
        (total, hour) =>
          (total += Number(this.hourlySales[weekday].hours[hour])),
        0
      );
      this.hourlySales[weekday].totals.total = total;
    });
  }

  _hourlySalesDumpHandler(e) {
    const dump = e.currentTarget;
    const { value } = dump;
    this.hourlySalesReport = this.harvester.hourlySalesExtractor(value);
    dump.value = !this.hourlySalesReport ? "Wrong Data!" : "Received!";
    setTimeout(() => {
      dump.value = "";
    }, 3000);
  }

  _hourlySalesReportHandler() {
    if (!this.hourlySalesReport) return;

    const selectValue = document.getElementById('hourly-report-select').value;
    if (selectValue === 'averageReport') {
      const weekdayCount = Object.keys(this.hourlySales).length
      for (let weekday in this.hourlySales) {
        for (let hour in this.hourlySales[weekday].hours) {
          if (this.hourlySalesReport.hours.hasOwnProperty(hour)) {
            this.hourlySales[weekday].hours[hour] = this.hourlySalesReport.hours[hour].hourlySales / weekdayCount;
          }
        }
      }
    } else {
      for (let hour in this.hourlySales[selectValue].hours) {
        if (this.hourlySalesReport.hours.hasOwnProperty(hour)) {
          this.hourlySales[selectValue].hours[hour] = this.hourlySalesReport.hours[hour].hourlySales
        }
      }
    }
    const weeklyTotal = this.getWeeklyTotal();
    this.updateTotals()
    this.weeklyTotal = this.getWeeklyTotal(true);
    this.updateWeeklyShare(weeklyTotal)
    this.showView()
  }
}
