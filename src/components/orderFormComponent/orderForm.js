import { orderFormTemplate } from "./orderFormTemplate.js";
import styles from "./orderForm.module.scss";
import BaseComponent from "../../framework/baseComponent.js";
import Calendar from "../calendar/calendar.js";
import Modal from '../shared/modal/modal.js';
import OpenOrderEditor from "./openOrderEditor/openOrderEditor.js"
import { v4 as uuid } from 'uuid';
export default class OrderFormComponent extends BaseComponent {
  constructor({ renderBody, router, services, utils }) {
    super();
    this.subscriberId = `OrderFormComponent_${uuid()}`;
    this.dateUtil = utils.dateUtil;
    this.formUtil = utils.formUtil;
    this.domUtil = utils.domUtil;
    this.stringUtil = utils.stringUtil;
    this.renderHandler = renderBody;
    this.router = router;
    this.authService = services.authService;
    this.errorRelay = services.errorRelay;
    this.harvester = services.harvester;
    this.calendar = new Calendar();
    this.calendar.on('close',this.subscriberId ,  this.setDate.bind(this));
    this.processor = services.processor;
    this.showView = this._showView.bind(this);
    this.dateInputFieldStartingDate =
    this.deliveryHarvestProducts = null;
    this.date = this.calendar.fullDate;
  }

  setDate(date) {
    this.date = date;
    this.showView();
  }

  _showView() {
    if (!this.authService.user) {
      this.router.redirect("/");
      return;
    }

    const controls = {
      submitHandler: this.submitHandler.bind(this),
      openCalendar: this.calendar.open.bind(this.calendar),
      closeCalendar: this.calendar.close.bind(this.calendar),
      importInventory: this.importInventory.bind(this),
      editOpenOrders: this.editOpenOrders.bind(this),
    };

    let template = orderFormTemplate(controls,  this.date);
    this.renderHandler(template);
  }

  getNextDeliveryDate() {
    let currentDate = new Date();
    const weekdays = this.dateUtil.getWeekdays([]);
    let nextAvailableDeliveryDate = this.dateUtil.findDeliveryDate(
      currentDate,
      { asDate: true }
    );

    return `${nextAvailableDeliveryDate.getDate()}/${
      nextAvailableDeliveryDate.getMonth() + 1
    }/${nextAvailableDeliveryDate.getFullYear()} - ${this.stringUtil.toPascalCase(
      weekdays[nextAvailableDeliveryDate.getDay() - 1]
    )}`;
  }

  submitHandler(e) {
    e.preventDefault();
    let form = e.target;
    let formData = this.formUtil.getFormData(form);
    if (this.formValidator(formData)) {
      let [date, weekday] = formData.date.split("-");
      formData.date = this.dateUtil.op(date).format();
      formData.weekday = weekday;
      formData.products = this.deliveryHarvestProducts;
      this.processor.nextOrder(formData);
      this.router.navigate("/order-details");
    }
  }

  async importInventory() {
    const text = await navigator.clipboard.readText();
    try {
      const { productData, reportData } = this.harvester.inventoryHarvest(text);
      console.log(reportData);
    } catch (err) {
      this.errorRelay.send(err);
    }
  }

  editOpenOrders() {
    const programConfig = { class: OpenOrderEditor };
    const styles = {
      width: '60vw',
      height: '50vh',
    }
    const modal = new Modal(document.body, 'Open Order Editor', '', {program: programConfig, styles, backdrop: true});
    const modalHeader = modal.element.querySelector('header');
    modalHeader.style.background = '#09b3ec';
  }

  receivedToday(e) {
    let receivedTodayContainerElement =
      document.getElementById("received-today");
    const choice = e.currentTarget.id.replace("previous-invoiced-", "");
    const on = styles["received-today__container__on"];
    if (choice === "no") {
      receivedTodayContainerElement.classList.add(on);
    } else {
      receivedTodayContainerElement.classList.remove(on);
    }
  }

  formValidator(formData) {
    const weekdays = this.dateUtil.getWeekdays([]);
    let warningMessageElement = document.getElementById("warning-message");
    warningMessageElement.replaceChildren(document.createDocumentFragment());
    let pass = true;

    if (formData["RMF-data-dump"] === "") {
      this.print("Copy your last week's Inventory Activity and click import");
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
        const deliveryDayAvailable = Object.keys(
          this.storeSettings.orderDays
        ).includes(invoiceWeekday);
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
