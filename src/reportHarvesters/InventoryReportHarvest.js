export default function inventoryHarvest (report) {

    // REGEX -----------------------------------------

    let reportDetailsPattern = /KFC\sUK[\w\s]+:\s[\d]{2}\D{1}[\d]{2}\D{1}[\d]{2,4}[\w\s]+:\s*(?<restaurant>[-\s\w]+)\s[-FromfROM\s]{3,7}(?<dateStart>[\d]{2}\D{1}[\d]{2}\D{1}[\d]{2,4})[\s\w]{2,5}(?<dateEnd>[\d]{2}\D{1}[\d]{2}\D{1}[\d]{2,4})/;

    let reportCategoryPattern = /[-\s\d]{2,3}(?<category>(?<mainC>[A-Z][a-z]{2,12})(?<secondC>\s[A-Z][a-z]{2,12})*)(?<data>[\s\S]+?)(?=\bTotal\b)/g;

    let productPattern = /(?<productCode>\d{1,7})\s(?<product>[A-Z]{2}[-.\w\s+\(\)\/&]{2,37})\s((?<individual>[eaEA]{2}|[KGkg]{2}|[pORTIONSPortions]{7,8}|[lL]{1})|(?<case>[PKpk]{2}|[BGbg]{2}|[HDhd]{2}|[BTLbtl]{2,3}|[CASEcase]{4}|[lL]{1})[-\s\n]{1,3}(?<caseValue>[\d.,]+)(?<caseUnit>g|KG|kg|L|G)?)\s(?<beginInventory>[-\n\d.,]+)\s(?<transferIn>[-\n\d.,]{4,})\s(?<transferOut>[-\n\d.,]{4,})\s(?<purchases>[-\n\d.,]{4,})\s(?<endInventory>[-\n\d.,]{4,})\s(?<actual>[-\n\d.,]{4,})\s(?<actualCost>[-\n*£\d.,]{4,})\s(?<theoretical>[\n\d.,]{4,})\s(?<theoreticalCost>[-\n*£\d.,]{4,})\s(?<variance>[-\n\d.,]{4,})\s(?<varianceCost>[-\n*£\d.,]{4,})\s(?<waste>[\n\d.,]{4,})\s(?<wasteCost>[-\n*£\d.,]{4,})\s(?<missing>[-\n\d.,]{4,})\s(?<missingCost>[-\n*£\d.,]{4,})\s(?<eff>[-\d.,]{4,})/g;

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

    
    let orderPageProducts = require('./DeliveryReportHarvest');
    
    //Main product matching 
    let match;
    while ((match = productPattern.exec(report))!== null) {

        let product = match.groups.product.trim();
        //Find in which category the current product belongs 
        let category = Object.entries(categoryData).find(x => x[1].includes(product))[0];
        if (!InventoryProduct.inventoryRecord[category].hasOwnProperty(product)) {
            InventoryProduct.inventoryRecord[category][product] = {};
        }
      
        //Get Delivery case values
        let orderCase = 0;
        
        for (let prod in orderPageProducts) {

            let splitter = /\W+/;
            let nameMatch = product.split(splitter).filter(x => x.length > 0);
            let matchCheck = nameMatch.filter(el => prod.includes(el)).filter(x => x.length > 0);

            if (matchCheck.length === nameMatch.length) {
                orderCase = orderPageProducts[prod].orderCase;
                delete orderPageProducts[prod];
                break;
            }

        }
            //Check product case specifics and do conversions;
            

            let productCase = match.groups.case ? match.groups.case.toUpperCase() : match.groups.individual.toUpperCase();
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

    // Try to get orderCase value to remaining products from order page products
    let orderPageMatchesToInventory = {}
    let unlinkedOrderPageProducts = Object.keys(orderPageProducts);
    unlinkedOrderPageProducts.forEach(el => orderPageMatchesToInventory[el] = {
        "1": [],
        "2": [],
        "3": [],
        "4": [],
        "5": [],
        "6": [],
        "7": [],
        "8": [],
        "9": [],
        "10": [],
    }) 
    //Get all objects without an orderCase value
    let categoryCatalogue = {};
    let inventoryWithoutOrderCase = [];
    for (let category in InventoryProduct.inventoryRecord) {
        //filter inventory objects that were not assigned an order case 
        let currentCategoryProducts = Object.keys(InventoryProduct.inventoryRecord[category])
        .filter(x => InventoryProduct.inventoryRecord[category][x].orderCase === 0);

        currentCategoryProducts.forEach(el => categoryCatalogue[el] = category)
        inventoryWithoutOrderCase.push(...currentCategoryProducts)
    }
        if (unlinkedOrderPageProducts.length > 0) {
            //Loop around each order page product that remains unlinked with InventoryProduct
            for (let unlinkedOrderProduct of unlinkedOrderPageProducts) {
                
                let splitter = /\W+/;
                    //Split order page product into an array of words
                let unlinkedProductWordArray = unlinkedOrderProduct.split(splitter).filter(x => x.length > 0).map(x => x.toUpperCase());

                let candidates = new Map();
                let bestMatchCount = 0;
                let matchCounter = 0;
                
                //Check within each inventory product left without order case metrics
                for (let productWithoutOrderCase of inventoryWithoutOrderCase) {

                    //Split current inventory product into an array of words
                    let productWithoutOrderCaseWordArray = productWithoutOrderCase.split(splitter).filter(x => x.length > 0)
                    .map(x => x.toUpperCase());
                    
                    //for each order page product word 
                    unlinkedProductWordArray.forEach((unLinkedProductWord) => {
                    //for each current inventory product word 
                    for (let withoutOrderCaseWord of productWithoutOrderCaseWordArray) {
                        if(withoutOrderCaseWord === unLinkedProductWord) {
                            matchCounter++;
                        }
                    }
                });
                if (matchCounter === bestMatchCount) {
                    bestMatchCount = matchCounter;
                    candidates.set(productWithoutOrderCase, {
                        category: categoryCatalogue[productWithoutOrderCase],
                        words: productWithoutOrderCaseWordArray,
                    });
                } else if (matchCounter > bestMatchCount) {
                    bestMatchCount = matchCounter;
                    candidates.clear();
                    candidates.set(productWithoutOrderCase, {
                        category: categoryCatalogue[productWithoutOrderCase],
                        words: productWithoutOrderCaseWordArray,
                    });
                } 
                matchCounter = 0;

                }
                if (bestMatchCount > 0) {
                    let candidateArr = Array.from(candidates);
                    for (let curr of candidateArr) {
                        orderPageMatchesToInventory[unlinkedOrderProduct][`${bestMatchCount}`].push({[curr[0]]: curr[1]});
                    }
                }
                candidates.clear();
            }
        }

    console.log(`step 1`);
    //Match Library sort by highest amount of matches
    function sortMatches(orderPageMatchesToInventory) {
        let orderPageMatchesToInventorySorted = Object.keys(orderPageMatchesToInventory).sort((a, b) => {
            let itemA = Object.keys(orderPageMatchesToInventory[a]).filter(x => orderPageMatchesToInventory[a][x].length > 0);
            let itemB = Object.keys(orderPageMatchesToInventory[b]).filter(x => orderPageMatchesToInventory[b][x].length > 0);
            
            let maxMatchesA = itemA.length > 0 ? Math.max(...itemA) : 0;
            let maxMatchesB = itemB.length > 0 ? Math.max(...itemB) : 0;
            return maxMatchesB - maxMatchesA;
          });
          return orderPageMatchesToInventorySorted
    }
    let orderPageMatchesToInventorySorted = sortMatches(orderPageMatchesToInventory);

    
      // delete empty indexes from matchLibrary
      orderPageMatchesToInventorySorted.filter((prod => {
        let isEmpty = true;

        for (let i of Object.keys(orderPageMatchesToInventory[prod])) {
            if(orderPageMatchesToInventory[prod][`${i}`].length === 0) {
                delete orderPageMatchesToInventory[prod][`${i}`]
            } else {
                isEmpty = false;
            }
        }
        if (isEmpty) {
             orderPageMatchesToInventory[prod] = null;
            let newObj = {};
            for (let item in orderPageMatchesToInventory) {
                if (orderPageMatchesToInventory[item] !== null) {
                    newObj[item] = orderPageMatchesToInventory[item];
                }
            } 
            orderPageMatchesToInventory = newObj;
            orderPageMatchesToInventorySorted = sortMatches(orderPageMatchesToInventory);
        }
    }))
for (let orderPageItem of orderPageMatchesToInventorySorted) {
    // console.log(orderPageItem, orderPageMatchesToInventory[orderPageItem]);
    let key = Object.keys(orderPageMatchesToInventory[orderPageItem])
    let matchesArr = orderPageMatchesToInventory[orderPageItem][key];
    
    if (matchesArr.length > 1) {
        //Find the better match by scoring based on word position
        let currentScore = 0;
        let productToWords = orderPageItem.split(" ").filter(el => el.length > 0);
        let matchIndex = Object.keys(orderPageMatchesToInventory[orderPageItem])[0]
        //Go through product matches
        for (let p = 0;p < orderPageMatchesToInventory[orderPageItem][matchIndex].length; p++) {
            let name = Object.keys(orderPageMatchesToInventory[orderPageItem][matchIndex][p])
            let words = orderPageMatchesToInventory[orderPageItem][matchIndex][p][name].words
            for (let w = 0;w < productToWords.length; w++) {
                if (productToWords[w] === words[w]) {
                    currentScore++;
                }
            }
            orderPageMatchesToInventory[orderPageItem][matchIndex][p] = [orderPageMatchesToInventory[orderPageItem][matchIndex][p], {score: currentScore}]
            currentScore = 0;
        }
        orderPageMatchesToInventory[orderPageItem][matchIndex] = orderPageMatchesToInventory[orderPageItem][matchIndex].sort((a, b) => b[1].score - a[1].score);
        orderPageMatchesToInventory[orderPageItem][matchIndex].splice(1,orderPageMatchesToInventory[orderPageItem][matchIndex].length - 1);

        orderPageMatchesToInventory[orderPageItem][matchIndex][0] = orderPageMatchesToInventory[orderPageItem][matchIndex][0][0];
    }
    if (matchesArr.length === 1) {
        let inventoryItem = Object.keys(orderPageMatchesToInventory[orderPageItem][key][0])[0];

        let inventoryLocation = categoryCatalogue[inventoryItem];
        InventoryProduct.inventoryRecord[inventoryLocation][inventoryItem].orderCase = orderPageProducts[orderPageItem].orderCase;

        // Delete all instances of this item in orderPageMatchesToInventory
        for (let orderPgItem of orderPageMatchesToInventorySorted) {
            let matchIndex = Object.keys(orderPageMatchesToInventory[orderPgItem])[0]; 
            if (orderPgItem) {
            for (let i = 0; i < orderPageMatchesToInventory[orderPgItem][matchIndex].length; i++) {
                let matchItemName = Object.keys(orderPageMatchesToInventory[orderPgItem][matchIndex][i])[0];
                if (matchItemName === inventoryItem) {
                    orderPageMatchesToInventory[orderPgItem][matchIndex].splice(i,1);
                }
            }
            }
             
    }
    orderPageMatchesToInventorySorted = sortMatches(orderPageMatchesToInventory)
    }
        
}
console.log("done");

for (let category in InventoryProduct.inventoryRecord) {
    for (let product in InventoryProduct.inventoryRecord[category]) {
        let theoretical = InventoryProduct.inventoryRecord[category][product].theoretical
        let actual = InventoryProduct.inventoryRecord[category][product].actual
        console.log(product);
        console.log('Theoretical: ' + theoretical);
        console.log('Actual: ' + actual);
        let resultTheoreticalWeekly = (InventoryProduct.inventoryRecord[category][product].toOrderCase(theoretical) / InventoryProduct.reportDaySpan) * 7;
        resultTheoreticalWeekly = (resultTheoreticalWeekly * 0.52) + (resultTheoreticalWeekly * 0.48)
        let resultActualWeekly = (InventoryProduct.inventoryRecord[category][product].toOrderCase(actual) / InventoryProduct.reportDaySpan) * 7;
        resultActualWeekly = (resultActualWeekly * 0.52) + (resultActualWeekly * 0.48)
        console.log("Theoretical usage:",resultTheoreticalWeekly);
        console.log("Actual usage:",resultActualWeekly);
        console.log(`----------------`);
    }
}


    function dateDifference(date1, date2) {
        // calculate the time difference in milliseconds
        let daysBetween = Math.abs(date1.getTime() - date2.getTime());
        // convert the time difference from milliseconds to days
        daysBetween = Math.ceil(daysBetween / (24 * 60 * 60 * 1000));
        return daysBetween;
    }

    // Convert a string date to a date object
    function dateConverter(date, deconstruct = false, useHyphen = false) {
        if (typeof date === "object") {
            if (deconstruct) {
                let simpleDate = ""
                if (useHyphen) {
                    simpleDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
                } else {
                    simpleDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
                }
                return simpleDate;
            }
            return new Date(`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`);
        }
        let datePattern = /\D+/;
        let delimiter = date.match(datePattern)[0];
        let [day, month, year] = date.split(delimiter);
        year = year.length !== 4 ? `20${year}` : year;
        return new Date(`${year}/${month}/${day}`);
    }
}
