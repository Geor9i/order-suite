import { render } from "lit-html";
import { serviceProvider } from "../../../services/serviceProvider.js";
import Program from "../../shared/program/program.js";
import { openOrderEditorTemplate } from "./openOrderEditorTemplate.js";
import { db } from "../../../constants/db.js";
import { bus } from "../../../constants/busEvents.js";
import {v4 as uuid } from 'uuid';
import { utils } from "../../../utils/utilConfig.js";
import Calendar from "../../calendar/calendar.js";
import { messages } from '../constants.js'
export default class OpenOrderEditor extends Program {
    constructor(contentElement, parentDataCallback) {
        super();
        this.subscriberId = `OpenOrderEditor_${uuid()}`;
        this.subscriptionArr = [];
        this.dateUtil = utils.dateUtil;
        this.firestoreService = serviceProvider.firestoreService;
        this.eventBus = serviceProvider.eventBus;
        this.template = openOrderEditorTemplate;
        this.harvester = serviceProvider.harvester;
        this.errorRelay = serviceProvider.errorRelay;
        this.contentElement = contentElement;
        this.parentDataCallback = parentDataCallback;
        this.date = '';
        this.calendar = new Calendar();
        this.calendar.on('close', this.subscriberId, this.setDate.bind(this));
        this.openOrderRecords = {};
    }

    get openOrders() {
        return this.firestoreService.userData?.[db.INVENTORY]?.[db.INVENTORY_RECORDS]?.[db.OPEN_ORDERS] ?? null;
    }

    setDate(data) {
        const { date, dateObj } = data;
        this.dateObj = dateObj;
        this.date = date;
        this.render();
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
            deleteRecord: this.deleteRecord.bind(this),
        }
        render(this.template(this.openOrderRecords, this.date, controls), this.contentElement);
    }

    async importOrder() {
        try {
            if (!this.date) {
                throw new  Error('Please select a delivery date!');
            }
            const text = await navigator.clipboard.readText();
            const data = this.harvester.purchaseOrderHarvest(text);
            if (data) {
                data.reportData.id = `${data.reportData.importDate}_${uuid()}`;
                data.reportData.arrivaldateObj = this.dateObj;
                const deliveryDate = this.dateUtil.op(this.dateObj).format({asString: true, delimiter: '-'});
                if (!this.openOrderRecords.hasOwnProperty(deliveryDate)) {
                    this.openOrderRecords[deliveryDate] = [];
                }
                this.openOrderRecords[deliveryDate].push(data);
                this.parentDataCallback(messages.PROCESSED_ORDER, this.openOrderRecords);
                this.render();
            }
        } catch(err) {
            this.errorRelay.send(err);
        }
    }

    async deleteRecord(deliveryDate, index) {
        this.openOrderRecords[deliveryDate].splice(index, 1);
        this.parentDataCallback(messages.PROCESSED_ORDER, this.openOrderRecords);
        this.render();
    }
   
}