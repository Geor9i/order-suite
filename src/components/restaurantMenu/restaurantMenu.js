import { restaurantMenuTemplate } from "./restaurantMenuTemplate.js";

export default class RestaurantMenu {
    constructor({ renderBody, router, fireService }) {
        this.render = renderBody;
        this.router = router;
        this.fireService = fireService;
        this.showView = this._showView.bind(this);
        this.menuButtonhandler = this._menuButtonhandler.bind(this);
    }

    _showView(ctx) {
        if (!this.fireService.user) {
            this.router.redirect("/");
            return;
        }
        this.render(restaurantMenuTemplate(this.menuButtonhandler));
    }

    _menuButtonhandler(e) {
        const id = e.currentTarget.id;
        const links = {
            restaurantTemplate: '/restaurant-template',
            products: '/product-manager',
            sales: '/sales-analysis',
        }
        this.router.navigate(links[id]);
    }

}
