import { html } from 'lit-html';
import styles from './salesAnalysisPage.module.css'


export const salesAnalysisPageTemplate = (slideOpen, weekGuide, workHours) => html`
<div class=${styles['page__container']}>
    <div @click=${slideOpen} data-id="sales-summary-dropdown" class=${styles['section__bar']}>Sales Summary
    </div>
    <div id="sales-summary-dropdown" class=${styles['expand__container']}>
      
    </div>
    <div @click=${slideOpen} data-id="hourly-sales-dropdown" class=${styles['section__bar']}>Hourly Sales
    </div>
    <div id="hourly-sales-dropdown" class=${styles['expand__container']}>
        <div @click=${slideOpen} data-id="sales-summary-manual" class=${`${styles['section__bar']} ${styles['section__bar-inner']}`}>Manual Entry
        </div>
        <div id="sales-summary-manual" class=${styles['expand__container']}>
            <div class=${styles['manual-entry-container']}>
                ${weekGuide.map(weekday => html`
                <div class=${styles['sales-summary-weekday']}>
                    <h2>${weekday}</h2>
                    <div class=${styles['manual-entry-weekday']}>
                        ${workHours[weekday].map(hour => html`
                            <div class=${styles['hour-container']}>
                                <label for="${weekday}-${hour}">${hour}:00</label>
                                <input for="${weekday}-${hour}" name="${weekday}-${hour}">£</input>
                            </div>
                        `)}
                    </div>
                </div>
                `)}
            </div>
        </div>
        <div @click=${slideOpen} data-id="sales-summary-analysis" class=${`${styles['section__bar']} ${styles['section__bar-inner']}`}>Report Analysis
        </div>
        <div id="sales-summary-analysis" class=${styles['expand__container']}>
       
        </div>
    </div>
</div>
`;





` <div class=${styles['sales-percentage-container']}>
<label for="sales-percentage-input-" class=${styles['sales-percentage-label']} >Daily Sales</label>
<input maxlength="5" class=${styles['sales-percentage-input']} id="sales-percentage-input-" placeholder="0"></input>
<p class=${styles['sales-percentage-input-sign']}>%</p>
</div>`