import { render } from "lit-html";
import { serviceProvider } from "../../../services/serviceProvider.js";
import Modal from "../../shared/modal/modal.js";
import Program from "../../shared/program/program.js";
import { inventoryItemsTemplate } from "./inventoryItemsTemplate.js";

export default class InventoryItems extends Program {
    constructor(programConfig) {
        super();
        this.programConfig = programConfig;
        this.template = inventoryItemsTemplate;
        this.harvester = serviceProvider.harvester;
        this.errorRelay = serviceProvider.errorRelay;
    }

    boot(windowContentElement) {
        const { products } = this.programConfig;
        if (!products) {
            const buttons = [{ title: 'Import from Clipboard', confirmMessage: 'confirmed', callback: () => {
                new Promise((resolve) => {
                    navigator.clipboard.readText()
                    .then(text => this.harvester.inventoryHarvest(text))
                    .then(result => resolve(result))
                    .catch(err => this.errorRelay.send(err))
                })
            }}];
            new Modal(windowContentElement, 'Inventory Warning', 'Please Import Your Inventory Activity' , {buttons, noClose: true})
        } else {
            render(this.template(products), windowContentElement);
        }
    }

    validateReport(reportObj) {

    }
}