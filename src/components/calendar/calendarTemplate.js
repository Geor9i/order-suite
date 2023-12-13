import { html } from "../../../node_modules/lit-html/lit-html.js";


export const calendarTemplate = (dateUtil, stringUtil, upArrowClick, downArrowClick, clickDate) => {
    const weekdays = dateUtil.getWeekdays([]).map(day => stringUtil.toPascalCase(day));
    
    
    return html`
<div id="calendar-body">
    <div id="calendar-header">
        <div class="in-header-container">
            <h2 id="calendar-header-text">2025 June</h2>
        </div>
        <div class="in-header-container">
            <div class="arrow-container"></div>
            <div class="arrow-container">
                <div id="arrow-up"  @click=${upArrowClick}></div>
            </div>
            <div class="arrow-container">
                <div id="arrow-down"  @click=${downArrowClick}></div>    
            </div>
        </div>
    </div>
    <table id="day-table">
    <tbody @click=${clickDate} id="day-table-tbody">
    ${
            Array.from({ length: 7 }, (_, i) => html`
                <tr>
                ${Array.from({ length: 7 }, (_, d) => html`
                    ${i === 0 ? html`<th>${weekdays[d].slice(0, 3)}</th>` : html`<td>NA</td>`}
                `)}
                </tr>
            `)
        }
    </tbody>
    </table>
</div>
`};

