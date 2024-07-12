import { html } from "lit-html";
import styles from './calendar.scss';

export const calendarBodyTemplate = (controls) => html`
<div class=${styles['container']}>
    <header class=${styles['calendar-header']}>
            <p @click=${controls.changeMode} class=${styles['calendar-date']}>2025 June</p>
        <div class=${styles['arrow-container']}>
                <div  class=${styles['arrow']}  @click=${() => controls.arrowClick(1)}>
                    <i class="fa-solid fa-angle-up"></i>
                </div>
                <div class=${styles['arrow']}  @click=${() => controls.arrowClick(-1)}>
                    <i class="fa-solid fa-angle-down"></i>
                </div>    
        </div>
    </header>
    <main>
    </main>
</div>
`

export const calendarDateTemplate = (weekdays, dates, today, controls) => html`
    <div class=${styles['row']}>
        ${weekdays.map(day => html`
            <div class=${styles['cell-inactive']}>${day}</div>
        `)}
    </div>

    ${dates.map(group => html`
        <div class=${styles['row']}>
            ${group.map(date => html`
                <div @click=${controls.clickCell}
                data-date=${date[0]}
                data-month=${date[1].month}
                data-year=${date[1].year} 
                data-day=${date[1].weekday}
                class=
                ${
                    today.getDate() === date[0] && today.getMonth() === date[1].month && today.getFullYear() === date[1].year ?
                    `${styles['cell']} ${styles['today']}` : date[1]?.range ? `${styles['cell']} ${styles['cell-indirect']}` : styles['cell']}>
                    ${date[0]
                }
                </div>
            `)}
        </div>
    `)}
`

export const calendarMonthsTemplate = (months, today, calendarDate, controls) => html`
    ${months.map((group, i1) => html`
        <div class=${styles['row']}>
            ${group.map((date, i2) => html`
                <div
                data-month=${(i1 * 4) + i2} 
                @click=${controls.clickCell} 
                class=${today.getMonth() === (i1 * 4) + i2 && today.getFullYear() === calendarDate.year ?
                    `${styles['cell']} ${styles['today']}` 
                    : styles['cell']}>
                ${date}
                </div>
            `)}
        </div>
    `)}
` 

export const calendarYearsTemplate = (years, today, controls) => html`
    ${years.map(group => html`
        <div class=${styles['row']}>
            ${group.map(year => html`
                <div 
                data-year=${year} 
                @click=${controls.clickCell} 
                class=${today.getFullYear() === year ?
                    `${styles['cell']} ${styles['today']}` 
                    : styles['cell']}>
                ${year}
            </div>
            `)}
        </div>
    `)}
` 