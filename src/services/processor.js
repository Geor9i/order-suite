import { utils } from "../utils/utilConfig.js";
import { v4 as uuid } from 'uuid';
import { db } from '../constants/db.js';
export default class Processor {
  constructor(firestoreService) {
    this.firestoreService = firestoreService;
    this.dateUtil = utils.dateUtil;
    this.timeUtil = utils.timeUtil;
    this.objUtil = utils.objUtil;
    this.stringUtil = utils.stringUtil;
    this.placementDate = new Date();
    this.productCounter = 0;
    this.orderProducts = {};
  }
 
  nextOrder(data) {
    const weekdayGuide = this.dateUtil.getWeekdays([]);
    this.productData = data.inventory.productData;
    this.reportData = data.inventory.reportData;
    const reportEndDate = new Date(this.reportData.endDate);
    const longTermInventoryRecords = this.firestoreService.userData[db.INVENTORY][db.INVENTORY_RECORDS][db.INVENTORY_ACTIVITY];
    this.longTermInventoryReport = longTermInventoryRecords[Object.keys(longTermInventoryRecords)[0]].reportData;
    this.longTermInventoryRecord = longTermInventoryRecords[Object.keys(longTermInventoryRecords)[0]].productData;
    this.openOrders = this.openOrdersRefs(this.productData, data.openOrders);
    this.deliveryDate = data.date;
    this.previousSales = Number(data.previousSales);
    this.salesForecast = Number(data.salesForecast);
    this.storeTemplate = this.firestoreService.userData[db.STORE_SETTINGS];
    const workDayCount = Object.keys(this.storeTemplate.weekdays).length;
    this.salesData = this.firestoreService.userData[db.SALES_DATA][db.HOURLY_SALES];
    const purchaseProductReports = this.firestoreService.userData[db.INVENTORY][db.INVENTORY_RECORDS][db.PURCHASE_PRODUCTS];
    this.purchaseProducts = purchaseProductReports[Object.keys(purchaseProductReports)[0]].productData;
    this.activeDaySpan = this.getActiveProductUsageDateSpan(reportEndDate, this.deliveryDate);
    this.purchaseRefs = this.inventoryPairs(this.productData, this.purchaseProducts);
    const productUsage = {};
    for (let category in this.productData) {
      for (let product in this.productData[category]) {
        if (!this.purchaseRefs[product]) continue;
       if (product === 'CHICKEN ORIGINAL PIECES') {
        debugger
       }
        const productData = this.productData[category][product];
        const longTermData = this.longTermInventoryRecord[category][product] || productData;
        const purchaseData = this.purchaseProducts[this.purchaseRefs[product]];
        
        console.log('productData: ', productData);
        console.log('longTermInventoryRecord: ', longTermData);
        console.log('purchaseProduct: ', purchaseData);
        let actualAverage = 0;
        if (!longTermData.theoretical) {
          actualAverage = (longTermData.actual / this.longTermInventoryReport.daySpan) * workDayCount;
        } else {
          actualAverage = longTermData.actual / (longTermData.theoretical || 1);
        }
        let usageRate;
        if (product === 'CHICKEN ORIGINAL PIECES') {
          let darkChickenProductData = this.longTermInventoryRecord[category]['CHICKEN ORIGINAL DARK MEAT'];
          actualAverage = (longTermData.actual + darkChickenProductData.actual) / (longTermData.theoretical || 1);
          usageRate = (((productData.theoretical * productData.unit.value) || 1) * actualAverage) / this.previousSales;
        }else {
          usageRate = (((productData.theoretical * productData.unit.value) || 1) * actualAverage) / this.previousSales;
        }
        this.orderProducts[product] = {
          onHand: productData.endInventory,
          usageRate,
          order: 0
        };
        
        productUsage[product] = new Map();
        for (let date of this.activeDaySpan) {
          const dateString = this.dateUtil.op(date).format({asString: true, delimiter: '-'});

          let incomingAmount = 0;
          if (this.openOrders[dateString]) {
            const openOrders = this.openOrders[dateString];
            openOrders.forEach(order => {
              const productRef = order.refs[product];
              if (!productRef) return;
              const inComingProduct = order.productData[productRef];
              incomingAmount += inComingProduct.amount * inComingProduct.case.value;
            })
          }

          const isDeliveryDate = this.dateUtil.compare(this.deliveryDate, date);
          const weekday = weekdayGuide[this.dateUtil.getDay(date)];
          const salesShare = this.salesData[weekday].share;
          const expectedSales = this.salesForecast * (salesShare / 100);
          const usage = this.orderProducts[product].usageRate * expectedSales;
          let onHand = isDeliveryDate ? Math.max(this.orderProducts[product].onHand, 0) : this.orderProducts[product].onHand;
          if (incomingAmount > 0) {
            onHand = Math.max(0, onHand) + incomingAmount;
          }
          this.orderProducts[product].onHand = onHand - usage;
          productUsage[product].set(date, {
            usage,
            onHand: this.orderProducts[product].onHand,
          })
        }
        const usageArr = [...productUsage[product]];
        const remaining = usageArr[usageArr.length - 1][1].onHand;
        if (remaining <= 0) {
          this.orderProducts[product].order = Math.ceil(Math.abs(remaining) / purchaseData.case.value);
        }
      }
    }
    console.log(this.orderProducts);

    
    return this.orderProducts;
  }

  openOrdersRefs(inventoryProducts, orderProducts) {
    const orderDatesArr = Object.keys(orderProducts);
    if (!orderDatesArr.length) return orderProducts;

    orderDatesArr.forEach(arrivalDate => {
      const orders = orderProducts[arrivalDate];
      orders.forEach((order, orderIndex) => {
        orderProducts[arrivalDate][orderIndex].refs = this.inventoryPairs(inventoryProducts, order.productData);
      })
    })
    return orderProducts;
  }

  currentWorkHoursPercentage() {
    const date = new Date();
    const weekdays = this.dateUtil.getWeekdays([]);
    let currentWeekday = date.getDay() - 1;
    currentWeekday = currentWeekday <= 0 ? weekdays[6] : weekdays[currentWeekday]
    const { startTime, endTime } = this.storeSettings.openTimes[currentWeekday];
    let lzH = date.getHours() < 10 ? "0" : "";
    let lzM = date.getMinutes() < 10 ? "0" : "";
    let currentTime = `${lzH}${date.getHours()}:${lzM}${date.getMinutes()}`;
    let totalWorkHours = this.time().timeSpanLength(startTime, endTime);
    if (this.time(currentTime).isWithin(startTime, endTime)) {
      let workHours = this.math().deduct(currentTime, startTime);
      return this.math().divide(workHours, totalWorkHours, {
        percentage: true,
      });
    } else if (this.time(currentTime).isLessEqThan(endTime)) {
      return 0;
    } else if (this.time(currentTime).isBiggerEqThan(endTime)) {
      return 1;
    }
  }
   
  getActiveProductUsageDateSpan(startDate, deliveryDate) {
    const weekGuide = this.dateUtil.getWeekdays([]).map((_, i) => i + 1);
    const orderDays = this.getOrderDays();
    const deliveryDayIndex = orderDays.indexOf(deliveryDate.getDay());
    let daySpan = 0;
    const startIndex = weekGuide.indexOf(orderDays[deliveryDayIndex]);
    let initial = true;
    for (let i = startIndex;i < weekGuide.length; i++) {
      if (i === weekGuide.length - 1) {
        i = 0;
        daySpan++;
      }
      if (!initial && orderDays.includes(i + 1)) break;
      initial = false;
      daySpan++;
    }
    console.log(daySpan);
    const nextOrderDeliveryDate = new Date(new Date(deliveryDate).setDate(deliveryDate.getDate() + daySpan));
    const nextOrderDate = nextOrderDeliveryDate.getDate();
    let currentDateObj = new Date(startDate);
    const dateArr = [currentDateObj];
    while(currentDateObj.getDate() !== nextOrderDate) {
      currentDateObj = new Date(new Date(currentDateObj).setDate(currentDateObj.getDate() + 1)); 
        dateArr.push(currentDateObj);
    }
    return dateArr;
  }

  getOrderDays() {
    const weekdayGuide = this.dateUtil.getWeekdays([]);
    return Object.keys(this.storeTemplate.weekdays)
    .filter(day => this.storeTemplate.weekdays[day].hasDelivery)
    .map(day => weekdayGuide.indexOf(day) + 1)
    .sort((a, b) => a - b);

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
        // if (invProduct.includes('CHICKEN ORIGINAL')) {
        //   debugger
        // }
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
