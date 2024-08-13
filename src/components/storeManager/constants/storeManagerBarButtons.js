
import InventoryRecords from "../InventoryRecords/InventoryRecords.js";
import InventoryItems from "../InventoryItems/inventoryItems.js";
import HourlySales from "../hourlySales/hourlySales.js";
import DailySales from "../dailySales/daylySales.js";

export const barButtons = [
    {name: 'I', description: 'Inventory Items', class: InventoryItems},
    {name: 'R', description: 'Inventory Records', class: InventoryRecords},
    {name: 'PR', description: 'Product Rulebook'},
    {name: 'HS', description: 'Hourly Sales', class: HourlySales},
    {name: 'DS', description: 'Daily Sales', class: DailySales},
];