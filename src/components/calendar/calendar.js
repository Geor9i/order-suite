import BaseComponent from "../../framework/baseComponent.js";
import { calendarBodyTemplate, calendarMonthsTemplate, calendarYearsTemplate, calendarDateTemplate} from "./newCalendarTemplate.js";
import { utils } from "../../utils/utilConfig.js";
import { render } from "lit-html";
import styles from './styles.scss';
export default class Calendar {
  constructor(calendarContainer) {
    this.calendarContainer = calendarContainer;
    this.domUtil = utils.domUtil;
    this.dateUtil = utils.dateUtil;
    this.stringUtil = utils.stringUtil;
    this.date = new Date().getDate();
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth();
    this.day = new Date().getDay();
    this.mode = 'date';
    this.months = this.dateUtil.getMonths([]);
    this.weekdays = this.dateUtil.getWeekdays([]).map(day => this.stringUtil.toPascalCase(day.slice(0, 3)));
    this.render();
    console.log(this.months);
  }

  render() {
    const controls = {
      changeMode: this.changeMode.bind(this, 1),
      upArrowClick: this.upArrowClick.bind(this),
      downArrowClick: this.downArrowClick.bind(this),
    }
    render(calendarBodyTemplate(controls), this.calendarContainer);
    this.content = this.calendarContainer.querySelector('main');
    this.dateDisplay = this.calendarContainer.querySelector(`.${styles['calendar-date']}`);
    this.showDates();
  }

  open() {
    if (!this.backdrop) {
      this.backdrop = document.createElement('div');
      this.backdrop.className = styles['calendar-backdrop'];
      this.backdrop.addEventListener('click', this.close.bind(this));
      document.body.appendChild(this.backdrop);
    } else {
      document.body.appendChild(this.backdrop);
    }
    this.domUtil.toggleVisibility(this.calendarContainer);
  }

  showDates() {
    const controls = {
      clickCell: this.clickCell.bind(this)
    }
    render(calendarDateTemplate(this.weekdays, this.dateMatrix(), controls), this.content);
    this.setDisplayDate()
  }

  setDisplayDate() {
    const display = {
      date: () => `${this.year} ${this.months[this.month].toUpperCase()}`,
      month: () => `${this.year}`,
      year: () => `${this.year} - ${this.year + 16}`,
    }
    this.dateDisplay.textContent = display[this.mode]();
  }

  close() {
    this.backdrop.remove();
    this.domUtil.toggleVisibility(this.calendarContainer, { off: true });
  }


  changeMode(sign) {
    const modes = [
      {type: 'date', template: calendarDateTemplate, data: [this.weekdays, this.dateMatrix()] },
      {type: 'month', template: calendarMonthsTemplate, data: [this.monthMatrix()] },
      {type: 'year', template: calendarYearsTemplate, data: [this.yearsMatrix()] },
    ];
    const controls = {
      clickCell: this.clickCell.bind(this)
     }
     const modeIndex = modes.findIndex(mode => mode.type === this.mode);
     const newMode = modes[Math.min(Math.max(modeIndex + sign, 0), modes.length - 1)];
     this.mode = newMode.type;
     render(newMode.template(...newMode.data, controls), this.content)
  }


  clickCell(e) {
    this.changeMode(-1);
    if (this.mode === 'date') {
      let keys = e.target.dataset;
      Object.keys(keys).forEach(entry => this[entry] = Number(keys[entry]));
    }
    this.setDisplayDate();
  }

  monthMatrix() {
  const monthMatrix = [];
  const months = this.dateUtil.getMonths([]).map(month => month.slice(0, 3).toUpperCase());
  months.forEach((month, i) => i % 4 === 0 ? monthMatrix.push([month]) : monthMatrix[monthMatrix.length - 1].push(month));
  return monthMatrix;
  }
  yearsMatrix() {
    const yearMatrix = [];
    const startYear = this.year;
    const years = new Array(16).fill(startYear).map((year, i) => year + i);
    years.forEach((year, i) => i % 4 === 0 ? yearMatrix.push([year]) : yearMatrix[yearMatrix.length - 1].push(year));
    return yearMatrix;
    }

  dateMatrix () {
    const totalCells = 42;
    const dateMatrix = [];
    let selectedMonth = [...this.calendarMonth(this.year, this.month)];
    let prevMonth = this.getMonthYear(this.year, this.month, "back");
    prevMonth = [...this.calendarMonth(prevMonth.year, prevMonth.month - 1)];
    let nextMonth = this.getMonthYear(this.year, this.month, "next");
    nextMonth = [...this.calendarMonth(nextMonth.year, nextMonth.month - 1)];
    const lastMonthCells = Math.abs(1 - selectedMonth[0][1].weekday);
    const nextMonthCells = totalCells - (lastMonthCells + selectedMonth.length);
    const calendarRange = [
      ...prevMonth.slice(prevMonth.length - lastMonthCells),
      ...selectedMonth,
      ...nextMonth.slice(0, nextMonthCells)
    ];
    calendarRange.forEach((day, i) => i % 7 === 0 ? dateMatrix.push([day]) : dateMatrix[dateMatrix.length - 1].push(day));
    return dateMatrix;
  }

  calendarMonth(year, month) {
    const monthDayCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let weekdays = [1, 2, 3, 4, 5, 6, 7];

    function monthDataMap(year, month) {
      let monthMap = new Map();
      let months = getDaysByMonth(year);
      let weekday = getFirstWeekDayYear(year);
      for (let m = 0; m < months.length; m++) {
        for (let d = 1; d <= months[m]; d++) {
          if (month === m) {
            monthMap.set(d, {weekday, month, year});
          }

          weekday =
            weekdays.indexOf(weekday) + 1 > 6
              ? weekdays[0]
              : weekdays[weekdays.indexOf(weekday) + 1];
        }
      }

      return monthMap;
    }

    //Check if a year is a leap year
    function getDaysByMonth(year) {
      let monthDaySpan = [...monthDayCount];
      if (year % 4 !== 0) {
        return monthDaySpan;
      } else {
        if (year % 100 !== 0) {
          monthDaySpan[1] = 29;
          return monthDaySpan;
        } else {
          if (year % 400 !== 0) {
            return monthDaySpan;
          } else {
            monthDaySpan[1] = 29;
            return monthDaySpan;
          }
        }
      }
    }
    // Get the weekday for the first day of the selected year
    function getFirstWeekDayYear(year) {
      //1950 Jan 01 - Sunday
      let firstWeekDayOfYear = weekdays[6];
      let i = 1950;
      let step = year > i ? 1 : -1;
      if (year === 1950) {
        return firstWeekDayOfYear;
      } else {
        for (i; step === 1 ? i < year : i > year; i += step) {
          let totalDaysInYear = getDaysByMonth(i).reduce((a, b) => a + b, 0);
          let dayDeviation = totalDaysInYear - 364;
          if (step === 1) {
            if (weekdays.indexOf(firstWeekDayOfYear) + dayDeviation > 6) {
              firstWeekDayOfYear =
                weekdays[
                  weekdays.indexOf(firstWeekDayOfYear) + dayDeviation - 7
                ];
            } else {
              firstWeekDayOfYear =
                weekdays[
                  weekdays.indexOf(firstWeekDayOfYear) + dayDeviation
                ];
            }
          } else {
            if (weekdays.indexOf(firstWeekDayOfYear) - dayDeviation < 0) {
              firstWeekDayOfYear =
                weekdays[
                  weekdays.indexOf(firstWeekDayOfYear) - dayDeviation + 7
                ];
            } else {
              firstWeekDayOfYear =
                weekdays[
                  weekdays.indexOf(firstWeekDayOfYear) - dayDeviation
                ];
            }
          }
        }
      }
      return firstWeekDayOfYear;
    }

    return monthDataMap(year, month);
  }
  // Get mm/yy for previous or next month in the calendar
  getMonthYear(year, month, direction) {
    month += 1;
    switch (direction) {
      case "back":
        if (month - 1 < 1) {
          month = 12;
          year -= 1;
        } else {
          month--;
        }
        break;
      case "next":
        if (month + 1 > 12) {
          month = 1;
          year += 1;
        } else {
          month++;
        }
        break;
    }
    return { year, month };
  }
  //On click functions to change dates
  upArrowClick() {
    if (this.month + 1 < 12) {
      this.month++;
    } else {
      this.month = 0;
      this.year++;
    }
    this.fillCalendar();
  }

  downArrowClick() {
    if (this.month - 1 >= 0) {
      this.month--;
    } else {
      this.month = 11;
      this.year--;
    }
    this.fillCalendar();
  }
}
