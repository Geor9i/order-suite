export default class Harvester {
  reportHarvest(report) {
    let productPattern =
      /(?<productCode>\d{4,})\t(?<product>[\w\s\(\)\-:&+\/"\.]{5,40})\t(?<case>(CASE|BT)[-\s\w\.]{2,10})\t\s(?<quantity>\d{1,2})\s{2}(?<orQ>[-\d.]{4,5})\s{2}(?<productPrice>[-\d.,]{4,10})\D{1,3}((?<previousOrderQuantity>[\d.,]{1,8})\D\((?<previousOrderQuantityDay>\d{2})\D(?<previousOrderQuantityMonth>\w{3})\D(?<previousOrderQuantityYear>\d{4})\)(?<br>[\s*]+)(?<prevWEnding>\d{2}\D\w{3}\D\d{4})\k<br>(?<previousWeeksUsage>[-\d.]{4,6})\k<br>(?<onHand>[-\d.]{4,6})\k<br>(?<currOnHand>[-\d.,]{4,8})|(?<contingency>[*\s]{10}))/g;

    let reportProducts = {};

    // Match products from report
    let match;
    while ((match = productPattern.exec(report)) !== null) {
      if (!reportProducts.hasOwnProperty(match.groups.product)) {
        //Get Case specifics data
        // console.log(match.groups.product);
        let caseRaw = match.groups.case
          .trim()
          .toLowerCase()
          .split("case-")
          .join("");
        let numPattern = /[\d.,]+/g;
        let caseValues = caseRaw
          .match(numPattern)
          .map((el) => Number(el.split(",").join("")));
        caseValues = caseValues.reduce((acc, curr) => (acc *= curr));
        let unitPattern = /[A-WYZa-wyz]+/g;
        let units = caseRaw.match(unitPattern);

        if (units && units.find((x) => x === "ml" || x === "g")) {
          caseValues /= 1000;
        }

        //Check if product exists in productUsage database!
        //if it does update its safeQuantity!

        let safeQuantity = 0;
        let sustainAmount = 0;
        let quotaReverse = false;
        let dailyUse = 0;
        let isBreak = false;
        // for (let group in productPreference) {
        //     if (isBreak) {
        //         break;
        //     }
        //     for (let product in productPreference[group]) {
        //             let splitter = /\W+/;
        //             let nameMatch = product.split(splitter);
        //             let matchCheck = nameMatch.filter(el => match.groups.product.includes(el));
        //             if (matchCheck.length === nameMatch.length) {
        //                 safeQuantity = productPreference[group][product].safeQuantity;
        //                 if (productPreference[group][product].hasOwnProperty("sustainAmount")) {
        //                     sustainAmount = productPreference[group][product].sustainAmount;
        //                 }
        //                 if (productPreference[group][product].hasOwnProperty("quotaReverse")) {
        //                     quotaReverse = productPreference[group][product].quotaReverse
        //                 }
        //                 if (productPreference[group][product].hasOwnProperty("dailyUse")) {
        //                     dailyUse = productPreference[group][product].dailyUse
        //                 }
        //                 // delete productPreference[group][product];
        //                 isBreak = true;
        //                 break;
        //             }
        //     }
        //     }
        if (match.groups.contingency === undefined) {
          reportProducts[match.groups.product] = {
            orderCase: caseValues,
            price: Number(match.groups.productPrice),
            previousOrderQuantity: Number(match.groups.previousOrderQuantity),
            previousOrderDate: `${match.groups.previousOrderQuantityYear}/${match.groups.previousOrderQuantityMonth}/${match.groups.previousOrderQuantityDay}`,
            previousWeeksUsage: Number(match.groups.previousWeeksUsage),
            onHand: Number(match.groups.onHand),
            // safeQuantity: safeQuantity,
            // sustainAmount: sustainAmount,
            // quotaReverse: quotaReverse,
            // dailyUse: dailyUse,
          };
        }
      }
      // discoveredProducts.push(match.groups.product);
    }

    return Object.keys(reportProducts).length > 0 ? reportProducts : null;
  }
}
