import {
  calendarBodyTemplate,
  calendarMonthsTemplate,
  calendarYearsTemplate,
  calendarDateTemplate,
} from "./calendarTemplate.js";
import { utils } from "../../utils/utilConfig.js";
import { render } from "lit-html";
import styles from "./calendar.scss";
import Modal from "../shared/modal/modal.js";
export default class Calendar {
  constructor(width = 350, height = 350) {
    this.width = width;
    this.height = height;
    this.modal = null;
    this.domUtil = utils.domUtil;
    this.dateUtil = utils.dateUtil;
    this.stringUtil = utils.stringUtil;
    this.today = new Date();
    this.date = this.today.getDate();
    this.year = this.today.getFullYear();
    this.month = this.today.getMonth();
    this.day = this.today.getDay();
    this.mode = "date";
    this._delimiter = ' ';
    this.months = this.dateUtil.getMonths([]);
    this.shortMonths = this.months.map((month) => this.stringUtil.toPascalCase(month.slice(0, 3)));
    this.weekdays = this.dateUtil.getWeekdays([]);
    this.shortWeekdays = this.weekdays.map((day) => this.stringUtil.toPascalCase(day.slice(0, 3)));
    this.events = {};
  }

  set delimiter(string) {
    this._delimiter = string;
  }

  get fullDate() {
    return `${this.stringUtil.toPascalCase(this.weekdays[this.dateUtil.getDay(this.day)])}${this._delimiter}${this.date}${this._delimiter}${this.shortMonths[this.month]}${this._delimiter}${this.year}`;
  }
  get dateObj() {
    return new Date(`${this.year}/${this.month + 1}/${this.date}`);
  }

  renderBody(x, y) {
    const modalStyles = {
      width: `${this.width}px`,
      height: `${this.height}px`,
      left: `${x - (this.width / 2)}px`,
      top: `${y - (this.height / 2)}px`,
      border: 'none',
      'z-index': '2001',
    }
    const backdropStyles = {'z-index': '2000'};
    this.modal = new Modal(document.body, '', '', { noHeader: true, styles: modalStyles, backdropStyles });

    const controls = {
      changeMode: this.changeMode.bind(this, 1),
      arrowClick: this.arrowClick.bind(this),
      clickCell: this.clickCell.bind(this),
    };
    render(calendarBodyTemplate(controls), this.modal.element);
    this.contentContainer = this.modal.element.querySelector("main");
    this.dateDisplay = this.modal.element.querySelector(`.${styles["calendar-date"]}`);
   
    this.renderContent();
    this.setDisplayDate();
  }

  open(e) {
    const { clientX, clientY } = e;
    this.renderBody(clientX, clientY);
    this.emit('open');
  }

  close() {
    this.emit('close', {date: this.fullDate, dateObj: this.dateObj});
    this.modal.destroy();
  }

  setDisplayDate() {
    const display = {
      date: () => `${this.year} ${this.months[this.month].toUpperCase()}`,
      month: () => `${this.year}`,
      year: () => `${this.year} - ${this.year + 15}`,
    };
    this.dateDisplay.textContent = display[this.mode]();
  }

  changeMode(sign) {
    const modes = ["date","month","year"];
    const modeIndex = modes.indexOf(this.mode);
    const newMode = modes[Math.min(Math.max(modeIndex + sign, 0), modes.length - 1)];
    if (this.mode !== newMode)  {
      this.mode = newMode;
      this.renderContent();
    }
    this.setDisplayDate();
  }

  renderContent() {
    const date = {
      date: this.date,
      month: this.month,
      year: this.year,
    }
    const modes = {
      date: {template: calendarDateTemplate, data: () => [this.shortWeekdays, this.dateMatrix(), this.today]},
      month: {template: calendarMonthsTemplate, data: () => [this.monthMatrix(), this.today, date]},
      year: {template: calendarYearsTemplate, data: () => [this.yearsMatrix(), this.today]},
    } 
    const controls = {
      clickCell: this.clickCell.bind(this),
    };
    const selectedMode = modes[this.mode];
    render(selectedMode.template(...selectedMode.data(), controls), this.contentContainer);
  }

  clickCell(e) {
    let keys = e.target.dataset;
    if (this.mode === "date") {
      Object.keys(keys).forEach((entry) => (this[entry] = Number(keys[entry])));
    } else if (this.mode === "month") {
      this.month = Number(keys.month);
    } else if (this.mode === "year") {
      this.year = Number(keys.year);
    }
    this.mode === 'date' && this.close();
    this.changeMode(-1);
  }

  monthMatrix() {
    const monthMatrix = [];
    const months = this.dateUtil.getMonths([]).map((month) => month.slice(0, 3).toUpperCase());
    months.forEach((month, i) =>
      i % 4 === 0
        ? monthMatrix.push([month])
        : monthMatrix[monthMatrix.length - 1].push(month)
    );
    return monthMatrix;
  }
  yearsMatrix() {
    const yearMatrix = [];
    const startYear = this.year;
    const years = new Array(16).fill(startYear).map((year, i) => year + i);
    years.forEach((year, i) =>
      i % 4 === 0
        ? yearMatrix.push([year])
        : yearMatrix[yearMatrix.length - 1].push(year)
    );
    return yearMatrix;
  }

  dateMatrix() {
    const totalCells = 42;
    const dateMatrix = [];
    let selectedMonth = [...this.calendarMonth(this.year, this.month)];
    let prevMonth = this.getMonthYear(this.year, this.month, -1);
    prevMonth = [...this.calendarMonth(prevMonth.year, prevMonth.month)];
    let nextMonth = this.getMonthYear(this.year, this.month, 1);
    nextMonth = [...this.calendarMonth(nextMonth.year, nextMonth.month)];
    const prevMonthCells = Math.abs(1 - selectedMonth[0][1].weekday);
    const nextMonthCells = totalCells - (prevMonthCells + selectedMonth.length);
    const prevMonthRange = prevMonth.slice(prevMonth.length - prevMonthCells).map(day => day = [day[0], {...day[1], range: 'previous'}])
    const nextMonthRange = nextMonth.slice(0, nextMonthCells).map(day => day = [day[0], {...day[1], range: 'next'}])
    const calendarRange = [...prevMonthRange, ...selectedMonth, ...nextMonthRange];
    calendarRange.forEach((day, i) =>
      i % 7 === 0
        ? dateMatrix.push([day])
        : dateMatrix[dateMatrix.length - 1].push(day)
    );
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
            monthMap.set(d, { weekday, month, year });
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
                weekdays[weekdays.indexOf(firstWeekDayOfYear) + dayDeviation];
            }
          } else {
            if (weekdays.indexOf(firstWeekDayOfYear) - dayDeviation < 0) {
              firstWeekDayOfYear =
                weekdays[
                  weekdays.indexOf(firstWeekDayOfYear) - dayDeviation + 7
                ];
            } else {
              firstWeekDayOfYear =
                weekdays[weekdays.indexOf(firstWeekDayOfYear) - dayDeviation];
            }
          }
        }
      }
      return firstWeekDayOfYear;
    }

    return monthDataMap(year, month);
  }
  getMonthYear(year, month, sign) {
    month = month + sign > 11 ? 0 : month + sign < 0 ? 11 : month + sign;
    year = (sign > 0 && month === 0) || (sign < 0 && month === 11) ? year + sign : year;
    return { month, year };
  }

  arrowClick(sign) {
    let { month, year } = this.getMonthYear(this.year, this.month, sign);
    if (this.mode === 'date') {
      this.month = month;
      this.year = year;
    } else if (this.mode === 'month') {
      this.year += sign;
    } else if (this.mode === 'year') {
      this.year += (15 * sign);
    }
    this.renderContent();
    this.setDisplayDate();
  }


  on(eventType, subscriberId, callback) {
    if(this.events.hasOwnProperty(eventType)) {
        if (this.events[eventType].hasOwnProperty(subscriberId)) {
            this.events[eventType][subscriberId].push({callback});
        }else {
            this.events[eventType][subscriberId] = [{callback}];
        }
    } else {
        this.events[eventType] = {
            [subscriberId]: [{callback}]
        };
    }
    
    const subscribtionIndex = this.events[eventType][subscriberId].length - 1;
    return () => {
        this.events[eventType][subscriberId].splice(subscribtionIndex, 1);
    }
}

emit(eventType, data = null) {
    if (this.events.hasOwnProperty(eventType)) {
        Object.keys(this.events[eventType]).forEach(subscriberId  => {
            this.events[eventType][subscriberId].forEach(subscription => subscription.callback(data));
        })
    }
}
}
