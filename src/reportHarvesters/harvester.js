export default class Harvester {
  constructor(utils) {
    this.dateUtil = utils.dateUtil;
    this.stringUtil = utils.stringUtil;
    this.objUtil = utils.objUtil;
  }
  unprocessedOrderHarvest(report) {
    const rmfUnprocessedConfirmPattern = /MacromatiX/g;
    const rmfUnprocessedProductPattern = /(?<code>\d{3,7})[-\s]+(?<product>.+?)[\t]+(?<case>[-\w\s.]+?)[\s]+(?<order>[\d.]+)[\s-]+(?<orQ>[\d.]+)[-\s]+(?<price>[\d.]+)[-\s]+(?<lastOrderQuantity>[\d.]+)[\s-]+\(?(?<prevOrderDate>[\w\s]*)\)?[-\s*]*(?<prevWEnding>[\w\s]+)[-\s*]+(?<previousWeeksUsage>[\d.]+)[-\s*]+(?<onHand>[\d.]+)[-\s*]+(?<onOrder>[\d.]+)[-\s*]+/g;

    const unprocessedOrderReportConfirmPattern = /Unprocessed Order/g;
    const unprocessedOrderReportProductPattern = /(?<code>\d{3,7})[-\s]+(?<product>[\s\S]{2,50}?)[-\s]+(?<onHand>[\d.]+)[-\s]+(?<order>[\d.]+)[\s-](?<case>[-\w\s.]+?)[\s]+(?<price>[\d.]+)[\s-](?<extPrice>[\d.]+)/g;

    let productMatches;
    if(report.match(rmfUnprocessedConfirmPattern)) {
      productMatches = [...report.matchAll(rmfUnprocessedProductPattern)];
    } else if (report.match(unprocessedOrderReportConfirmPattern)) {
      productMatches = [...report.matchAll(unprocessedOrderReportProductPattern)];
    }

    return this.formatMatches(productMatches);
  }

  inventoryHarvest(report) {
    // REGEX -----------------------------------------
    let reportDetailsPattern = /Restaurant: (?<storeName>[\s\S]+?)[-\s]+From[-\s]+(?<startDate>[\d\/]+)[-\s]+to[-\s]+(?<endDate>[\w\/]+)/;

    let reportCategoryPattern = /\d{1,2}[-]+(?<category>[A-Za-z\s]{2,30})\s[\s\S]+?Total/g;

    let productPattern = /(?<code>\d{1,7})[\s]+(?<product>[A-Z][\s\S]{2,50}?)[-\s]+(?<unit>[-.\w]+)[-\s]+(?<beginInventory>[\n\d.,]+)[-\s]+(?<transferIn>[\n\d.,]{4,})[-\s]+(?<transferOut>[\n\d.,]{4,})[-\s]+(?<purchases>[\n\d.,]{4,})[-\s]+(?<endInventory>[\n\d.,]{4,})[-\s]+(?<actual>[\n\d.,]{4,})[-\s]*(?<actualCost>£[\n*\d.,]{4,})[-\s]+(?<theoretical>[\n\d.,]{4,})[-\s]*(?<theoreticalCost>£[\n*\d.,]{4,})[-\s]+(?<variance>[\n\d.,]{4,})[-\s]*(?<varianceCost>£[\n*\d.,]{4,})[-\s]+(?<waste>[\n\d.,]{4,})[-\s]*(?<wasteCost>£[\n*\d.,]{4,})[-\s]+(?<missing>[\n\d.,]{4,})[-\s]*(?<missingCost>£[\n*\d.,]{4,})[-\s]+(?<eff>[\d.,]{4,})/g;
    //-----------------------------------------------------REGEX

    let productData = {};
    let reportData = {};
    const categoryMatches = [...report.matchAll(reportCategoryPattern)];

    //? Get report details data (day span and store name)
    let reportMatch = report.match(reportDetailsPattern);
    if (reportMatch !== null) {
      const startDate = this.dateUtil.op(reportMatch.groups.startDate.trim()).format();
      const endDate = this.dateUtil.op(reportMatch.groups.endDate.trim()).format();
      reportData = {
        storeName: reportMatch.groups.storeName.trim(),
        startDate: startDate,
        endDate: endDate,
        daySpan: this.dateUtil.dateDifference( startDate, endDate )
      }
    }

    categoryMatches.forEach(categoryMatch => {
      const categoryName = categoryMatch.groups.category.trim().toUpperCase();
      const rawData = categoryMatch[0].trim();
      const productMatches = [...rawData.matchAll(productPattern)];
      productData[categoryName] = this.formatMatches(productMatches);
    })
   
    return {reportData, productData};
  }

  purchaseOrderHarvest(report) {
    const edgeConfirmPattern = /\sEXT. PRICE UNIT PRICE U\/M QTY DESCRIPTION VENDOR CODE/g;
    const chromeConfirmPattern = /VENDOR CODE DESCRIPTION QTY U\/M UNIT PRICE EXT. PRICE/g;

    const chromePattern = /(?<code>\d{4,7})[-\s]+(?<product>[\s\S]{2,50}?)[-\s]+(?<amount>[\d.]+)[-\s]+(?<case>[-\w.]+)[-\s]+(?<price>[\d.]+)[-\s]+(?<extPrice>[\d.]+)/g;
    const edgePattern = /(?<code>\d{4,7})[-\s]+(?<product>[\s\S]{2,50}?)[-\s]+(?<extPrice>[\d.]+)[-\s]+(?<case>[-\w.]+)[-\s]+(?<amount>[\d.]+)[-\s]+(\d{4,7})[-\s]+(?<price>[\d.]+)/g;
    
    let productMatches;
    if (report.match(edgeConfirmPattern) !== null) {
      productMatches = [...report.matchAll(edgePattern)]; 
    }else if (report.match(chromeConfirmPattern) !== null) {
      productMatches = [...report.matchAll(chromePattern)]; 
    }
    const productData = this.formatMatches(productMatches);

    return productData;
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


  formatMatches(productMatches) {
    let productData = {};
    productMatches.forEach(match => {
      const product = this.stringUtil.removeSpecialChars(match.groups.product.trim());
      const props = Object.keys(match.groups).reduce((propObj, key) => {
        if (key === 'product') return propObj;

        const str = this.stringUtil.stringToNumber(match.groups[key]);
        propObj[key] = str;
        return propObj;
      }, {})
      productData[product] = props;
    })
    return productData;
  }
}
