import { serviceProvider } from "../../../services/serviceProvider.js";
import Modal from "../../shared/modal/modal.js";
import Program from "../../shared/program/program.js";
import { inventoryItemsTemplate } from "./inventoryItemsTemplate.js";

export default class InventoryItems extends Program {
    constructor() {
        super();
        this.template = inventoryItemsTemplate;
        const harvester = serviceProvider.harvester;
    }

    boot(windowContentElement) {
        const { products } = this.programConfig;
        if (products === null) {
            const buttons = [{ title: 'Import from Clipboard', callback: () => {
                navigator.clipboard
                .readText()
                .then(report => this.harvester.inventoryHarvest(report))
                .then(result => this.validateReport(result))
                .then(products => {render(this.template(products), windowContentElement)})
                .catch(err => console.log(err))
            }}];
            const modal = new Modal(windowContentElement, 'Please import all products from your inventory activity!', {buttons})
        } else {
            render(this.template(products), windowContentElement);
        }
    }

    validateReport(reportObj) {

    }
}