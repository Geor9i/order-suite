import { html } from "../../../node_modules/lit-html/lit-html.js";
import styles from './calendar.module.scss';

export const calendarTemplate = (weekdays, controls) => html`
<div id="calendar-body" class=${styles['calendar-body']}>
    <div id="calendar-header" class=${styles['calendar-header']}>
        <div class=${styles['in-header-container']}>
            <h2 id="calendar-header-text" class=${styles['calendar-header-text']}>2025 June</h2>
        </div>
        <div class=${styles['in-header-container']}>
            <div class=${styles['arrow-container']}></div>
            <div class=${styles['arrow-container']}>
                <div id="arrow-up" class=${styles['arrow-up']}  @click=${controls.upArrowClick}></div>
            </div>
            <div class=${styles['arrow-container']}>
                <div id="arrow-down" class=${styles['arrow-down']}  @click=${controls.downArrowClick}></div>    
            </div>
        </div>
    </div>
    <table id="day-table" class=${styles['day-table']}>
    <tbody @click=${controls.clickDate} id="day-table-tbody">
    ${ Array.from({ length: 7 }, (_, i) => html`
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
`

