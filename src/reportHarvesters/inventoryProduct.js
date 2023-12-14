export default class InventoryProduct {
    constructor(name, category, beginInventory, transferIn, transferOut, purchases, endInventory, actual, actualCost, theoretical, theoreticalCost, variance, varianceCost, waste, wasteCost, missing, missingCost, eff, productCase, caseValue, caseUnit, orderCase) {
        this.name = name;
        this.beginInventory = beginInventory;
        this.transferIn = transferIn;
        this.transferOut = transferOut;
        this.purchases = purchases;
        this.endInventory = endInventory;
        this.actual = actual;
        this.actualCost = actualCost;
        this.theoretical = theoretical;
        this.theoreticalCost = theoreticalCost;
        this.variance = variance;
        this.varianceCost = varianceCost;
        this.waste = waste;
        this.wasteCost = wasteCost;
        this.missing = missing;
        this.missingCost = missingCost;
        this.eff = eff;
        this.inventoryCase = {
            case: productCase,
            value: caseValue,
            unit: caseUnit
        };
        this.orderCase = orderCase;
        InventoryProduct.inventoryRecord[category][name] = this;
    }

    static inventoryRecord = {};

    toOrderCase (amount) {
                
        //Convert caseValue to number
            if (this.inventoryCase.value === undefined || this.inventoryCase.value === null) {
                this.inventoryCase.value = null;
            } else if (isNaN(this.inventoryCase.value)){
                this.inventoryCase.value = Number(this.inventoryCase.value.split(",").join(""));
            } else {
                this.inventoryCase.value = Number(this.inventoryCase.value)
            }
            //Define case and unit variants
            let individual = ['EA', 'PORTIONS', 'L', 'KG'];
            let packs = ['PK', 'BG', 'BT', 'CASE', 'BTL', 'HD'];
            
            function unitConverter (conversionAmount, unit) {
                if (unit !== undefined) {
                    if (unit  === 'g' || unit === 'ml') {
                        return conversionAmount / 1000;
                    } 
                }
                return conversionAmount;
            };
            
            //Checks
            if (individual.find(x => x === this.inventoryCase.case)) {
                return amount / this.orderCase;
            } else if (packs.find(x => x === this.inventoryCase.case)) {
                return unitConverter(amount * this.inventoryCase.value, this.inventoryCase.unit) / this.orderCase
            } 
        }
    }