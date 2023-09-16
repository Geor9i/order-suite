
export class Utility {
  constructor(storeSettings) {
    this.storeSettings = storeSettings;
  }

  //CSS
    findActiveClass (obj) {
       let result = Object.keys(obj).find(el => obj[el] !== null);
       return obj[result];
    }

    toggleClass (element, classArr) {

        let elementClass = element.className;
        let switchClass = classArr.find(el => el !== elementClass);
        element.className = switchClass;
    }

     deleteChildren(...elements) {
        for (let element of elements) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
        }
      }

      toggleVisibility(element, displayOption = 'block', off = false) {

        if (off) {
          element.style.display === 'none';
          return
        }

        if (element.style.display === 'none' || element.style.display === '') {
            element.style.display = displayOption;
            return true;
        } else {
            element.style.display = 'none';
            return false;
        }
      }


//======================================================
      //DATES
      getWeekDay(index) {
        let daysOfWeek = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        return daysOfWeek[index];
      }
      
       getMonth(index) {
        let months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return months[index];
      }

      orderDaysToNum(orderDays) {
        let weekDays = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        // let orderDaysRegEx = /\W+/;
        // orderDays = orderDays.split(orderDaysRegEx);
      
        orderDays.map((el) => {
          if (
            weekDays.includes(el) &&
            !orderDays.includes(weekDays.indexOf(el) + 1)
          ) {
            orderDays.splice(orderDays.indexOf(el), 1, weekDays.indexOf(el) + 1);
            return 0;
          } else {
            console.log("Please include only valid delivery days!");
          }
        });
        orderDays = orderDays.sort((a, b) => a - b);
        return orderDays;
      }


       // Calculate the difference in days between 2 dates
   dateDifference(date1, date2) {
    // calculate the time difference in milliseconds
    let daysBetween = Math.abs(date1.getTime() - date2.getTime());
    // convert the time difference from milliseconds to days
    daysBetween = Math.ceil(daysBetween / (24 * 60 * 60 * 1000));
    return daysBetween;
  }


  /**
   * This function finds the next or previous order date!
   * @param {boolean} isArray Return an array?
   * @param {boolean} asDateMap Return an object of date Ranges
   * @param {boolean} goForward - Preset to go forward, if false is supplied it goes backwards!
   * @param {object} dateFrom - Provide a date object for the start date! For example today!
   * @param {boolean} asDate returns result as a date Object!
   * @param {object} dateTo Will return complete day sequence between two dates if specified!
   * @returns {any} Depending on option selected 1.date, 2.array, 3.number
   */
   findDeliveryDate(
    dateFrom,
    asDate = false,
    isArray = false,
    goForward = true,
    dateTo = null,
    asDateMap = false
  ) {
    let orderDays = [1, 3, 5];
    let step = goForward ? 1 : -1;
    let i = dateFrom.getDay();
    let arr = [];
    let countDown = dateTo !== null ? this.dateDifference(dateFrom, dateTo) : 0;
  
    //Fill an array with a range of weekdays matching the selected dates!
    arr.push(i);
    do {
      i += step;
      countDown !== 0 ? countDown-- : countDown;
      i > 7 ? (i = 1) : i;
      i < 1 ? (i = 7) : i;
      arr.push(i);
    } while (countDown !== 0 || !orderDays.includes(i));
  
    //If array has been selected as output
    if (isArray) {
      arr = goForward ? arr : arr.reverse();
      //If asDateMap is true convert dates to a map of weekly stats and estimates
      if (asDateMap) {
        let map = new Map();
        let dateStamp = new Date(dateFrom);
        let dateStampFormat;
        let properties = {};
        for (let i = 0; i < arr.length; i++) {
          dateStampFormat = `${
            weekDays[dateStamp.getDay() === 0 ? 6 : dateStamp.getDay() - 1]
          } <=> ${this.dateConverter(dateStamp, true)}`;
          map.set(dateStampFormat, properties);
          dateStamp = new Date(dateStamp.setDate(dateStamp.getDate() + 1));
        }
  
        return map;
      }
      return arr;
    } else {
      //if date has been selected as output
      if (asDate) {
        let date = new Date(dateFrom);
        if (goForward) {
          date = new Date(date.setDate(dateFrom.getDate() + arr.length - 1));
        } else {
          date = new Date(date.setDate(dateFrom.getDate() - arr.length - 1));
        }
        return date;
      }
    }
  }

   /**
 * Converts a date string to a Date object and reverse.
 *
 * @param {string|Date} date - The date string or Date object to convert.
 * @param {Object} [options] - An options object for customization.
 * @param {string} [options.delimeter='/'] - The delimiter to use when constructing the date string.
 * @param {boolean} [options.deconstruct=false] - If true, deconstructs the date into components.
 * @param {boolean} [options.toRMFDate=false] - If true, converts the date to the "RMF" format.
 * @returns {Date|string|null} The converted Date object or string, or null if parsing fails.
 */
   dateConverter(date, options = {delimeter: '/', deconstruct:false, toRMFDate:false}) {
    if (typeof date === "object") {
      if (options.deconstruct) {
        if (options.toRMFDate) {
          return `${date.getDate()} ${getMonth(date.getMonth())} ${date.getFullYear()}`;
        } else {
          let del = options.delimeter;
          return `${date.getFullYear()}${del}${date.getMonth() + 1}${del}${date.getDate()}`;
        }
      }
    }
    let datePattern = /(?<normal>(?<day>\d{1,2})(?<d>\D+)(?<month>\d{1,2})\k<d>(?<year>\d{2,4}))|(?<reverse>(?<year1>\d{2,4})(?<d1>\D+)(?<month1>\d{1,2})\k<d1>(?<day1>\d{1,2}))/;
    let dateMatch = date.match(datePattern);
    if (!dateMatch) {
      return null;
    }
    let day, month, year;
    if (dateMatch.groups.normal) {
      [day, month, year] = [dateMatch.groups.day, dateMatch.groups.month, dateMatch.groups.year]
    } else if (dateMatch.groups.reverse) {
      [day, month, year] = [dateMatch.groups.day1, dateMatch.groups.month1, dateMatch.groups.year1]
    }
    let fullYearLength = 4;
    let yearStart = `${new Date().getFullYear()}`.slice(0, fullYearLength - `${year}`.length);
    year = `${yearStart}${year}`;
    return new Date(`${year}/${month}/${day}`);
  }

  
  
//====================================================================================
      //String Formating
      
       stringToNumber(string) {
        return Number(string.trim().split(",").join("").split("£").join(""));
      }

      replaceString(string, textToReplace, replacemenText) {
        if (textToReplace instanceof RegExp) {
            while(textToReplace.test(string)) {
              string = string.replace(textToReplace, replacemenText)
            }
        return string;

        } else {
            while(string.includes(textToReplace)) {
              string = string.replace(textToReplace, replacemenText)
            }
          return string;
        }
       
      }

      optimizeName(name) {
        //Remove special chars
        const specialChars = {
            '!': '', '"': '', '#': '', '$': '', '%': ' ', '&': ' ', "'": '', '(': ' ',
            ')': ' ', '*': '', '+': '', '-': '', '/': ' ', ':': '',
            ';': ' ', '<': '', '=': '', '>': '', '?': '', '@': '', '[': '', '\\': '',
            ']': '', '^': '', '_': '', '`': '', '{': '', '|': '', '}': '', '~': '',
            '\n': ' ', '\t': ' ', ' ': ' ', '':' '
          };
          
      let newString = '';
      for (let i = 0;i < name.length; i++) {
        let char = name[i];
        
        if(specialChars.hasOwnProperty(char)) {
            char = specialChars[char];
        }
            newString += char;
      }
      //Remove excess space
      const pattern = /\s{2,}/g;
      while ((match = pattern.exec(newString))!== null) {
        newString = newString.replace(pattern, ' ');
      }
      pattern.lastIndex = 0;
      return newString.trim()
      }

  // ===================================================================================
  //FORMS    
   
  

  getFormFieldsObj (form) {
    let fields = this.createElementArray(form, 'input');
    fields = fields.filter(el => el.value !== 'submit')
    fields = this.elementArrayToObject(fields, 'name');
    return fields;
}

 createElementArray(parent, ...elements) {
    if (elements.length === 1 && typeof elements[0] === 'string') {
        return Array.from(parent.querySelectorAll(elements));
    } else {
        let arr = [];
        for (let element of elements) {
            arr.push(element);
        }
        return arr;
    }
}

 elementArrayToObject(array, keyAttribute, omitELements) {
    let obj = array.reduce((obj, element) => {
        if (keyAttribute === 'text') {
            let pattern = /\s/g;
            let text = (element.textContent).replace(pattern, '-');
            let key = text;
            obj[key] = element;
        } else {
            obj[element.getAttribute(keyAttribute)] = element;
        }
        return obj;
    }, {})
    if (omitELements) {
        for (let element of omitELements) {
            if (obj[element]) {
                delete obj[element];
            }
        }
    }
    return obj;
}


 getFormData(form) {
    let formData = new FormData(form);
    formData = Object.fromEntries(formData.entries());
    return formData;
}


 formValidator(formData, minPasswordLength = 1, rePass = undefined) {
    let isFilled = true;
    let emailPattern = /^[-\w]+@[\w\.]+[^\-\.\,\s\t\n\\\=\@\^\&\%\£\"\!\'\#\~\?\>\<\/\¬\`\;\:]$/g;
    for (let key in formData) {
        if (formData[key] === '') {
            isFilled = false;
            throw new UserReadableError('All fields must be filled!');
            break;
        }
        if (key === 'email') {
            if (!emailPattern.test(formData[key])) {
                throw new UserReadableError('Please enter a valid email')
                isFilled = false;
            }
            emailPattern.lastIndex = 0;
        } else if (key === 'password' && formData[key].length < Math.max(1, minPasswordLength)) {
            throw new UserReadableError(`Password must be at least ${minPasswordLength} characters long!`)
            isFilled = false;
        }
    }
    if (rePass && formData[rePass] !== formData.password) {
        isFilled = false;
        throw new UserReadableError('Both passwords must match!')
    }
    return isFilled;
}

//Store Settings

currentWorkHours() {
    const openTimes = this.storeSettings.openTimes;
    //Calculate how long the shop has been opened for
    let time = Number(`${new Date().getHours()}${new Date().getMinutes()}`);
    const weekday = new Date().getDay();
    const [openTime, closeTime] = openTimes[weekday].split('-').map(el => Number(el.trim().replace(':', '')));
    let workHours = 0;
    if (time >= openTime && time <= closeTime) workHours = time - openTime;
    else if (time > 22) workHours = closeTime - openTime;
    return workHours;
}

//ERRORS

printWarningMessage(messageContainer, message, action = 'add') {
  if (action === "add") {
    let warningElements = document.querySelectorAll(`.warning-message`);
    if (warningElements) {
      let isPresent = false;
      for (let i = 0; i < warningElements.length; i++) {
        if (warningElements[i].textContent.includes(message)) {
          isPresent = true;
          break;
        }
      }
      if (!isPresent) {
        let warningOrderedList = document.createElement("p");
        warningOrderedList.textContent = message;
        warningOrderedList.className = "warning-message";
        messageContainer.appendChild(warningOrderedList);
      }
    }
  } else if (action === "remove") {
    let warningElements = document.querySelectorAll(`.warning-message`);
    for (let i = 0; i < warningElements.length; i++) {
      if (warningElements[i].textContent.includes(message)) {
        warningElements[i].remove();
      }
    }
  }
}

}