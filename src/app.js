import { render } from "../node_modules/lit-html/lit-html.js";
import page from "../node_modules/page/page.mjs";
import { firebaseConfig } from "../config/firebaseConfig.js";
import { initializeApp } from 'firebase/app'
import FireService from "./services/fireService.js";

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
import { userNavTemplate } from "./components/nav/userNavTemplate.js";

import DateUtil from "./utils/dateUtil.js";
import TimeUtil from "./utils/timeUtil.js";
import StringUtil from "./utils/stringUtil.js";
import FormUtil from "./utils/formUtil.js";
import DomUtil from "./utils/domUtil.js";
import ObjectUtil from "./utils/objectUtil.js";

import StoreTemplateScreen from "./components/storeTemplate/storeSetupScreen.js";
import { storeSetupTemplate } from "./components/storeTemplate/StoreSetupTemplate.js";
import { guestNavTemplate } from "./components/nav/guestNavTemplate.js";
import { loginPageTemplate } from "./components/loginPage/loginPageTemplate.js";
import LoginPage from "./components/loginPAge/loginPage.js";
import RegisterPage from "./components/registerPage/registerPage.js";
import { registerPageTemplate } from "./components/registerPage/registerPageTemplate.js";

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
  objUtil: new ObjectUtil()
};

//Product Processor
const processor = new Processor(storeSettings, utils);

//Harvester
const harvester = new Harvester(utils);

//Components

const calendarComponent = new Calendar(calendarTemplate, renderCalender, utils);
const navComponent = new NavComponent(guestNavTemplate ,userNavTemplate, renderNav, router, fireService, utils);
const homeComponent = new HomeComponent(
  homePageTemplate,
  renderBody,
  router,
  utils
);

const loginPageComponent = new LoginPage(loginPageTemplate, renderBody, router, fireService, utils);
const registerPageComponent = new RegisterPage(registerPageTemplate, renderBody, router, fireService, utils);

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
const storeTemplateScreen = new StoreTemplateScreen(
  storeSetupTemplate,
  renderBody,
  router,
  utils
);

page(navComponent.showView);
page("/", homeComponent.showView);
page("/login", loginPageComponent.showView);
page("/register", registerPageComponent.showView);
page("/order-form", orderFormComponent.showView);
page("/order-details", orderPageComponent.showView);
page("/restaurant", storeTemplateScreen.showView);

page.start();
