export default class MathUtil {

    evenArrToHundred(numArr) {
        let sum = numArr.reduce((acc, curr) => acc + curr, 0);
        if (sum > 0 && sum !== 100) {
          let adjustment = 100 - sum;
          let adjusted = [];
          for (let i = 0; i < numArr.length; i++) {
            let value = numArr[i];
            adjusted.push(adjustment * (value / sum));
          }
          for (let i = 0; i < numArr.length; i++) {
            let value = numArr[i];
            numArr[i] = value + adjusted[i];
            dailySalesFields[i].value = numArr[i].toFixed(2);
          }
          let result = numArr.reduce(
            (acc, curr) => acc + curr, 0);
          console.log(result);
        }
      }
}