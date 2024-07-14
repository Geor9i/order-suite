import '../styles/site.scss';
import page from "../node_modules/page/page.mjs";
import { render } from "../node_modules/lit-html/lit-html.js";
import ComponentManager from "./framework/componentManager.js";
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
import { serviceProvider as services } from './services/serviceProvider.js';
import { utils } from "./utils/utilConfig.js";

if (module.hot) {
  module.hot.accept();
}

const main = document.querySelector("main");
const nav = document.querySelector("header");

const router = {
  navigate: page.show,
  redirect: page.redirect,
};
//Render Functions
const renderNav = (template) => render(template, nav);
const renderBody = (template) => render(template, main);

const CM = new ComponentManager();
//Standalone Components
const navComponent = new NavComponent(renderNav, router, services, utils);
//Loaders
const baseLoader = { renderBody, router, utils, services };

page(services.authService.confirmUser);
page(navComponent.showView);
page("/index.html", "/");
page("/", () => CM.mount(HomeComponent, baseLoader));
page("/login", () => CM.mount(LoginPage, baseLoader));
page("/register", () => CM.mount(RegisterPage, baseLoader));
page("/order-form", () => CM.mount(OrderFormComponent, baseLoader));
page("/order-details", () => CM.mount(OrderPage, baseLoader));
page("/restaurant", () => CM.mount(RestaurantMenu, baseLoader));
page("/restaurant-template", () => CM.mount(StoreTemplateScreen, baseLoader));
page("/restaurant-sales", () => CM.mount(SalesAnalysis, baseLoader));
page("/product-manager", () => CM.mount(ProductManager, baseLoader));
page("/404", () => CM.mount(NotFoundPage, baseLoader));
page.start();
