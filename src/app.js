import { render } from '../node_modules/lit-html/lit-html.js';
import page from '../node_modules/page/page.mjs';

import Utility from './utils/utility.js';
import Processor from './processing/processor.js';
import Calendar from './components/calendar/calendar.js'
import Harvester from './reportHarvesters/harvester.js';
import NavComponent from './components/nav/nav.js';
import OrderPage from './components/orderPage/orderPage.js'
import OrderFormComponent from './components/orderFormComponent/orderForm.js'
import HomeComponent from './components/homePage/homePage.js'

import { homePageTemplate } from './components/homePage/homePageTemplate.js';
import { orderFormTemplate } from './components/orderFormComponent/orderFormTemplate.js';
import { calendarTemplate } from './components/calendar/calendarTemplate.js';
import { storeSettings } from './storeSettings.js';
import { orderPageTemplate } from './components/orderPage/orderPageTemplate.js';
import { navTemplate } from './components/nav/navTemplate.js';

const main = document.querySelector('main');
const nav = document.querySelector('header');

const router = {
    navigate: page.show,
    redirect: page.redirect
};
//Render Functions
const renderNav = (template) => render(template, nav);
const renderBody = (template) => render(template, main);
const renderCalender = (template, parent) => render(template, parent)


//Utils
const utility = new Utility(storeSettings);

//Product Processor
const processor = new Processor(utility);

//Harvester
const harvester = new Harvester()

//Components
const calendarComponent = new Calendar(utility, calendarTemplate, renderCalender)
const navComponent = new NavComponent(utility, renderNav, navTemplate, router);
const homeComponent = new HomeComponent(utility, renderBody, homePageTemplate, router);
const orderFormComponent = new OrderFormComponent(utility, renderBody, orderFormTemplate, router, calendarComponent, harvester, processor);
const orderPageComponent = new OrderPage(utility, renderBody, orderPageTemplate, router)

page(navComponent.showView)
page('/', homeComponent.showView);
page('/order-form', orderFormComponent.showView);
page('/order-details', orderPageComponent.showView);

page.start();
