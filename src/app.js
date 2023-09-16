import { render } from '../node_modules/lit-html/lit-html.js';
import page from '../node_modules/page/page.mjs';
import { SessionService } from './services/sessionService.js';
import { NavComponent } from './components/nav/nav.js';
import { navTemplate } from './components/nav/navTemplate.js';
import { Utility } from './utility.js';
import { HomeComponent } from './components/homePage/homePage.js';
import { homePageTemplate } from './components/homePage/homePageTemplate.js';
import { OrderFormComponent } from './components/orderFormComponent/orderForm.js';
import { orderFormTemplate } from './components/orderFormComponent/orderFormTemplate.js';
import { Calendar } from './components/calendar/calendar.js';
import { calendarTemplate } from './components/calendar/calendarTemplate.js';
import { storeSettings } from './storeSettings.js';
import { reportHarvest } from './reportHarvesters/DeliveryReportHarvest.js';
import { Processor } from './processing/processor.js';
import { OrderPage } from './components/orderPage/orderPage.js';
import { orderPageTemplate } from './components/orderPage/orderPageTemplate.js';


const main = document.querySelector('main');
const nav = document.querySelector('header');

const router = {
    navigate: page.show,
    redirect: page.redirect
};
//Render Functions
let renderNav = (template) => render(template, nav);
let renderBody = (template) => render(template, main);
let renderCalender = (template, parent) => render(template, parent)


//Utils
const utility = new Utility(storeSettings);

//Product Processor
let processor = new Processor(utility);

//Services
const sessionService = new SessionService();

//Components
const calendarComponent = new Calendar(utility, calendarTemplate, renderCalender)
const navComponent = new NavComponent(utility, renderNav, navTemplate, router);
const homeComponent = new HomeComponent(utility, renderBody, homePageTemplate, router);
const orderFormComponent = new OrderFormComponent(utility, renderBody, orderFormTemplate, router, calendarComponent, reportHarvest, processor);
const orderPageComponent = new OrderPage(utility, renderBody, orderPageTemplate, router)

page(navComponent.showView)
page('/', homeComponent.showView);
page('/order-form', orderFormComponent.showView);
page('/order-details', orderPageComponent.showView);

page.start();
