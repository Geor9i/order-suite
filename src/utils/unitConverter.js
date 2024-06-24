import { conversionUnits, conversionEndPoints } from '../constants/units.js'

export default class UnitConverter {

    constructor() {
        this.costPairs = [];
    }
 
    baseUnitFormat(string) {
        if (!string) return null;
        const str = string?.toLowerCase();
        if (conversionUnits.hasOwnProperty(str)) {
            return {unit: conversionEndPoints[str], value: conversionUnits[str]}
        } else {
            let packSize, pack
            if (str.includes('-')) {
                [pack, packSize] = str.split('-');
            } else {
                packSize = str
            }
            const multPattern = /(?<multiplier>\d)+x(?<unitValue>\d[\w]+)/;

            let multiplier = 1;
            let match;
            if ((match = packSize.match(multPattern)) !== null) {
                multiplier = Number(match.groups.multiplier);
                packSize = match.groups.unitValue;
            }

            const valuePattern = /([\d.,]+)/;
            const value = packSize.match(valuePattern)[0];
            const unit = packSize.replace(value, '');
            const unitValue = conversionUnits[unit] || 1;
            const unitAmount = multiplier * Number(value);
            const convertedValue = unitValue * unitAmount;
            return {pack, value: convertedValue, unit: conversionEndPoints[unit] || 'ea'}
        }
    }

    convertToUnitCost(props) {
        const workProps = {...props};
        const costPairs = this.getCostPairs(workProps);
        //? Find the value of a single report item
        let reportUnitPrice = 0;
        for (let costPair of costPairs) {
            const [valueKey, costKey] = costPair;
            if (workProps[valueKey] > 0 && workProps[costKey] > 0) {
                reportUnitPrice = workProps[costKey] / workProps[valueKey];
                break;
            }
        }
        const unitValue = (workProps['case'] || workProps['unit']).value;
        const unitPrice = reportUnitPrice / unitValue;
        return {...workProps, unitPrice, reportUnitPrice};
    }

    getCostPairs(props) {
        if (this.costPairs.length) return this.costPairs;

        const costPairs = [];
        for (let prop in props) {
            if (!prop.toLowerCase().includes('cost')) continue;
            for (let prop1 in props) {
                if (prop1 === prop) continue;
                if (prop.includes(prop1)) {
                    costPairs.push([prop1, prop])
                }
            }
        }
        this.costPairs = costPairs;
        return costPairs;
    }
}