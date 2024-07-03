import Program from "../../shared/program/program.js";
import { inventoryItemsTemplate } from "./inventoryItemsTemplate.js";

export default class InventoryItems extends Program {
    constructor() {
        super();
        this.template = inventoryItemsTemplate;
    }
}