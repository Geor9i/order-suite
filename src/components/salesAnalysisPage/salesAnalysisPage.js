import { salesAnalysisPageTemplate } from "./salesAnalysisPageTemplate";
import styles from "./salesAnalysisPage.module.scss";
import BaseComponent from "../../framework/baseComponent";
import { bus } from '../../constants/busEvents'
import {v4 as uuid} from 'uuid';
import { db } from '../../constants/db.js';
export default class SalesAnalysis extends BaseComponent {
  constructor({ renderBody, router, services, utils }) {
    super();
    this.subscriberId = `SalesAnalysis_${uuid()}`
    this.render = renderBody;
    this.router = router;
    this.harvester = services.harvester;
    this.authService = services.authService;
    this.firestoreService = services.firestoreService;
    this.errorRelay = services.errorRelay;
    this.eventBus = services.eventBus;
    this.stringUtil = utils.stringUtil;
    this.timeUtil = utils.timeUtil;
    this.dateUtil = utils.dateUtil;
    this.formUtil = utils.formUtil;
    this.domUtil = utils.domUtil;
    this.mathUtil = utils.mathUtil;
    this.showView = this._showView.bind(this);
    this.weeklyTotal = 0;
    this.hourlySalesReport = null;
    this.sliderContainers = [];
    this.storeTemplateData = null;
    this.salesData = null;
    this.hourlySalesTemplate = null;
  }

  init() {
    this.storeTemplateData = this.firestoreService.userData?.[db.STORE_SETTINGS];
    this.salesData = this.firestoreService.userData?.[db.SALES_DATA];
    this.eventBus.on(bus.USERDATA, this.subscriberId, (data) => this.salesData = data[db.SALES_DATA]);
    this.hourlySalesTemplate = this.getHourlySalesTemplate();
    this.preventEnterSubmit = (e) => e.key === 'Enter' && e.preventDefault();
    document.addEventListener('keydown', this.preventEnterSubmit);
  }

  destroy() {
    document.removeEventListener('keydown', this.preventEnterSubmit);
  }

  getHourlySalesArr() {
    const weekGuide = this.dateUtil.getWeekdays([]);
    return this.hourlySalesTemplateArr = Object.keys(this.hourlySalesTemplate)
    .sort((a, b) => weekGuide.indexOf(a) - weekGuide.indexOf(b))
    .reduce((arr, weekday) => {
      arr.push([weekday, this.hourlySalesTemplate[weekday]])
      return arr;
    }, []);
  }

  slideOpen(e) {
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

 async submitHandler(e) {
    e.preventDefault();
    const weekGuide = this.dateUtil.getWeekdays([]);
    const formData = this.formUtil.getFormData(e.target);
    const formHours = Object.keys(formData);
    const weeklyTotal = this.getWeeklyTotal(true);
    const result = weekGuide.reduce((obj, weekday) => {
      obj[weekday] = {};
      const pattern = new RegExp(`${weekday}-\\d+`);
      const hours = formHours.filter(hour => hour.match(pattern)!== null);
      let total = 0;
      const hourTemplate = hours.reduce((hourObj, hourWeekday) => {
        const hour = hourWeekday.split('-')[1];
        hourObj[hour] = Number(formData[hourWeekday]);
        total += Number(formData[hourWeekday]);
        return hourObj;
      }, {});
      obj[weekday] = {
        hours: hourTemplate,
        total,
        share: (total / weeklyTotal) * 100,
      }
      return obj;
    }, {});

    try {
      await this.firestoreService.setHourlySales(result);
      this.router.redirect("/");
    }catch(err) {
      this.errorRelay.send(err);
    }
  }

  _showView() {
    if (!this.authService.user) {
      this.router.redirect("/");
      return;
    }
    const hourlySales = this.getHourlySalesArr();
    this.render(
      salesAnalysisPageTemplate(
        this.slideOpen.bind(this),
        hourlySales,
        this.hourlySalesInputHandler.bind(this),
        this.hourlySalesChangeHandler.bind(this),
        this.weeklyTotal,
        this.hourlySalesDumpHandler.bind(this),
        this.hourlySalesReportHandler.bind(this),
        this.submitHandler.bind(this)
      )
    );
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
    const openTimes = this.getOpenTimes();
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
  
  getOpenTimes() {
    const { weekdays } = this.storeTemplateData;
    return Object.keys(weekdays).reduce((obj, day) => {
      obj[day] = {
        startTime: weekdays[day].open,
        endTime: weekdays[day].close,
      }
      return obj;
    }, {})
  }

  hourlySalesInputHandler(e) {
    const { value, name, id } = e.target;
    let filteredValue = this.stringUtil.filterString(value, [
      { symbol: "\\d" },
      { symbol: "\\.", matchLimit: 1 },
    ]);
    filteredValue = filteredValue || 0;
    if (e.target.tagName === "INPUT" && (id.includes('total') || id.includes('share'))) {
      const [field, weekday] = e.target.id.split("-");
      console.log(weekday);
      this.hourlySalesTemplate[weekday].totals[field] = filteredValue;
    } else if (e.target.tagName === "INPUT") {
      const [weekday, hour] = name.split("-");
      this.hourlySalesTemplate[weekday].hours[hour] = filteredValue;
    }
    e.target.value = filteredValue;
    this.showView();
  }

  hourlySalesChangeHandler(e) {
    let { name, value, id } = e.target;
    if (e.target.tagName === "INPUT" && (id.includes('total') || id.includes('share'))) {
      const [field, weekday] = e.target.id.split("-");
      this.hourlySalesTemplate[weekday].totals[field] = Number(value);
      this.calcFromTotals(field, weekday);
    } else if (e.target.tagName === "INPUT") {
      const [weekday, hour] = name.split("-");
      this.hourlySalesTemplate[weekday].hours[hour] = Number(value);
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
      Object.keys(this.hourlySalesTemplate).forEach((day) => {
        currentShareTotal += this.hourlySalesTemplate[day].totals.share;
      });
      let shareDifference = 100 - currentShareTotal;
      const sharesArr = [];
      let selectedShareIndex;
      Object.keys(this.hourlySalesTemplate).forEach((day, i) => {
        if (weekday === day) {
          selectedShareIndex = i;
        }
        sharesArr.push(this.hourlySalesTemplate[day].totals.share);
      });
      let adjustedShares = this.mathUtil.spreadProportionateValueArr(
        sharesArr,
        shareDifference,
        selectedShareIndex
      );
      Object.keys(this.hourlySalesTemplate).forEach((day, i) => {
        this.hourlySalesTemplate[day].totals.share = adjustedShares[i];
        this.hourlySalesTemplate[day].totals.total =
          weeklyTotal * (adjustedShares[i] / 100);
        this.updateHours(day);
      });
    }
    this.showView();
  }

  updateHours(weekday) {
    const { total } = this.hourlySalesTemplate[weekday].totals;
    const hourValuesArr = Object.values(this.hourlySalesTemplate[weekday].hours);
    const hourKeysArr = Object.keys(this.hourlySalesTemplate[weekday].hours);
    let adjustedValuesArr = this.mathUtil.evenArrRatioToSum(
      hourValuesArr,
      total,
      -1,
      true
    );
    for (let hour of hourKeysArr) {
      this.hourlySalesTemplate[weekday].hours[hour] = adjustedValuesArr.shift();
    }
  }

  updateWeeklyShare(weeklyTotal) {
    if (weeklyTotal === 0) return null;
    Object.keys(this.hourlySalesTemplate).forEach((weekday) => {
      this.hourlySalesTemplate[weekday].totals.share =
        (this.hourlySalesTemplate[weekday].totals.total / weeklyTotal) * 100;
    });
  }

  getWeeklyTotal(fromTotal = false) {
    let weeklyTotal = 0;
    Object.keys(this.hourlySalesTemplate).forEach((weekday) => {
      let total = 0;
      if (fromTotal) {
        total = Number(this.hourlySalesTemplate[weekday].totals.total);
      } else {
        total = Object.keys(this.hourlySalesTemplate[weekday].hours).reduce(
          (total, hour) =>
            (total += Number(this.hourlySalesTemplate[weekday].hours[hour])),
          0
        );
      }
      weeklyTotal += total;
    });
    return weeklyTotal;
  }

  updateTotals() {
    Object.keys(this.hourlySalesTemplate).forEach((weekday) => {
      let total = Object.keys(this.hourlySalesTemplate[weekday].hours).reduce(
        (total, hour) =>
          (total += Number(this.hourlySalesTemplate[weekday].hours[hour])),
        0
      );
      this.hourlySalesTemplate[weekday].totals.total = total;
    });
  }

 hourlySalesDumpHandler(e) {
    const dump = e.currentTarget;
    const { value } = dump;
    this.hourlySalesReport = this.harvester.hourlySalesExtractor(value);
    dump.value = !this.hourlySalesReport ? "Wrong Data!" : "Received!";
    setTimeout(() => {
      dump.value = "";
    }, 3000);
  }

  hourlySalesReportHandler() {
    if (!this.hourlySalesReport) return;

    const selectValue = document.getElementById('hourly-report-select').value;
    if (selectValue === 'averageReport') {
      const weekdayCount = Object.keys(this.hourlySalesTemplate).length
      for (let weekday in this.hourlySalesTemplate) {
        for (let hour in this.hourlySalesTemplate[weekday].hours) {
          if (this.hourlySalesReport.hours.hasOwnProperty(hour)) {
            this.hourlySalesTemplate[weekday].hours[hour] = this.hourlySalesReport.hours[hour].hourlySales / weekdayCount;
          }
        }
      }
    } else {
      for (let hour in this.hourlySalesTemplate[selectValue].hours) {
        if (this.hourlySalesReport.hours.hasOwnProperty(hour)) {
          this.hourlySalesTemplate[selectValue].hours[hour] = this.hourlySalesReport.hours[hour].hourlySales
        }
      }
    }
    const weeklyTotal = this.getWeeklyTotal();
    this.updateTotals();
    this.weeklyTotal = this.getWeeklyTotal(true);
    this.updateWeeklyShare(weeklyTotal);
    this.showView();
  }
}
