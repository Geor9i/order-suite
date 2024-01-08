import { html } from 'lit-html';
import styles from './salesAnalysisPage.module.css';
import StringUtil from '../../utils/stringUtil.js';
const stringUtil = new StringUtil();

export const salesAnalysisPageTemplate = (slideOpen, hourlySales, hourlySalesInputHandler, hourlySalesChangeHandler, weeklyTotal, submitHandler) => html`
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
        <div @click=${slideOpen} data-id="hourly-sales-manual" class=${`${styles['section__bar']} ${styles['section__bar-inner']} ${styles['section__bar-closed']}`}>
        <p>Hourly Manual Entry</p>
        </div>
        <div @change=${hourlySalesChangeHandler} @input=${hourlySalesInputHandler} id="hourly-sales-manual" class=${styles['expand__container']}>
            <div class=${styles['manual-entry-container']}>
                ${Object.keys(hourlySales).map(weekday =>
                     html`
                        <div class=${styles['sales-summary-weekday']}>
                            <h2>${stringUtil.toPascalCase(weekday)}</h2>
                            <div class=${styles['manual-entry-weekday']}>
                                ${Object.keys(hourlySales[weekday].hours).map(hour => html`
                                    <div class=${styles['hour-container']}>
                                        <label for="${weekday}-${hour}">${hour}:00</label>
                                        <p>£</p>
                                        <input maxLength="8" @click=${(e) => e.currentTarget.select()} for="${weekday}-${hour}" name="${weekday}-${hour}" .value=${hourlySales[weekday].hours[hour]}></input>
                                    </div>
                                `)}
                            </div>
                            <div class=${styles['hourly-totals-container']}>
                                <div class=${styles['hourly-totals-field']}>
                                    <label for="total-${weekday}">Total</label>
                                    <p>£</p>
                                    <input @click=${(e) => e.currentTarget.select()} class=${styles['manual-totals']} id="total-${weekday}" .value=${hourlySales[weekday].totals.total}></input>
                                </div>
                                <div class=${styles['hourly-totals-field'] }>
                                    <label for="share-${weekday}">Weekly Share</label>
                                    <p>%</p>
                                    <input @click=${(e) => e.currentTarget.select()} class=${styles['manual-totals']} id="share-${weekday}" .value=${hourlySales[weekday].totals.share}></input>
                                </div>
                            </div>
                        </div>
                `)}
            </div>
            <div class=${styles['weekly-total-container']}>
                <label for="weekly-total-field">Total Sales</label>
                <input disabled id="weekly-total-field" name="weekly-total-field" .value=${weeklyTotal}></input>
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
