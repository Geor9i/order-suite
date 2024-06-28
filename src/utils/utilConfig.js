import DateUtil from "./dateUtil.js";
import TimeUtil from "./timeUtil.js";
import StringUtil from "./stringUtil.js";
import FormUtil from "./formUtil.js";
import DomUtil from "./domUtil.js";
import ObjectUtil from "./objectUtil.js";
import MathUtil from "./mathUtil.js";
import UnitConverter from "./unitConverter.js";
import EventUtil from "./eventUtil.js";

export const utils = {
    dateUtil: new DateUtil(),
    timeUtil: new TimeUtil(),
    stringUtil: new StringUtil(),
    formUtil: new FormUtil(),
    domUtil: new DomUtil(),
    objUtil: new ObjectUtil(),
    mathUtil: new MathUtil(),
    eventUtil: new EventUtil(),
    unitConverter: new UnitConverter(),
  };