function inventoryHarvest (report) {

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
inventoryHarvest (`Recipe
Code
Description Reporting
Unit
Begin
Inventory
Transfer In Transfer Out Purchases End Inventory Actual Actual Cost Theoretical Theoretical
Cost
Variance Variance Cost Waste Waste Cost Missing Missing
Cost
Eff
1- Chilled Products
11241 BEANS LARGE PREPOTTED EA 11.00 0.00 0.00 576.00 138.00 449.00 £278.29 368.00 £228.09 81.00 £50.20 103.60 £64.21 -22.60 -£14.01 81.96
11240 BEANS REGULAR PREPOTTED EA 41.00 0.00 0.00 1,088.00 93.00 1,036.00 £363.84 787.00 £276.39 249.00 £87.45 92.00 £32.31 157.00 £55.14 75.97
1046 CHEESE SLICE EA 703.00 0.00 0.00 3,024.00 1,220.50 2,506.50 £189.24 1,815.00 £137.03 691.50 £52.21 0.00 £0.00 691.50 £52.21 72.41
10510 CHICKEN ORIGINAL (DARK
MEAT)
HD-9 0.00 0.00 0.00 720.00 0.00 720.00 £2,055.46 0.00 £0.00 720.00 £2,055.46 0.00 £0.00 720.00 £2,055.46 0.00
1 CHICKEN ORIGINAL (Pieces) HD-9 -0.11 0.00 0.00 1,160.00 138.00 1,021.89 £2,917.29 1,701.78 £4,858.24 -679.89 -£1,940.95 61.00 £174.14 -740.89 -£2,115.09 166.53
138 COLESLAW LARGE EA 24.00 0.00 0.00 288.00 29.00 283.00 £120.81 273.00 £116.54 10.00 £4.27 0.00 £0.00 10.00 £4.27 96.47
137 COLESLAW REGULAR EA 6.00 0.00 0.00 432.00 24.00 414.00 £130.53 384.00 £121.08 30.00 £9.46 0.00 £0.00 30.00 £9.46 92.75
10425 LETTUCE APOLLO MIX BG-250g 0.94 0.00 0.00 64.00 5.78 59.17 £89.64 21.80 £33.03 37.37 £56.61 11.36 £17.21 26.01 £39.40 36.84
1752 LG BEANS EPCS FLAG EA 0.00 0.00 0.00 0.00 0.00 0.00 £0.00 368.00 £0.00 -368.00 £0.00 55.00 £0.00 -423.00 £0.00 0.00
1750 LG GRAVY EPCS FLAG EA 0.00 0.00 0.00 0.00 0.00 0.00 £0.00 863.00 £0.00 -863.00 £0.00 26.00 £0.00 -889.00 £0.00 0.00
1679 MILK FRESH BTL-2L 7.00 0.00 0.00 24.00 4.00 27.00 £52.34 2.65 £5.13 24.35 £47.20 15.90 £30.82 8.45 £16.38 9.81
734 PEPPER MAYO PK-750g 22.60 0.00 0.00 24.00 7.75 38.86 £64.04 17.77 £29.29 21.08 £34.75 0.00 £0.00 21.08 £34.75 45.74
10422 PICKLED SLAW PK-1KG 5.68 0.00 0.00 56.00 3.84 57.84 £199.55 49.32 £170.15 8.52 £29.39 0.00 £0.00 8.52 £29.39 85.27
11227 PINEAPPLE STICK EA 68.00 0.00 0.00 300.00 197.00 171.00 £90.95 207.00 £110.10 -36.00 -£19.15 0.00 £0.00 -36.00 -£19.15 121.05
1753 RG BEANS EPCS FLAG EA 0.00 0.00 0.00 0.00 0.00 0.00 £0.00 787.00 £0.00 -787.00 £0.00 69.00 £0.00 -856.00 £0.00 0.00
1751 RG GRAVY EPCS FLAG EA 0.00 0.00 0.00 0.00 0.00 0.00 £0.00 1,780.00 £0.00 -1,780.00 £0.00 191.00 £0.00 -1,971.00 £0.00 0.00
1002 SALAD ICEBERG PK-500g 10.94 0.00 0.00 136.00 12.24 134.70 £185.04 109.04 £149.80 25.66 £35.24 7.62 £10.47 18.04 £24.78 80.95
1025 SAUCE BURGER DRESSING PK-770g 24.97 0.00 0.00 48.00 17.64 55.34 £82.02 48.10 £71.28 7.24 £10.73 7.55 £11.18 -0.31 -£0.45 86.92
733 TOMATO CHOPPED kg -0.02 0.00 0.00 24.00 2.72 21.26 £65.85 10.31 £31.94 10.95 £33.92 0.40 £1.24 10.55 £32.68 48.49
10237 WHITE CHOCOLATE PIECES
(Milky Bar)
PK-400G 1.42 0.00 -1.00 16.00 4.88 11.54 £37.01 5.12 £16.43 6.42 £20.58 0.00 £0.00 6.42 £20.58 44.39
Total £6,921.91 £6,354.52 £567.39 £341.59 £225.80
2-Ambient Foods
10332 AERO CHOC PIECES CASE-4KG 0.62 0.00 0.00 0.00 0.63 0.00 -£0.15 0.15 £6.08 -0.15 -£6.23 0.00 £0.00 -0.15 -£6.23 -4,000.00
10420 BEAN SALSA BT-1.181kg 3.97 0.00 0.00 5.98 -0.09 10.05 £37.42 4.43 £16.51 5.61 £20.90 0.00 £0.00 5.61 £20.90 44.13
1380 BREADING HOT&CRISPY PK-198g 63.53 0.00 0.00 0.00 2.23 61.30 £32.43 38.20 £20.20 23.11 £12.22 1.16 £0.61 21.95 £11.61 62.31
13 BREADING SALT PK-1.2KG 9.59 0.00 0.00 50.96 20.74 39.81 £38.75 41.24 £40.14 -1.43 -£1.39 0.94 £0.91 -2.36 -£2.30 103.58
10432 CHOCOLATE POWDER SBC kg 0.80 0.00 0.00 10.00 12.00 -1.20 -£5.16 0.41 £1.77 -1.61 -£6.93 0.00 £0.00 -1.61 -£6.93 -34.25
10441 COFFEE BEAN (KENTUCKY
BLEND)
kg 2.90 0.00 0.00 10.00 12.00 0.90 £6.18 0.35 £2.40 0.55 £3.78 0.00 £0.00 0.55 £3.78 38.89
11114 DIP GARLIC MAYO EA 173.00 0.00 0.00 1,200.00 318.00 1,055.00 £150.55 1,001.00 £142.84 54.00 £7.71 0.00 £0.00 54.00 £7.71 94.88
KFC UK - Strictly Confidential 1 / 7
Inventory Activity Report
KFC UK
Generated at: 11/06/2023
Restaurant: FARNBOROUGH - VICTORIA RD - 11037
From 01/05/2023 to 31/05/2023
Sorted By Description
Recipe
Code
Description Reporting
Unit
Begin
Inventory
Transfer In Transfer Out Purchases End Inventory Actual Actual Cost Theoretical Theoretical
Cost
Variance Variance Cost Waste Waste Cost Missing Missing
Cost
Eff
11111 DIP SMOKY BBQ EA 161.00 0.00 0.00 1,000.00 314.00 847.00 £118.66 954.00 £133.66 -107.00 -£14.99 0.00 £0.00 -107.00 -£14.99 112.63
11197 DIP SUPERCHARGER EA 192.00 0.00 0.00 800.00 317.00 675.00 £108.00 958.00 £153.28 -283.00 -£45.28 0.00 £0.00 -283.00 -£45.28 141.93
11112 DIP SWEET CHILLI EA 27.00 0.00 0.00 800.00 317.00 510.00 £73.08 628.00 £89.99 -118.00 -£16.91 0.00 £0.00 -118.00 -£16.91 123.14
11109 DIP TOMATO SAUCE EA 86.00 0.00 0.00 400.00 338.00 148.00 £20.32 116.00 £15.93 32.00 £4.39 0.00 £0.00 32.00 £4.39 78.38
10 FLOUR 3 STEP CASE11.34KG
-2.26 3.00 0.00 104.00 11.08 93.66 £809.18 81.22 £701.72 12.44 £107.47 9.00 £77.72 3.44 £29.75 86.72
11037 GRAVY 3 STEP EA 30.98 0.00 0.00 100.00 34.97 96.01 £92.26 133.29 £128.09 -37.28 -£35.83 8.75 £8.41 -46.03 -£44.24 138.83
11146 GRAVY BOOSTER EA -4.02 0.00 0.00 0.00 -3.03 -0.99 -£0.53 133.30 £71.71 -134.29 -£72.25 8.76 £4.71 -143.05 -£76.96 -
13,451.2
3
183 ICE CREAM MIX PK-1KG 4.12 0.00 -6.00 60.00 13.15 44.97 £82.94 36.37 £67.07 8.61 £15.87 0.00 £0.00 8.61 £15.87 80.86
11103 MASH EPCS FLAG EA 0.00 0.00 0.00 0.00 0.00 0.00 £0.00 396.00 £0.00 -396.00 £0.00 36.00 £0.00 -432.00 £0.00 0.00
14 MILK & EGG MIX PK-340g 26.62 0.00 0.00 40.00 11.86 54.76 £86.17 42.55 £66.97 12.20 £19.20 1.03 £1.62 11.17 £17.58 77.72
10238 MILK CARNATION CONDENSED BT-450g 2.89 0.00 -1.00 12.00 2.84 11.05 £29.52 6.75 £18.02 4.31 £11.50 0.00 £0.00 4.31 £11.50 61.04
718 MILK MILLAC MAID EA 0.00 0.00 0.00 0.00 200.00 -200.00 -£4.54 0.00 £0.00 -200.00 -£4.54 0.00 £0.00 -200.00 -£4.54 0.00
10043 SACHET BBQ SAUCE EA 1,162.50 0.00 0.00 3,000.00 2,926.00 1,236.50 £29.06 3,148.25 £73.98 -1,911.75 -£44.93 0.00 £0.00 -1,911.75 -£44.93 254.61
10169 SACHET LIGHT MAYONNAISE EA 1,317.50 0.00 -220.00 3,300.00 2,951.00 1,446.50 £47.06 3,148.25 £102.00 -1,701.75 -£54.94 0.00 £0.00 -1,701.75 -£54.94 217.65
1680 SACHET TOMATO KETCHUP EA 1,196.00 0.00 -225.00 4,500.00 3,594.00 1,877.00 £30.03 6,341.50 £101.46 -4,464.50 -£71.43 0.00 £0.00 -4,464.50 -£71.43 337.85
931 SALT SACHETS EA 4,236.00 0.00 0.00 5,000.00 12,155.00 -2,919.00 -£8.76 14,280.00 £42.84 -17,199.00 -£51.60 189.00 £0.57 -17,388.00 -£52.16 -489.21
11192 SAUCE BBQ SMOKEY(Twister) BT - 950g 9.95 0.00 0.00 6.32 4.51 11.76 £31.08 10.78 £28.50 0.97 £2.57 0.00 £0.00 0.97 £2.57 91.72
11257 SAUCE BUFFALO (TWISTER) kg 1.00 0.00 0.00 8.00 3.93 5.07 £19.96 2.68 £10.56 2.39 £9.41 0.00 £0.00 2.39 £9.41 52.88
11183 SAUCE BUTTERMILK
DRESSING
BT - 1062g 4.99 0.00 0.00 5.65 1.95 8.68 £33.58 4.87 £18.84 3.81 £14.74 0.00 £0.00 3.81 £14.74 56.10
10306 SAUCE CHOCOLATE
(KRUSHEMS + SUNDAE)
BT-1000g 2.68 1.00 0.00 12.00 5.94 9.74 £56.59 2.69 £15.64 7.05 £40.95 0.00 £0.00 7.05 £40.95 27.63
805 SAUCE DADDIES (Ketchup) BT-1.35kg 4.83 0.00 0.00 12.00 8.84 7.98 £13.77 5.48 £9.46 2.50 £4.31 0.00 £0.00 2.50 £4.31 68.69
773 SAUCE HOT SALSA SMOOTH BT-1073g 4.80 0.00 0.00 6.00 3.84 6.96 £21.71 5.95 £18.55 1.01 £3.16 0.00 £0.00 1.01 £3.16 85.45
11148 SAUCE KANSAS BBQ (BITES) kg 7.42 0.00 0.00 36.18 14.96 28.64 £79.46 22.26 £61.75 6.38 £17.71 0.00 £0.00 6.38 £17.71 77.71
11256 SAUCE KOREAN BBQ BT-1KG 3.00 0.00 0.00 0.00 2.00 1.00 £3.96 0.00 £0.00 1.00 £3.96 0.00 £0.00 1.00 £3.96 0.00
10233 SAUCE SUPERCHARGER L 1.80 0.00 0.00 24.00 7.87 17.93 £63.78 10.81 £38.44 7.12 £25.34 0.00 £0.00 7.12 £25.34 60.27
10406 SAUCE SWEET CHILLI (BITES) BT-1.17kg 5.59 0.00 0.00 17.44 5.54 17.49 £61.95 12.41 £43.97 5.08 £17.99 0.00 £0.00 5.08 £17.99 70.97
11056 SAUCE SWEET CHILLI (Stacker) BT-955g 11.37 0.00 0.00 0.00 3.04 8.33 £27.11 5.87 £19.09 2.47 £8.03 0.00 £0.00 2.47 £8.03 70.39
11222 SAUCE VEGAN MAYO BT-975g 2.78 0.00 0.00 0.00 1.99 0.79 £3.04 1.03 £3.94 -0.24 -£0.90 0.00 £0.00 -0.24 -£0.90 129.73
11 SEASONING 3 STEP PK-740g 14.62 0.00 0.00 60.00 14.86 59.75 £356.49 42.64 £254.36 17.12 £102.13 0.97 £5.79 16.15 £96.34 71.35
1570 SUGAR STICKS EA 4,750.00 0.00 0.00 0.00 4,250.00 500.00 £1.85 34.00 £0.13 466.00 £1.72 0.00 £0.00 466.00 £1.72 6.80
KFC UK - Strictly Confidential 2 / 7
Inventory Activity Report
KFC UK
Generated at: 11/06/2023
Restaurant: FARNBOROUGH - VICTORIA RD - 11037
From 01/05/2023 to 31/05/2023
Sorted By Description
Recipe
Code
Description Reporting
Unit
Begin
Inventory
Transfer In Transfer Out Purchases End Inventory Actual Actual Cost Theoretical Theoretical
Cost
Variance Variance Cost Waste Waste Cost Missing Missing
Cost
Eff
11120 SWEETCORN PK-340g 4.94 0.00 0.00 36.00 3.76 37.18 £30.39 30.06 £24.57 7.12 £5.82 0.00 £0.00 7.12 £5.82 80.85
10431 TEA BAGS EA 650.00 0.00 0.00 0.00 1,200.00 -550.00 -£17.93 0.00 £0.00 -550.00 -£17.93 0.00 £0.00 -550.00 -£17.93 0.00
1670 TOPPING OREO PCS BG-400g 7.81 0.00 0.00 24.00 35.82 -4.01 -£6.94 5.92 £10.24 -9.93 -£17.18 0.00 £0.00 -9.93 -£17.18 -147.63
11098 UNSEASONED OR CHICKEN
Flag
EA 0.00 0.00 0.00 0.00 0.00 0.00 £0.00 15,316.00 £0.00 -15,316.00 £0.00 252.00 £0.00 -15,568.00 £0.00 0.00
Total £2,552.34 £2,554.70 -£2.36 £100.34 -£102.71
3-Ambient Packaging
729 BAG BROWN PAPER EA 426.00 800.00 0.00 8,000.00 3,541.00 5,685.00 £169.98 19,062.00 £569.95 -13,377.00 -£399.97 0.00 £0.00 -13,377.00 -£399.97 335.30
10318 BAG CARRIER LARGE EA 281.50 0.00 0.00 5,250.00 1,397.00 4,134.50 £377.48 4,273.00 £390.12 -138.50 -£12.65 0.00 £0.00 -138.50 -£12.65 103.35
1572 BAG CHICKEN LARGE EA 599.00 0.00 0.00 1,800.00 884.00 1,515.00 £46.66 850.00 £26.18 665.00 £20.48 0.00 £0.00 665.00 £20.48 56.11
11248 BAG CHICKEN SMALL (H/W) EA -108.00 0.00 0.00 0.00 925.00 -1,033.00 -£20.14 2,380.00 £46.41 -3,413.00 -£66.55 0.00 £0.00 -3,413.00 -£66.55 -230.40
1571 BAG CHICKEN SMALL (OR) EA 1,477.00 0.00 0.00 4,000.00 3,933.00 1,544.00 £39.99 2,502.00 £64.80 -958.00 -£24.81 0.00 £0.00 -958.00 -£24.81 162.05
88 BAG CORN COBETTE EA 4,740.00 0.00 0.00 0.00 2,959.00 1,781.00 £9.26 1,642.00 £8.54 139.00 £0.72 189.00 £0.98 -50.00 -£0.26 92.20
109 BAG FILLET PLASTIC EA 1,500.00 0.00 0.00 0.00 2,000.00 -500.00 -£5.95 0.00 £0.00 -500.00 -£5.95 0.00 £0.00 -500.00 -£5.95 0.00
98 BAG FRIES (GENERIC) 8 x 8 EA 4,029.00 0.00 -1,800.00 4,000.00 2,303.00 3,926.00 £34.16 3,998.00 £34.78 -72.00 -£0.63 504.00 £4.38 -576.00 -£5.01 101.83
11177 BAG FRIES REG (11x11 FRIES) EA 3,563.00 0.00 0.00 15,000.00 4,710.00 13,853.00 £70.65 12,176.00 £62.10 1,677.00 £8.55 0.00 £0.00 1,677.00 £8.55 87.89
10382 BOX 6 IN 1 EA 43.00 300.00 0.00 3,000.00 1,327.00 2,016.00 £289.09 2,428.00 £348.18 -412.00 -£59.08 0.00 £0.00 -412.00 -£59.08 120.44
1633 BOX BUCKET SNACKBOX EA 625.00 0.00 0.00 440.00 879.00 186.00 £25.18 271.00 £36.69 -85.00 -£11.51 0.00 £0.00 -85.00 -£11.51 145.70
11113 BOX DIPS BAR EA 500.00 0.00 0.00 0.00 250.00 250.00 £15.93 0.00 £0.00 250.00 £15.93 0.00 £0.00 250.00 £15.93 0.00
10034 BOX MEGABOX (4 IN 1) EA 397.00 0.00 0.00 350.00 698.00 49.00 £3.44 158.00 £11.11 -109.00 -£7.66 0.00 £0.00 -109.00 -£7.66 322.45
876 BOX POPCORN LARGE EA 285.00 0.00 0.00 2,000.00 1,482.00 803.00 £33.40 917.00 £38.15 -114.00 -£4.74 0.00 £0.00 -114.00 -£4.74 114.20
877 BOX POPCORN REG EA 674.00 0.00 0.00 500.00 485.00 689.00 £24.87 494.00 £17.83 195.00 £7.04 0.00 £0.00 195.00 £7.04 71.70
1123 BOX POPCORN SMALL EA 854.00 0.00 0.00 1,500.00 1,910.00 444.00 £12.30 1,319.00 £36.54 -875.00 -£24.24 0.00 £0.00 -875.00 -£24.24 297.07
10536 BOX RICEBOX (2017) EA 41.00 0.00 0.00 400.00 196.00 245.00 £46.45 218.00 £41.33 27.00 £5.12 0.00 £0.00 27.00 £5.12 88.98
74 BUCKET & LID 130oz EA 186.00 0.00 0.00 250.00 184.00 252.00 £61.49 262.00 £63.93 -10.00 -£2.44 0.00 £0.00 -10.00 -£2.44 103.97
10372 BUCKET & LID 85OZ EA 86.00 0.00 0.00 1,800.00 552.00 1,334.00 £246.39 2,193.00 £405.05 -859.00 -£158.66 0.00 £0.00 -859.00 -£158.66 164.39
10396 BUCKET & LID MIGHTY (54oz) EA -29.00 0.00 0.00 1,008.00 63.00 916.00 £128.06 1,019.00 £142.46 -103.00 -£14.40 0.00 £0.00 -103.00 -£14.40 111.24
11233 BUCKET KIDS EA 84.00 0.00 0.00 180.00 105.00 159.00 £44.42 190.00 £53.09 -31.00 -£8.66 0.00 £0.00 -31.00 -£8.66 119.50
11218 BUCKET POPCORN 35oz EA 520.00 0.00 0.00 0.00 0.00 520.00 £109.46 0.00 £0.00 520.00 £109.46 0.00 £0.00 520.00 £109.46 0.00
89 CARRIER 2 CUP EA 612.15 0.00 0.00 1,160.00 1,143.70 628.45 £24.82 873.15 £34.49 -244.70 -£9.67 0.00 £0.00 -244.70 -£9.67 138.94
1167 CARRIER 4 CUP EA 292.15 0.00 0.00 0.00 -16.30 308.45 £24.80 873.15 £70.20 -564.70 -£45.40 0.00 £0.00 -564.70 -£45.40 283.08
1487 CLAMSHELL BANQUET EA 471.00 0.00 0.00 1,500.00 818.00 1,153.00 £44.74 1,037.00 £40.24 116.00 £4.50 0.00 £0.00 116.00 £4.50 89.94
KFC UK - Strictly Confidential 3 / 7
Inventory Activity Report
KFC UK
Generated at: 11/06/2023
Restaurant: FARNBOROUGH - VICTORIA RD - 11037
From 01/05/2023 to 31/05/2023
Sorted By Description
Recipe
Code
Description Reporting
Unit
Begin
Inventory
Transfer In Transfer Out Purchases End Inventory Actual Actual Cost Theoretical Theoretical
Cost
Variance Variance Cost Waste Waste Cost Missing Missing
Cost
Eff
1632 CLAMSHELL CLASSIC (WRAP
BURGER)
EA 467.00 0.00 0.00 1,800.00 557.00 1,710.00 £65.49 1,565.00 £59.94 145.00 £5.55 254.00 £9.73 -109.00 -£4.17 91.52
11171 CLAMSHELL FRIES (Delivery
Only)
EA 2,275.00 0.00 0.00 960.00 -327.00 3,562.00 £130.01 15,041.00 £549.00 -11,479.00 -£418.98 0.00 £0.00 -11,479.00 -£418.98 422.26
11251 CLAMSHELL MINI FILLET
BURGER
EA 459.00 0.00 0.00 800.00 683.00 576.00 £23.27 687.00 £27.75 -111.00 -£4.48 0.00 £0.00 -111.00 -£4.48 119.27
11055 CLAMSHELL STACKER &
TOWER
EA 640.00 0.00 0.00 800.00 216.00 1,224.00 £79.56 1,200.00 £78.00 24.00 £1.56 0.00 £0.00 24.00 £1.56 98.04
11223 CLAMSHELL VEGAN EA 75.00 0.00 0.00 300.00 299.00 76.00 £4.18 72.00 £3.96 4.00 £0.22 0.00 £0.00 4.00 £0.22 94.74
108 CORN SKEWERS EA 2,290.00 0.00 0.00 2,000.00 1,959.00 2,331.00 £10.72 1,642.00 £7.55 689.00 £3.17 189.00 £0.87 500.00 £2.30 70.44
10424 CUP 12oz TALL SBC + KB EA 0.00 0.00 0.00 600.00 325.00 275.00 £18.84 34.00 £2.33 241.00 £16.51 0.00 £0.00 241.00 £16.51 12.36
85 CUP 16OZ EA -48.00 0.00 0.00 2,000.00 1,168.00 784.00 £30.89 1,593.00 £62.76 -809.00 -£31.87 0.00 £0.00 -809.00 -£31.87 203.19
87 CUP 22OZ EA 941.00 0.00 0.00 0.00 647.00 294.00 £13.08 224.00 £9.97 70.00 £3.12 0.00 £0.00 70.00 £3.12 76.19
11205 CUP CLEAR - SOUTHERN
REFRESHER
EA 1,810.00 0.00 0.00 0.00 0.00 1,810.00 £125.80 0.00 £0.00 1,810.00 £125.80 0.00 £0.00 1,810.00 £125.80 0.00
1674 CUP KRUSHEMS EA 433.00 0.00 0.00 0.00 1,213.00 -780.00 -£40.40 304.00 £15.75 -1,084.00 -£56.15 0.00 £0.00 -1,084.00 -£56.15 -38.97
11124 FORK PLASTIC LONG 18cm EA 0.00 0.00 0.00 0.00 1,000.00 -1,000.00 -£13.00 31.00 £0.40 -1,031.00 -£13.40 0.00 £0.00 -1,031.00 -£13.40 -3.10
86 LID 12/16/22OZ EA 1,643.00 0.00 -200.00 2,000.00 2,661.00 782.00 £10.83 1,837.00 £25.53 -1,055.00 -£14.70 0.00 £0.00 -1,055.00 -£14.70 234.91
11201 LID CARD (Rice / Salad/ Bites) EA 715.00 0.00 0.00 1,000.00 217.00 1,498.00 £52.13 931.00 £32.40 567.00 £19.73 0.00 £0.00 567.00 £19.73 62.15
1586 LID HOT CUP (LID KFC
EMBOSSED )
EA 1,000.00 0.00 0.00 0.00 0.00 1,000.00 £18.80 34.00 £0.64 966.00 £18.16 0.00 £0.00 966.00 £18.16 3.40
1612 LID KRUSHEM EA -7.00 0.00 0.00 0.00 143.00 -150.00 -£2.96 304.00 £5.99 -454.00 -£8.94 0.00 £0.00 -454.00 -£8.94 -202.67
1133 LID SIDE LARGE EA 1,088.00 0.00 0.00 1,152.00 542.00 1,698.00 £39.56 1,627.00 £37.91 71.00 £1.65 117.00 £2.73 -46.00 -£1.07 95.82
1142 LID SIDE SMALL EA -37.00 0.00 -150.00 4,800.00 3,532.00 1,081.00 £12.76 2,567.00 £30.29 -1,486.00 -£17.53 260.00 £3.07 -1,746.00 -£20.60 237.47
11237 LID SIPPY EA 1,689.60 0.00 0.00 2,112.00 0.00 3,801.60 £65.77 0.00 £0.00 3,801.60 £65.77 0.00 £0.00 3,801.60 £65.77 0.00
101 NAPKINS EA 4,329.00 2,000.00 0.00 8,000.00 8,242.00 6,087.00 £26.78 32,048.00 £141.01 -25,961.00 -£114.23 758.00 £3.34 -26,719.00 -£117.56 526.50
200 PLATE - BOAT TRAY EA -10.00 0.00 0.00 0.00 42.00 -52.00 -£1.49 369.00 £10.55 -421.00 -£12.04 0.00 £0.00 -421.00 -£12.04 -709.62
11200 POT SIDE CARD (Rice / Salad /
Bites)
EA 755.00 0.00 0.00 1,000.00 517.00 1,238.00 £74.16 931.00 £55.77 307.00 £18.39 0.00 £0.00 307.00 £18.39 75.20
1129 POT SIDE LARGE EA 1,192.00 0.00 0.00 1,240.00 1,460.00 972.00 £42.77 1,259.00 £55.40 -287.00 -£12.63 62.00 £2.73 -349.00 -£15.36 129.53
1141 POT SIDE SMALL EA 1,431.00 0.00 0.00 4,800.00 3,558.00 2,673.00 £65.49 1,780.00 £43.61 893.00 £21.88 191.00 £4.68 702.00 £17.20 66.59
11170 SCOOP FRIES LARGE (11X11
Fries)
EA 767.00 0.00 0.00 0.00 774.00 -7.00 -£0.15 417.00 £9.01 -424.00 -£9.16 0.00 £0.00 -424.00 -£9.16 -5,957.14
834 SPOON DESERT EA 580.00 0.00 0.00 1,000.00 1,407.00 173.00 £2.21 3,801.00 £48.65 -3,628.00 -£46.44 341.00 £4.36 -3,969.00 -£50.80 2,197.11
104 SPORKS EA -66.00 0.00 0.00 0.00 -38.00 -28.00 -£0.28 1,584.00 £15.84 -1,612.00 -£16.12 0.00 £0.00 -1,612.00 -£16.12 -5,657.14
107 STICKERS (Delivery Labels) EA 685.00 0.00 0.00 7,040.00 1,767.00 5,958.00 £50.64 6,626.00 £56.32 -668.00 -£5.68 0.00 £0.00 -668.00 -£5.68 111.21
1435 STIRRERS WOODEN EA 1,000.00 0.00 0.00 0.00 6,000.00 -5,000.00 -£13.00 34.00 £0.09 -5,034.00 -£13.09 0.00 £0.00 -5,034.00 -£13.09 -0.68
1593 STRAWS JUMBO KRUSHEM EA 993.00 0.00 -200.00 0.00 393.00 400.00 £5.48 304.00 £4.16 96.00 £1.32 0.00 £0.00 96.00 £1.32 76.00
KFC UK - Strictly Confidential 4 / 7
Inventory Activity Report
KFC UK
Generated at: 11/06/2023
Restaurant: FARNBOROUGH - VICTORIA RD - 11037
From 01/05/2023 to 31/05/2023
Sorted By Description
Recipe
Code
Description Reporting
Unit
Begin
Inventory
Transfer In Transfer Out Purchases End Inventory Actual Actual Cost Theoretical Theoretical
Cost
Variance Variance Cost Waste Waste Cost Missing Missing
Cost
Eff
103 STRAWS WRAPPED EA 1,818.00 0.00 -250.00 5,000.00 4,711.00 1,857.00 £15.23 1,837.00 £15.06 20.00 £0.16 0.00 £0.00 20.00 £0.16 98.92
1324 TRAYLINER DBL SIDED EA 3,176.00 0.00 0.00 0.00 3,179.00 -3.00 -£0.02 580.00 £4.70 -583.00 -£4.72 0.00 £0.00 -583.00 -£4.72 -
19,333.3
3
966 WETNAPS EA 3,975.00 0.00 0.00 0.00 4,361.00 -386.00 -£2.32 19,078.00 £114.47 -19,464.00 -£116.78 0.00 £0.00 -19,464.00 -£116.78 -4,942.49
132 WOODEN FORKS EA 421.00 0.00 0.00 1,000.00 -61.00 1,482.00 £17.93 2,151.00 £26.03 -669.00 -£8.09 36.00 £0.44 -705.00 -£8.53 145.14
11252 WRAP KIDS EA -1.00 0.00 0.00 1,000.00 0.00 999.00 £13.99 43.00 £0.60 956.00 £13.38 0.00 £0.00 956.00 £13.38 4.30
1656 WRAP STREETWISE (Mini
Sleeve)
EA 422.00 0.00 -875.00 1,200.00 291.00 456.00 £21.75 738.00 £35.05 -282.00 -£13.31 0.00 £0.00 -282.00 -£13.31 161.84
1400 WRAP TWISTER(4 FLAVOUR) EA 667.00 0.00 0.00 1,000.00 331.00 1,336.00 £80.96 871.00 £52.78 465.00 £28.18 0.00 £0.00 465.00 £28.18 65.19
Total £2,902.40 £4,181.44 -£1,279.04 £37.30 -£1,316.34
4-Frozen Products
1024 BUN GLAZED (Water Split) EA 110.00 0.00 0.00 3,672.00 450.00 3,332.00 £440.16 2,837.00 £374.77 495.00 £65.39 254.00 £33.55 241.00 £31.84 85.14
1132 BUN MINI FILLET EA 14.00 0.00 0.00 1,080.00 271.00 823.00 £93.99 730.00 £83.37 93.00 £10.62 0.00 £0.00 93.00 £10.62 88.70
2 CHICKEN FILLETS EA 240.00 0.00 0.00 2,640.00 408.00 2,472.00 £1,370.97 2,273.00 £1,260.61 199.00 £110.37 159.00 £88.18 40.00 £22.18 91.95
714 CHICKEN FROZEN - (Heads) HD-9 0.00 0.00 0.00 84.00 72.00 12.00 £44.95 0.00 £0.00 12.00 £44.95 0.00 £0.00 12.00 £44.95 0.00
1406 CHICKEN HOTWINGS ISP EA 100.00 0.00 0.00 32,760.00 3,180.00 29,680.00 £3,383.52 28,869.00 £3,291.07 811.00 £92.45 931.00 £106.13 -120.00 -£13.68 97.27
1130 CHICKEN MINI FILLET EA 0.00 0.00 0.00 19,920.00 1,920.00 18,000.00 £4,836.60 17,076.00 £4,588.32 924.00 £248.28 597.00 £160.41 327.00 £87.86 94.87
11215 CHICKEN OR FILLET BITES FTF EA 187.00 0.00 0.00 2,856.00 255.00 2,788.00 £414.02 2,452.00 £364.12 336.00 £49.90 198.00 £29.40 138.00 £20.49 87.95
825 CHICKEN POPCORN PK-148 11.00 0.00 0.00 490.00 62.00 439.00 £2,059.61 385.69 £1,809.50 53.31 £250.11 31.00 £145.44 22.31 £104.67 87.86
1020 CHICKEN ZINGER ISP EA 279.00 0.00 0.00 2,160.00 314.00 2,125.00 £1,114.35 1,889.00 £990.59 236.00 £123.76 191.00 £100.16 45.00 £23.60 88.89
11091 CHICKEN ZINGER MINI EA 0.00 0.00 0.00 0.00 0.00 0.00 £0.00 0.00 £0.00 0.00 £0.00 40.00 £8.38 -40.00 -£8.38 0.00
75884 COOKIE FULLY BAKED
(FROZEN)
EA -6.00 0.00 0.00 460.00 225.00 229.00 £70.76 349.00 £107.84 -120.00 -£37.08 0.00 £0.00 -120.00 -£37.08 152.40
10461 COOKIE WHITE CHOC EA 0.00 0.00 0.00 345.00 115.00 230.00 £75.44 66.00 £21.65 164.00 £53.79 0.00 £0.00 164.00 £53.79 28.70
66 CORN COBETTES EA -36.00 0.00 0.00 2,304.00 247.00 2,021.00 £351.86 1,642.00 £285.87 379.00 £65.98 290.40 £50.56 88.60 £15.43 81.25
11140 FRIES 11X11 kg 46.34 0.00 0.00 2,295.00 278.25 2,063.09 £2,457.76 2,010.44 £2,395.03 52.66 £62.73 43.50 £51.82 9.16 £10.91 97.45
127 HASH BROWN EA 19.00 0.00 0.00 1,750.00 472.00 1,297.00 £95.33 998.00 £73.35 299.00 £21.98 0.00 £0.00 299.00 £21.98 76.95
11097 MASHED POTATOES EA -41.40 0.00 0.00 6,251.00 711.00 5,498.60 £103.37 3,564.00 £67.00 1,934.60 £36.37 324.00 £6.09 1,610.60 £30.28 64.82
10513 RICE SPICEY Portions 86.00 0.00 0.00 1,152.00 184.00 1,054.00 £182.76 910.00 £157.79 144.00 £24.97 11.00 £1.91 133.00 £23.06 86.34
1657 TORTILLA 20cm PLAIN EA -7.00 0.00 0.00 1,152.00 207.00 938.00 £74.66 738.00 £58.74 200.00 £15.92 0.00 £0.00 200.00 £15.92 78.68
11191 TORTILLA 25.4cm (4 Flavour
Twister)
EA 184.00 0.00 0.00 1,152.00 237.00 1,099.00 £115.18 876.00 £91.80 223.00 £23.37 0.00 £0.00 223.00 £23.37 79.71
11196 VEGAN FILLET EA 77.00 0.00 0.00 120.00 121.00 76.00 £50.21 72.00 £47.57 4.00 £2.64 1.00 £0.66 3.00 £1.98 94.74
Total £17,335.50 £16,069.00 £1,266.50 £782.71 £483.79
KFC UK - Strictly Confidential 5 / 7
Inventory Activity Report
KFC UK
Generated at: 11/06/2023
Restaurant: FARNBOROUGH - VICTORIA RD - 11037
From 01/05/2023 to 31/05/2023
Sorted By Description
Recipe
Code
Description Reporting
Unit
Begin
Inventory
Transfer In Transfer Out Purchases End Inventory Actual Actual Cost Theoretical Theoretical
Cost
Variance Variance Cost Waste Waste Cost Missing Missing
Cost
Eff
5-Ambient Chemicals
10428 BAG CLEAR REFUSE - Food &
DMR
EA 262.00 0.00 0.00 350.00 700.00 -88.00 -£7.93 0.00 £0.00 -88.00 -£7.93 0.00 £0.00 -88.00 -£7.93 0.00
215 BLUE ROLL 1 PLY 400M EA 10.00 6.00 0.00 60.00 54.00 22.00 £51.78 0.00 £0.00 22.00 £51.78 0.00 £0.00 22.00 £51.78 0.00
10548 BUN T RELEASE (SUMA) EA 9.00 0.00 0.00 0.00 12.00 -3.00 -£10.62 0.00 £0.00 -3.00 -£10.62 0.00 £0.00 -3.00 -£10.62 0.00
10226 CARE TABLETS EA 240.00 0.00 0.00 0.00 300.00 -60.00 -£16.87 0.00 £0.00 -60.00 -£16.87 0.00 £0.00 -60.00 -£16.87 0.00
1763 CLOTH GREEN EA 300.00 0.00 0.00 0.00 300.00 0.00 £0.00 0.00 £0.00 0.00 £0.00 0.00 £0.00 0.00 £0.00 0.00
10555 DEGREASER (SUMA) L 7.00 0.00 0.00 0.00 10.00 -3.00 -£5.45 0.00 £0.00 -3.00 -£5.45 0.00 £0.00 -3.00 -£5.45 0.00
10225 DETERGENT TABLETS EA 26.00 0.00 0.00 0.00 80.00 -54.00 -£18.51 0.00 £0.00 -54.00 -£18.51 0.00 £0.00 -54.00 -£18.51 0.00
1383 DISHWASH SOAP (SUMA STAR
D1)
CASE-10L 1.00 0.00 0.00 4.00 10.00 -5.00 -£38.42 0.00 £0.00 -5.00 -£38.42 0.00 £0.00 -5.00 -£38.42 0.00
11225 FACE MASK EA 0.00 0.00 0.00 0.00 50.00 -50.00 -£6.01 0.00 £0.00 -50.00 -£6.01 0.00 £0.00 -50.00 -£6.01 0.00
10547 GLASS/SURFACE CLEANER
(TASKI)
EA 0.25 0.00 0.00 0.00 1.00 -0.75 -£10.25 0.00 £0.00 -0.75 -£10.25 0.00 £0.00 -0.75 -£10.25 0.00
10268 GLOVES EA 120.00 0.00 0.00 2,000.00 1,000.00 1,120.00 £26.54 0.00 £0.00 1,120.00 £26.54 0.00 £0.00 1,120.00 £26.54 0.00
10552 GRILL CLEANER (SUMA) L 0.00 0.00 0.00 17.60 14.40 3.20 £9.93 0.00 £0.00 3.20 £9.93 0.00 £0.00 3.20 £9.93 0.00
10006 HAND SOAP L 63.50 0.00 0.00 0.00 60.00 3.50 £7.95 0.00 £0.00 3.50 £7.95 0.00 £0.00 3.50 £7.95 0.00
10191 ICE MELT SHAKER EA 1.50 0.00 0.00 0.00 1.00 0.50 £1.31 0.00 £0.00 0.50 £1.31 0.00 £0.00 0.50 £1.31 0.00
10544 RESTROOM CLEANER (TASKI) EA 1.00 0.00 0.00 0.00 3.50 -2.50 -£52.36 0.00 £0.00 -2.50 -£52.36 0.00 £0.00 -2.50 -£52.36 0.00
10549 SANITISER (SUMA) EA 8.15 0.00 0.00 0.00 8.00 0.15 £4.27 0.00 £0.00 0.15 £4.27 0.00 £0.00 0.15 £4.27 0.00
10553 SANITISER TABLETS (TITAN
CHLOR PLUS)
EA 500.00 0.00 0.00 1,200.00 2,000.00 -300.00 -£8.13 0.00 £0.00 -300.00 -£8.13 0.00 £0.00 -300.00 -£8.13 0.00
10545 SANITISING GEL EA 3.50 0.00 0.00 0.00 5.00 -1.50 -£15.22 0.00 £0.00 -1.50 -£15.22 0.00 £0.00 -1.50 -£15.22 0.00
11245 SPRINT FLOWER L 3.00 0.00 0.00 0.00 3.00 0.00 £0.00 0.00 £0.00 0.00 £0.00 0.00 £0.00 0.00 £0.00 0.00
11051 STAINLESS STEEL POLISH
(SUMA INOX D7.1)
L 3.00 0.00 0.00 4.50 4.50 3.00 £11.37 0.00 £0.00 3.00 £11.37 0.00 £0.00 3.00 £11.37 0.00
1203 TOILET ROLLS EA 27.00 0.00 0.00 72.00 44.00 55.00 £11.75 0.00 £0.00 55.00 £11.75 0.00 £0.00 55.00 £11.75 0.00
180 TOWELS BLUE SERVICE (HAND
WASH)
EA 280.00 0.00 0.00 2,000.00 1,000.00 1,280.00 £56.32 0.00 £0.00 1,280.00 £56.32 0.00 £0.00 1,280.00 £56.32 0.00
Total -£8.54 £0.00 -£8.54 £0.00 -£8.54
6-Oil
10223 OIL PREMIUM PRESSURE
FRYER
L 80.00 0.00 -20.00 1,100.00 100.00 1,060.00 £1,937.15 0.00 £0.00 1,060.00 £1,937.15 0.00 £0.00 1,060.00 £1,937.15 0.00
Total £1,937.15 £0.00 £1,937.15 £0.00 £1,937.15
8-Drinks
34 BIB 7UP FREE L 16.62 0.00 0.00 12.00 21.48 7.14 £13.16 4.91 £9.04 2.24 £4.12 0.00 £0.00 2.24 £4.12 68.70
32 BIB DIET PEPSI 12LT L 10.58 0.00 0.00 12.00 11.92 10.66 £19.67 3.43 £6.33 7.23 £13.34 0.00 £0.00 7.23 £13.34 32.17
KFC UK - Strictly Confidential 6 / 7
Inventory Activity Report
KFC UK
Generated at: 11/06/2023
Restaurant: FARNBOROUGH - VICTORIA RD - 11037
From 01/05/2023 to 31/05/2023
Sorted By Description
Recipe
Code
Description Reporting
Unit
Begin
Inventory
Transfer In Transfer Out Purchases End Inventory Actual Actual Cost Theoretical Theoretical
Cost
Variance Variance Cost Waste Waste Cost Missing Missing
Cost
Eff
10571 BIB ICE TEA PEACH (LIPTON) L 9.25 0.00 0.00 10.00 9.95 9.30 £14.67 4.66 £7.36 4.63 £7.31 0.00 £0.00 4.63 £7.31 50.17
11119 BIB PEPSI CHERRY MAX L 10.63 0.00 0.00 24.00 29.83 4.80 £8.85 6.07 £11.19 -1.27 -£2.34 0.00 £0.00 -1.27 -£2.34 126.43
120 BIB PEPSI MAX L 28.16 0.00 0.00 48.00 23.08 53.09 £98.49 39.56 £73.40 13.52 £25.09 0.00 £0.00 13.52 £25.09 74.53
11096 BIB ROBINSONS AP &
BLKCURRANT
L 9.10 0.00 0.00 7.00 7.00 9.10 £16.67 2.03 £3.73 7.07 £12.95 0.00 £0.00 7.07 £12.95 22.36
33 BIB TANGO 12LT L 15.31 0.00 0.00 12.00 11.90 15.41 £28.62 14.20 £26.38 1.21 £2.24 0.00 £0.00 1.21 £2.24 92.17
11199 BIB WATERMELON LIME L 10.80 0.00 0.00 10.00 12.95 7.85 £24.14 5.10 £15.69 2.75 £8.46 0.00 £0.00 2.75 £8.46 64.97
1689 BTL 7UP FREE 1.5L EA 7.00 0.00 0.00 180.00 64.20 122.80 £75.10 153.00 £93.57 -30.20 -£18.47 0.00 £0.00 -30.20 -£18.47 124.59
43 BTL DIET PEPSI 1.5L EA 5.00 0.00 0.00 60.00 76.00 -11.00 -£6.70 48.00 £29.24 -59.00 -£35.94 0.00 £0.00 -59.00 -£35.94 -436.36
45 BTL PEPSI MAX 1.5L EA 10.00 0.00 0.00 540.00 91.00 459.00 £279.62 504.00 £307.04 -45.00 -£27.41 0.00 £0.00 -45.00 -£27.41 109.80
46 BTL TANGO 1.5L EA 25.00 0.00 0.00 216.00 101.00 140.00 £85.29 171.00 £104.17 -31.00 -£18.89 0.00 £0.00 -31.00 -£18.89 122.14
11153 CAN 7UP FREE EA 43.00 0.00 0.00 456.00 41.00 458.00 £120.13 438.00 £114.89 20.00 £5.25 0.00 £0.00 20.00 £5.25 95.63
11059 CAN PEPSI MAX EA 52.00 0.00 0.00 1,896.00 150.00 1,798.00 £618.87 1,690.00 £581.70 108.00 £37.17 0.00 £0.00 108.00 £37.17 93.99
11060 CAN TANGO EA 71.00 0.00 0.00 984.00 28.00 1,027.00 £267.84 906.00 £236.28 121.00 £31.56 0.00 £0.00 121.00 £31.56 88.22
935 FRUIT SHOOT
BLCKCURRANT/APPLE
EA 14.00 0.00 0.00 264.00 38.00 240.00 £63.79 221.00 £58.74 19.00 £5.05 0.00 £0.00 19.00 £5.05 92.08
934 FRUIT SHOOT ORANGE EA 11.00 0.00 0.00 192.00 73.00 130.00 £34.55 123.00 £32.69 7.00 £1.86 0.00 £0.00 7.00 £1.86 94.62
1128 TROPICANA ORANGE EA 0.00 0.00 0.00 288.00 41.00 247.00 £92.16 188.00 £70.14 59.00 £22.01 0.00 £0.00 59.00 £22.01 76.11
11004 WATER SPARKLING EA 15.00 0.00 0.00 96.00 44.00 67.00 £15.02 65.00 £14.57 2.00 £0.45 0.00 £0.00 2.00 £0.45 97.01
37 WATER STILL 500ML EA 34.00 0.00 0.00 744.00 16.00 762.00 £165.13 528.00 £114.42 234.00 £50.71 0.00 £0.00 234.00 £50.71 69.29
Total £2,035.09 £1,910.58 £124.51 £0.00 £124.51
Grand Total £33,675.85 £31,070.25 £2,605.60 £1,261.94 £1,343.67
Flash report based on activity for selected dates and sub categories only
Gap Cost: £2,605.60 Gap %: 2.49
KFC UK - Strictly Confidential 7 / 7
Inventory Activity Report
KFC UK
Generated at: 11/06/2023
Restaurant: FARNBOROUGH - VICTORIA RD - 11037
From 01/05/2023 to 31/05/2023
Sorted By Description`)
