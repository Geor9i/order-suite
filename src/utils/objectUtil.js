import StringUtil from "./stringUtil.js";

export default class ObjectUtil {
  constructor() {
    this.string = new StringUtil();
  }

  getLastMapEntry(map) {
    let lastMapEntry;
      for (let entry of map.entries()) {
        lastMapEntry = entry;
      }
      return lastMapEntry
  }

  includes(data, target) {
    let dataType = this.typeof(data);
    let targetType = this.typeof(target);
    if (!targetType || !dataType || ["number", "boolean"].includes(dataType))
      return null;

    if (
      ["string", "array"].includes(dataType) &&
      !["array", "object"].includes(targetType)
    ) {
      return data.includes(target);
    } else if (
      dataType === "string" &&
      ["array", "object"].includes(targetType)
    ) {
      return null;
    } else if (dataType === "array" && targetType === "array") {
      let tempArr = Array.from(data);
      let tempTargetArr = JSON.stringify(Array.from(target));
      for (let element of tempArr) {
        if (Array.isArray(element)) {
          let tempElement = JSON.stringify(Array.from(element));
          if (tempElement === tempTargetArr) {
            return true;
          }
        }
      }
      return false;
    } else if (dataType === "array" && targetType === "object") {
    }
  }

  iterate(data, callback) {
    if (Array.isArray(data)) {
      let result = [...data];
      return result.map((el) => callback(el));
    } else if (typeof data === "object") {
      let result = { ...data };
      return Object.keys(result).reduce((acc, curr) => {
        acc[curr] = callback(data[curr]);
        return acc;
      }, {});
    }
  }

  compare(prop1, prop2, options) {
    let globalStructureMatch = true; 
    let globalReferenceMatch = true; 
    const isInvalid = (type) => ['undefined', 'null'].some(invalidType => invalidType === type);
    const isIterable = (type) => ['object', 'array', 'set', 'weakset', 'map', 'weakmap'].includes(type);
    const isPrimitive = (type) => ['number', 'string', 'boolean'].includes(type);
    const isObject = (type) => type === 'object';
    const isArray = (type) => type === 'array';
    const isMap = (type) => ['map', 'weakmap'].includes(type);
    const isSet = (type) => ['set', 'weakset'].includes(type);
    const objName = (obj) => `{ ${Object.keys(obj).slice(0, 3).join(', ') + `${Object.keys(obj).length > 3 ? '...' : ''}`} }`;
    const arrName = (arr) =>`[ ${ arr.slice(0, 3).join(', ') + `${arr.length > 3 ? '...' : ''}`} ]`;
    const placeHolder = (type, value, key) => {
      const placeholders = {
        object: `{ ${key} }`,
        weakmap: `w{[ ${key} ]}`,
        map: `{[ ${key} ]}`,
        array: `[ ${key} ]`,
        set: `S[ ${key} ]`,
        weakset: `wS[ ${value} ]`,
        regex: `\/ ${key} \/`,
        number: `$ ${value}`,
        string: `"${value}"`,
        null: `${type}`,
        boolean: `${key}: ${value}`,
      }

      if (!placeHolder[type]) {
        return `${key}`
      } 
      return placeholders[type]
    }
    const config = {
      indent: 0,
      index: null,
      map: 'Root',
      invalid: false
    }

    const analyze = (a, b, config) => {
      const aType = this.typeof(a);
      const bType = this.typeof(b);

      if (aType === bType) {
        if (isInvalid(a)) {
          config.map + `${a} === ${b} ( ${aType} )`;
          return config;
        } else {
          if(isPrimitive(aType)){
            let valueMatch = a === b;
            config.map += "\n";
            config.map += `└───${valueMatch ? `${a}` : `${a} (${aType}) !== ${b} (${bType})`}`
            globalStructureMatch = globalStructureMatch ? valueMatch : globalStructureMatch;
            return valueMatch;
          } else if (isIterable(aType)) {

            const parentIsObject = isObject(aType);
            const parentIsMap = isMap(aType);
            const parentIsSet = isSet(aType);
            let iteratorA, iteratorB;
            if (parentIsObject) {
              [iteratorA, iteratorB] = [Object.keys(a), Object.keys(b)];
            } else if (parentIsMap) {
              [iteratorA, iteratorB] = [a.entries(), b.entries()];
            } else {
            [iteratorA, iteratorB ]= [Array.from(a), Array.from(b)];
            }

            if (a !== b) {
              config.map += ` | !== Ref`;
            }

            if ((iteratorA?.length ?? a?.size) !== (iteratorB?.length ?? b?.size)) {
              config.map += ` | ${placeHolder(aType, a, 'a')} !== ${placeHolder(bType, b, 'b')} | length diff: ${Math.abs((iteratorA?.length ?? a?.size) - (iteratorB?.length ?? b?.size))}`;
              globalStructureMatch = false;
              globalReferenceMatch = false;
              config.invalid = true;
              if (!options?.fullReport) {
                return config;
              }
            }

            let iterations = Math.max((iteratorA?.length ?? a?.size), (iteratorB?.length ?? b?.size))

            for (let i = 0; i < iterations; i++) {
              config.map += "\n";
              const indexItemTypeA = parentIsObject ? this.typeof(Object.values(a)[i]) : parentIsMap ? this.typeof(a.get(Array.from(a)[i][0])) : this.typeof(iteratorA[i]);
              const indexItemTypeB = parentIsObject ? this.typeof(Object.values(b)[i]) : parentIsMap ? this.typeof(b.get(Array.from(b)[i][0])) : this.typeof(iteratorB[i]);
              let nameA = isObject(indexItemTypeA) ? iteratorA[i] : isArray(indexItemTypeA) ? arrName(Object.values(a)[i]) : iteratorA[i];
              nameA = isObject(this.typeof(nameA)) ? objName(nameA) : nameA;
              let nameB = isObject(indexItemTypeB) ? iteratorB[i] : isArray(indexItemTypeB) ? arrName(Object.values(b)[i]) : iteratorB[i];
              nameB = isObject(this.typeof(nameB)) ? objName(nameB) : nameB;
              if (options?.exclude && nameA === nameB && options?.exclude.includes(nameA)) {
                continue;
              }
              const valueA = parentIsObject ? a[iteratorA[i]] : parentIsMap ? a.get(Array.from(a)[i][0]) : iteratorA[i];
              const valueB = parentIsObject ? b[iteratorB[i]] : parentIsMap ? b.get(Array.from(b)[i][0]) : iteratorB[i];
              let typeMatch = indexItemTypeA === indexItemTypeB;
              let referenceMatch = valueA === valueB;
              globalReferenceMatch = globalReferenceMatch ? referenceMatch : globalReferenceMatch;

              let depthConfig = {
                indent: config.indent + 1,
                index: i,
                map: '',
                invalid: false
              }
              let valueMatch = valueA === valueB;
              if (typeMatch && isIterable(indexItemTypeA)) {
                depthConfig = analyze(valueA, valueB, depthConfig);
                valueMatch = !depthConfig.invalid
                if (!options?.fullReport && !depthConfig.invalid) {
                  return config;
                }
              }

              config.map += '│   '.repeat(config.indent);
              config.map += `${i === iterations.length - 1 ? '└───' : '├───'} ${referenceMatch && valueMatch ?
                `${placeHolder(indexItemTypeA, valueA, nameA)}  ${options?.types ? `--> ${indexItemTypeA} ` : ''}` : `${placeHolder(indexItemTypeA, valueA, nameA)} ${valueMatch? "==" : "!=="} ${
                  placeHolder(indexItemTypeB, valueB, nameB)} ${!valueMatch ? `| i: ${i || config.index || ''}` : ''}`}`;
              config.map += depthConfig.map;
  
              if (!typeMatch || !valueMatch) {
                globalStructureMatch = false;
                config.invalid = true;
                if (!options?.fullReport) {
                  return config;
                }
              }

              if (i === iterations - 1) {
                return config;
              }
            }
          }
        }
      } else {
        config.map += `└───${placeHolder(aType, a, a)} !== ${placeHolder(bType, b, b)}`;
        globalStructureMatch = false;
        globalReferenceMatch = false;
        config.invalid = true;
        return config;
      }
      return config
    }
    
    let resultConfig = analyze(prop1, prop2, config);
    if (options?.log) {
      console.log(resultConfig.map);
    }
    return {globalReferenceMatch, globalStructureMatch};
  }

  reduceToObj(arr, data) {
    return arr.reduce((acc, curr) => {
      let dataType = this.typeof(data);
      switch (dataType) {
        case "array":
          acc[curr] = [...data];
          break;
        case "object":
          acc[curr] = { ...data };
          break;
        default:
          acc[curr] = data;
          break;
      }
      return acc;
    }, {});
  }

  reduceToArr(obj, {addParams = {}, setId = false, ownId = false} = {}) {
    return Object.keys(obj).reduce((arr, key, i) => {
      let element = obj[key];
      if (addParams) {
        Object.keys(addParams).forEach(key => {
          element[key] = addParams[key]
        })
      }
      if (setId) {
        element.id = i
      } else if (ownId) {
        element.id = key
      }
      arr.push(element);
      return arr;
    }, [])
  }

  typeof(target) {
    if (target === null) return null;
    if (target === undefined) return undefined;
    let types = ["number", "string", "object", "boolean"];
    let targetType = typeof target;
    if (!types.includes(targetType)) return targetType;

    if (targetType !== "object") {
      return targetType;
    } else {
      return Array.isArray(target) ? "array" : "object";
    }
  }

 

  hasOwnProperties(object, properties, operator = "&&") {
    if (operator === "&&") {
      return properties.find((key) => {
        if (!object[key]) {
          return false;
        }
      })
        ? true
        : false;
    } else if (operator === "||") {
      return properties.find((key) => {
        if (object[key]) {
          return true;
        }
      })
        ? true
        : false;
    }
  }

  merge(objectA, objectB, priorityKeys) {
    if (this.typeof(objectA) !== "object") return objectB;
    if (this.typeof(objectB) !== "object") return objectA;
    priorityKeys =
      priorityKeys && Array.isArray(priorityKeys)
        ? priorityKeys
        : [priorityKeys];
    let prioritizedA = this.keyTools(objectA, { extractSubKeys: priorityKeys });
    let prioritizedB = this.keyTools(objectB, { extractSubKeys: priorityKeys });
    return { ...prioritizedA, ...prioritizedB };
  }
  /**
   *
   * @param {Object} targetObject Supply target Object
   * @param {Object} options supply targets
   * @param {String} options.extractKey look only inside this specific Key name in the object
   * @param {Boolean} options.extractSubKeys an array of all wanted properties!
   * @param {String} options.immerseKey Value used as key for new object used to surround all qualifying end value
   * @param {Array} options.avoidKeys object keys to avoid during immersion
   *
   * @returns {Object} a new Object containing all wanted keys containing props and their values unless  options.targetKey are specified, in which case it returns an object with the values discovered under the targetKey
   */
  keyTools(
    targetObject,
    {
      extractKey = null,
      extractSubKeys = null,
      immerseKey = null,
      avoidKeys = null,
    } = {}
  ) {
    if (
      (this.typeof(targetObject) !== "object" && (!immerseKey || !avoidKeys)) ||
      (!extractKey && !extractSubKeys && !immerseKey && !avoidKeys)
    )
      return null;

    extractSubKeys = extractSubKeys
      ? Array.isArray(extractSubKeys)
        ? extractSubKeys
        : [extractSubKeys]
      : null;
    const log = {
      withinTargetKey: false,
      targetKeyExtracted: false,
      paths: {},
    };

    const submerge = (targetObject, path = {}) => {
      const validateKey = (key) => {
        if (extractKey === key || log.withinTargetKey) {
          log.withinTargetKey = true;
          return true;
        }
        if (extractSubKeys && extractSubKeys.includes(key)) {
          return true;
        }

        return false;
      };
      const validateImmersion = (targetObject, key) => {
        if (
          immerseKey &&
          avoidKeys &&
          !avoidKeys.includes(key) &&
          !this.isEmpty(targetObject[key]) &&
          this.typeof(targetObject[key]) !== "object"
        ) {
          return true;
        }
        return false;
      };
      for (let key in targetObject) {
        if (validateKey(key)) {
          log.targetKeyExtracted = extractKey !== null ? true : false;
          path = { ...path, [key]: targetObject[key] };
          continue;
        } else if (validateImmersion(targetObject, key)) {
          if (!path.hasOwnProperty(immerseKey)) {
            path[key] = {};
          }
          path[key][immerseKey] = targetObject[key];
        } else if (this.typeof(targetObject[key]) === "object") {
          if (!path.hasOwnProperty(key)) {
            path[key] = {};
          }
          path[key] = submerge(targetObject[key], path[key]);
        }
      }
      log.withinTargetKey = false;
      return this.deleteEmptyKeys(path);
    };

    for (let key in targetObject) {
      if (this.typeof(targetObject[key]) === "object") {
        if (extractKey && extractKey !== key) continue;

        let path = { [key]: {} };
        log.withinTargetKey = extractKey === key ? true : false;
        let discovered = submerge(targetObject[key], path[key]);
        if (discovered) {
          if (log.targetKeyExtracted) {
            return discovered;
          }
          path[key] = discovered;
          log.paths = { ...log.paths, ...path };
        }
      } else if (
        !extractKey &&
        extractSubKeys &&
        extractSubKeys.includes(key)
      ) {
        log.paths[key] = targetObject[key];
      } else if (extractKey && extractKey === key) {
        return targetObject[key];
      } else if (immerseKey && avoidKeys && !avoidKeys.includes(key)) {
        log.paths[key] = {};
        log.paths[key][immerseKey] = targetObject[key];
      }
    }
    return Object.keys(log.paths).length > 0 ? log.paths : null;
  }

  deleteEmptyKeys(targetObject) {
    if (this.typeof(targetObject) !== "object") return null;

    let result = { ...targetObject };
    for (let key in result) {
      if (this.isEmpty(result[key])) {
        delete result[key];
      }
    }
    if (this.isEmpty(result)) {
      return null;
    } else {
      return result;
    }
  }

  isEmpty(target) {
    if (!target) return true;

    const isEmptyObject = (object) => {
      for (let key in object) {
        let type = this.typeof(object[key]);
        if (type === "object") {
          if (Object.keys(object[key]).length === 0) {
            continue;
          }
          if (!isEmptyObject(object[key])) {
            return false;
          }
        } else if (["array", "string", "boolean", "number"].includes(type)) {
          if (!this.isEmpty(object[key])) {
            return false;
          }
        } else if (object[key] === null || object[key] === undefined) {
          continue;
        }
      }
      return true;
    };

    let type = this.typeof(target);
    switch (type) {
      case "string":
        return target.length === 0;
      case "array":
        return target.filter((el) => !this.isEmpty(el)).length === 0;
      case "object":
        return isEmptyObject(target);
      case "undefined":
      case "null":
        return true;
      default:
        return false;
    }
  }

  hasNestedProperty(object, props, key = true) {
    if (this.typeof(object) !== "object") return null;
    props = Array.isArray(props) ? props : [props];

    if (key) {
      for (let key in object) {
        if (props.includes(key)) {
          return true;
        } else if (this.typeof(object[key]) === "object") {
          if (this.hasNestedProperty(object[key], props)) {
            return true;
          }
        }
      }
    } else {
      for (let key in object) {
        if (props.includes(object[key])) {
          return true;
        } else if (this.typeof(object[key]) === "object") {
          if (this.hasNestedProperty(object[key], props, false)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getNestedProperty(targetObject, propName) {
    let propNameArr = propName.split(".");
    if (propNameArr.length === 1) {
      return targetObject[propName] ? targetObject[propName] : null;
    }
    return propNameArr.reduce((obj, prop) => {
      return obj && obj[prop] ? obj[prop] : null;
    }, targetObject);
  }

  setNestedProperty(targetObject, propName, setValue) {
    let propNameArr = propName.split(".");
    let lastProp = propNameArr.pop();
    if (propNameArr.length === 0) {
      targetObject[lastProp] = setValue;
      return targetObject;
    }
    propNameArr.reduce((obj, prop) => {
      if (!obj[prop]) {
        obj[prop] = {};
      }
      return obj[prop];
    }, targetObject)[lastProp] = setValue;
    return targetObject;
  }

  rotateArr(arr, options = {}) {
    options.amount = options.amount ? Math.max(0, options.amount) : 1;
    options.left = options.left !== undefined ? options.left : true;
    options.element = options.element ? options.element : null;
    let result = [...arr];

    if (!options.element) {
      let i = options.amount;
      while (i !== 0) {
        options.left
          ? result.push(result.shift())
          : result.unshift(result.pop());
        i--;
      }
    } else if (result.includes(options.element)) {
      while (result[0] !== options.element) {
        result.unshift(result.pop());
      }
    }
    return result;
  }

  sort(arr, callback) {
    arr = [...arr];
  
    const sortedArr = [];
  
    while (arr.length > 0) {
      let sortIndex = 0; 
      for (let i = 0; i < arr.length; i++) {
          if (callback(arr[sortIndex], arr[i]) > 0) {
              sortIndex = i;
          }
      }
      sortedArr.push(arr[sortIndex]);
      arr.splice(sortIndex, 1);
    }
    return sortedArr;
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
  

  search(list, keyword, { filter = [], returnBool = false } = {}) {
    let discovered = Object.keys(list).filter((listItem) => {
      for (let item in list[listItem]) {
        let content = list[listItem][item];
        let type = this.typeof(content);
        if (
          type === "string" &&
          content.toLowerCase().includes(keyword.toLowerCase())
        ) {
          return true;
        } else if (
          type === "array" &&
          content.find((el) => {
            let elType = this.typeof(el);
            if (
              elType === "string" &&
              el.toLowerCase().includes(keyword.toLowerCase())
            ) {
              return true;
            } else if (elType === "number" && String(el).includes(keyword)) {
              return true;
            } else if (elType === "object") {
              return this.search(el, keyword, { returnBool: true });
            }
            return false;
          })
        ) {
          return true;
        } else if (type === "number" && String(content).includes(keyword)) {
          return true;
        } else if (
          type === "object" &&
          this.search(content, keyword, { returnBool: true })
        ) {
          return true;
        }
      }
      return false;
    });
    if (returnBool) {
      return discovered.length > 0 ? true : false;
    }
    return discovered.reduce((obj, curr) => {
      obj[curr] = { ...list[curr] };
      return obj;
    }, {});
  }
}
