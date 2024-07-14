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
    const longTermInventoryRecords = this.firestoreService.userData[db.INVENTORY][db.INVENTORY_RECORDS][db.INVENTORY_ACTIVITY];
    this.longTermInventoryRecord = longTermInventoryRecords[Object.keys(longTermInventoryRecords)[0]].productData;
    this.openOrders = data.openOrders;
    this.deliveryDate = data.date;
    this.previousSales = Number(data.previousSales);
    this.salesForecast = Number(data.salesForecast);
    this.storeTemplate = this.firestoreService.userData[db.STORE_SETTINGS];
    this.salesData = this.firestoreService.userData[db.SALES_DATA][db.HOURLY_SALES];
    const purchaseProductReports = this.firestoreService.userData[db.INVENTORY][db.INVENTORY_RECORDS][db.PURCHASE_PRODUCTS];
    this.purchaseProducts = purchaseProductReports[Object.keys(purchaseProductReports)[0]].productData;
    this.activeDaySpan = this.getActiveOrderDaySpan(this.deliveryDate);
    this.purchaseRefs = this.inventoryPairs(this.productData, this.purchaseProducts);
    const productUsage = {};
    for (let category in this.productData) {
      for (let product in this.productData[category]) {
        if (!this.purchaseRefs[product]) continue;
       
        const productData = this.productData[category][product];
        const longTermData = this.longTermInventoryRecord[category][product];
        const purchaseData = this.purchaseProducts[this.purchaseRefs[product]];
        
        console.log('productData: ', productData);
        console.log('longTermInventoryRecord: ', longTermData);
        console.log('purchaseProduct: ', purchaseData);
        const actualAverage = longTermData.actual / longTermData.theoretical;

        this.orderProducts[product] = {
          onHand: productData.endInventory,
          usageRate: (productData.theoretical * actualAverage) / this.previousSales,
          order: 0
        };
        
        productUsage[product] = new Map();
        for (let date of this.activeDaySpan) {
          const weekday = weekdayGuide[this.dateUtil.getDay(date)];
          const salesShare = this.salesData[weekday].share;
          const expectedSales = this.salesForecast * (salesShare / 100);
          const usage = this.orderProducts[product].usageRate * expectedSales;
          const onHand = this.orderProducts[product].onHand;
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
      console.log(this.orderProducts);
    }

    
    return this.orderProducts;
  }

  productUsageDaily(prodMap, product) {
    //Check if there is incoming stock

    const productMap = new Map(prodMap);
    const p = { ...product };
    const { weekendSalesPercent } = this.storeSettings;
    const weekGuide = this.dateUtil.getWeekdays([]);
    // Estimate days to cover sales quota
    let weekdaySales = (100 - weekendSalesPercent) / 4;
    let weekendSales = weekendSalesPercent / 3;
    // Adjust previous weeks usage based on sales forecast!
    let usageRate = p.weeklyUsage / this.previousSales;
    p.weeklyUsage = usageRate * this.salesForecast;
    product.safeQuantity = p.weeklyUsage * 0.1;
    //DeliveryDay Reached marker
    let deliveryDayMarker = false;
    // map out usage and onHand within productMap
    for (let [key, object] of productMap.entries()) {
      //Check if this is a weekend day or weekday
      let [currentWeekday, currentDate] = key
        .split("<=>")
        .map((el) => el.trim());
      let weekdayNum = weekGuide.indexOf(currentWeekday) + 1;
      let currentUsage =
        p.weeklyUsage * ((weekdayNum >= 5 ? weekendSales : weekdaySales) / 100);
      //Adjust currentUsage based on time passed if current day is today
      if (currentDate === this.dateUtil.op(this.placementDate).format()) {
        currentUsage -= currentUsage * this.workHoursPercentage;
      }
      //  Upon reaching order reception date check if previous orders are still on the system and adjust order quantity
      if (p.productArrivalDate === currentDate) {
        if (
          !this.previousIsInvoiced ||
          (this.receivedToday !== true && this.receivedToday !== null)
        ) {
          p.onHand += p.lastOrderQuantity;
        }
      }

      // Zero out minus quantities that add up to onHand before deliveryDay
      deliveryDayMarker =
        currentDate === this.dateUtil.op(this.deliveryDate).format()
          ? true
          : deliveryDayMarker;
      if (p.onHand <= 0 && !deliveryDayMarker) {
        p.onHand = 0;
        currentUsage = 0;
      }

      //set usage for the date in the map object

      let innerProperties = {
        onHand: p.onHand,
        usage: currentUsage,
      };
      productMap.set(key, innerProperties);
      p.onHand -= currentUsage;
    }
    return productMap;
  }

  forecastUsage() {
    const products = { ...this.products };
    for (let product in products) {
      if (products[product].previousWeeksUsage <= 0) {
        continue;
      }
      const productArrivalDate = this.dateUtil.findDeliveryDate(
        new Date(products[product].previousOrderDate),
        { asDate: true }
      );
      let currProd = {
        product,
        weeklyUsage: products[product].previousWeeksUsage,
        onHand: products[product].onHand,
        currentDemand: products[product].previousWeeksUsage,
        lastOrderQuantity: products[product].previousOrderQuantity,
        price: products[product].price,
        safeQuantity: products[product].safeQuantity || 0,
        productArrivalDate: this.dateUtil.op(productArrivalDate).format(),
      };
      let startDate = this.placementDate;
      let dayCount = 0;
      let usageMap = new Map();
      let onHand = 1;
      while (onHand > 0 && dayCount < 50) {
        dayCount++;
        let emptyMap = this.getEmptyUsageMap(startDate, dayCount);
        usageMap = this.productUsageDaily(emptyMap, currProd);
        onHand = this.objUtil.getLastMapEntry(usageMap)[1].onHand;
      }
      const id = `${product}_${uuid()}`;
      this.productEvolution[id] = usageMap;
    }

    return { ...this.productEvolution };
  }

  getEmptyUsageMap(startDate, dayCount = 0) {
    const weekGuide = this.dateUtil.getWeekdays([]);
    let usageMap = new Map();
    let dateStamp = new Date(startDate);
    let dateStampFormat;
    let properties = {};
    for (let i = 0; i < dayCount; i++) {
      const day = dateStamp.getDay();
      dateStampFormat = `${weekGuide[(day === 0 ? 7 : day) - 1]
        } <=> ${this.dateUtil.op(dateStamp).format()}`;
      usageMap.set(dateStampFormat, properties);
      dateStamp = new Date(dateStamp.setDate(dateStamp.getDate() + 1));
    }
    return usageMap;
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
   
  getActiveOrderDaySpan(deliveryDate) {
    const weekGuide = this.dateUtil.getWeekdays([]).map((_, i) => i + 1);
    const orderDays = this.getOrderDays();
    const today = new Date();
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
    let currentDateObj = new Date(today);
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
