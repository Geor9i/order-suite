import { utils } from '../utils/utilConfig';
export default class Harvester {
    constructor() {
      this.dateUtil = utils.dateUtil;
      this.stringUtil = utils.stringUtil;
      this.objUtil = utils.objUtil;
      this.unitConverter = utils.unitConverter;
    }
    unprocessedOrderHarvest(report) {
      const rmfUnprocessedConfirmPattern = /MacromatiX/g;
      const rmfUnprocessedProductPattern =/(?<code>\d{3,7})[-\s]+(?<product>.+?)[\t]+(?<case>[-\w\s.]+?)\t(?<order>[-\s]+[\d.]+)(?<orQ>[-\s]+[\d.]*)(?<price>[-\s]*[\d.]+)[-\s]+((?<lastOrderQuantity>[-\s]*[\d.]+)[\s-]+\(?(?<prevOrderDate>[\w\s]*)\)?[-\s*]*(?<prevWEnding>[\w\s]+)[-\s*]*(?<previousWeeksUsage>[-\s]*[\d.]+)[-\s*]*(?<onHand>[-\s]*[\d.]+)[-\s*]*(?<onOrder>[-\s]*[\d.]+)[-\s*]+|[\*\s]+)/g;
  
      const unprocessedOrderReportConfirmPattern = /Unprocessed Order/g;
      const unprocessedOrderReportProductPattern = /(?<code>\d{3,7})[-\s]+(?<product>[\s\S]{2,50}?)(?<onHand>[-\s]+[\d.]+)(?<order>[-\s]+[\d.]+)[-\s]+(?<case>[-\w\s.]{5,}?)(?<price>[-\s]+[\d.]{4,})(?<extPrice>[-\s]+[\d.]+)/g;
  
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
  
      let productPattern = /(?<code>\d{1,7})[\s]+(?<product>[A-Z][\s\S]{2,50}?)(?<unit>[-\s]+[-.\w]+)(?<beginInventory>[-\s]+[\n\d.,]+)(?<transferIn>[-\s]+[\n\d.,]{4,})(?<transferOut>[-\s]+[\n\d.,]{4,})(?<purchases>[-\s]+[\n\d.,]{4,})(?<endInventory>[-\s]+[\n\d.,]{4,})(?<actual>[-\s]+[\n\d.,]{4,})(?<actualCost>[-\s]*£[\n*\d.,]{4,})(?<theoretical>[-\s]+[\n\d.,]{4,})(?<theoreticalCost>[-\s]*£[\n*\d.,]{4,})(?<variance>[-\s]+[\n\d.,]{4,})(?<varianceCost>[-\s]*£[\n*\d.,]{4,})(?<waste>[-\s]+[\n\d.,]{4,})(?<wasteCost>[-\s]*£[\n*\d.,]{4,})(?<missing>[-\s]+[\n\d.,]{4,})(?<missingCost>[-\s]*£[\n*\d.,]{4,})(?<eff>[-\s]+[\d.,]{4,})/g;
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
  
      const chromePattern = /(?<code>\d{4,7})[-\s]+(\d{4,7})?[-\s]+(?<product>[\s\S]{2,50}?)[-\s]+(?<amount>[\d.]{4,})(?<case>[-\s]+[-\w.]+)(?<price>[-\s]+[\d.]+)(?<extPrice>[-\s]+[\d.]+)/g;
      const edgePattern = /(?<code>\d{4,7})[-\s]+(?<product>[\s\S]{2,50}?)(?<extPrice>[-\s]+[\d.]+)(?<case>[-\s]+[-\w.]+)(?<amount>[-\s]+[\d.]+)[-\s]+(\d{4,7})(?<price>[-\s]+[\d.]+)/g;
      
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
        try {
            
            const product = this.stringUtil.removeSpecialChars(match.groups.product.trim());
            if (product.includes('SLAW')) {
                console.log('here');
            }
            const props = Object.keys(match.groups).reduce((propObj, key) => {
              if (key === 'product') return propObj;
              let str = match.groups[key]?.trim();
              if (key === 'case' || key === 'unit') {
                  str = this.unitConverter.baseUnitFormat(str);
              } else {
                  str = this.stringUtil.stringToNumber(str);
              }
              propObj[key] = str;
              return propObj;
            }, {})
            const convertedProps = this.unitConverter.convertToUnitCost(props);
            productData[product] = { ...convertedProps, reportName: match.groups.product };
        }catch(err) {
            console.log(`Match error: `, err);
            console.log(match?.groups?.product);
            return;
        }
       
      })
      return productData;
    }
  }
  