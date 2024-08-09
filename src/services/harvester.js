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
    const rmfUnprocessedProductPattern = /(?<code>\d{3,7})[-\s]+(?<product>.+?)[\t]+(?<case>[-\w\s.]+?)\t(?<order>[-\s]+[\d.]+)(?<orQ>[-\s]+[\d.]*)(?<price>[-\s]*[\d.]+)[-\s]+((?<lastOrderQuantity>[-\s]*[\d.]+)[\s-]+\(?(?<prevOrderDate>[\w\s]*)\)?[-\s*]*(?<prevWEnding>[\w\s]+)[-\s*]*(?<previousWeeksUsage>[-\s]*[\d.]+)[-\s*]*(?<onHand>[-\s]*[\d.]+)[-\s*]*(?<onOrder>[-\s]*[\d.]+)[-\s*]+|[\*\s]+)/g;

    const unprocessedOrderReportConfirmPattern = /Unprocessed Order/g;
    const unprocessedOrderReportProductPattern = /(?<code>\d{3,7})[-\s]+(?<product>[\s\S]{2,50}?)(?<onHand>[-\s]+[\d.]{3,})(?<order>[-\s]+[\d.]+)[-\s]+(?<case>[-\w\s.]{4,}?)(?<price>[-\s]+[\d]+\.\d+)(?<extPrice>[-\s]+[\d.]{4,})/g;

    let productMatches;
    if(report.match(rmfUnprocessedConfirmPattern)) {
      productMatches = [...report.matchAll(rmfUnprocessedProductPattern)];
    } else if (report.match(unprocessedOrderReportConfirmPattern)) {
      productMatches = [...report.matchAll(unprocessedOrderReportProductPattern)];
    }
    const reportData = {
      importDate: this.dateUtil.op(new Date()).format({asString: true, delimiter: '-'}),
    }
    const productData = this.formatToBaseUnit(productMatches);
    return { productData, reportData }
  }

  inventoryHarvest(report) {
    // REGEX -----------------------------------------
    let reportDetailsPattern = /Restaurant: (?<storeName>[\s\S]+?)[-\s]+From[-\s]+(?<startDate>[\d\/]+)[-\s]+to[-\s]+(?<endDate>[\w\/]+)/;

    let reportCategoryPattern = /\d{1,2}[-]+(?<category>[A-Za-z\s]{2,30})\s[\s\S]+?Total/g;

    let productPattern = /(?<code>\d{1,7})[\s]+(?<product>[A-Z][\s\S]{2,50}?)(?<unit>[-\s]+[-.\w]+)(?<beginInventory>[-\s]+[\n\d.,]+)[-\s]+(?<transferIn>[\n\d.,]{4,})[-\s]+(?<transferOut>[\n\d.,]{4,})[-\s]+(?<purchases>[\n\d.,]{4,})[-\s]+(?<endInventory>[\n\d.,]{4,})[-\s]+(?<actual>[\n\d.,]{4,})(?<actualCost>[-\s]*£[\n*\d.,]{4,})[-\s]+(?<theoretical>[\n\d.,]{4,})(?<theoreticalCost>[-\s]*£[\n*\d.,]{4,})[-\s]+(?<variance>[\n\d.,]{4,})(?<varianceCost>[-\s]*£[\n*\d.,]{4,})[-\s]+(?<waste>[\n\d.,]{4,})(?<wasteCost>[-\s]*£[\n*\d.,]{4,})[-\s]+(?<missing>[\n\d.,]{4,})(?<missingCost>[-\s]*£[\n*\d.,]{4,})(?<eff>[-\s]+[\d.,]{4,})/g;
    //-----------------------------------------------------REGEX

    let productData = {};
    const categoryMatches = [...report.matchAll(reportCategoryPattern)];

    //? Get report details data (day span and store name)
    let reportMatch = report.match(reportDetailsPattern);
    if (!reportMatch) {
      throw new Error('Wrong Data Provided!')
    }
    const startDate = this.dateUtil.op(reportMatch.groups.startDate.trim()).format();
    const endDate = this.dateUtil.op(reportMatch.groups.endDate.trim()).format();
      const reportData = {
        startDate: this.dateUtil.op(startDate).format({asString: true, delimiter: '-'}),
        endDate: this.dateUtil.op(endDate).format({asString: true, delimiter: '-'}),
        importDate: this.dateUtil.op(new Date()).format({asString: true, delimiter: '-'}),
        storeName: reportMatch.groups.storeName.trim(),
        daySpan: this.dateUtil.dateDifference(startDate, endDate) + 1
      }

    categoryMatches.forEach(categoryMatch => {
      const categoryName = categoryMatch.groups.category.trim().toUpperCase();
      const rawData = categoryMatch[0].trim();
      const productMatches = [...rawData.matchAll(productPattern)];
      productData[categoryName] = this.formatToBaseUnit(productMatches);
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
    const productData = this.formatToBaseUnit(productMatches);

    const reportData = {
      importDate: this.dateUtil.op(new Date()).format({asString: true, delimiter: '-'}),
    }

    return {productData, reportData};
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

  formatToBaseUnit(productMatches) {
    let productData = {};
    productMatches.forEach(match => {
      try {
          const product = this.stringUtil.removeSpecialChars(match.groups.product.trim())
          .toUpperCase()
          if (product.includes('SAUCE BUTTERMILK DRESSING')) {
            console.log(product);
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
          const convertedProps = this.unitConverter.addUnitPrice(props);
          productData[product] = { ...convertedProps, reportName: match.groups.product };
      } catch(err) {
          console.log(`Match error: `, err);
          console.log(match?.groups?.product);
          return;
      }
     
    })
    return productData;
  }

  inventoryPairs(inventoryProducts, importProducts) {
    // Match products
    const productRefs = {};
    const matched = {};
    const unmatchedInventory = {};
    const importGroups = new Map();
    const groupWords = (wordArr, productName) => {
      wordArr.forEach(word => {
        if (!importGroups.has(word)) {
          importGroups.set(word, []);
        }
        importGroups.get(word).push(productName);
      });
    }
    const toWordArr = ( productName ) => productName.split(' ').map(el => el.trim().toUpperCase());
    const getImportGroupProducts = (wordArr) => {
      const products = new Set();
      wordArr.forEach(word => {
        if (importGroups.has(word)) {
          importGroups.get(word).forEach(product => products.add(product));
        }
      });
      return [...products];
    }
    const sortCandidates = ((a, b) => {
      if (b.matchedWords.length - a.matchedWords.length === 0) {
        return b.score - a.score;
      } 
        return b.matchedWords.length - a.matchedWords.length
    });
    const unmatchedImport = Object.keys(importProducts).reduce((obj, prodName) => {
      const words = toWordArr(prodName);
      groupWords(words, prodName);
      obj[prodName] = { words };
      return obj;
    }, {});

    for (let category in inventoryProducts) {
      for (let invProduct in inventoryProducts[category]) {
        if (importProducts.hasOwnProperty(invProduct)) {
          //? Match same named products
          matched[invProduct] = invProduct;
          productRefs[invProduct] = {isMatched: true, group: 'inventory'};
          continue;
        }
          unmatchedInventory[invProduct] = { words: toWordArr(invProduct) };
          const invWordArr = unmatchedInventory[invProduct].words;
          const importProductsGroup = getImportGroupProducts(invWordArr);
          //? Match available import candidates
          for(let product of importProductsGroup) {
            if (productRefs?.[product]?.isMatched) continue;

              const importWordArr = unmatchedImport[product].words;
              const [matchedWords, unmatchedWords, score] = this.stringUtil.matchWords(invWordArr, importWordArr);
              if (matchedWords.length) {
                if (!unmatchedInventory[invProduct].hasOwnProperty('candidates')) {
                  unmatchedInventory[invProduct].candidates = [];
                }
                productRefs[product] = {isMatched: false, group: 'import'};
                unmatchedInventory[invProduct].candidates.push({ matchedWords, unmatchedWords, product, score});
                if (!unmatchedImport[product].hasOwnProperty('candidates')) {
                  unmatchedImport[product].candidates = [];
                }
                productRefs[invProduct] = {isMatched: false, group: 'inventory'};
                unmatchedImport[product].candidates.push({ matchedWords, unmatchedWords, product: invProduct, score }) 
              }
          }
          //? sort inventory product candidates
          if (unmatchedInventory[invProduct].hasOwnProperty('candidates')) {
            unmatchedInventory[invProduct].candidates.sort(sortCandidates);
          }
    }
  }
  //? sort import product candidates
  for (let product in unmatchedImport) {
    if (!unmatchedImport?.[product]?.candidates) continue;
    unmatchedImport[product].candidates.sort(sortCandidates);
  }
  
  // combine matches data
  const inventoryArr = Object.keys(unmatchedInventory);
  const unmatchedProducts = new Set();
  const usedIndexes = new Set();

  const findUnmatched = () => inventoryArr.find((product) => productRefs?.[product]?.isMatched === false && !unmatchedProducts.has(product));
  const findInventoryIndex = (productName) => inventoryArr.findIndex((product) => product === productName);
  const matchProducts = (productName) => {
    const ref = productRefs[productName];
    if (ref.isMatched) return null;
    const [hostProductGroup, targetProductGroup] = ref.group === 'inventory' ? [unmatchedInventory, unmatchedImport] : [unmatchedImport, unmatchedInventory];
    const hostProduct = hostProductGroup[productName];
    for (let targetProduct of hostProduct.candidates) {
      if (productRefs[targetProduct.product].isMatched) continue;
      const targetName = targetProduct.product;
      const target = targetProductGroup[targetName];
      if (!target) continue;
      for (let targetCandidate of target.candidates) {
        if (productRefs[targetProduct.product].isMatched) break;
        if (productRefs[targetCandidate.product].isMatched) continue;
        if (targetCandidate.product === productName) {
          productRefs[productName].isMatched = true;
          productRefs[targetName].isMatched = true;
          const [inventoryProductName, importProductName] = ref.group === 'inventory' ? [productName, targetName] : [targetName, productName];
          const inventoryIndex = findInventoryIndex(inventoryProductName)
          usedIndexes.add(inventoryIndex);
          matched[inventoryProductName] = importProductName;
          return;
        } else {
          matchProducts(targetCandidate.product);
        }
      }
    }
    unmatchedProducts.add(productName);
  }
  
  while(usedIndexes.size < inventoryArr.length - unmatchedProducts.size){
      const product = findUnmatched();
      if (!product) break;
      matchProducts(product)  ;
  }
  return matched;
  }
}

  