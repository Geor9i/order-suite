export class OrderFormComponent {
  constructor(
    utility,
    renderHandler,
    templateFunction,
    router,
    calendarComponent,
    reportHarvest,
    processor
  ) {
    this.utility = utility;
    this.renderHandler = renderHandler;
    this.templateFunction = templateFunction;
    this.router = router;
    this.calendarComponent = calendarComponent;
    this.reportHarvest = reportHarvest;
    this.processor = processor;
    this.showView = this._showView.bind(this);
    this.openCalendar = this._openCalendar.bind(this);
    this.submitHandler = this._submitHandler.bind(this);
    this.dateInputFieldStartingDate =
      this._dateInputFieldStartingDate.bind(this);
    this.closeCalendar = this._closeCalendar.bind(this);
    this.deliveryHarvestProducts = null;
  }

  _showView(ctx) {
    let template = this.templateFunction(
      this.submitHandler,
      this.openCalendar,
      this.dateInputFieldStartingDate,
      this.closeCalendar
    );
    this.renderHandler(template);
    this.rmfDumpHandler();
    this.receivedTodayCheckbox();
  }

  _openCalendar(e) {
    e.preventDefault();
    let calendarContainer = document.getElementById("calendar-container");
    let backDrop = document.getElementById("calendar-backdrop");
    this.utility.toggleVisibility(calendarContainer);
    this.utility.toggleVisibility(backDrop);
    this.calendarComponent.showView(calendarContainer);
  }

  _dateInputFieldStartingDate() {
    let currentDate = new Date();
    let nextAvailableDeliveryDate = this.utility.findDeliveryDate(currentDate, { asDate: true });

    return `${nextAvailableDeliveryDate.getDate()}/${nextAvailableDeliveryDate.getMonth() + 1
      }/${nextAvailableDeliveryDate.getFullYear()} - ${this.utility.getWeekDay(
        nextAvailableDeliveryDate.getDay() - 1
      )}`;
  }

  _closeCalendar() {
    let calendarContainer = document.getElementById("calendar-container");
    let backDrop = document.getElementById("calendar-backdrop");
    this.utility.toggleVisibility(backDrop, { off: true });
    this.utility.toggleVisibility(calendarContainer, { off: true });
  }

  _submitHandler(e) {
    e.preventDefault();
    let form = e.target;
    let radioElementYes = document.getElementById("previous-invoiced-yes");
    let radioElementNo = document.getElementById("previous-invoiced-no");
    let formData = this.utility.getFormData(form);
    formData.radioYes = radioElementYes.checked;
    formData.radioNo = radioElementNo.checked;
    // this.processor.nextOrder(formData)

    if (this.formValidator(formData)) {
      let [date, weekday] = formData.date.split('-');
      formData.date = this.utility.dateConverter(date)
      formData.weekday = weekday;
      formData.products = this.deliveryHarvestProducts;
      this.processor.previousSales = Number(formData['previous-sales']);
      this.processor.salesForecast = Number(formData['sales-forecast']);
      this.processor.products = this.processor.nextOrder(formData);
    }
  }

  rmfDumpHandler() {
    let rmfDataDumpElement = document.getElementById("rmf-data-dump");
    rmfDataDumpElement.addEventListener("input", (e) => {
      if (rmfDataDumpElement.value.length >= 1) {
        this.deliveryHarvestProducts = this.reportHarvest([rmfDataDumpElement.value]);
        //If valid products have been discovered on entry
        if (this.deliveryHarvestProducts) {
          rmfDataDumpElement.value = "Data Received!";
          rmfDataDumpElement.disabled = true;
        } else {
          rmfDataDumpElement.value = "";
          e.currentTarget.placeholder = "Wrong Data!";
        }
      }
    });
  }

  receivedTodayCheckbox() {
    let orderFormElement = document.querySelector(".order__form__area");
    let receivedTodayContainerElement = document.querySelector(
      ".received-today__container"
    );

    orderFormElement.addEventListener("click", (e) => {
      if (e.target.id === "previous-invoiced-no") {
        receivedTodayContainerElement.classList.remove(
          "received-today__container"
        );
        receivedTodayContainerElement.classList.add(
          "received-today__container__on"
        );
      } else if (e.target.id === "previous-invoiced-yes") {
        receivedTodayContainerElement.classList.remove(
          "received-today__container__on"
        );
        receivedTodayContainerElement.classList.add(
          "received-today__container"
        );
      }
    });
  }

  formValidator(formData) {
    let warningMessageElement = document.getElementById("warning-message");
    warningMessageElement.replaceChildren(document.createDocumentFragment());
    let pass = true;

    if (formData["RMF-data-dump"] === "") {
      this.print("Paste your RMF order page and include:");
      this.print("1. Previous Week's Usage");
      this.print("2. Last Order Detail");
      pass = false;
    }
    if (!formData["radioNo"] && !formData["radioYes"]) {
      this.print("Have all RMF orders been accepted ?");
      pass = false;
    }

    if (formData.date === "") {
      this.print("Select a valid delivery date!");
      pass = false;
    } else {
      // Receive and parse date input data
      let orderInvoiceDate = formData.date.split(" - ")[0];
      //Check if parsed date is valid
      let dateCheckPattern = /[0-9]{1,2}(\D+)[0-9]{1,2}\1[0-9]{4}/g;
      if ((orderInvoiceDate.match(dateCheckPattern) !== null)) {
        orderInvoiceDate = this.utility.dateConverter(orderInvoiceDate);
        if (!this.utility.storeSettings.orderDays.includes(orderInvoiceDate.getDay())) {
          this.print('Select an available delivery date!')
        }

        if (this.isOrderPlacedForDate(orderInvoiceDate)) {
          this.print("An order for the selected date has already been placed!");
        }
      }
    }

    if (
      formData["previous-sales"] === "" ||
      isNaN(formData["previous-sales"])
    ) {
      this.print("Enter a valid number in weekly sales!");
      pass = false;
    }
    if (
      formData["sales-forecast"] === "" ||
      isNaN(formData["sales-forecast"])
    ) {
      this.print("Enter a valid number in forecast!");
      pass = false;
    }

    return pass;
  }

  print(message) {
    let warningMessageElement = document.getElementById("warning-message");
    let p = document.createElement("p");
    p.textContent = message;
    warningMessageElement.appendChild(p);
  }

  isOrderPlacedForDate(orderInvoiceDate) {
    if (this.deliveryHarvestProducts) {
      for (let product in this.deliveryHarvestProducts) {
        let productLastOrderedOn = new Date(this.deliveryHarvestProducts[product].previousOrderDate);
        let lastOrderedArrival = this.utility.findDeliveryDate(productLastOrderedOn, { asDate: true });
        if (this.utility.dateConverter(lastOrderedArrival, { deconstruct: true }) === this.utility.dateConverter(orderInvoiceDate, { deconstruct: true })) {
          return true;
        }
      }
    }
    return false;
  }
}