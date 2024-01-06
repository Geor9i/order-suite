export default class MathUtil {

  evenArrRatioToSum(numArr, sum) {
    sum = Math.max(sum, 0);
    let arrSum = numArr.reduce((acc, curr) => acc + curr, 0);
    if (arrSum !== sum && arrSum !== 0) {
      let adjustment = sum - arrSum;
      let adjusted = [];
      for (let i = 0; i < numArr.length; i++) {
        let value = numArr[i];
        adjusted.push(adjustment * (value / arrSum));
        numArr[i] = value + adjusted[i];
      }
    } 
    return numArr;
  }
}