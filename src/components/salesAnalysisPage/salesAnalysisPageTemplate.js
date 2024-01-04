import { html } from 'lit-html';
import styles from './salesAnalysisPage.module.css'


export const salesAnalysisPageTemplate = (slideOpen, weekGuide, workHours, hourlySalesChangeHandler, submitHandler) => html`
<div class=${styles['page__container']}>
    <div @click=${slideOpen} data-id="sales-summary-dropdown" class=${`${styles['section__bar']} ${styles['section__bar-closed']}`}>Sales Summary
    </div>
    <div id="sales-summary-dropdown" class=${styles['expand__container']}>
        
        <div class=${styles['submit-btn-container']}>
            <button class=${styles['submit-btn']}>Submit</button>
        </div>
    </div>

    <div @click=${slideOpen} data-id="hourly-sales-dropdown" class=${`${styles['section__bar']} ${styles['section__bar-closed']}`}>Hourly Sales
    </div>
    <form @submit=${submitHandler} id="hourly-sales-dropdown" class=${styles['expand__container']}>
        <div @click=${slideOpen} data-id="hourly-sales-manual" class=${`${styles['section__bar']} ${styles['section__bar-inner']} ${styles['section__bar-closed']}`}>Manual Entry
        </div>
        <div @input=${hourlySalesChangeHandler} id="hourly-sales-manual" class=${styles['expand__container']}>
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
                    <div class=${styles['hourly-totals-container']}>
                        <div class=${styles['hourly-totals-field']}>
                            <label for="total-value">Total</label>
                            <input disabled id="total-value" value="0"></input>
                            <p>£</p>
                        </div>
                        <div class=${styles['hourly-totals-field']}>
                            <label for="total-percentage">Weekly Share</label>
                            <input disabled id="total-percentage" value="0"></input>
                            <p>%</p>
                        </div>
                    </div>
                </div>
                `)}
            </div>
        </div>
        <div @click=${slideOpen} data-id="sales-summary-analysis" class=${`${styles['section__bar']} ${styles['section__bar-inner']} ${styles['section__bar-closed']}`}>Report Analysis
        </div>
        <div id="sales-summary-analysis" class=${styles['expand__container']}>
       
        </div>
        <div class=${styles['submit-btn-container']}>
            <button class=${styles['submit-btn']}>Submit</button>
        </div>
    </form>
</div>
`;
