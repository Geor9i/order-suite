function usageGraph(on = false) {
    const productEvolution = require('./NextOrder');
    
    if (on) {
    for (let product in productEvolution) {
        let weekDay = []
        let usage = []
        let onHand = []
        let dateLog = []
        console.log(product);
    
        for (let date of productEvolution[product].entries()) {
            usage.push(`${date[1].usage.toFixed(2)}`);
            onHand.push(`${date[1].onHand.toFixed(2)}`);
            weekDay.push(`${date[0].split("<=>")[0].trim()}`)
            dateLog.push(`${date[0].split("<=>")[1].trim()}`)
        }
    
        //Establish biggest string
        let max = 0;
        for (let x of usage) {
            max = x.length > max ? x.length : max;
        }
        for (let x of weekDay) {
            max = x.length > max ? x.length : max;
        }
        for (let x of onHand) {
            max = x.length > max ? x.length : max;
        }
        for (let x of dateLog) {
            max = x.length > max ? x.length : max;
        }
    
        let usagePrint = "";
        let dateLogPrint = "";
        let onHandPrint = "";
        let weekDayPrint = "";
        let padding = max + 6;
        for (let i = 0;i < usage.length;i++) {
            dateLogPrint += `${dateLog[i]}`.padEnd(max," ").padEnd(padding," ");
            weekDayPrint += `${weekDay[i]}`.padEnd(max," ").padEnd(padding," ");
            usagePrint += `${usage[i]}`.padEnd(max," ").padEnd(padding," ");
            onHandPrint += `${onHand[i]}`.padEnd(max," ").padEnd(padding," ");
        }
        console.log(`Date:`.padEnd(10," ") + dateLogPrint);
        console.log(`Day:`.padEnd(10," ") + weekDayPrint);
        console.log(`Usage:`.padEnd(10," ") + usagePrint);
        console.log(`On Hand:`.padEnd(10," ") + onHandPrint);
        console.log(`\n`);
    }
    }
    }
    
    usageGraph(true)