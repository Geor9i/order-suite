import { orderFormTemplate } from "./orderFormTemplate.js";
import styles from './orderForm.module.scss'
import BaseComponent from "../../framework/baseComponent.js";
export default class OrderFormComponent extends BaseComponent {
  constructor({
    renderBody,
    router,
    calendarComponent,
    harvester,
    processor,
    storeSettings,
    authService,
    utils,
  }) {
    this.storeSettings = storeSettings;
    this.dateUtil = utils.dateUtil;
    this.formUtil = utils.formUtil;
    this.domUtil = utils.domUtil;
    this.stringUtil = utils.stringUtil;
    this.renderHandler = renderBody;
    this.router = router;
    this.authService = authService;
    this.calendarComponent = calendarComponent;
    this.harvester = harvester;
    this.processor = processor;
    this.showView = this._showView.bind(this);
    this.openCalendar = this._openCalendar.bind(this);
    this.submitHandler = this._submitHandler.bind(this);
    this.dateInputFieldStartingDate =
      this._dateInputFieldStartingDate.bind(this);
    this.closeCalendar = this._closeCalendar.bind(this);
    this.deliveryHarvestProducts = null;
  }

  _showView(ctx) {
    if (!this.authService.user) {
      this.router.redirect("/");
      return;
    }

    let template = orderFormTemplate(
      this.submitHandler,
      this.openCalendar,
      this.dateInputFieldStartingDate,
      this.closeCalendar,
      this.receivedToday
    );
    this.renderHandler(template);
    this.rmfDumpHandler();
  }

  _openCalendar(e) {
    e.preventDefault();
    let calendarContainer = document.getElementById("calendar-container");
    let backDrop = document.getElementById("calendar-backdrop");
    this.domUtil.toggleVisibility(calendarContainer);
    this.domUtil.toggleVisibility(backDrop);
    this.calendarComponent.showView(calendarContainer);
  }

  _dateInputFieldStartingDate() {
    let currentDate = new Date();
    const weekdays = this.dateUtil.getWeekdays([]);
    let nextAvailableDeliveryDate = this.dateUtil.findDeliveryDate(
      currentDate,
      { asDate: true }
    );

    return `${nextAvailableDeliveryDate.getDate()}/${nextAvailableDeliveryDate.getMonth() + 1
      }/${nextAvailableDeliveryDate.getFullYear()} - ${this.stringUtil.toPascalCase(
        weekdays[nextAvailableDeliveryDate.getDay() - 1]
      )}`;
  }

  _closeCalendar() {
    let calendarContainer = document.getElementById("calendar-container");
    let backDrop = document.getElementById("calendar-backdrop");
    this.domUtil.toggleVisibility(backDrop, { off: true });
    this.domUtil.toggleVisibility(calendarContainer, { off: true });
  }

  _submitHandler(e) {
    e.preventDefault();
    let form = e.target;
    let radioElementYes = document.getElementById("previous-invoiced-yes");
    let radioElementNo = document.getElementById("previous-invoiced-no");
    let formData = this.formUtil.getFormData(form);
    formData.radioYes = radioElementYes.checked;
    formData.radioNo = radioElementNo.checked;
    // this.processor.nextOrder(formData)

    if (this.formValidator(formData)) {
      let [date, weekday] = formData.date.split("-");
      formData.date = this.dateUtil.op(date).format();
      formData.weekday = weekday;
      formData.products = this.deliveryHarvestProducts;
      this.processor.nextOrder(formData);
      this.router.navigate("/order-details");
    }
  }

  rmfDumpHandler() {
    let rmfDataDumpElement = document.getElementById("RMF-data-dump");
    rmfDataDumpElement.addEventListener("input", (e) => {
      if (rmfDataDumpElement.value.length >= 1) {
        this.deliveryHarvestProducts = this.harvester.reportHarvest([
          rmfDataDumpElement.value,
        ]);
        //If valid products have been discovered on entry
        if (this.deliveryHarvestProducts) {
          rmfDataDumpElement.value = "Data Received!";
          rmfDataDumpElement.disabled = true;
        } else {
          rmfDataDumpElement.value = "";
          e.currentTarget.placeholder = "Wrong Data!";
        }
      }
    });
  }

  receivedToday(e) {
    let receivedTodayContainerElement = document.getElementById("received-today");
    const choice = e.currentTarget.id.replace('previous-invoiced-', '');
    const on = styles['received-today__container__on'];
    if (choice === 'no') {
      receivedTodayContainerElement.classList.add(on)
    } else {
      receivedTodayContainerElement.classList.remove(on)
    }
  }

  formValidator(formData) {
    const weekdays = this.dateUtil.getWeekdays([]);
    let warningMessageElement = document.getElementById("warning-message");
    warningMessageElement.replaceChildren(document.createDocumentFragment());
    let pass = true;

    if (formData["RMF-data-dump"] === "") {
      this.print("Paste your RMF order page and include:");
      this.print("1. Previous Week's Usage");
      this.print("2. Last Order Detail");
      pass = false;
    }
    if (!formData["radioNo"] && !formData["radioYes"]) {
      this.print("Have all RMF orders been accepted ?");
      pass = false;
    }

    if (formData.date === "") {
      this.print("Select a valid delivery date!");
      pass = false;
    } else {
      // Receive and parse date input data
      let orderInvoiceDate = formData.date.split(" - ")[0];
      //Check if parsed date is valid
      let dateCheckPattern = /[0-9]{1,2}(\D+)[0-9]{1,2}\1[0-9]{4}/g;
      if (dateCheckPattern.test(orderInvoiceDate)) {
        orderInvoiceDate = this.dateUtil.op(orderInvoiceDate).format();
        let invoiceWeekday = weekdays[orderInvoiceDate.getDay() - 1];
        const deliveryDayAvailable = Object.keys(this.storeSettings.orderDays).includes(invoiceWeekday);
        if (!deliveryDayAvailable) {
          this.print("Select an available delivery date!");
        }

        if (this.isOrderPlacedForDate(orderInvoiceDate)) {
          this.print("An order for the selected date has already been placed!");
        }
      }
    }

    if (
      formData["previous-sales"] === "" ||
      isNaN(formData["previous-sales"])
    ) {
      this.print("Enter a valid number in weekly sales!");
      pass = false;
    }
    if (
      formData["sales-forecast"] === "" ||
      isNaN(formData["sales-forecast"])
    ) {
      this.print("Enter a valid number in forecast!");
      pass = false;
    }

    return pass;
  }

  print(message) {
    let warningMessageElement = document.getElementById("warning-message");
    let p = document.createElement("p");
    p.textContent = message;
    warningMessageElement.appendChild(p);
  }

  isOrderPlacedForDate(orderInvoiceDate) {
    if (this.deliveryHarvestProducts) {
      for (let product in this.deliveryHarvestProducts) {
        let productLastOrderedOn = new Date(
          this.deliveryHarvestProducts[product].previousOrderDate
        );
        let lastOrderedArrival = this.dateUtil.findDeliveryDate(
          productLastOrderedOn,
          { asDate: true }
        );
        if (
          this.dateUtil.op(lastOrderedArrival).format() ===
          this.dateUtil.op(orderInvoiceDate).format()
        ) {
          return true;
        }
      }
    }
    return false;
  }
}
