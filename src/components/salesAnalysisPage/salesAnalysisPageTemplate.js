import { html } from "lit-html";
import styles from "./salesAnalysisPage.module.scss";
import StringUtil from "../../utils/stringUtil.js";
const stringUtil = new StringUtil();

export const salesAnalysisPageTemplate = (
  slideOpen,
  hourlySales,
  hourlySalesInputHandler,
  hourlySalesChangeHandler,
  weeklyTotal,
  hourlySalesDumpHandler,
  hourlySalesReportHandler,
  submitHandler
) => html`
<div class=${styles["page__container"]}>
   

    <div @click=${slideOpen} data-id="hourly-sales" class=${`${styles["section__bar"]} ${styles["section__bar-closed"]}`}>Hourly Sales
    </div>
    <form @submit=${submitHandler} id="hourly-sales" class=${
  styles["expand__container"]
}>
    <div class=${styles["inner-slider-container"]}>
        <div @click=${slideOpen} data-id="hourly-sales-manual" class=${`${styles["section__bar"]} ${styles["section__bar-inner"]} ${styles["section__bar-closed"]}`}>
        <p>Hourly Manual Entry</p>
        </div>
        <div @change=${hourlySalesChangeHandler} @input=${hourlySalesInputHandler} id="hourly-sales-manual" class=${
styles["expand__container"]}>
            <div class=${styles["manual-entry-container"]}>
                ${hourlySales.map(([weekday, data]) => html`
                        <div class=${styles["sales-summary-weekday"]}>
                            <h2>${stringUtil.toPascalCase(weekday)}</h2>
                            <div class=${styles["manual-entry-weekday"]}>
                                ${Object.keys(data.hours).map(
                                  (hour) => html`
                                    <div class=${styles["hour-container"]}>
                                        <label for="${weekday}-${hour}">${hour}:00</label>
                                        <p>£</p>
                                        <input maxLength="8" @click=${(e) =>
                                          e.currentTarget.select()} id="${weekday}-${hour}" name="${weekday}-${hour}" .value=${Number(Number(
                                    data.hours[hour]).toFixed(2))}></input>
                                    </div>
                                `
                                )}
                            </div>
                            <div class=${styles["hourly-totals-container"]}>
                                <div class=${styles["hourly-totals-field"]}>
                                    <label for="total-${weekday}">Total</label>
                                    <p>£</p>
                                    <input @click=${(e) =>
                                      e.currentTarget.select()} class=${
                      styles["manual-totals"]
                    } id="total-${weekday}" .value=${Number(Number(
                     data.totals.total).toFixed(2))}></input>
                                </div>
                                <div class=${styles["hourly-totals-field"]}>
                                    <label for="share-${weekday}">Weekly Share</label>
                                    <p>%</p>
                                    <input @click=${(e) =>
                                      e.currentTarget.select()} class=${
                      styles["manual-totals"]
                    } id="share-${weekday}" .value=${Number(Number(
                      data.totals.share).toFixed(2))
                      }></input>
                                </div>
                            </div>
                        </div>
                `
                )}
            </div>
            <div class=${styles["weekly-total-container"]}>
                <label for="weekly-total-field">Total Sales</label>
                <input disabled id="weekly-total-field" name="weekly-total-field" .value=${Number(
                  weeklyTotal.toFixed(2)
                )}></input>
            </div>
        </div>
            </div>
    <div class=${styles["inner-slider-container"]}>
        <div @click=${slideOpen} data-id="hourly-sales-analysis" class=${`${styles["section__bar"]} ${styles["section__bar-inner"]} ${styles["section__bar-closed"]}`}>Report Analysis
        </div>
        <div id="hourly-sales-analysis" class=${styles["expand__container"]}>
            <div class=${styles["expand-content"]}>
                <div class=${styles["input-group"]}>
                    <label for="hourly-report-dump">Paste RMF Hourly Sales Report</label>
                    <input @input=${hourlySalesDumpHandler} id="hourly-report-dump" class=${
                      styles["report-dump"]
                    }></input>
                </div>
                <div class=${styles["input-group"]}>
                    <label for="hourly-report-select">Paste RMF Hourly Sales Report</label>
                    <select id="hourly-report-select" class=${
                      styles["hourly-report-select"]
                    }>
                        <option value="averageReport">Weekly Average Report</option>
                        ${hourlySales.map(
                          ([weekday, data]) =>
                            html`<option value=${weekday}>
                              ${stringUtil.toPascalCase(weekday)}
                            </option>`
                        )}
                    </select>
                </div>
                <button type="button" @click=${hourlySalesReportHandler} class=${styles["process-btn"]}>Process</button>
            </div>
        </div>
        <div class=${styles["submit-btn-container"]}>
            <button class=${styles["submit-btn"]}>Submit</button>
        </div>
    </div>
    </form>
</div>
`;
