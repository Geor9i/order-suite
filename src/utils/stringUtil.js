export default class StringUtil {
    
    toUpperCase (string) {
        if(typeof string === 'string') {
            return string.toUpperCase();
        }
        throw new Error ('Param is not a string!')
    }

    toLowerCase(string) {
        if(typeof string === 'string') {
            return string.toLowerCase();
        }
        throw new Error ('Param is not a string!')
    }
    toPascalCase(string) {
        if(typeof string === 'string') {
            return string.slice(0, 1).toUpperCase() + string.toLowerCase().slice(1);
        }
        throw new Error ('Param is not a string!')
    }

     filterString(string, { letters = '', regexSymbols = '', keep = false } = {}) {
        if (typeof string !== 'string') {
          throw new Error(`${string} is not of type String!`);
        }
        regexSymbols = regexSymbols.split('').map(s => `\\${s}`).join('');
        const pattern = new RegExp(`[${keep ? '^' : ''}${letters}${regexSymbols}]`, 'g');
        string = string.replace(pattern, '');
        return string;
      }
      

    format(data) {
        if (typeof data === "string") {
          return data.trim().toLowerCase();
        } else if (Array.isArray(data)) {
          return data.map((str) => str.trim().toLowerCase());
        }
      }


      
  stringToNumber(string) {
    return Number(string.trim().split(",").join("").split("£").join(""));
  }

  replaceString(string, textToReplace, replacementText) {
    if (textToReplace instanceof RegExp) {
      while (textToReplace.test(string)) {
        string = string.replace(textToReplace, replacementText)
      }
      return string;

    } else {
      while (string.includes(textToReplace)) {
        string = string.replace(textToReplace, replacementText)
      }
      return string;
    }

  }

  removeSpecialChars(name) {
    //Remove special chars
    const specialChars = {
      '!': '', '"': '', '#': '', '$': '', '%': ' ', '&': ' ', "'": '', '(': ' ',
      ')': ' ', '*': '', '+': '', '-': '', '/': ' ', ':': '',
      ';': ' ', '<': '', '=': '', '>': '', '?': '', '@': '', '[': '', '\\': '',
      ']': '', '^': '', '_': '', '`': '', '{': '', '|': '', '}': '', '~': '',
      '\n': ' ', '\t': ' ', ' ': ' ', '': ' '
    };

    let newString = '';
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
      newString = newString.replace(pattern, ' ');
    }
    pattern.lastIndex = 0;
    return newString.trim()
  }

}