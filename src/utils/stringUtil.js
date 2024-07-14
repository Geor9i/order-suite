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
    if (!string) return null;
    const number = string.trim().split(/[\,\£\$]+/g).join('');
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

  
  matchWords(wordArr, matchWordArr) {
    const matchedIndexes = new Set();
    const potentialPairs = [];
    const [shorterWordArr, longerWordArr] = [wordArr, matchWordArr].sort((a, b) => a.length - b.length);
    let breakLoop = false;
    const shortWordUsedIndexes = new Set();
    for (let i = 0; i < longerWordArr.length; i++) {
      if (breakLoop) break;
      const wordA = longerWordArr[i];
      for (let j = 0;j < shorterWordArr.length; j++) {
        if (shortWordUsedIndexes.has(j)) continue;
        const wordB = shorterWordArr[j];
        if (wordA === wordB) {
          matchedIndexes.add(i);
          shortWordUsedIndexes.add(j);
          if (shortWordUsedIndexes.size === shorterWordArr.length) {
            breakLoop = true;
          }
          break;
        } else {
          potentialPairs.push({shortArrIndex: j, longArrIndex: i})
        }
      }
    }
    
    //? Match potential pairs
    const scoredPairs = {};
    let score = 0;
    for (let pair of potentialPairs) {
      const {shortArrIndex, longArrIndex} = pair;
      if(shortWordUsedIndexes.has(shortArrIndex)) continue;
      const score = this.wordSimmilarityScore(shorterWordArr[shortArrIndex], longerWordArr[longArrIndex]);
      if (score <= 0) continue;
      if (!scoredPairs[longArrIndex]) {
        scoredPairs[longArrIndex] = [];
      } 
      scoredPairs[longArrIndex].push({shortArrIndex, score});
    }
    for (let longArrWordIndex in scoredPairs) {
      const topMatch = scoredPairs[longArrWordIndex].sort((a, b) => b.score - a.score)[0];
      score += topMatch.score;
    }
    const unmatchedWords = longerWordArr.filter((_, i) => !matchedIndexes.has(i));
    const matchedWords = [...matchedIndexes].map(index => longerWordArr[index]);
    score = Math.max((score + (matchedWords.length) * 2) - unmatchedWords.length, 0)
    return [matchedWords, unmatchedWords, score];
  }

  wordSimmilarityScore(wordA, wordB) {
    //? Remove plurals
    let score = 0;
    const removePlurals = (word) => {
       if (word.endsWith('s') && word.length > 1) {
        return word.slice(0, word.length - 1)
      }
      return word
    }
    wordA = removePlurals(wordA.toLowerCase());
    wordB = removePlurals(wordB.toLowerCase());
   
    let [shorterWord, longerWord] = [wordA, wordB].sort((a, b) => a.length - b.length);
    if (longerWord.includes(shorterWord)) {
      score = shorterWord.length  / longerWord.length;
    }
    return score;
      
    } 
}
