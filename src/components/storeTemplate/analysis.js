let storeForm = document.querySelector('.store__open-times__form__inactive');
let confirmButtonContainer = document.querySelector('.store__details-confirm-button__container');

let analysisPage = domGen(`
<div #analysis-container .store__details__container>
    <div .analysis__inner-bar>Sales Summary
    </div>
    <div .analysis__inner-dropdown>
        <div .analysis__inner-content>
        <label for="#sales-summary-input">Paste a 30 day+ sales summary report</label>
        <input .analysis__inner-content-input #sales-summary-input type="text">
        </input>
        <button .analysis__inner-content-button>Process</button>
        </div>
    </div>
    <div .analysis__inner-bar>Hourly Sales
    </div>
    <div .analysis__inner-dropdown>
        <div .analysis__inner-content>
        <label for="hourly-sales-input">Paste a 30 day+ hourly sales report</label>
        <input #hourly-sales-input .analysis__inner-content-input type="text">
        </input>
        <button .analysis__inner-content-button>Process</button>
        </div>
    </div>
</div>
`)

storeForm.insertBefore(analysisPage, confirmButtonContainer);