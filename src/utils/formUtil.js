import ObjectUtil from "./objectUtil.js";

export default class FormUtil {
  constructor () {
    this.objectUtil = new ObjectUtil();
  }
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
          return
        }
        if (key === "email") {
          if (!emailPattern.test(formData[key])) {
            alert("Please enter a valid email");
          return
          }
          emailPattern.lastIndex = 0;
        } else if (
          key === "password" &&
          formData[key].length < Math.max(1, minPasswordLength)
        ) {
          alert(`Password must be at least ${minPasswordLength} characters long!`);
          return;
        }
      }
      if (rePass && formData[rePass] !== formData.password) {
        alert("Both passwords must match!");
        return;
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
    let fields = this.objectUtil.createElementArray(form, 'input');
    fields = fields.filter(el => el.value !== 'submit')
    fields = this.objectUtil.elementArrayToObject(fields, 'name');
    return fields;
  }

 
  }
  