import { render } from "lit-html";
import { serviceProvider } from "../../../services/serviceProvider.js";
import Modal from "../../shared/modal/modal.js";
import Program from "../../shared/program/program.js";
import styles from './dailySales.scss';
import { db } from "../../../constants/db.js";
import { bus } from "../../../constants/busEvents.js";
import { utils } from "../../../utils/utilConfig.js";
import { v4 as uuid} from 'uuid';
import { dailySalesTemplate } from "./dailySalesTemplate.js";

export default class DailySales extends Program {
    constructor(windowContentElement, parentDataCallback, programConfig) {
        super();
        this.subscriberId = `DailySales${uuid()}`;
        this.subscriptionArr = [];
        this.programConfig = programConfig;
        this.firestoreService = serviceProvider.firestoreService;
        this.eventBus = serviceProvider.eventBus;
        this.objUtil = utils.objUtil;
        this.stringUtil = utils.stringUtil;
        this.dateUtil = utils.dateUtil;
        this.formUtil = utils.formUtil;
        this.harvester = serviceProvider.harvester;
        this.errorRelay = serviceProvider.errorRelay;
        this.parentDataCallback = parentDataCallback;
        this.windowContentElement = windowContentElement;
    }

    get hourlySales() {
        return this.firestoreService.userData?.[db.SALES_DATA]?.[db.HOURLY_SALES] ?? null;
    }

    boot() {
        this.subscriptionArr.forEach(unsubscribe => unsubscribe());
        this.storeTemplateData = this.firestoreService.userData?.[db.STORE_SETTINGS];
        this.salesData = this.firestoreService.userData?.[db.SALES_DATA]?.[db.DAILY_SALES];
        this.eventBus.on(bus.USERDATA, this.subscriberId, (data) => this.salesData = data[db.SALES_DATA][db.DAILY_SALES]);
        this.render();
    }

    close() {
        this.subscriptionArr.forEach(unsubscribe => unsubscribe());
    }


  destroy() {
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


 async submitHandler(e) {
    e.preventDefault();
    try {
      await this.firestoreService.setDailySales(result);
    }catch(err) {
      this.errorRelay.send(err);
    }
  }

  render() {
    const controls = {
      submitHandler: this.submitHandler.bind(this)
    }
    render(dailySalesTemplate(controls), this.windowContentElement);
  }

}