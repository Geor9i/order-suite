export default class MathUtil {

    evenArrToHundred() {
        let sum = realSalesPercent.reduce((acc, curr) => acc + curr, 0);
        if (sum > 0) {
          let adjustment = 100 - sum;
          let adjusted = [];
          for (let i = 0; i < realSalesPercent.length; i++) {
            let value = realSalesPercent[i];
            adjusted.push(adjustment * (value / sum));
          }
          for (let i = 0; i < realSalesPercent.length; i++) {
            let value = realSalesPercent[i];
            realSalesPercent[i] = value + adjusted[i];
            dailySalesFields[i].value = realSalesPercent[i].toFixed(2);
          }
          let result = realSalesPercent.reduce(
            (acc, curr) => acc + curr, 0);
          console.log(result);
        }
      }
}