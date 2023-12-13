import { render } from "../node_modules/lit-html/lit-html.js";
import page from "../node_modules/page/page.mjs";

import Processor from "./processing/processor.js";
import Calendar from "./components/calendar/calendar.js";
import Harvester from "./reportHarvesters/harvester.js";
import NavComponent from "./components/nav/nav.js";
import OrderPage from "./components/orderPage/orderPage.js";
import OrderFormComponent from "./components/orderFormComponent/orderForm.js";
import HomeComponent from "./components/homePage/homePage.js";

import { homePageTemplate } from "./components/homePage/homePageTemplate.js";
import { orderFormTemplate } from "./components/orderFormComponent/orderFormTemplate.js";
import { calendarTemplate } from "./components/calendar/calendarTemplate.js";
import { storeSettings } from "./storeSettings.js";
import { orderPageTemplate } from "./components/orderPage/orderPageTemplate.js";
import { navTemplate } from "./components/nav/navTemplate.js";

import DateUtil from "./utils/dateUtil.js";
import TimeUtil from "./utils/timeUtil.js";
import StringUtil from "./utils/stringUtil.js";
import FormUtil from "./utils/formUtil.js";
import DomUtil from "./utils/domUtil.js";
import ObjectUtil from "./utils/objectUtil.js";

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
  objUtil: new ObjectUtil()
};

//Product Processor
const processor = new Processor(storeSettings, { ...utils });

//Harvester
const harvester = new Harvester();

//Components
const calendarComponent = new Calendar(calendarTemplate, renderCalender, utils);
const navComponent = new NavComponent(navTemplate, renderNav, router, utils);
const homeComponent = new HomeComponent(
  homePageTemplate,
  renderBody,
  router,
  utils
);
const orderFormComponent = new OrderFormComponent(
  orderFormTemplate,
  renderBody,
  router,
  calendarComponent,
  harvester,
  processor,
  storeSettings,
  utils
);
const orderPageComponent = new OrderPage(
  orderPageTemplate,
  renderBody,
  router,
  processor,
  utils
);

page(navComponent.showView);
page("/", homeComponent.showView);
page("/order-form", orderFormComponent.showView);
page("/order-details", orderPageComponent.showView);

page.start();
