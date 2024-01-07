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
          adjustedValue = decimalCount >= 0 ? Number((sum / numArr.length).toFixed(decimalCount)) : sum / numArr.length;
        } else {
          if (decimalCount >= 0) {
            adjustedValue = Number((adjustment * (value / arrSum)).toFixed(decimalCount));
          } else {
            adjustedValue = adjustment * (value / arrSum);
          }
        }
        numArr[i] = value + adjustedValue;
      }
    } 
    return numArr;
  }
}