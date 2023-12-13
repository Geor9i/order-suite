export default class FormUtil {
    formValidator(formData, minPasswordLength = 1, rePass = null) {
      if (Object.keys(formData).length === 0) {
        throw new Error("Form must be filled!");
      }
  
      // let emailPattern =
      //   /^(?!\.)[-\w\!\#\.\(\)\$\%\&\'\*\+\/\=\?\"\'\^\[\]\`\{\|\}\~]+?(?<!\.)@(?!\.)[-\w\!\#\.\(\)\$\%\&\'\*\+\/\=\?\"\'\^\[\]\`\{\|\}\~]+?\.[-\w\!\#\.\(\)\$\%\&\'\*\+\/\=\?\"\'\^\[\]\`\{\|\}\~]+(?<!\.)$/g;
      let emailPattern =
      /^[-\w]+@[^\-\.\,\s\t\n\\\=\@\^\&\%\£\"\!\'\#\~\?\>\<\/\¬\`\;\:][\w\.]+[^\-\.\,\s\t\n\\\=\@\^\&\%\£\"\!\'\#\~\?\>\<\/\¬\`\;\:]$/g
  
      for (let key in formData) {
        if (formData[key] === "") {
          alert(`${key} must be filled!`);
        }
        if (key === "email") {
          if (!emailPattern.test(formData[key])) {
            alert("Please enter a valid email");
          }
          emailPattern.lastIndex = 0;
        } else if (
          key === "password" &&
          formData[key].length < Math.max(1, minPasswordLength)
        ) {
          alert(
            `Password must be at least ${minPasswordLength} characters long!`
          );
        }
      }
      if (rePass && formData[rePass] !== formData.password) {
        alert("Both passwords must match!");
      }
      return true;
    }
  
    valueConverter(value) {
      if (typeof value === "string") {
        value = value.toLowerCase();
        if (["true", "false"].includes(value)) {
          return value === "true" ? true : false;
        } else if (!isNaN(Number(value))) {
          return Number(value);
        } else {
          return value;
        }
      }
      return null;
    }
  
    formKeys({ formKeys = {}, empty = false } = {}) {
      const iterator = Array.isArray(formKeys)
        ? [...formKeys]
        : Object.keys(formKeys);
      return iterator.reduce((acc, curr) => {
        acc[curr] = empty ? "" : curr;
        return acc;
      }, {});
    }

    
  getFormData(form) {
    let formData = new FormData(form);
    formData = Object.fromEntries(formData.entries());
    return formData;
  }

  

  getFormFieldsObj(form) {
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
  }
  