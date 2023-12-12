export default class Processor {
  constructor(utility) {
    this.utility = utility;
    this.products = null;
    this.receivedToday = null;
    this.previousSales = null;
    this.salesForecast = null;
    this.orderInvoiceDate = null;
    this.placementDate = new Date();
  }
  // FUNCTIONS

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

    console.log(formData);

    this.products = formData.products;
    this.orderInvoiceDate = formData.date;
    let previousIsInvoiced = formData.radioYes ? true : false;
    this.receivedToday = formData['received-today'] ? true : false;
    this.previousSales = formData['previous-sales'];
    this.salesForecast = formData['sales-forecast'];
    let salesQuotaWeekend = this.utility.storeSettings.salesQuotaWeekend;
    let workHours = this.utility.currentWorkHours();

    let productEvolution = {};
    // Variable to hold cost amount
    let orderTotal = 0;

    //HTML Visualize Table headers

    let dataTableHeader;


    let dataTable;

    // outputAreaElement.appendChild(dataTable);

    let currentOrderProducts = {
      counter: 0,
    };

    for (let product in this.products) {
      let nextOrderDate = this.utility.findDeliveryDate(this.orderInvoiceDate, { asDate: true });
      let productUsageMap = this.utility.findDeliveryDate(this.placementDate, { asArray: true, dateTo: nextOrderDate, asDateMap: true });

      // date object from stored date string!
      let productLastOrderedOn = new Date(this.products[product].previousOrderDate);
      let productArrivalDate = this.utility.findDeliveryDate(productLastOrderedOn, { asDate: true });
      productArrivalDate = this.utility.dateConverter(productArrivalDate, { deconstruct: true });
      //Pre-define variables to store product object params
      let currProd = {
        weeklyUsage: this.products[product].previousWeeksUsage,
        onHand: this.products[product].onHand,
        currentDemand: this.products[product].previousWeeksUsage,
        lastOrderQuantity: this.products[product].previousOrderQuantity,
        price: this.products[product].price,
        dailyUse: this.products[product].dailyUse ? this.products[product].dailyUse : 0,
        deviational: this.products[product].sustainAmount ? this.products[product].sustainAmount : 0,
        safeQuantity: this.orderInvoiceDate.getDay() >= 5 ? this.products[product].safeQuantity * 1 : this.products[product].safeQuantity
      }
      // let onHand = products[product].onHand;
      // let currentDemand = products[product].previousWeeksUsage;
      // let lastOrderQuantity = products[product].previousOrderQuantity;
      // let price = products[product].price;
      // //  let productSize = products[product].case;
      // let quotaReverse = products[product].quotaReverse ? true : false;
      // let dailyUse = products[product].dailyUse;
      // let deviational = 0;
      // if (products[product].sustainAmount) {
      //   deviational = products[product].sustainAmount;
      // }
      // let safeQuantity = products[product].safeQuantity;
      // safeQuantity =
      //   orderInvoiceDate.getDay() >= 5 ? safeQuantity * 1 : safeQuantity;

      //Map onHand and daily usage figures
      this.productUsageDaily(productUsageMap, currProd);

      console.log(productUsageMap);
      //Extract Data for UsageGraph
      productEvolution[product] = productUsageMap;

      /**
       *  Calculate order amount!
       */ //================================================

      //Iterate through the map and get the last entry (last date's params)
      let lastMapEntry;
      for (lastMapEntry of productUsageMap.entries()) {
        lastMapEntry = lastMapEntry[1];
      }
      let productRemain = lastMapEntry.onHand;

      let orderNow = 0;
      if (productRemain < 0) {
        productRemain = Math.abs(productRemain);
        orderNow = productRemain + safeQuantity + deviational;
      } else if (productRemain >= 0) {
        orderNow =
          productRemain >= safeQuantity + deviational
            ? 0
            : safeQuantity + deviational - productRemain;
      }

      //Get Delivery day date
      let orderDayOnHand;
      for (let entry of productUsageMap.entries()) {
        if (
          entry[0].split("<=>")[1].trim() ===
          dateConverter(this.orderInvoiceDate, true)
        ) {
          orderDayOnHand = entry[1].onHand;
          break;
        }
      }

      if (!currentOrderProducts.hasOwnProperty(product)) {
        currentOrderProducts[product] = {
          order: Math.max(0, Math.ceil(orderNow)),
          isInvoiced: previousIsInvoiced,
          price: price,
          usage: currentDemand.toFixed(2),
          onHand: onHand,
          stockOnOrderDay: orderDayOnHand.toFixed(2),
          nextOrderDayOnHand: lastMapEntry.onHand.toFixed(2),
          arrivalDate: productArrivalDate,
          id: null,
          isInDataTable: false,
          readyToAdd: false,
        };
        currentOrderProducts[product].count =
          currentOrderProducts[product].order > 0
            ? currentOrderProducts.counter++
            : null;
        if (currentOrderProducts[product].order > 0) {
          productTableConstructor(currentOrderProducts, product);
        }
      }
    }

    // console.log(currentOrderProducts);
    return currentOrderProducts;
  }
  /**======================================================================
   *
   * @param {map} productMap date range map
   * @param {Object} p current product
   * @param {Number} [p.weeklyUsage] Usage for previous week
   * @param {Number} [p.onHand] Current on hand quantity
   * @param {Number} [p.incomingStock] Amount of incoming stock
   * @param {date} [p.incomingStockDate] Arrival date for incoming stock
   * @param {number} [p.dailyUse] Added usage regardless of stats!
   * @returns Filled map with daily requirement data!
   */
  productUsageDaily(
    productMap,
    p
    // weeklyUsage,
    // onHand,
    // incomingStock,
    // incomingStockDate,
    // quotaReverse,
    // dailyUse
  ) {
    //Check if there is incoming stock
    const { weekendSalesPercent } = this.utility.storeSettings;
    if (p.incomingStock > 0) {
      incomingStockDate = findDeliveryDate(incomingStockDate, { asDate: true });
      incomingStockDate = dateConverter(incomingStockDate, { asDate: true });
    }

    console.log(p.dailyUse);
    // Estimate days to cover sales quota
    let weekdaySales = Math.abs((100 - weekendSalesPercent) / 4);
    let weekendSales = weekendSalesPercent / 3;

    // Adjust previous weeks usage based on sales forecast!
    let usagePerThousand = (p.weeklyUsage / this.previousSales) * 1000;
    p.weeklyUsage = usagePerThousand * (this.salesForecast / 1000);
    //DeliveryDay Reached marker
    let deliveryDayMarker = false;

    // map out usage and onHand within productMap
    for (let [key, object] of productMap.entries()) {
      //Check if this is a weekend day or weekday
      let dayType = this.utility.getWeekDay(key.split("<=>")[0].trim()) + 1;
      let dayDate = key.split("<=>")[1].trim();
      let currentUsage;
      if (dayType >= 5) currentUsage = p.weeklyUsage * (weekendSales / 100);
      else currentUsage = p.weeklyUsage * (weekdaySales / 100);
      currentUsage += p.dailyUse;
      //If placing order end of day!
      if (dayDate === this.utility.dateConverter(this.placementDate, { deconstruct: true })) {
        currentUsage = currentUsage - currentUsage * openTimePercentage;
      }
      //If previous order is invoiced
      if (incomingStockDate === dayDate) {
        if (!receivedToday) {
          p.incomingStock = previousIsInvoiced ? 0 : p.incomingStock;
        } else {
          if (previousIsInvoiced) {
            p.incomingStock = 0;
          } else {
            if (incomingStockDate === this.utility.dateConverter(this.placementDate, { deconstruct: true })) {
              p.incomingStock = 0;
            }
          }
        }
        p.onHand += p.incomingStock;
      }

      // Zero out minus quantities that add up to onHand before deliveryDay
      deliveryDayMarker =
        dayDate === this.utility.dateConverter(this.orderInvoiceDate, { deconstruct: true })
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
}