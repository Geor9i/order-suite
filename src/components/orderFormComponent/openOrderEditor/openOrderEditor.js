import { render } from "lit-html";
import { serviceProvider } from "../../../services/serviceProvider.js";
import Program from "../../shared/program/program.js";
import { openOrderEditorTemplate } from "./openOrderEditorTemplate.js";
import styles from './openOrderEditor.scss';
import { db } from "../../../constants/db.js";
import { bus } from "../../../constants/busEvents.js";
import {v4 as uuid } from 'uuid';
import { utils } from "../../../utils/utilConfig.js";
import Calendar from "../../calendar/calendar.js";
export default class OpenOrderEditor extends Program {
    constructor(contentElement) {
        super();
        this.subscriberId = 'OpenOrderEditor';
        this.subscriptionArr = [];
        this.domUtil = utils.domUtil;
        this.firestoreService = serviceProvider.firestoreService;
        this.eventBus = serviceProvider.eventBus;
        this.template = openOrderEditorTemplate;
        this.harvester = serviceProvider.harvester;
        this.errorRelay = serviceProvider.errorRelay;
        this.contentElement = contentElement;
        this.calendar = new Calendar();
    }

    get openOrders() {
        return this.firestoreService.userData?.[db.INVENTORY]?.[db.INVENTORY_RECORDS]?.[db.OPEN_ORDERS] ?? null;
    }

    boot() {
        this.subscriptionArr.forEach(unsubscribe => unsubscribe());
        const unsubscribe = this.eventBus.on(bus.USERDATA, this.subscriberId, this.render.bind(this));
        this.subscriptionArr = [unsubscribe];
        this.render();
    }

    close() {
        this.subscriptionArr.forEach(unsubscribe => unsubscribe());
    }

    render() {
        const controls = {
            importOrder: this.importOrder.bind(this),
            openCalendar: this.calendar.open.bind(this.calendar),
            closeCalendar: this.calendar.close.bind(this.calendar),
        }
        render(this.template(this.openOrders, controls), this.contentElement);
    }

    async importOrder(recordGroup) {
        try {
            const text = await navigator.clipboard.readText();
            const data = this.harvester.purchaseOrderHarvest(text);
            if (data) {
                data.reportData.id = `${data.reportData.importDate}_${uuid()}`;
                this.parentDataCallback(message[recordGroup], data);
            }
        } catch(err) {
            this.errorRelay.send(err);
        }
    }

    async deleteRecord(record, recordGroup) {
        const id = record.reportData.id;
        await this.firestoreService.deleteInventoryRecord(id, recordGroup);
    }
   
}