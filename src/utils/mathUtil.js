export default class MathUtil {

  evenArrRatioToSum(numArr, sum, decimalCount = -1, averageZeroValues = false) {
    numArr = [...numArr];
    sum = Math.max(sum, 0);
    let arrSum = numArr.reduce((acc, curr) => acc + curr, 0);
        // Check if adjustment is needed and whether to average zero values
    if (arrSum !== sum && (arrSum !== 0 || averageZeroValues)) {
      let adjustment = sum - arrSum;
      for (let i = 0; i < numArr.length; i++) {
        let value = numArr[i];
        let adjustedValue;
        if (averageZeroValues && adjustment === sum) {
          adjustedValue = sum / numArr.length;
        } else {
            adjustedValue = adjustment * (value / arrSum);
        }
        if (decimalCount >= 0) {
          numArr[i] = Number((value + adjustedValue).toFixed(decimalCount));
        } else {
          numArr[i] = value + adjustedValue;
        }
      }
    } 
    return numArr;
  }

  spreadProportionateValueArr(valueArr, value, skipIndex = -1) {
    valueArr = [...valueArr];
    let skip = skipIndex >= 0;
    let valueArrSum = 0;
    for (let i = 0;i < valueArr.length;i++) {
      if (skip && skipIndex === i) {
        continue;
      }
      valueArrSum += valueArr[i];
    }
    if (valueArrSum === 0) return valueArr;
    
    for (let i = 0;i < valueArr.length;i++) {
      if (skip && skipIndex === i) {
        continue;
      }
      let currentRatio = valueArr[i] / valueArrSum;
      let valueProportion = value * currentRatio;
      valueArr[i] = valueArr[i] + valueProportion;
    }
    return valueArr
  }
}