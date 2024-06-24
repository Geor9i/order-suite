import BaseComponent from "../../framework/baseComponent.js";
import { restaurantMenuTemplate } from "./restaurantMenuTemplate.js";
import { routes } from '../../constants/routing.js';
export default class RestaurantMenu extends BaseComponent {
    constructor({ renderBody, router, authService }) {
        super();
        this.render = renderBody;
        this.router = router;
        this.authService = authService;
        this.showView = this._showView.bind(this);
        this.menuButtonHandler = this._menuButtonHandler.bind(this);
    }

    _showView(ctx) {
        if (!this.authService.user) {
            this.router.redirect(routes.HOME);
            return;
        }
        this.render(restaurantMenuTemplate(this.menuButtonHandler));
    }

    _menuButtonHandler(e) {
        const id = e.currentTarget.id;
        const links = {
            restaurantTemplate: '/restaurant-template',
            products: '/product-manager',
            sales: '/restaurant-sales',
        }
        this.router.navigate(links[id]);
    }

}
