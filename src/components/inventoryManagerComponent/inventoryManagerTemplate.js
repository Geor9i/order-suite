import { html } from "../../../node_modules/lit-html/lit-html.js";


export const  inventoryManagerTemplate = () => html`
    
       
    <section class="inventory-section__inactive">
            <div class="inventory__main-container">
                <div class="inventory__start-menu__active">
                    <div id="inventory__start-menu__create-button" class="inventory__start-menu__selector">
                        <h1>Create New</h1>
                    </div>
                    <div id="inventory__start-menu__edit-button" class="inventory__start-menu__selector">
                        <h1>Edit</h1>
                    </div>
                </div>
                <!-- Create screen -->
                <div class="create-store-template__form__inactive">
                    <label for="store-name__input-field">Enter Store Name</label>
                    <input class="template__field" type="text" id="store-name__input-field">
                    <div class="previous-template-password__container__inactive">
                        <label class="previous-template-password-label" for="previous-template-password">Previous
                            Password</label>
                        <input class="template__field" type="password" id="previous-template-password">
                    </div>
                    <label for="template-password">Password</label>
                    <input class="template__field" type="password" id="template-password">
                    <label for="confirm-template-password">Confirm Password</label>
                    <input class="template__field" type="password" id="confirm-template-password">
                    <div class="template__next-button__container">
                        <button class="template__next-button">Next</button>
                    </div>
                </div>

                <div class="store__open-times__form__inactive">
                    <h1 class="store__open-times__form-header">Farnborough Express</h1>
                    <div class="store__details__bar">Store Details
                    </div>
                    <div class="store__details__container">
                        <div class="weekday__main__container"></div>
                    </div>
                    <div id="analysis-bar" class="store__details__bar">Analysis</div>
                    <div class="store__details-confirm-button__container">
                        <button class="store__details-confirm-button">Confirm</button>
                    </div>
                </div>

                <div class="inventory-template__create-form__inactive">
                    <div class="inventory-template__main-container"></div>

                    <!-- Edit screen -->
                    <div class="edit-store-template__form__inactive">
                        <h2 id="store-name__edit-template__header">Store:</h2>
                        <label for="edit-template-password">Password</label>
                        <input class="template__field" type="password" id="edit-template-password">
                        <label for="edit-confirm-template-password">Confirm Password</label>
                        <input class="template__field" type="password" id="edit-confirm-template-password">
                        <div class="template__logn-button__container">
                            <button class="template__login-button">Login</button>
                        </div>
                    </div>
                </div>
        </section>
`;