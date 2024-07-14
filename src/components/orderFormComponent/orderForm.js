import { orderFormTemplate } from "./orderFormTemplate.js";
import BaseComponent from "../../framework/baseComponent.js";
import Calendar from "../calendar/calendar.js";
import Modal from '../shared/modal/modal.js';
import OpenOrderEditor from "./openOrderEditor/openOrderEditor.js"
import { v4 as uuid } from 'uuid';
import { messages } from "./constants.js";

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
    this.currentInventory = null;
    this.openOrders = null;
  }

  setDate(data) {
    const { date, dateObj } = data;
    this.date = date;
    this.dateObj = dateObj;
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

    let template = orderFormTemplate(controls,  this.date, this);
    this.renderHandler(template);
  }

  submitHandler(e) {
    e.preventDefault();
    let form = e.target;
    let formData = this.formUtil.getFormData(form);
    const { previousSales, salesForecast } = formData;
    this.formValidator(formData);
    const data = {
      previousSales, salesForecast,
      date: this.dateObj,
      inventory: this.currentInventory,
      openOrders: this.openOrders
    }
    this.processor.nextOrder(data);
    // this.router.navigate("/order-details");
  }

  async importInventory() {
    try {
      const text = await navigator.clipboard.readText();
      const { productData, reportData } = this.harvester.inventoryHarvest(text);
      this.currentInventory = { productData, reportData };
      this._showView();
    } catch (err) {
      this.errorRelay.send(err);
    }
  }

  editOpenOrders() {
    const programConfig = { class: OpenOrderEditor, callback: this.comunicate.bind(this) };
    const styles = {
      width: '60vw',
      height: '50vh',
    }
    const modal = new Modal(document.body, 'Open Order Editor', '', { program: programConfig, styles });
    const modalHeader = modal.element.querySelector('header');
    modalHeader.style.background = '#09b3ec';
  }

  comunicate(message, data) {
    if (message === messages.PROCESSED_ORDER) {
      this.openOrders = Object.keys(data).reduce((obj, date) => {
        if (data[date].length) {
          obj[date] = data[date];
        }
        return obj;
      }, {})
    }
  }

  formValidator(formData) {
  try {
        if (!this.currentInventory) {
          throw new Error('Copy your last week\'s Inventory Activity and click import');
        }
        if (!formData.date) {
          throw new Error("Select a valid delivery date!");
        } 
        if (!formData["previousSales"] || isNaN(formData["previousSales"])) {
          throw new Error('Enter a valid number in weekly sales!');
        }
        if (!formData["salesForecast"] || isNaN(formData["salesForecast"])) {
          throw new Error("Enter a valid number in forecast!");
        }
    }catch(err) {
      this.errorRelay.send(err);
    }
  }
}
