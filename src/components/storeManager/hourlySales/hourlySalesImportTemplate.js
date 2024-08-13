import { html } from "lit-html";

export const hourlySalesImportTemplate = (hourlySales, controls) => html`
  <div class=${styles["expand-content"]}>
    <div class=${styles["input-group"]}>
        <label for="hourly-report-dump">Paste RMF Hourly Sales Report</label>
        <input @input=${controls.hourlySalesDumpHandler} id="hourly-report-dump" class=${
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
    <button type="button" @click=${controls.hourlySalesReportHandler} class=${styles["process-btn"]}>Process</button>
</div>
`