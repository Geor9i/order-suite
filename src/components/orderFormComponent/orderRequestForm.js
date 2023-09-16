//Number array with all available order days
let orderDays = orderDaysToNum(["Monday", "Wednesday", "Friday"]);
let weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let orderFormElement = document.querySelector('.order__form__area');
// let rmfDataDumpElement = document.getElementById("rmf-data-dump");
// rmfDataDumpElement.value = "";
let radioElementYes = document.getElementById("previous-invoiced-yes");
let radioElementNo = document.getElementById("previous-invoiced-no");
let receivedTodayContainerElement = document.querySelector('.received-today__container');
let receivedTodayCheckboxElement = document.getElementById('received-today')
let weeklySalesInputElement = document.querySelector("#previous-sales");
weeklySalesInputElement.value = "";
let forecastInputElement = document.querySelector("#sales-forecast");
forecastInputElement.value = "";
let calendarButtonElement = document.getElementById("date-button");
let calendarContainerElement = document.getElementById("calendar-container");
let calendarDateButtonCollection = document.querySelector("#day-table")
let dateInputField = document.getElementById("date-input");
let createButtonElement = document.querySelector("#create-button");
let productsOnOrder = {};


//  CALENDAR

//Clicking the date calendar button
calendarButtonElement.addEventListener("click", (e) => {

  //Hide Calendar on form Click
  orderFormElement.addEventListener("click", (e) => {
      let calendarBodyElement = document.getElementById("calendar-body")
      if (calendarContainerElement.style.display === "block") {
        if (e.target !== calendarButtonElement) {
          if (e.target !== calendarBodyElement) {
            if (e.target.id !== 'arrow-up' && e.target.id !== 'arrow-down')
            calendarContainerElement.style.display = 'none';
        }
        } 
        }
    })

  if (calendarContainerElement.style.display === "block") {
    calendarContainerElement.style.display = "none"

  } else {
    calendarContainerElement.style.display = "block"
  }
})



//==============================================================================
//RMF  INPUT PROCESSING
rmfDataDumpElement.addEventListener("input", (e) => {
  let deliveryHarvestProducts = {};
  if (e.currentTarget.value.length >= 1) {
    deliveryHarvestProducts = reportHarvest([rmfDataDumpElement.value])
    // console.log(deliveryHarvestProducts);
    //If valid products have been discovered on entry
    if (discoveredProducts.length > 0) {
      orderDumpState(1)
      e.currentTarget.value = "Data Received!"
    } else {
      e.currentTarget.value = "";
      e.currentTarget.placeholder = "Wrong Data!"
    }

  }
});

// Deselect all radio buttons
radioElementYes.checked = false
radioElementNo.checked = false
let warningFlag = [false, false, false, false, false];
// let nextOrderParameters = {};

//Display received today box

orderFormElement.addEventListener('click', (e) => {
  if (e.target.id === 'previous-invoiced-no') {
    receivedTodayContainerElement.classList.remove('received-today__container');
    receivedTodayContainerElement.classList.add('received-today__container__on');
  } else if (e.target.id === 'previous-invoiced-yes') {
    receivedTodayContainerElement.classList.remove('received-today__container__on');
    receivedTodayContainerElement.classList.add('received-today__container');
  }
})

//When create button is pressed
// Ensure all fields are filled correctly!
createButtonElement.addEventListener("click", () => {
  let warningMessageElement = document.getElementById("warning-message");
  warningMessageElement.style.display = "block";

  //RFM data not present or invalid
  if (!discoveredProducts.length > 0) {
    if (!warningFlag[0]) {
      warningFlag[0] = true
      printWarningMessage(warningMessageElement, "Paste your RMF order page and include:", "add")
      printWarningMessage(warningMessageElement, "1. Previous Week's Usage", "add")
      printWarningMessage(warningMessageElement, "2. Last Order Detail", "add")
      printWarningMessage(warningMessageElement, "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -", "add")

    }
  } else if (discoveredProducts.length > 0 && warningFlag[0]) {
    printWarningMessage(warningMessageElement, "Paste your RMF order page and include:", "remove")
    printWarningMessage(warningMessageElement, "1. Previous Week's Usage", "remove");
    printWarningMessage(warningMessageElement, "2. Last Order Detail", "remove");
    printWarningMessage(warningMessageElement, "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -", "remove");
    warningFlag[0] = false;

  }

  //Check if radio buttons have been used
  if (!warningFlag[2] && !radioElementYes.checked && !radioElementNo.checked) {
    warningFlag[2] = true;
    printWarningMessage(warningMessageElement, "Have all RMF orders been accepted ?", "add")

  } else if ((radioElementYes.checked || radioElementNo.checked) && warningFlag[2]) {
    let isInvoiced = radioElementYes.checked ? true : false;
    nextOrderParameters.isInvoiced = isInvoiced;
    printWarningMessage(warningMessageElement, "Have all RMF orders been accepted ?", "remove")
    warningFlag[2] = false;
  }


  // If the date input field value is bigger than one... process
  if (dateInputField.value.length > 0) {

    // Receive and parse date input data
    let orderInvoiceDate = dateInputField.value.split(" - ")[0];
    let orderForWeekday = dateInputField.value.split(" - ")[1];

    //Check if parsed date is valid
    let dateCheckPattern = /[0-9]{1,2}(\D+)[0-9]{1,2}\1[0-9]{4}/g;
    if ((orderInvoiceDate.match(dateCheckPattern) !== null)) {
      nextOrderParameters.orderInvoiceDate = orderInvoiceDate;
      nextOrderParameters.weekDay = orderForWeekday;
      orderInvoiceDate = dateConverter(orderInvoiceDate);

      // if the warning flag has been triggered before
      if (warningFlag[1]) {
        printWarningMessage(warningMessageElement, "Select a valid delivery date!", "remove");
        printWarningMessage(warningMessageElement, `An order for the selected date has already been placed!`, "remove");
        warningFlag[1] = false;
      }


      //Declare a placement date!  
      let placementDate = dateConverter(new Date());

      let nextDeliveryDate = findDeliveryDate(placementDate, true);
      let dateCorrectionMessage = `Please enter a correct order date for your store!\nNext available date: ${nextDeliveryDate.getDate()}/${nextDeliveryDate.getMonth() + 1}/${nextDeliveryDate.getFullYear()} ${weekDays[nextDeliveryDate.getDay() - 1]}`

      if (!orderDays.includes(orderInvoiceDate.getDay())) {
        warningFlag[1] = true;
        printWarningMessage(warningMessageElement, dateCorrectionMessage, "add")

      } else if (orderDays.includes(orderInvoiceDate.getDay())) {
        printWarningMessage(warningMessageElement, dateCorrectionMessage, "remove");
        warningFlag[1] = false;
      }

      //Detect previously placed order for the same placement date!
      if (radioElementYes.checked || radioElementNo.checked) {
        let previousIsInvoiced;
        if (radioElementYes.checked) {
          previousIsInvoiced = true;
        } else {
          previousIsInvoiced = false;
        }
        nextOrderParameters.isInvoiced = previousIsInvoiced;
        for (let product in deliveryHarvestProducts) {

          let productLastOrderedOn = new Date(deliveryHarvestProducts[product].previousOrderDate);
          let lastOrderedArrival = findDeliveryDate(productLastOrderedOn, true);
          if (dateConverter(lastOrderedArrival, true) === dateConverter(orderInvoiceDate, true)) {
            warningFlag[1] = true;
            printWarningMessage(warningMessageElement, `An order for the selected date has already been placed!`, "add");
            break;
          }
        }
      }

    } else {
      warningFlag[1] = true;
      printWarningMessage(warningMessageElement, "Select a valid delivery date!", "add")

    }
  } else if (!dateInputField.value.length > 0) {
    warningFlag[1] = true;
    printWarningMessage(warningMessageElement, "Select a valid delivery date!", "add")
  }


  //Weekly sales has not been entered or has invalid data
  let numPattern = /\d+[\d\.\,]*\d*/g;
  let weeklySalesData;

  if ((weeklySalesData = weeklySalesInputElement.value.match(numPattern)) !== null) {
    weeklySalesData = weeklySalesData[0];
    printWarningMessage(warningMessageElement, "Enter a valid number in weekly sales!", "remove")
    warningFlag[3] = false;
    weeklySalesData = Number(weeklySalesData.split(",").join(""));
    nextOrderParameters.weeklySalesData = weeklySalesData;
  } else {
    warningFlag[3] = true;
    printWarningMessage(warningMessageElement, "Enter a valid number in weekly sales!", "add")
  }


  let weeklyForecastData;
  if ((weeklyForecastData = forecastInputElement.value.match(numPattern)) !== null) {
    weeklyForecastData = weeklyForecastData[0];
    weeklyForecastData = Number(weeklyForecastData.split(",").join(""));
    nextOrderParameters.weeklyForecastData = weeklyForecastData;
    printWarningMessage(warningMessageElement, "Enter a valid number in forecast!", "remove");
    warningFlag[4] = false;

  } else {
    warningFlag[4] = true;
    printWarningMessage(warningMessageElement, "Enter a valid number in forecast!", "add")
  }


  if (!warningFlag.includes(true)) {
    let headerDate = document.querySelector(".generated__order-page__main__title");
    headerDate.textContent = `${nextOrderParameters.weekDay} ${nextOrderParameters.orderInvoiceDate}`
    nextOrderParameters.receivedToday = receivedTodayCheckboxElement.checked
    warningMessageElement.style.display = "none";
    appState.setState(2)
  }
})
