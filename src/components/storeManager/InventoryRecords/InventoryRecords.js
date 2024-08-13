import { render } from "lit-html";
import { html } from "lit-html";
import { serviceProvider } from "../../../services/serviceProvider.js";
import Program from "../../shared/program/program.js";
import { InventoryRecordsTemplate } from "./inventoryRecordsTemplate.js";
import { messages } from "../constants/communication.js";
import styles from './inventoryRecords.scss';
import { db, INVENTORY } from "../../../constants/db.js";
import { bus } from "../../../constants/busEvents.js";
import { v4 as uuid } from "uuid";

export default class InventoryRecords extends Program {
    constructor( windowContentElement, parentDataCallback, programConfig ) {
        super();
        this.subscriberId = 'DataImports';
        this.subscriptionArr = [];
        this.firestoreService = serviceProvider.firestoreService;
        this.eventBus = serviceProvider.eventBus;
        this.programConfig = programConfig;
        this.template = InventoryRecordsTemplate;
        this.harvester = serviceProvider.harvester;
        this.errorRelay = serviceProvider.errorRelay;
        this.parentDataCallback = parentDataCallback;
        this.windowContentElement = windowContentElement;
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
            importData: this.importData.bind(this), 
            deleteRecord: this.deleteRecord.bind(this),
        };
        const formatRecords = (recordCollection) => Object.keys(recordCollection).map(record => recordCollection[record]);
        const inventory = this.firestoreService.userData[db.INVENTORY];
        const records = {
            [db.PURCHASE_PRODUCTS]: formatRecords(inventory?.[db.INVENTORY_RECORDS]?.[db.PURCHASE_PRODUCTS] ?? {}),
            [db.INVENTORY_ACTIVITY]: formatRecords(inventory?.[db.INVENTORY_RECORDS]?.[db.INVENTORY_ACTIVITY] ?? {})
        }
        render(this.template(records, controls), this.windowContentElement);
    }

    async importData(recordGroup) {
        try {
            const text = await navigator.clipboard.readText();
            const data = this.harvester[INVENTORY[recordGroup].harvester](text);
            const message = {
                [db.INVENTORY_ACTIVITY]: messages.INVENTORY_ACTIVITY_IMPORT,
                [db.PURCHASE_PRODUCTS]: messages.INVENTORY_RECORD_IMPORT,
            }
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