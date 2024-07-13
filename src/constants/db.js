export const db = {
    USERS: 'users',
    STORE_SETTINGS: 'STORE_SETTINGS',
    INVENTORY: 'INVENTORY',
    SALES_DATA: 'SALES_DATA',
    HOURLY_SALES: 'HOURLY_SALES',
    INVENTORY_RECORDS: 'INVENTORY_RECORDS',
    PURCHASE_PRODUCTS: 'PURCHASE_PRODUCTS',
    INVENTORY_ACTIVITY: 'INVENTORY_ACTIVITY',
    OPEN_ORDERS: 'OPEN_ORDERS',
}

export const db_main_collections = {
    STORE_SETTINGS: {title: 'Store Preferences', key: 'STORE_SETTINGS'},
    INVENTORY: {title: 'Store Products', key: 'INVENTORY'},
    SALES_DATA: {title: 'Sales Data', key: 'SALES_DATA'},
}

export const INVENTORY = {
    PURCHASE_PRODUCTS: {title: 'Purchase Products', key: 'PURCHASE_PRODUCTS', placeholder: 'Paste RMF Unprocessed Order', harvester: 'unprocessedOrderHarvest' },
    INVENTORY_ACTIVITY: {title: 'Inventory Activity', key: 'INVENTORY_ACTIVITY', placeholder: 'Paste Inventory Activity Report', harvester: 'inventoryHarvest' },
}
