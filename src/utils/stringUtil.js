export default class StringUtil {
  toUpperCase(string) {
    if (typeof string === "string") {
      return string.toUpperCase();
    }
    throw new Error("Param is not a string!");
  }

  toLowerCase(string) {
    if (typeof string === "string") {
      return string.toLowerCase();
    }
    throw new Error("Param is not a string!");
  }
  toPascalCase(string) {
    if (typeof string === "string") {
      return string.slice(0, 1).toUpperCase() + string.toLowerCase().slice(1);
    }
    throw new Error("Param is not a string!");
  }

  /**
   *
   * @param {String} string The string to be filtered
   * @param {Object} options
   * @param {String} regexSymbols[].symbol - The regex symbol.
   * @param {Number} regexSymbols[].matches - The match limit for the regex symbol. If not provided or 0, matches any quantity.
   * @param {Boolean} regexSymbols[].remove Keep or Reject matches
   * @returns filtered value
   */
  filterString(string, regexSymbols = []) {
    if (typeof string !== "string") {
      throw new Error(`${string} is not of type String!`);
    }
    const stringSpread = string
      .split("")
      .map((char) => ({ char, matched: false }));

    for (let i = 0; i < stringSpread.length; i++) {
      let { char, matched } = stringSpread[i];
      if (matched) continue;

      for (let s = 0; s < regexSymbols.length; s++) {
        let { symbol, matchLimit, remove } = regexSymbols[s];
        let pattern = '';
        const prefix = remove ? '^' : '';
        if (matchLimit === undefined) {
          pattern = new RegExp(
            `[${prefix}${symbol}]`,
            "g"
          );
        } else if ( matchLimit > 0) {
          pattern = new RegExp(
            `[${prefix}${symbol}]{${matchLimit}}`,
            "g"
          );
         } else {
          continue;
         }

        if (!matched) {
          let pass = pattern.test(char);
          if (pass) {
            stringSpread[i].matched = pass;
            if (regexSymbols[s].matchLimit) {
              regexSymbols[s].matchLimit -= 1;
            }
            break;
          }
        }
      }
    }
    return stringSpread.map(({ char, matched: match }) => (match ? char : "")).join("");
  }

  format(data) {
    if (typeof data === "string") {
      return data.trim().toLowerCase();
    } else if (Array.isArray(data)) {
      return data.map((str) => str.trim().toLowerCase());
    }
  }

  stringToNumber(string) {
    const number = string.split(/[\,\£\$]+/g).join('');
    if (!isNaN(number)) {
      return Number(number);
    }
    return string;
  }

  replaceString(string, textToReplace, replacementText) {
    if (textToReplace instanceof RegExp) {
      while (textToReplace.test(string)) {
        string = string.replace(textToReplace, replacementText);
      }
      return string;
    } else {
      while (string.includes(textToReplace)) {
        string = string.replace(textToReplace, replacementText);
      }
      return string;
    }
  }

  removeSpecialChars(name) {
    //Remove special chars
    const specialChars = {
      "!": "",
      '"': "",
      "#": "",
      $: "",
      "%": " ",
      "&": " ",
      "'": "",
      "(": " ",
      ")": " ",
      "*": "",
      "+": "",
      "-": "",
      "/": " ",
      ":": "",
      ";": " ",
      "<": "",
      "=": "",
      ">": "",
      "?": "",
      "@": "",
      "[": "",
      "\\": "",
      "]": "",
      "^": "",
      _: "",
      "`": "",
      "{": "",
      "|": "",
      "}": "",
      "~": "",
      "\n": " ",
      "\t": " ",
      " ": " ",
      "": " ",
    };

    let newString = "";
    for (let i = 0; i < name.length; i++) {
      let char = name[i];

      if (specialChars.hasOwnProperty(char)) {
        char = specialChars[char];
      }
      newString += char;
    }
    //Remove excess space
    const pattern = /\s{2,}/g;
    let match;
    while ((match = pattern.exec(newString)) !== null) {
      newString = newString.replace(pattern, " ");
    }
    pattern.lastIndex = 0;
    return newString.trim();
  }

  generateProductId(productName) {
    return this.stringUtil
      .removeSpecialChars(productName)
      .split("")
      .filter((el) => el !== " ")
      .map((el) => el.toLowerCase())
      .join("");
  }
}
