export class Calendar {

  constructor(utility, templateFunc, renderCalender) {
    this.utility = utility;
    this.templateFunc = templateFunc;
    this.renderCalender = renderCalender;
    this.showView = this._showView.bind(this);
    this.fillCalendar = this._fillCalendar.bind(this);
    this.upArrowClick = this._upArrowClick.bind(this);
    this.downArrowClick = this._downArrowClick.bind(this);
    this.clickDate = this._clickDate.bind(this);
    this.today = new Date();
    this.year = this.today.getFullYear();
    this.month = this.today.getMonth();
    this.originMonth = this.today.getMonth()
    this.originYear = this.today.getFullYear();
    
  }


  _showView(parent) {
    this.renderCalender(this.templateFunc(this.utility, this.upArrowClick, this.downArrowClick, this.clickDate), parent);
    this.fillCalendar()
  }

  _clickDate(e) {
    if (
      e.target.parentNode.tagName === "TR" &&
      e.target.getAttribute("date")
    ) {
      let selectedDate = e.target.getAttribute("date");
      let dateInputField = document.getElementById('date-input');
      dateInputField.value = selectedDate;
      this.utility.toggleVisibility(document.getElementById('calendar-container'))
    }
  }


   //Function to fill the dates in the calendar
   _fillCalendar() {

      let calenderHeaderTextElement = document.getElementById("calendar-header-text");
      let calendarTrCollection = document.querySelectorAll(`#day-table tr`);
      let todayDate = this.today;
      let year = this.year;
      let month = this.month;
      let day = todayDate.getDate();

      let selectedMonth = [...this.calendarMonth(year, month)];
      let prevMonth = this.getRightDate(year, month, 'back');
      prevMonth = [...this.calendarMonth(prevMonth.year, prevMonth.month - 1)];

      let nextMonth = this.getRightDate(year, month, 'next');
      nextMonth = [...this.calendarMonth(nextMonth.year, nextMonth.month - 1)];
      let isCurrent = false;

      //Get the index for the last monday of the previous month
      let prevMonthIndex = prevMonth.reduce((acc, curr, i) => {
        if (curr[1] === "Monday") {
          acc.pop();
          acc.push(i);
        }
        return acc;
      }, [])[0];
      let currentMonthIndex = 0;
      let nextMonthIndex = 0;
      calenderHeaderTextElement.innerText = `${year} ${this.utility.getMonth(month)}`;

      let activeRows = Array.from(calendarTrCollection).slice(1);

      //iterate over calendar table to map dates
      //row iteration
      for (let row = 0; row < activeRows.length; row++) {
        let colCollection = activeRows[row].cells;
        //col iteration
        for (let col = 0; col < colCollection.length; col++) {
          //if the current date's weekday calender mapping does not match the first weekday of the selected month
          if (!isCurrent && prevMonth.length > prevMonthIndex) {
            colCollection[col].innerText = prevMonth[prevMonthIndex][0];
            colCollection[col].style.backgroundColor = "rgba(200,200,200,0.5)";
            colCollection[col].style.color = "rgba(100,100,100,0.5)";

            let dateValues = this.getRightDate(year, month, "back");
            colCollection[col].setAttribute(
              "date",
              `${colCollection[col].innerText}/${dateValues.month}/${dateValues.year} - ${this.utility.getWeekDay(col)}`
            );
            prevMonthIndex++;
          }
          //if the two weekdays match confirm in boolean
          if (this.utility.getWeekDay(col) === selectedMonth[0][1]) {
            isCurrent = true;
          }
          //begin printing current month
          if (isCurrent) {
            //if there are no more days in the current month begin priniting next month
            if (currentMonthIndex > selectedMonth.length - 1) {
              colCollection[col].innerText = nextMonth[nextMonthIndex][0];
              //styles
              colCollection[col].style.backgroundColor = "rgba(200,200,200,0.5)";
              colCollection[col].style.color = "rgba(100,100,100,0.5)";
              nextMonthIndex++;

              let dateValues = this.getRightDate(year, month, "next");
              colCollection[col].setAttribute(
                "date",
                `${colCollection[col].innerText}/${dateValues.month}/${dateValues.year} - ${this.utility.getWeekDay(col)}`
              );
              continue;
            }
            // else print current month
            //-------------------------
            //have the current date always selected on the calender
            if (selectedMonth[currentMonthIndex][0] === day) {
              if (month === this.originMonth && year === this.originYear) {
                colCollection[col].style.border = "1px solid rgba(255,72,0, 0.5)";
              }
            } else {
              colCollection[col].style.border = "";
            }
            colCollection[col].innerText = selectedMonth[currentMonthIndex][0];
            colCollection[col].style.backgroundColor = "rgba(243,243,243,1)";
            colCollection[col].style.color = "rgba(0,0,0,0.8)";
            currentMonthIndex++;
            colCollection[col].setAttribute(
              "date",
              `${colCollection[col].innerText}/${month + 1}/${year} - ${this.utility.getWeekDay(col)}`
            );
          }
        }
      }
  //Update Value in Calendar
      this.year = year;
      this.month = month;
    
  }


  calendarMonth(year, month) {
    const monthDayCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


    function monthDataMap(year, month) {

      let monthMap = new Map();
      let months = getDaysByMonth(year);
      let weekDay = getFirstWeekDayYear(year);
      for (let m = 0; m < months.length; m++) {
        for (let d = 1; d <= months[m]; d++) {
          if (month === m) {
            monthMap.set(d, weekDay)
          }

          weekDay = ((daysOfWeek.indexOf(weekDay) + 1)) > 6 ? daysOfWeek[0] : daysOfWeek[daysOfWeek.indexOf(weekDay) + 1]
        }
      }

      return monthMap
    }


    //Check if a year is a leap year
    function getDaysByMonth(year) {
      let monthDaySpan = [...monthDayCount]
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
      let firstWeekDayOfYear = daysOfWeek[6];
      let i = 1950;
      let step = year > i ? 1 : -1;
      if (year === 1950) {
        return firstWeekDayOfYear
      } else {
        for (i; step === 1 ? i < year : i > year; i += step) {
          let totalDaysInYear = getDaysByMonth(i).reduce((a, b) => a + b, 0);
          let dayDeviation = totalDaysInYear - 364;
          if (step === 1) {
            if (daysOfWeek.indexOf(firstWeekDayOfYear) + dayDeviation > 6) {
              firstWeekDayOfYear = daysOfWeek[daysOfWeek.indexOf(firstWeekDayOfYear) + dayDeviation - 7];
            } else {
              firstWeekDayOfYear = daysOfWeek[daysOfWeek.indexOf(firstWeekDayOfYear) + dayDeviation];
            }
          } else {
            if (daysOfWeek.indexOf(firstWeekDayOfYear) - dayDeviation < 0) {
              firstWeekDayOfYear = daysOfWeek[daysOfWeek.indexOf(firstWeekDayOfYear) - dayDeviation + 7];
            } else {
              firstWeekDayOfYear = daysOfWeek[daysOfWeek.indexOf(firstWeekDayOfYear) - dayDeviation];
            }
          }

        }
      }
      return firstWeekDayOfYear;
    }


    return monthDataMap(year, month)
  }

  

  // Get mm/yy for previous or next month in the calendar
  getRightDate(year, month, direction) {
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
    return {year, month};
  }

  //On click functions to change dates
  _upArrowClick() {
    if (this.month + 1 < 12) {
      this.month++;
    } else {
      this.month = 0;
      this.year++;
    }
    this.fillCalendar();
  }

  _downArrowClick() {
    if (this.month - 1 >= 0) {
      this.month--;
    } else {
      this.month = 11;
      this.year--;
    }
    this.fillCalendar();
  }


}

