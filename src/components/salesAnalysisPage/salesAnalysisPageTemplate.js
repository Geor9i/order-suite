import styles from './salesAnalysisPage.module.css'


export const salesAnaylsisPageTemplate = () => html`
<div
@click=${slideOpen}
data-id="analysis-container"
class="store__details__bar"
>
Analysis
</div>
${dataAnalysis(slideOpen)}`



const dataAnalysis = (slideOpen) => html`
<div id="analysis-container" class="store__details__container">
    <div @click=${slideOpen} data-id="sales-summary-dropdown" class="analysis__inner-bar">Sales Summary
    </div>
    <div id="sales-summary-dropdown" class="analysis__inner-dropdown">
        <div class="analysis__inner-content">
        <label for="sales-summary-input" id="sales-summary-input">Paste a 30 day+ sales summary report</label>
        <input class="analysis__inner-content-input" id="sales-summary-input" name="sales-summary-input" type="text">
        </input>
        <button class="analysis__inner-content-button">Process</button>
        </div>
    </div>
    <div @click=${slideOpen} data-id="hourly-sales-dropdown" class="analysis__inner-bar">Hourly Sales
    </div>
    <div id="hourly-sales-dropdown" class="analysis__inner-dropdown">
        <div class="analysis__inner-content">
        <label for="hourly-sales-input">Paste a 30 day+ hourly sales report</label>
        <input id="hourly-sales-input" class="analysis__inner-content-input type="text">
        </input>
        <button class="analysis__inner-content-button">Process</button>
        </div>
    </div>
</div>
`;



` <div class="sales-percentage-container">
<label for="sales-percentage-input-" class="sales-percentage-label" >Daily Sales</label>
<input maxlength="5" class="sales-percentage-input" id="sales-percentage-input-" placeholder="0"></input>
<p class="sales-percentage-input-sign">%</p>
</div>`