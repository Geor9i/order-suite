import DateUtil from "./dateUtil.js";
import { storeSettings } from "../storeSettings.js";
export default class TimeUtil {
  constructor() {
    this.storeSettings = storeSettings;
    this.dateUtil = new DateUtil();
  }

  math() {
    return {
      add: (timeA, timeB) => this.math().calcTime(timeA, timeB, "+"),
      deduct: (timeA, timeB) => this.math().calcTime(timeA, timeB, "-"),
      multiply: (timeA, timeB) => this.math().calcTime(timeA, timeB, "*"),
      divide: (timeA, timeB, { percentage = false } = {}) =>
        this.math().calcTime(timeA, this.math().max(timeB, "00:01"), "/", {
          percentage,
        }),
      multiplyNormal: (time, number) =>
        this.math().calcTime(time, number, "multiply"),
      divideNormal: (time, number) =>
        this.math().calcTime(time, number, "divide"),
      calcTime: (timeA, param2, sign, { percentage = false } = {}) => {
        timeA = this.time().toMinutes(timeA);
        param2 =
          typeof param2 === "number" ? param2 : this.time().toMinutes(param2);
        let methods = {
          "+": () => timeA + param2,
          "-": () => timeA - param2,
          "*": () => timeA * param2,
          "/": () => timeA / param2,
          multiply: () => timeA * param2,
          divide: () => timeA / param2,
        };
        let result = methods[sign]();
        if (percentage) {
          return result;
        }
        let resultSign = Math.sign(result) === 1 ? "" : "-";
        result = Math.abs(result);
        let h = Math.floor(result / 60);
        let m = Math.floor(result - h * 60);
        let lz = (num) => (Math.abs(num) < 10 ? "0" : "");
        return `${resultSign}${lz(h)}${h}:${lz(m)}${m}`;
      },
      calcClockTime: (time, modTime, sign = "+") => {
        sign = sign === "-" || sign === -1 ? -1 : 1;
        let clockHours = this.time().toObj(time);
        let modHours = this.time().toObj(modTime);
        let dayCount = Math.floor(Math.abs(modHours.h / 24));
        let minToHour = Math.floor(modHours.m / 60);
        modHours.m = modHours.m - minToHour * 60;
        clockHours.h += (modHours.h + minToHour) * sign;
        clockHours.h =
          clockHours.h < 0 || clockHours.h > 24
            ? clockHours.h + 24 * Math.max(dayCount, 1)
            : clockHours.h;
        clockHours.m = clockHours.m + modHours.m * sign;
        if (clockHours.m < 0) {
          clockHours.m += 60;
          clockHours.h =
            clockHours.h - 1 < 0 ? clockHours.h - 1 + 24 : clockHours.h - 1;
        } else if (clockHours.m > 60) {
          clockHours.m -= 60;
          clockHours.h =
            clockHours.h + 1 > 24 ? clockHours.h + 1 - 24 : clockHours.h + 1;
        }
        if (clockHours.h === 24) {
          clockHours.h = 0;
        }
        return clockHours;
      },
      max: (...times) => {
        return times.reduce((biggest, current) => {
          let currentIsLess = this.time(biggest).isBiggerEqThan(current);
          biggest = currentIsLess ? biggest : current;
          return biggest;
        }, `${Number.MIN_SAFE_INTEGER}:${Number.MIN_SAFE_INTEGER}`);
      },
      min: (...times) => {
        return times.reduce((smallest, current) => {
          let currentIsBigger = this.time(smallest).isLessEqThan(current);
          smallest = currentIsBigger ? smallest : current;
          return smallest;
        }, `${Number.MAX_SAFE_INTEGER}:${Number.MAX_SAFE_INTEGER}`);
      },
    };
  }

  weekdayHourly(weekDayOpenTimes, options = {}) {
    let adjustForClock = false;
    let openTimes = this.time().toObj(weekDayOpenTimes);
    let [start, startMin] = openTimes.startTime.split(":");
    let [end, endMin] = openTimes.endTime.split(":");
    [start, end] = [start, end].map(Number);
    let result = {};
    for (let i = start; i <= end; i++) {
      let lz = i < 10 ? "0" : "";
      if (options.clock && i === 24) {
        i = 0;
        adjustForClock = true;
        lz = i < 10 ? "0" : "";
      }
      if (i === start || i === end) {
        result[`${lz}${i}:${i === start ? startMin : endMin}`] = {};
      } else {
        result[`${lz}${i}:00`] = {};
      }

      if (options.clock && i === 0 && adjustForClock) {
        i = 24;
      }
    }
    return result;
  }

  time(time) {
    return {
      isEq: (compareTime) => {
        let compare = this.time().toSeconds(compareTime);
        return this.time().toSeconds(time) === compare;
      },
      isBiggerThan: (compareTime) => {
        let compare = this.time().toSeconds(compareTime);
        return this.time().toSeconds(time) > compare;
      },
      isLessThan: (compareTime) => {
        let compare = this.time().toSeconds(compareTime);
        return this.time().toSeconds(time) < compare;
      },
      isBiggerEqThan: (compareTime) => {
        let compare = this.time().toSeconds(compareTime);
        return this.time().toSeconds(time) >= compare;
      },
      isLessEqThan: (compareTime) => {
        let compare = this.time().toSeconds(compareTime);
        return this.time().toSeconds(time) <= compare;
      },
      isWithin: (startTime, endTime) => {
        if (
          this.time(startTime).isLessEqThan(time) &&
          this.time(endTime).isBiggerEqThan(time)
        ) {
          return true;
        }
        return false;
      },
      timeSpanLength: (startTime, endTime) => {
        return this.math().deduct(endTime, startTime);
      },
      toMinutes: (time) => {
        let obj = this.time().toObj(time);
        return obj.h * 60 + obj.m;
      },
      toSeconds: (time) => {
        let obj = this.time().toObj(time);
        return obj.h * 60 * 60 + obj.m * 60;
      },
      toHours: (minutes) => {
        let hours = Math.trunc(Math.max(0, minutes / 60));
        return {
          h: hours,
          m: minutes - hours * 60,
        };
      },
      toClockFormat(string) {
        string = string.split(":").join("");
        let timeNumber = Number(string);
        if (isNaN(timeNumber)) {
          throw new Error(`${string} is not in a valid time format`);
        }

        if (string.length >= 4) {
          if (timeNumber > 2359 || timeNumber < 0) {
            string = "0000";
          }

          if (string.length > 2) {
            let hours = string.slice(0, 2);
            let minutes = string.slice(2);
            let [tens, units] = minutes.split("");
            if (tens) {
              tens = Number(tens) > 5 ? 5 : tens;
            }
            if (units) {
              units = Number(units) > 9 ? 9 : units;
            }
            string = `${hours}${tens}${units}`;
          }

          string = string.split(":").join("");
          return `${string.slice(0, 2)}:${string.slice(2, 4)}`;
        }
        return string;
      },
      toTimeFormat(string) {
        string = string.split(":").join("");
        let timeNumber = Number(string);
        if (isNaN(timeNumber)) {
          throw new Error(`${string} is not in a valid time format`);
        }
        if (string.length >= 4) {
          string = string.split(":").join("");
          return `${string.slice(0, 2)}:${string.slice(2, 4)}`;
        }
        return string;
      },
      fillTime(string) {
        if (string === "") {
          return string;
        }
        let timeNumber = Number(string.split(":").join(""));
        if (isNaN(timeNumber)) {
          throw new Error(`${string} is not in a valid time format`);
        }
        string = string.split(":").join("");
        if (timeNumber < 10) {
          string = `0${timeNumber}:00`;
        } else if (timeNumber < 100) {
          string = `${timeNumber}:00`;
        } else if (timeNumber < 1000) {
          string = `${String(timeNumber).slice(0, 2)}:${String(
            timeNumber
          ).slice(2)}0`;
        }
        return string;
      },
      toTime(time, options = {}) {
        if (options.fromMinutes) {
          let h = Math.floor(time / 60);
          let m = time - h * 60;
          let lzH = h < 10 ? "0" : "";
          let lzM = m < 10 ? "0" : "";
          return `${lzH}${h}:${lzM}${m}`;
        }
        if (typeof time === "object") {
          let lzH = time.h < 10 ? "0" : "";
          let lzM = time.m < 10 ? "0" : "";
          return `${lzH}${time.h}:${lzM}${time.m}`;
        } else if (typeof time === "number") {
          let h = Math.floor(time / 100);
          let m = time - h * 100;
          let lzH = h < 10 ? "0" : "";
          let lzM = m < 10 ? "0" : "";
          return `${lzH}${h}:${lzM}${m}`;
        }
      },
      toObj: (time) => {
        if (typeof time === "object") {
          return { ...time };
        }

        if (time.includes(" - ")) {
          return time.split(" - ").reduce((acc, curr, i) => {
            if (i === 0) {
              acc.startTime = curr;
            } else {
              acc.endTime = curr;
            }
            return acc;
          }, {});
        }
        let [h, m] = time.split(":").map(Number);
        return { h, m };
      },
    };
  }

  hourlyTimeWindow(startTime, endTime, output = [], value = 0) {
    let start = this.time().toMinutes(startTime);
    start = this.time().toHours(start).h;
    let end = this.time().toMinutes(endTime);
    end = this.time().toHours(end).h;
    const result = Array.isArray(output)? [] : {};
    for (let h = start; h < end; h++) {
      if (Array.isArray(result)) {
        result.push(h)
      } else {
        result[h] = value;
      }
    }
    return result;
  }

  relativeTime(originTime) {
    if (!originTime) return null;
    let hourLength = 12;
    let timeSpread = Array(hourLength * 2).fill(0);
    let orgTime = this.time().toObj(originTime);
    let orgIndex = Math.round(timeSpread.length / 2) - 1;
    let forwardTime = { ...orgTime };
    let backwardTime = { ...orgTime };
    for (let i = orgIndex; i >= 0; i--) {
      timeSpread.splice(i, 1, { ...backwardTime });
      backwardTime = this.math().calcClockTime(backwardTime, "-01:00");
    }
    for (let i = orgIndex; i < timeSpread.length; i++) {
      timeSpread.splice(i, 1, { ...forwardTime });
      forwardTime = this.math().calcClockTime(forwardTime, "01:00");
    }
    let minuteSpread = Array(60)
      .fill({})
      .map((el, i) => ({
        m: i,
      }));
    function spliceTimeSpread() {
      let result = [];
      for (let i = 0; i < timeSpread.length; i++) {
        let currentTimeHour = timeSpread[i].h;
        let minutesArr = [...minuteSpread].map((timeObj) => ({
          ...timeObj,
          h: currentTimeHour,
        }));
        result.push(...minutesArr);
      }
      return result;
    }
    timeSpread = spliceTimeSpread();
    orgIndex = timeSpread.findIndex(
      (timeObj) => timeObj.h === orgTime.h && timeObj.m === orgTime.m
    );
    function findClosestIndex(compareTimeObj) {
      let foundIndexes = [];
      timeSpread.forEach((timeObj, i) =>
        timeObj.h === compareTimeObj.h && timeObj.m === compareTimeObj.m
          ? foundIndexes.push(i)
          : null
      );
      return foundIndexes.reduce((accIndex, currIndex) => {
        let currentDistance = Math.abs(orgIndex - currIndex);
        let accDistance = Math.abs(orgIndex - accIndex);
        return accDistance < currentDistance ? accIndex : currIndex;
      }, Number.MAX_SAFE_INTEGER);
    }
    return {
      isBiggerThan: (compareTime) => {
        let compare = this.time().toObj(compareTime);
        let compareIndex = findClosestIndex(compare);
        if (compareIndex !== -1) {
          return orgIndex > compareIndex;
        }
        return false;
      },
      isLessThan: (compareTime) => {
        let compare = this.time().toObj(compareTime);
        let compareIndex = findClosestIndex(compare);
        if (compareIndex !== -1) {
          return orgIndex < compareIndex;
        }
        return false;
      },
    };
  }

  
}
