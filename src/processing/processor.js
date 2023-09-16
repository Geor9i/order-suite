export class Processor {
  constructor(utility) {
    this.utility = utility;
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

  let products = formData.products;
  let orderInvoiceDate = this.utility.dateConverter(formData['date-input']);
  let previousIsInvoiced = formData.radioYes ? true : false;
  let receivedToday = formData['received-today'] ? true : false;
  let salesTotalLastWeek = formData['previous-sales'];
  let weeklySalesForecast = formData['sales-forecast'];
  let salesQuotaWeekend = this.utility.storeSettings.salesQuotaWeekend;
  let checkTime = true;
  let placementDate = new Date();
  let workHours = this.utility.currentWorkHours();

    let productEvolution = {};
    // Variable to hold cost amount
    let orderTotal = 0;
  
    //HTML Visualize Table headers
  
    let dataTableHeader;
  
  
    let dataTable;
  
    outputAreaElement.appendChild(dataTable);
  
    let currentOrderProducts = {
      counter: 0,
    };
  
    for (let product in products) {
      let nextOrderDate = findDeliveryDate(orderInvoiceDate, true);
      let productUsageMap = findDeliveryDate(
        placementDate,
        false,
        true,
        true,
        nextOrderDate,
        true
      );
  
      // date object from stored date string!
      let productLastOrderedOn = new Date(products[product].previousOrderDate);
  
      let productArrivalDate = findDeliveryDate(productLastOrderedOn, true);
      productArrivalDate = dateConverter(productArrivalDate, true);
  
      //Pre-define variables to store product object params
      let onHand = products[product].onHand;
      let currentDemand = products[product].previousWeeksUsage;
      let lastOrderQuantity = products[product].previousOrderQuantity;
      let price = products[product].price;
      //  let productSize = products[product].case;
      let quotaReverse = products[product].quotaReverse ? true : false;
      let dailyUse = products[product].dailyUse;
      let deviational = 0;
      if (products[product].sustainAmount) {
        deviational = products[product].sustainAmount;
      }
      let safeQuantity = products[product].safeQuantity;
      safeQuantity =
        orderInvoiceDate.getDay() >= 5 ? safeQuantity * 1 : safeQuantity;
  
      //Map onHand and daily usage figures
      productUsageDaily(
        currentDemand,
        productUsageMap,
        onHand,
        lastOrderQuantity,
        productLastOrderedOn,
        quotaReverse,
        dailyUse
      );
  
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
          dateConverter(orderInvoiceDate, true)
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
     * @param {Number} weeklyUsage Usage for previous week
     * @param {map} productMap date range map
     * @param {Number} onHand Current on hand quantity
     * @param {Number} incomingStock Amount of incoming stock
     * @param {date} incomingStockDate Arrival date for incoming stock
     * @param {boolean} quotaReverse Inverse week and weekend usage!
     * @param {number} dailyUse Added usage regardless of stats!
     * @returns Filled map with daily requirement data!
     */
     productUsageDaily(
      weeklyUsage,
      productMap,
      onHand,
      incomingStock,
      incomingStockDate,
      quotaReverse,
      dailyUse
    ) {
      //Check if there is incoming stock
      if (incomingStock > 0) {
        incomingStockDate = findDeliveryDate(incomingStockDate, true);
        incomingStockDate = dateConverter(incomingStockDate, true);
      }
  
      // Estimate days to cover sales quota
      let weekDayQuota = Math.abs((100 - salesQuotaWeekend) / 4);
      let weekendQuota = salesQuotaWeekend / 3;
      if (quotaReverse) {
        weekendQuota = Math.abs((100 - salesQuotaWeekend) / 3);
        weekDayQuota = salesQuotaWeekend / 4;
      }
  
      // Adjust previous weeks usage based on sales forecast!
      let usagePerThousand = (weeklyUsage / salesTotalLastWeek) * 1000;
      weeklyUsage = usagePerThousand * (weeklySalesForecast / 1000);
      //DeliveryDay Reached marker
      let deliveryDayMarker = false;
  
      // map out usage and onHand within productMap
      for (let [key, object] of productMap.entries()) {
        //Check if this is a weekend day or weekday
        let dayType = weekDays.indexOf(key.split("<=>")[0].trim()) + 1;
        let dayDate = key.split("<=>")[1].trim();
        let currentUsage;
        if (dayType >= 5) currentUsage = weeklyUsage * (weekendQuota / 100);
        else currentUsage = weeklyUsage * (weekDayQuota / 100);
        currentUsage += dailyUse;
        //If placing order end of day!
        if (dayDate === dateConverter(placementDate, true) && checkTime) {
          currentUsage = currentUsage - currentUsage * openTimePercentage;
        }
        //If previous order is invoiced
        if (incomingStockDate === dayDate) {
          if (!receivedToday) {
            incomingStock = previousIsInvoiced ? 0 : incomingStock;
          } else {
            if (previousIsInvoiced) {
              incomingStock = 0;
            } else {
              if (incomingStockDate === dateConverter(placementDate, true)) {
                incomingStock = 0;
              }
            }
          }
          onHand += incomingStock;
        }
  
        // Zero out minus quantities that add up to onHand before deliveryDay
        deliveryDayMarker =
          dayDate === dateConverter(orderInvoiceDate, true)
            ? true
            : deliveryDayMarker;
        if (onHand <= 0 && !deliveryDayMarker) {
          onHand = 0;
          currentUsage = 0;
        }
  
        //set usage for the date in the map object
  
        let innerProperties = {
          onHand: onHand,
          usage: currentUsage,
        };
        productMap.set(key, innerProperties);
        onHand -= currentUsage;
      }
  
      return productMap;
    }
  }