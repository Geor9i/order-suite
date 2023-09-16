//Inventory variables-----------------

let inventorySectionElement = document.querySelector('.inventory-section__inactive');
let startMenu = document.querySelector('.inventory__start-menu__active');
let createStoreTemplateFormElement = document.querySelector('.create-store-template__form__inactive');
let storeOpeningTimesForm = document.querySelector('.store__open-times__form__inactive')
let editStoreTemplateFormElement = document.querySelector('.edit-store-template__form__inactive');


//-----------------Inventory variables
let headerBarElement = document.querySelector(".main__title");
let orderSectionElement = document.querySelector(".order-page__section");
let orderFormMainContainer = document.querySelector('.order__form__main__container');
let dropdownMenuElement = document.querySelector(".dropdown__menu");
let makeAnOrderButtonElement = document.querySelector(".menu__make__order");
let inventoryAdjustmentButtonElement = document.querySelector(".menu__adjust__products");
let pullDownElement = document.querySelector(".menu__pulldown");
let orderPageMainContainer = document.querySelector('.generated__order-page__main__container');
let orderFormAreaElement = document.querySelector(".order__form__area");
let generatedFormContainerElement = document.querySelector(".generated__order-page__main__container");
let headerOutputAreaElement = document.querySelector(".order__table__page-output-order-header");
let outputAreaElement = document.querySelector(".order__table__page-output-order");
let sideScreenElement = document.querySelector(".order__table__page-side-selector__screen");
let rmfDataDumpElement = document.getElementById("rmf-data-dump");
let deliveryHarvestProducts = {};
let discoveredProducts = [];
let nextOrderParameters = {};






//STATES====================================================================

function changeState() {
  let state = 0;

  return {
    getState() {
      return state;
    },
    setState(num) {
      if (num >= 0 && num <= 6) {
        state = num;
        updateScreens(state);
      }
    }
  }
}

let appState = changeState();


//order page dump state

function orderDumpState(value) {

  switch (value) {
    case 0:
      rmfDataDumpElement.className = 'rmf-data-dump';
      rmfDataDumpElement.disabled = false;
      rmfDataDumpElement.value = '';
      break;
    case 1:
      rmfDataDumpElement.className = 'rmf-data-dump__disabled';
      rmfDataDumpElement.disabled = true;
      break;
  }
}


//====================================================================STATES

//Window change==============================================================

function updateScreens(state) {
  switch (state) {
    //Main Screen state
    case 0:
      inventorySectionElement.className = 'inventory-section__inactive';
      orderSectionElement.className = "order-page__section";
      orderPageMainContainer.className = 'generated__order-page__main__container';
      orderFormAreaElement.className = "order__form__area__none";
      rmfDataDumpElement.value = "";
      deleteChildren(headerOutputAreaElement, outputAreaElement, sideScreenElement);
      orderDumpState(0);
      break;
    case 1:
      inventorySectionElement.className = 'inventory-section__inactive';
      createStoreTemplateFormElement.className = 'create-store-template__form__inactive';
      editStoreTemplateFormElement.className = 'edit-store-template__form__inactive';
      orderSectionElement.className = "order-page__section__active";
      orderPageMainContainer.className = 'generated__order-page__main__container';
      orderFormAreaElement.className = "order__form__area__appear";
      rmfDataDumpElement.value = "";
      deleteChildren(headerOutputAreaElement, outputAreaElement, sideScreenElement);
      orderDumpState(0);
      break;
    case 2:
      orderFormAreaElement.className = "order__form__area__dissapear";
      createStoreTemplateFormElement.className = 'create-store-template__form__inactive';
      editStoreTemplateFormElement.className = 'edit-store-template__form__inactive'
      setTimeout(function() {

        productsOnOrder = nextOrder(deliveryHarvestProducts, nextOrderParameters.orderInvoiceDate, nextOrderParameters.isInvoiced, nextOrderParameters.receivedToday, nextOrderParameters.weeklySalesData, nextOrderParameters.weeklyForecastData);

        generateSideBar(productsOnOrder)
        orderPageMainContainer.className = 'generated__order-page__main__container__active';
        orderFormAreaElement.className = "order__form__area__none";
        orderPageMainContainer.className = 'generated__order-page__main__container__active';
      }, 1200);
      break;
    case 3:
      startMenu.className = 'inventory__start-menu__active'
      inventorySectionElement.className = 'inventory-section__active';
      createStoreTemplateFormElement.className = 'create-store-template__form__inactive';
      editStoreTemplateFormElement.className = 'edit-store-template__form__inactive';

      orderSectionElement.className = "order-page__section";
      orderPageMainContainer.className = 'generated__order-page__main__container';
      break;
    case 4:
      startMenu.className = 'inventory__start-menu__inactive'
      inventorySectionElement.className = 'inventory-section__active';
      orderSectionElement.className = "order-page__section";
      orderPageMainContainer.className = 'generated__order-page__main__container';
      createStoreTemplateFormElement.className = 'create-store-template__form__active';
      editStoreTemplateFormElement.className = 'edit-store-template__form__inactive'
      break;
    case 4.1:
      //Delete----------------------------
      inventorySectionElement.className = 'inventory-section__active';
      startMenu.className = 'inventory__start-menu__inactive';
      //---------------------------Delete
      createStoreTemplateFormElement.className = 'create-store-template__form__inactive';
      storeOpeningTimesForm.className = 'store__open-times__form__active';
      clearStoreOpeningTimesTemplate();
      generateStoreOpeningTimesTemplate(weekDayMainContainer)
      break;
    case 4.2:
      //Delete----------------------------
      inventorySectionElement.className = 'inventory-section__active';
      startMenu.className = 'inventory__start-menu__inactive';
      //---------------------------Delete
      createStoreTemplateFormElement.className = 'create-store-template__form__inactive';
      storeOpeningTimesForm.className = 'store__open-times__form__inactive';
      inventoryTemplateForm.className = 'inventory-template__create-form__active'
      break;
    case 5:
      startMenu.className = 'inventory__start-menu__inactive'
      inventorySectionElement.className = 'inventory-section__active';
      orderSectionElement.className = "order-page__section";
      orderPageMainContainer.className = 'generated__order-page__main__container';
      createStoreTemplateFormElement.className = 'create-store-template__form__inactive';
      editStoreTemplateFormElement.className = 'edit-store-template__form__active';
      break;
  }

  //State REF
  /*
  0. Blank home screen
  1. Order form appear
  2. Order form disapear and order table screen appear 
  3. Store template menu screen appear
  4. Create new store template
  5. Edit store template
  
  */
}

//==============================================================Window change


//==============================================================================
// EVENTS

//DROPDOWN MENU




function displayOrderWarning() {
  return new Promise((resolve, reject) => {


    dropdownMenuElement.className = 'dropdown__menu';
    headerBarElement.removeEventListener('click', headerBarDropdown);
    pullDownElement.removeEventListener('click', headerBarDropdown);

    let pageCover = domGen(`
        <div .page-cover>
          <div .warning-message-container>
            <div .warning-message-text-container>
            <p .warning-message-text>Are you sure ?</p>
            </div>
            <div .warning-message__button-container>
            <button .warning-message__button>Yes</button>        
            <button .warning-message__button>Cancel</button>        
            </div>
          </div>
        </div>
        `)

    orderSectionElement.insertBefore(pageCover, orderSectionElement.firstChild);
    let warningMessageContainer = document.querySelector('.warning-message-container')

    warningMessageContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('warning-message__button') && e.target.textContent === 'Yes') {
        warningMessageContainer.remove();
        appState.setState(1);
        resolve(true);
        pageCover.remove();
        warningMessageContainer.remove();
        headerBarElement.addEventListener('click', headerBarDropdown);
        pullDownElement.addEventListener('click', headerBarDropdown);
      } else if (e.target.classList.contains('warning-message__button') && e.target.textContent === 'Cancel') {
        warningMessageContainer.remove();
        resolve(false);
        pageCover.remove();
        warningMessageContainer.remove();
        headerBarElement.addEventListener('click', headerBarDropdown);
        pullDownElement.addEventListener('click', headerBarDropdown);
      }
    })
  })
}
