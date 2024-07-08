import { render } from "lit-html";
import { serviceProvider } from "../../../services/serviceProvider.js";
import Modal from "../../shared/modal/modal.js";
import Program from "../../shared/program/program.js";
import { inventoryItemsTemplate } from "./inventoryItemsTemplate.js";
import { messages } from "../constants/communication.js";

export default class InventoryItems extends Program {
    constructor(programConfig, parentDataCallback) {
        super();
        this.subscriberId = 'InventoryItems';
        this.programConfig = programConfig;
        this.productGroups = programConfig.productGroups;
        this.template = inventoryItemsTemplate;
        this.harvester = serviceProvider.harvester;
        this.errorRelay = serviceProvider.errorRelay;
        this.parentDataCallback = parentDataCallback;
    }

    boot(windowContentElement) {
        console.log('groups: ', this.productGroups);
        if (!this.productGroups) {
            const buttons = [{ title: 'Import from Clipboard', confirmMessage: 'confirmed', callback: this.importProducts.bind(this)}];
            const modal = new Modal(windowContentElement, 'Inventory is Empty', 'Please Import Your Inventory Activity' , { buttons, noClose: true });
        } else {
            render(this.template(this.productGroups), windowContentElement);
        }
    }

    importProducts() {
           return navigator.clipboard.readText()
            .then(text => this.harvester.inventoryHarvest(text))
            .then(data => this.validateSendProductImport(data))
            .catch(err => this.errorRelay.send(err))
    }

    validateSendProductImport(data) {
        const {reportData, productData} = data;
        const minDaySpan = 30;
        const minProductGrops = 3;
        if (reportData.daySpan < minDaySpan) {
            throw new Error(`Report period must span for at least ${minDaySpan} days!`);
        } else if (Object.keys(productData).length < minProductGrops) {
            throw new Error(`Discovered product groups must be at least ${minProductGrops}!\nPlease include more product categories!`);
        }
        const dataTransmission = { reportData, productData, message: messages.INVENTORY_TEMPLATE_IMPORT }
        this.parentDataCallback(dataTransmission);
        this.productGroups = productGroups;
        render(this.template(this.productGroups), windowContentElement);
    }
}