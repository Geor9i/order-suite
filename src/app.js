import { render } from "../node_modules/lit-html/lit-html.js";
import '../styles/styles.css';
import page from "../node_modules/page/page.mjs";
import { firebaseConfig } from "../config/firebaseConfig.js";
import { initializeApp } from "firebase/app";
import FireService from "./services/fireService.js";

import Processor from "./processing/processor.js";
import Calendar from "./components/calendar/calendar.js";
import Harvester from "./reportHarvesters/harvester.js";
import NavComponent from "./components/nav/nav.js";
import OrderPage from "./components/orderPage/orderPage.js";
import OrderFormComponent from "./components/orderFormComponent/orderForm.js";
import HomeComponent from "./components/homePage/homePage.js";
import NotFoundPage from "./components/404/NotFoundPage.js";
import StoreTemplateScreen from "./components/storeTemplate/storeSetupScreen.js";
import LoginPage from "./components/loginPage/loginPage.js";
import RegisterPage from "./components/registerPage/registerPage.js";
import RestaurantMenu from "./components/restaurantMenu/restaurantMenu.js";
import SalesAnalysis from "./components/salesAnalysisPage/salesAnalysisPage.js";
import ProductManager from "./components/productManager/productManager.js";

import DateUtil from "./utils/dateUtil.js";
import TimeUtil from "./utils/timeUtil.js";
import StringUtil from "./utils/stringUtil.js";
import FormUtil from "./utils/formUtil.js";
import DomUtil from "./utils/domUtil.js";
import ObjectUtil from "./utils/objectUtil.js";
import MathUtil from "./utils/mathUtil.js";
import { storeSettings } from "./storeSettings.js";
import ComponentManager from "./lib/componentManager.js";
import { report } from "../inventoryReport.js";

const app = initializeApp(firebaseConfig);
const fireService = new FireService(app);
const main = document.querySelector("main");
const nav = document.querySelector("header");

const router = {
  navigate: page.show,
  redirect: page.redirect,
};
//Render Functions
const renderNav = (template) => render(template, nav);
const renderBody = (template) => render(template, main);
const renderCalender = (template, parent) => render(template, parent);

//Utils
const utils = {
  dateUtil: new DateUtil(),
  timeUtil: new TimeUtil(storeSettings),
  stringUtil: new StringUtil(),
  formUtil: new FormUtil(),
  domUtil: new DomUtil(),
  objUtil: new ObjectUtil(),
  mathUtil: new MathUtil(),
};

//Product Processor
const processor = new Processor(storeSettings, utils);
const harvester = new Harvester(utils);
const CM = new ComponentManager();
//Components
const navComponent = new NavComponent(renderNav, router, fireService, utils);
const calendarComponent = new Calendar(renderCalender, utils);

//Loaders
const baseLoader = { renderBody, router, fireService, utils };
const funcLoader = {
  calendarComponent,
  harvester,
  processor,
  storeSettings,
};

page(fireService.confirmUser);
page(navComponent.showView);
page("/index.html", "/");
page("/", () => CM.mount(HomeComponent, baseLoader));
page("/login", () => CM.mount(LoginPage, baseLoader));
page("/register", () => CM.mount(RegisterPage, baseLoader));
page("/order-form", () => CM.mount(OrderFormComponent, baseLoader, funcLoader));
page("/order-details", () => CM.mount(OrderPage, baseLoader, funcLoader));
page("/restaurant", () => CM.mount(RestaurantMenu, baseLoader));
page("/restaurant-template", () => CM.mount(StoreTemplateScreen, baseLoader));
page("/restaurant-sales", () =>
  CM.mount(SalesAnalysis, baseLoader, funcLoader)
);
page("/product-manager", () => CM.mount(ProductManager, baseLoader));
page("/404", () => CM.mount(NotFoundPage, baseLoader));

page.start();
// const salesDataMap = harvester.salesSummaryExtractor(report);

// // Convert Map entries to an array of strings
// const mapEntries = Array.from(salesDataMap.entries())
//   .map(([key, value]) => `salesData.set('${key}', ${JSON.stringify(value)});`);

// // Join the array into a single string
// const salesDataString = `
// const salesData = new Map();
// ${mapEntries.join('\n')}
// `;

// const blob = new Blob([salesDataString], { type: 'application/javascript' });

// const a = document.createElement('a');
// a.href = URL.createObjectURL(blob);
// a.download = 'salesData.js';

// document.body.appendChild(a);
// a.click();
// document.body.removeChild(a);
