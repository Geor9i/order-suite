export default class Processor {
  constructor(storeSettings, utils) {
    this.storeSettings = storeSettings;
    this.dateUtil = utils.dateUtil;
    this.timeUtil = utils.timeUtil;
    this.objUtil = utils.objUtil;
    this.stringUtil = utils.stringUtil;
    this.products = {};
    this.currentOrderProducts = {};
    this.productEvolution = {};
    this.receivedToday = null;
    this.previousSales = null;
    this.salesForecast = null;
    this.orderInvoiceDate = null;
    this.nextOrderInvoiceDate = null;
    this.placementDate = new Date();
    this.previousIsInvoiced = null;
    this.workHoursPercentage = this.timeUtil.currentWorkHoursPercentage();
    this.productCounter = 0;
  }
  /**
   *
   * @param {Object} deliveryHarvestProducts Products object harvested from deliveryReportHarvest
   * @param {string} orderInvoiceDate The date for which you want to place the order!
   * @param {number} salesTotalLastWeek Sales forecast for last week!
   * @param {number} weeklySalesForecast Weekly forecast inclusive of order date.
   * @param {number} salesQuotaWeekend Forecasted sales quota as a percentage for the weekend (Friday, Saturday, Sunday)
   * @param {boolean} previousIsInvoiced Has the previous order been invoiced ? true or false
   * @param {boolean} checkTime If placing your order at the end of the sales day set to true
   * @param {Array} orderDays Enter your available order days if omitted: "Monday", "Wednesday" and "Friday"
   * @returns Forecasted order requirements as an Object!
   */
  nextOrder(formData) {
    this.products = { ...formData.products };
    const products = { ...formData.products };
    this.orderInvoiceDate = formData.date;
    this.nextOrderInvoiceDate = this.dateUtil.findDeliveryDate(formData.date, {
      asDate: true,
    });
    this.previousIsInvoiced = formData.radioYes ? true : false;
    this.receivedToday =
      formData["received-today"] !== undefined
        ? !!formData["received-today"]
        : null;
    this.previousSales = Number(formData["previous-sales"]);
    this.salesForecast = Number(formData["sales-forecast"]);

    for (let product in products) {
      let nextOrderDate = this.dateUtil.findDeliveryDate(
        this.orderInvoiceDate,
        {
          asDate: true,
        }
      );
      let productUsageMap = this.dateUtil.findDeliveryDate(this.placementDate, {
        asArray: true,
        dateTo: nextOrderDate,
        asDateMap: true,
      });

      // date object from stored date string!
      let productLastOrderedOn = new Date(products[product].previousOrderDate);
      const productArrivalDate = this.dateUtil.findDeliveryDate(
        productLastOrderedOn,
        { asDate: true }
      );
      //Pre-define variables to store product object params
      let currProd = {
        weeklyUsage: products[product].previousWeeksUsage,
        onHand: products[product].onHand,
        currentDemand: products[product].previousWeeksUsage,
        lastOrderQuantity: products[product].previousOrderQuantity,
        price: products[product].price,
        safeQuantity: 0,
        productArrivalDate: this.dateUtil.op(productArrivalDate).format(),
      };

      //Map onHand and daily usage figures
      const populatedUsageMap = this.productUsageDaily(
        productUsageMap,
        currProd
      );

      let productRemain =
        this.objUtil.getLastMapEntry(populatedUsageMap)[1].onHand;
      let orderNow = 0;
      if (productRemain < 0) {
        orderNow = Math.abs(productRemain) + currProd.safeQuantity;
      } else {
        orderNow =
          productRemain >= currProd.safeQuantity
            ? 0
            : currProd.safeQuantity - productRemain;
      }

      //Get Delivery day date
      let orderDayOnHand;
      for (let entry of populatedUsageMap.entries()) {
        let currentDate = entry[0].split("<=>")[1].trim();
        if (currentDate === this.dateUtil.op(this.orderInvoiceDate).format()) {
          orderDayOnHand = entry[1].onHand;
          break;
        }
      }
      let order = Math.max(0, Math.ceil(orderNow));
      let count = order > 0 ? this.productCounter++ : null;
      const productId = this.generateId(product);
      if (!this.currentOrderProducts.hasOwnProperty(productId)) {
        this.currentOrderProducts[productId] = {
          ...currProd,
          product,
          forecastOrder: order,
          order,
          count,
          stockOnOrderDay: Number(orderDayOnHand.toFixed(2)),
          nextOrderDayOnHand: Number(productRemain.toFixed(2)),
          sideDisplay: true,
        };
      }
    }
    return this.currentOrderProducts;
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
        currentDate === this.dateUtil.op(this.orderInvoiceDate).format()
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
      const id = this.generateId(product);
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

  generateId(productName) {
    return this.stringUtil
      .removeSpecialChars(productName)
      .split("")
      .filter((el) => el !== " ")
      .map((el) => el.toLowerCase())
      .join("");
  }
}
