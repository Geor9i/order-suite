export default class DomUtil {


    
  //CSS
  findActiveClass(obj) {
    let result = Object.keys(obj).find(el => obj[el] !== null);
    return obj[result];
  }

  toggleClass(element, classArr) {

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

  toggleVisibility(element, { displayOption = 'block', off = false } = {}) {

    if (off) {
      element.style.display = 'none';
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


}