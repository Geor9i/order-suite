function inventoryHarvest (report) {

    // report = report.split('').join('-');
    // console.log(report);
    // REGEX -----------------------------------------

    let reportDetailsPattern = /KFC\sUK[\w\s]+:\s[\d]{2}\D{1}[\d]{2}\D{1}[\d]{2,4}[\w\s]+:\s*(?<restaurant>[-\s\w]+)\s[-FromfROM\s]{3,7}(?<dateStart>[\d]{2}\D{1}[\d]{2}\D{1}[\d]{2,4})[\s\w]{2,5}(?<dateEnd>[\d]{2}\D{1}[\d]{2}\D{1}[\d]{2,4})/;

    let reportCategoryPattern = /[\s\d][^\s]-\s?(?<category>(?<mainC>[A-Z][a-z]{2,12})(?<secondC>\s[A-Z][a-z]{2,12})*)(?<data>[\s\S]+?)(?=\bTotal\b)/g;
    let productPattern = /(?<productCode>\d{1,7})\s(?<product>[A-Z]{2}[-.\w\s+\(\)\/&]{2,45})\s((?<individual>[eaEA]{2}|[KGkg]{2}|[pORTIONSPortions]{7,8}|[lL]{1})|(?<case>[PKpk]{2}|[BGbg]{2}|[HDhd]{2}|[BTLbtl]{2,3}|[CASEcase]{4}|[lL]{1})[-\s\n]{1,3}(?<caseValue>[\d.,]+|[\d.,]+[xX][\d.,]+)(?<caseUnit>g|KG|kg|L|G)?)\s(?<beginInventory>[-\n\d.,]+)\s(?<transferIn>[-\n\d.,]{4,})\s(?<transferOut>[-\n\d.,]{4,})\s(?<purchases>[-\n\d.,]{4,})\s(?<endInventory>[-\n\d.,]{4,})\s(?<actual>[-\n\d.,]{4,})\s(?<actualCost>[-\n*£\d.,]{4,})\s(?<theoretical>[\n\d.,]{4,})\s(?<theoreticalCost>[-\n*£\d.,]{4,})\s(?<variance>[-\n\d.,]{4,})\s(?<varianceCost>[-\n*£\d.,]{4,})\s(?<waste>[\n\d.,]{4,})\s(?<wasteCost>[-\n*£\d.,]{4,})\s(?<missing>[-\n\d.,]{4,})\s(?<missingCost>[-\n*£\d.,]{4,})\s(?<eff>[-\d.,]{4,})/g;
    //-----------------------------------------------------REGEX

    //Product Class--------------------------------------------

    class InventoryProduct {
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
    
    //-----------------------------------------------Product Class

    // Get Report Data and split into product categories
    // let inventoryRecord = {};
    let categoryData = {};
    let categoryMatch;

    while ((categoryMatch = reportCategoryPattern.exec(report))!== null) {

        let exclusions = ["total", "grand"].map(x => x.toUpperCase());
        let categoryName = categoryMatch.groups.category.trim().toUpperCase()

        if (!exclusions.includes(categoryName)) {
            categoryData[categoryName] = categoryMatch.groups.data.trim();
            InventoryProduct.inventoryRecord[categoryName] = {};
        }
    }

    

    // Get report details data (day span and store name)
    let reportMatch = report.match(reportDetailsPattern);
    if (reportMatch !== null) {
        InventoryProduct.storeName = reportMatch.groups.restaurant.trim();
        InventoryProduct.reportStartDate = dateConverter(reportMatch.groups.dateStart.trim());
        InventoryProduct.reportEndtDate = dateConverter(reportMatch.groups.dateEnd.trim());
        InventoryProduct.reportDaySpan = dateDifference(InventoryProduct.reportStartDate, InventoryProduct.reportEndtDate);
    }

    
    //Main product matching 
    let match;
    while ((match = productPattern.exec(report))!== null) {
        let product = match.groups.product.trim()
        //Find in which category the current product belongs 
        let category = Object.entries(categoryData).find(x => x[1].includes(product))[0];
        product = optimizeName(product);
        if (!InventoryProduct.inventoryRecord[category].hasOwnProperty(product)) {
            InventoryProduct.inventoryRecord[category][product] = {};
        }
      
        //Get Delivery case values
        let orderCase = 0;
        

            //Check product case specifics and do conversions;
            

            let productCase = match.groups.case ? match.groups.case.toUpperCase() : match.groups.individual.toUpperCase();
            //TODO: Handle values where multiplication is given instead of actual case Example SAUCE TERIYAKI 
            let caseValue = match.groups.caseValue;
            let caseUnit = match.groups.caseUnit ? match.groups.caseUnit.toLowerCase() : match.groups.caseUnit;
            //Assign value vars
            let beginInventory = stringToNumber(match.groups.beginInventory);
            let transferIn = stringToNumber(match.groups.transferIn);
            let transferOut = stringToNumber(match.groups.transferOut);
            let purchases = stringToNumber(match.groups.purchases);
            let endInventory = stringToNumber(match.groups.endInventory);
            let actual = stringToNumber(match.groups.actual);
            let actualCost = stringToNumber(match.groups.actualCost);
            let theoretical = stringToNumber(match.groups.theoretical);
            let theoreticalCost = stringToNumber(match.groups.theoreticalCost);
            let variance = stringToNumber(match.groups.variance);
            let varianceCost = stringToNumber(match.groups.varianceCost);
            let waste = stringToNumber(match.groups.waste);
            let wasteCost = stringToNumber(match.groups.wasteCost);
            let missing = stringToNumber(match.groups.missing);
            let missingCost = stringToNumber(match.groups.missingCost);
            let eff = stringToNumber(match.groups.eff);
            
            new InventoryProduct(product, category, beginInventory, transferIn, transferOut, purchases, endInventory, actual, actualCost, theoretical, theoreticalCost, variance, varianceCost, waste, wasteCost, missing, missingCost, eff, productCase, caseValue, caseUnit, orderCase)
    }
    return InventoryProduct.inventoryRecord;
}