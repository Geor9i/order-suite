import { render } from "lit-html";
import { html } from "lit-html";
import { serviceProvider } from "../../../services/serviceProvider.js";
import Modal from "../../shared/modal/modal.js";
import Program from "../../shared/program/program.js";
import { InventoryRecordsTemplate } from "./inventoryRecordsTemplate.js";
import { messages } from "../constants/communication.js";
import styles from './inventoryRecords.scss';
import { INVENTORY_RECORDS } from "../../../constants/userDataDetail.js";

export default class InventoryRecords extends Program {
    constructor(windowContentElement, programConfig, parentDataCallback) {
        super();
        this.subscriberId = 'DataImports';
        this.programConfig = programConfig;
        this.inventory = programConfig.inventory;
        this.template = InventoryRecordsTemplate;
        this.harvester = serviceProvider.harvester;
        this.errorRelay = serviceProvider.errorRelay;
        this.parentDataCallback = parentDataCallback;
        this.windowContentElement = windowContentElement;
    }

    boot() {
       this.render()
    }

    render() {
        const controls = {
            importData: this.importData.bind(this)
        }
        const records = Object.keys(INVENTORY_RECORDS).reduce((obj, key) => {
            obj[key] = this?.inventory?.[INVENTORY_RECORDS[key].key] || {};
            return obj
        }, {})
        render(this.template(records, controls), this.windowContentElement);
    }

    async importData(group) {
        try {
            const text = await navigator.clipboard.readText();
            const data = this.harvester[INVENTORY_RECORDS[group].harvester](text);
            console.log(data);
        } catch(err) {
            console.log();
            this.errorRelay.send(err);
        }
    }

   
}