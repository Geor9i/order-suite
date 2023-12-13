
export default class ErrorUtil {
  constructor(storeSettings) {
    this.storeSettings = storeSettings;
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