export default class DomUtil {
  //CSS
  findActiveClass(obj) {
    let result = Object.keys(obj).find((el) => obj[el] !== null);
    return obj[result];
  }

  toggleClass(element, classArr) {
    let elementClass = element.className;
    let switchClass = classArr.find((el) => el !== elementClass);
    element.className = switchClass;
  }

  addRemoveClass(element, className) {
    if (element.classList.contains(className)) {
      element.classList.remove(className);
    } else {
      element.classList.add(className);
    }
  }

  deleteChildren(...elements) {
    for (let element of elements) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  }

  toggleVisibility(element, { displayOption = "block", off = false } = {}) {
    if (off) {
      element.style.display = "none";
      return;
    }

    if (element.style.display === "none" || element.style.display === "") {
      element.style.display = displayOption;
      return true;
    } else {
      element.style.display = "none";
      return false;
    }
  }

  // Function to generate color based on map size
  getColorForMapSize(size) {
    // Normalize the size to a range between 0 and 1
    const normalizedSize = Math.min(size / 10, 1);

    // Calculate the hue for a smooth transition between red and green
    const hue = normalizedSize * 120; // 0° (red) to 120° (green)

    // Convert HSL to RGB
    const rgbColor = this.hslToRgb(hue / 360, 1, 0.5);

    // Convert RGB values to hexadecimal and format the color
    const color = `#${rgbColor
      .map((c) =>
        Math.round(c * 255)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")}`;

    return color;
  }

  // Function to convert HSL to RGB
  hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b];
  }
}
