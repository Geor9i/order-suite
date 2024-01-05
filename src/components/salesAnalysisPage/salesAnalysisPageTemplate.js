import { html } from 'lit-html';
import styles from './salesAnalysisPage.module.css'


export const salesAnalysisPageTemplate = (slideOpen, hourlySales, hourlySalesInputHandler, hourlySalesChangeHandler, submitHandler) => html`
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
        <div @change=${hourlySalesChangeHandler} @input=${hourlySalesInputHandler} id="hourly-sales-manual" class=${styles['expand__container']}>
            <div class=${styles['manual-entry-container']}>
                ${Object.keys(hourlySales).map(weekday =>
                     html`
                        <div class=${styles['sales-summary-weekday']}>
                            <h2>${weekday}</h2>
                            <div class=${styles['manual-entry-weekday']}>
                                ${Object.keys(hourlySales[weekday].hours).map(hour => html`
                                    <div class=${styles['hour-container']}>
                                        <label for="${weekday}-${hour}">${hour}:00</label>
                                        <input maxLength="8" @click=${(e) => e.currentTarget.select()} for="${weekday}-${hour}" name="${weekday}-${hour}" value=${hourlySales[weekday].hours[hour]}>£</input>
                                    </div>
                                `)}
                            </div>
                            <div class=${styles['hourly-totals-container']}>
                                <div class=${styles['hourly-totals-field']}>
                                    <label for="total-value">Total</label>
                                    <input class=${styles['manual-totals']} disabled id="total-value-${weekday}" value=${hourlySales[weekday].totals.total}></input>
                                    <p>£</p>
                                </div>
                                <div class=${styles['hourly-totals-field'] }>
                                    <label for="total-percentage">Weekly Share</label>
                                    <input class=${styles['manual-totals']} disabled id="total-percentage-${weekday}" value=${hourlySales[weekday].totals.share}></input>
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
