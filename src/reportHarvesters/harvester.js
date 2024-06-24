import InventoryProduct from "./inventoryProduct.js";

export default class Harvester {
  constructor(utils) {
    this.dateUtil = utils.dateUtil;
    this.stringUtil = utils.stringUtil;
    this.objUtil = utils.objUtil;
  }
  reportHarvest(report) {
    const rmfPageProductPattern = /(?<productCode>\d{3,7})[-\s]+(?<product>.+?)[\t]+(?<productCase>[-\w\s.]+?)[\s]+(?<order>[\d.]+)[\s-]+(?<orQ>[\d.]+)[-\s]+(?<productPrice>[\d.]+)[-\s]+(?<previousOrderQuantity>[\d.]+)[\s-]+\(?(?<prevOrderDate>[\w\s]*)\)?[-\s*]*(?<prevWEnding>[\w\s]+)[-\s*]+(?<previousWeeksUsage>[\d.]+)[-\s*]+(?<onHand>[\d.]+)[-\s*]+(?<onOrder>[\d.]+)[-\s*]+/g;


      const unprocessedOrderReportProductPattern = /(?<productCode>\d{3,7})[-\s]+(?<product>[\s\S]{2,50}?)[-\s]+(?<onHand>[\d.]+)[-\s]+(?<order>[\d.]+)[\s-](?<productCase>[-\w\s.]+?)[\s]+(?<price>[\d.]+)[\s-](?<extPrice>[\d.]+)/g;

    let reportProducts = {};

    // Match products from report
    let match;
    while ((match = rmfPageProductPattern.exec(report)) !== null) {
      if (!reportProducts.hasOwnProperty(match.groups.product)) {
        //Get Case specifics data
        // console.log(match.groups.product);
        let caseRaw = match.groups.case
          .trim()
          .toLowerCase()
          .split("case-")
          .join("");
        let numPattern = /[\d.,]+/g;
        let caseValues = caseRaw
          .match(numPattern)
          .map((el) => Number(el.split(",").join("")));
        caseValues = caseValues.reduce((acc, curr) => (acc *= curr));
        let unitPattern = /[A-WYZa-wyz]+/g;
        let units = caseRaw.match(unitPattern);

        if (units && units.find((x) => x === "ml" || x === "g")) {
          caseValues /= 1000;
        }

        //Check if product exists in productUsage database!
        //if it does update its safeQuantity!

        let safeQuantity = 0;
        let sustainAmount = 0;
        let quotaReverse = false;
        let dailyUse = 0;
        let isBreak = false;
        // for (let group in productPreference) {
        //     if (isBreak) {
        //         break;
        //     }
        //     for (let product in productPreference[group]) {
        //             let splitter = /\W+/;
        //             let nameMatch = product.split(splitter);
        //             let matchCheck = nameMatch.filter(el => match.groups.product.includes(el));
        //             if (matchCheck.length === nameMatch.length) {
        //                 safeQuantity = productPreference[group][product].safeQuantity;
        //                 if (productPreference[group][product].hasOwnProperty("sustainAmount")) {
        //                     sustainAmount = productPreference[group][product].sustainAmount;
        //                 }
        //                 if (productPreference[group][product].hasOwnProperty("quotaReverse")) {
        //                     quotaReverse = productPreference[group][product].quotaReverse
        //                 }
        //                 if (productPreference[group][product].hasOwnProperty("dailyUse")) {
        //                     dailyUse = productPreference[group][product].dailyUse
        //                 }
        //                 // delete productPreference[group][product];
        //                 isBreak = true;
        //                 break;
        //             }
        //     }
        //     }
        if (match.groups.contingency === undefined) {
          reportProducts[match.groups.product] = {
            orderCase: caseValues,
            price: Number(match.groups.productPrice),
            previousOrderQuantity: Number(match.groups.previousOrderQuantity),
            previousOrderDate: `${match.groups.previousOrderQuantityYear}/${match.groups.previousOrderQuantityMonth}/${match.groups.previousOrderQuantityDay}`,
            previousWeeksUsage: Math.max(Number(match.groups.previousWeeksUsage), 0),
            onHand: Math.max(Number(match.groups.onHand), 0),
          };
        }
      }
    }

    return Object.keys(reportProducts).length > 0 ? reportProducts : null;
  }

  inventoryHarvest(report) {
    // REGEX -----------------------------------------
    let reportDetailsPattern =
      /KFC\sUK[\w\s]+:\s[\d]{2}\D{1}[\d]{2}\D{1}[\d]{2,4}[\w\s]+:\s*(?<restaurant>[-\s\w]+)\s[-FromfROM\s]{3,7}(?<dateStart>[\d]{2}\D{1}[\d]{2}\D{1}[\d]{2,4})[\s\w]{2,5}(?<dateEnd>[\d]{2}\D{1}[\d]{2}\D{1}[\d]{2,4})/;

    let reportCategoryPattern = /\d{1,2}[-]+(?<category>[A-Za-z\s]{2,30})\s[\s\S]+?Total/g;

    let productPattern = /(?<productCode>\d{1,7})\s(?<product>[A-Z]{2}[-.\w\s+\(\)\/&]{2,45})\s((?<individual>[eaEA]{2}|[KGkg]{2}|[pORTIONSPortions]{7,8}|[lL]{1})|(?<case>[PKpk]{2}|[BGbg]{2}|[HDhd]{2}|[-HDhd\s\d]{4,}|[BTLbtl]{2,3}|[CASEcase]{4}|[lL]{1})(?:[-\s]*(?<caseAmount>[\d\w.]+)?))[-\s]+(?<beginInventory>[\n\d.,]+)[-\s]+(?<transferIn>[\n\d.,]{4,})[-\s]+(?<transferOut>[\n\d.,]{4,})[-\s]+(?<purchases>[\n\d.,]{4,})[-\s]+(?<endInventory>[\n\d.,]{4,})[-\s]+(?<actual>[\n\d.,]{4,})[-\s]*(?<actualCost>£[\n*\d.,]{4,})[-\s]+(?<theoretical>[\n\d.,]{4,})[-\s]*(?<theoreticalCost>£[\n*\d.,]{4,})[-\s]+(?<variance>[\n\d.,]{4,})[-\s]*(?<varianceCost>£[\n*\d.,]{4,})[-\s]+(?<waste>[\n\d.,]{4,})[-\s]*(?<wasteCost>£[\n*\d.,]{4,})[-\s]+(?<missing>[\n\d.,]{4,})[-\s]*(?<missingCost>£[\n*\d.,]{4,})[-\s]+(?<eff>[\d.,]{4,})/g;


    //-----------------------------------------------------REGEX

    let categoryData = {};
    let categoryMatch;

    while ((categoryMatch = reportCategoryPattern.exec(report)) !== null) {
      let categoryName = categoryMatch.groups.category.trim().toUpperCase();
        categoryData[categoryName] = categoryMatch[0].trim();
        InventoryProduct.inventoryRecord[categoryName] = {};
    }

    // Get report details data (day span and store name)
    let reportMatch = report.match(reportDetailsPattern);
    if (reportMatch !== null) {
      InventoryProduct.storeName = reportMatch.groups.restaurant.trim();
      InventoryProduct.reportStartDate = this.dateUtil
        .op(reportMatch.groups.dateStart.trim())
        .format();
      InventoryProduct.reportEndtDate = this.dateUtil
        .op(reportMatch.groups.dateEnd.trim())
        .format();
      InventoryProduct.reportDaySpan = this.dateUtil.dateDifference(
        InventoryProduct.reportStartDate,
        InventoryProduct.reportEndtDate
      );
    }
    console.log(InventoryProduct);

    //Main product matching
    let match;
    while ((match = productPattern.exec(report)) !== null) {
      let product = match.groups.product.trim();
      //Find in which category the current product belongs
      let category = Object.entries(categoryData).find((x) =>
        x[1].includes(product)
      )[0];
      product = this.stringUtil.removeSpecialChars(product);
      if (!InventoryProduct.inventoryRecord[category].hasOwnProperty(product)) {
        InventoryProduct.inventoryRecord[category][product] = {};
      }

      //Get Delivery case values
      let orderCase = 0;

      //Check product case specifics and do conversions;

      let productCase = match.groups.case
        ? match.groups.case.toUpperCase()
        : match.groups.individual.toUpperCase();
      //TODO: Handle values where multiplication is given instead of actual case Example SAUCE TERIYAKI
      let caseValue = match.groups.caseValue;
      let caseUnit = match.groups.caseUnit
        ? match.groups.caseUnit.toLowerCase()
        : match.groups.caseUnit;
      //Assign value vars
      let beginInventory = this.stringUtil.stringToNumber(
        match.groups.beginInventory
      );
      let transferIn = this.stringUtil.stringToNumber(match.groups.transferIn);
      let transferOut = this.stringUtil.stringToNumber(
        match.groups.transferOut
      );
      let purchases = this.stringUtil.stringToNumber(match.groups.purchases);
      let endInventory = this.stringUtil.stringToNumber(
        match.groups.endInventory
      );
      let actual = this.stringUtil.stringToNumber(match.groups.actual);
      let actualCost = this.stringUtil.stringToNumber(match.groups.actualCost);
      let theoretical = this.stringUtil.stringToNumber(
        match.groups.theoretical
      );
      let theoreticalCost = this.stringUtil.stringToNumber(
        match.groups.theoreticalCost
      );
      let variance = this.stringUtil.stringToNumber(match.groups.variance);
      let varianceCost = this.stringUtil.stringToNumber(
        match.groups.varianceCost
      );
      let waste = this.stringUtil.stringToNumber(match.groups.waste);
      let wasteCost = this.stringUtil.stringToNumber(match.groups.wasteCost);
      let missing = this.stringUtil.stringToNumber(match.groups.missing);
      let missingCost = this.stringUtil.stringToNumber(
        match.groups.missingCost
      );
      let eff = this.stringUtil.stringToNumber(match.groups.eff);

      new InventoryProduct({
        product,
        category,
        beginInventory,
        transferIn,
        transferOut,
        purchases,
        endInventory,
        actual,
        actualCost,
        theoretical,
        theoreticalCost,
        variance,
        varianceCost,
        waste,
        wasteCost,
        missing,
        missingCost,
        eff,
        productCase,
        caseValue,
        caseUnit,
        orderCase}
      );
    }
    return InventoryProduct.inventoryRecord;
  }

  salesSummaryExtractor(report) {
    let salesSummaryExtractDataPattern =
      /\b(?<=[A-Z][a-z]{2},\s)(?<day>\d{2})-(?<month>[A-Z][a-z]{2})-(?<year>\d{4})\s(?<grossSales>[\d\.,]+)\s(?<tax>[\d.,]+)\s(?<netSales>[\d.,]+)\s(?<transactions>[\d.,]+)\b/g;

    const salesSummaryRecord = new Map();
    const months = this.dateUtil
      .getMonths([], { short: true })
      .map((month) => this.stringUtil.toPascalCase(month));
    if (!salesSummaryExtractDataPattern.test(report)) return null;

    let salesDateMatch;
    while (
      (salesDateMatch = salesSummaryExtractDataPattern.exec(report)) !== null
    ) {
      const { day, month, year } = salesDateMatch.groups;
      let currDate = `${year}/${months.indexOf(month)}/${day}`;

      if (!salesSummaryRecord.hasOwnProperty(currDate)) {
        salesSummaryRecord.set(currDate, {
          salesTotal: this.stringUtil.stringToNumber(
            salesDateMatch.groups.netSales
          ),
          transactionsTotal: this.stringUtil.stringToNumber(
            salesDateMatch.groups.transactions
          ),
        })
      }
    }
    return salesSummaryRecord;
  }

  hourlySalesExtractor(report) {
    let hourlySalesExtractDatePattern =
      /\b(?<=Data as of: )(?<date_day_from>\d{1,2})\/(?<date_month_from>\d{2})\/(?<date_year_from>\d{4}) - (?<date_day_to>\d{1,2})\/(?<date_month_to>\d{2})\/(?<date_year_to>\d{4})\b/;

    let hourlySalesExtractDataPattern =
      /\b(?<time_hour>\d{2}):\d{2}\s-\s(?:\d{2}:\d{2} )(?<customer_count>[\d,.]+)\s(?<item_count>[\d,.]+)\s(?<hourly_sales>[\d,.]+)\s(?<percent_total_sales>[\d,.]+)%\s(?<hourly_sales_cumulative>[\d,.]+)\s(?<hourly_ticket_average>[\d,.]+)\s(?<average_price_sales_item>[\d,.]+)\b/g;

    class SalesRecord {
      constructor(startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.hours = [];
        for (let h = 0; h < 24; h++) {
          this.hours[h] = {
            hourlySales: 0,
            hourlySalesCumulative: 0,
            hourlyTicketAverage: 0,
            transactions: 0,
          };
        }
      }
    }

    let dateCheck = report.match(hourlySalesExtractDatePattern);
    if (dateCheck === null) return null;
    const reportStartDate = `${dateCheck.groups.date_year_from}/${dateCheck.groups.date_month_from}/${dateCheck.groups.date_day_from}`;
    const reportEndDate = `${dateCheck.groups.date_year_to}/${dateCheck.groups.date_month_to}/${dateCheck.groups.date_day_to}`;
    const hourlySalesRecord = new SalesRecord(reportStartDate, reportEndDate);

    let dataMatch;
    while ((dataMatch = hourlySalesExtractDataPattern.exec(report)) !== null) {
      let hour = Number(dataMatch.groups.time_hour);
      hourlySalesRecord.hours[hour] = {
        transactions: this.stringUtil.stringToNumber(
          dataMatch.groups.customer_count
        ),
        hourlySales: this.stringUtil.stringToNumber(
          dataMatch.groups.hourly_sales
        ),
        cumulativeSales: this.stringUtil.stringToNumber(
          dataMatch.groups.hourly_sales_cumulative
        ),
        ticketAverage: Number(dataMatch.groups.hourly_ticket_average),
      };
    }

    const totals = {
      transactions: 0,
      sales: 0,
      ticketAverage: 0,
      workHours: 0,
    };
    for (let hour of hourlySalesRecord.hours) {
      if (!this.objUtil.isEmpty(hour)) {
        totals.transactions += hour.transactions;
        totals.sales += hour.hourlySales;
        totals.ticketAverage += hour.ticketAverage;
        totals.workHours = hour.ticketAverage
          ? totals.workHours + 1
          : totals.workHours;
      }
    }
    totals.ticketAverage /= totals.workHours;

    return { ...hourlySalesRecord, totals };
  }

  purchaseOrderHarvest(report) {
    const edgeConfirmPattern = /\sEXT. PRICE UNIT PRICE U\/M QTY DESCRIPTION VENDOR CODE/g;
    const chromeConfirmPattern = /VENDOR CODE DESCRIPTION QTY U\/M UNIT PRICE EXT. PRICE/g;

    const chromePattern = /((?<productCode>\d{4,7})\s\2|\d{4,7})\s-\s(?<productName>[\w\s\(\)\/.,]+)\s(?<amount>[\d.]+)\s(?<productCase>CASE-[\d\w.]+)\s(?<price>[\d.]+)\s(?<extPrice>[\d.]+)/g;
    const edgePattern = /(?<productCode>\d{4,7})\s-\s(?<productName>[\w\s\(\)\/.,]+)\s(?<extPrice>[\d.]+)\s(?<productCase>CASE-[\d\w.]+)\s(?<amount>[\d.]+)\s(?<productCode1>\d{4,7})\s(?<price>[\d.]+)/g;
    
    let products;
    if (report.match(edgeConfirmPattern) !== null) {
      products = report.matchAll(edgePattern); 
    }else if (report.match(chromeConfirmPattern) !== null) {
      products = report.matchAll(chromePattern); 
    }

    for (let product of products) {
      const { amount, productCase, extPrice, price, productCode, productName } = product.groups;
      console.log({ amount, productCase, extPrice, price, productCode, productName });
    }


  }
}
