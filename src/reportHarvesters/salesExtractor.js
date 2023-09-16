function dataExtract(reports) {
    //Get Shop Name
    let shopPattern = /\b((?<=Entity: )|(?<=Store: ))(?<name>[A-Z]+)\s-\s(?<Location>[A-Z]*[\s]*[A-Z]*)\s-\s(?<storeNumber>[\d]+)\b/g
  
    let store = {};
    class SalesDay {
      constructor() {
        this.salesTotal = 0;
        this.transactionsTotal = 0;
        this.ticketAverageTotal = 0;
        this.hourlySales = [];
        this.hourlySalesCumulative = [];
        this.hourlyTicketAverage = [];
        this.transactions = [];
  
        for (let h = 0; h < 24; h++) {
          this.hourlySales[h] = 0;
          this.hourlySalesCumulative[h] = 0;
          this.hourlyTicketAverage[h] = 0;
          this.transactions[h] = 0;
        }
      }
    }
  
    //Get Report Type
    let reportPattern = /(?<ssr>Sales Summary Report)|(?<hr>Hourly Sales)/g;
    // Extract sales summary report data
    let salesSummaryExtractDataPattern =
      /\b(?<=[A-Z][a-z]{2},\s)(?<date_day>\d{2})-(?<date_month>[A-Z][a-z]{2})-(?<date_year>\d{4})\s(?<grossSales>[\d\.,]+)\s(?<tax>[\d.,]+)\s(?<netSales>[\d.,]+)\s(?<transactions>[\d.,]+)\b/g;
  
      let hourlySalesExtractDatePattern = /\b(?<=Data as of: )(?<date_day_from>\d{1,2})\/(?<date_month_from>\d{2})\/(?<date_year_from>\d{4}) - (?<date_day_to>\d{1,2})\/(?<date_month_to>\d{2})\/(?<date_year_to>\d{4})\b/
  
      let hourlySalesTotalsData = /(?<=Total\s)(?<transactions>[\d,]*[\d+])\s(?<item_count>[\d,]*[\d]+)\s(?<total_sales>[\d,]*\d*.?\d+)\s(?<total_sales2>[\d,]*[\d.]*\d+)\s(?<ticket_average>[\d,]*[\d.]*\d+)\s(?<sale_item>[\d,]*[\d.]*\d+)/
  
      let hourlySalesExtractDataPattern = /\b(?<time_hour>\d{2}):\d{2} - (?:\d{2}:\d{2} )(?<customer_count>\d+)\s(?<item_count>\d+)\s(?<hourly_sales>\d*,?\d*.?\d+)\s(?<percent_total_sales>\d+.?\d+)%\s(?<hourly_sales_cumulative>\d*,?\d*.?\d+)\s(?<hourly_ticket_average>\d+.?\d+)\s(?<average_price_sales_item>\d+.?\d+)\b/g
  
    //Iterate through reports and save data
  
    while (reports.length !== 0) {
      let currentReport = reports.shift();
  
      //match report type by regex pattern
      let reportName = currentReport.match(reportPattern)[0];
      let currentStore = currentReport.match(shopPattern)[0].split(" - ")[0];
      let currentStoreNumber = currentReport.match(shopPattern)[0].split(" - ")
      currentStoreNumber = currentStoreNumber[currentStoreNumber.length - 1]
      let additionalInfo = currentReport.match(shopPattern)[0].split(" - ")[1]
  
      //Check if report data extraction is successful
      if (reportName === null && currentStore === null) {
        continue;
      }
  
      //Check if there is a store name object in stores and if not create it!
      currentStore = `${currentStore} - ${additionalInfo}`
      if (!store.hasOwnProperty(currentStore)) {
        store[currentStore] = {
          storeNumber: currentStoreNumber
        };
      } 
  
      //Define what happens if a sales summary report is identified
      if (reportName.includes("Sales Summary")) {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
    
        // Find All sales date in the report by date and extract it
        let salesDateMatch;
        while ((salesDateMatch = salesSummaryExtractDataPattern.exec(currentReport)) !== null) {
          let day = salesDateMatch.groups.date_day;
          let month =
            months.indexOf(salesDateMatch.groups.date_month) + 1 < 10
              ? `0${months.indexOf(salesDateMatch.groups.date_month) + 1}`
              : `${months.indexOf(salesDateMatch.groups.date_month) + 1}`;
  
          let year = salesDateMatch.groups.date_year;
          let currDate = `${year}/${month}/${day}`;
  
          //Create a sales date object if the store does not have it
          if (!store[currentStore].hasOwnProperty(currDate)) {
            store[currentStore][currDate] = new SalesDay();
          }
  
          // Set total Sales
          store[currentStore][currDate].salesTotal = Number(
            salesDateMatch.groups.netSales.replaceAll(",", "")
          );
          // Set Total Transactions
          store[currentStore][currDate].transactionsTotal = Number(
            salesDateMatch.groups.transactions
          );
          
          // Calc Ticket Average
          store[currentStore][currDate].ticketAverageTotal = store[currentStore][currDate].salesTotal / store[currentStore][currDate].transactionsTotal
  
        }
  
        //Define what happens if an hourly sales report is identified
      } else if (reportName.includes("Hourly Sales")) {
  
        let dateCheck;
        let dayFrom;
        let dayTo;
        let monthFrom;
        let monthTo;
        let yearFrom;
        let yearTo;
        let dateFrom;
        let dateTo;
        if ((dateCheck = currentReport.match(hourlySalesExtractDatePattern)) !== null) {
           dayFrom = Number(dateCheck.groups.date_day_from) < 10 ? `0${dateCheck.groups.date_day_from}`: dateCheck.groups.date_day_from;
           dayTo = Number(dateCheck.groups.date_day_to) < 10 ? `0${dateCheck.groups.date_day_to}`: dateCheck.groups.date_day_to;
           monthFrom = dateCheck.groups.date_month_from
           monthTo = dateCheck.groups.date_month_to
           yearFrom = dateCheck.groups.date_year_from
           yearTo = dateCheck.groups.date_year_to
           dateFrom = `${yearFrom}/${monthFrom}/${dayFrom}`
           dateTo = `${yearTo}/${monthTo}/${dayTo}`
        }
          
        //If The report covers one date
        if (dateTo === dateFrom) {
          if (!store[currentStore].hasOwnProperty(dateTo)) {
            store[currentStore][dateTo] = new SalesDay()
          }
  
          let dataMatch;
  
          while((dataMatch = hourlySalesExtractDataPattern.exec(currentReport)) !== null){
  
          let hour = Number(dataMatch.groups.time_hour);
          let transactions = Number(dataMatch.groups.customer_count);
          let hourlySales = Number(dataMatch.groups.hourly_sales.replaceAll(",",""));
          let cumulativeSales = Number(dataMatch.groups.hourly_sales_cumulative.replaceAll(",",""));
          let ticketAverage = Number(dataMatch.groups.hourly_ticket_average);
          
  
          store[currentStore][dateTo].hourlySales[hour] = hourlySales;
          store[currentStore][dateTo].hourlySalesCumulative[hour] = cumulativeSales;
          store[currentStore][dateTo].hourlyTicketAverage[hour] = ticketAverage;
          store[currentStore][dateTo].transactions[hour] = transactions;
  
          }
  
          //Insert Totals Data
  
          let totalsMatch;
  
          if ((totalsMatch = currentReport.match(hourlySalesTotalsData)) !== null) {
            let salesTotal = Number(totalsMatch.groups.total_sales.replaceAll(",",""))
            let ticketAverageTotal = Number(totalsMatch.groups.ticket_average.replaceAll(",",""))
            let totalTransactions = Number(totalsMatch.groups.transactions.replaceAll(",",""))
  
            store[currentStore][dateTo].salesTotal = salesTotal
            store[currentStore][dateTo].transactionsTotal = totalTransactions
            store[currentStore][dateTo].ticketAverageTotal = ticketAverageTotal
  
            /* this.salesTotal = 0;
        this.transactionsTotal = 0;
        this.ticketAverageTotal = 0;*/ 
          } 
  
        //If the report is for multiple days
        } else {
  
          beginDate = Number(yearFrom + monthFrom + dayFrom)
          endDate = Number(yearTo + monthTo + dayTo)
          let daysBetween = Math.abs(endDate - beginDate)
  
          for (let date = beginDate; date <= endDate;date++) {
            let year = String(date).substring(0,4)
            let month = String(date).substring(4,6)
            let day = String(date).substring(6,8)
            let currDate = `${year}/${month}/${day}`
  
            if (!store[currentStore].hasOwnProperty(currDate)) {
              store[currentStore][currDate] = new SalesDay()
            }
  
            let dataMatch;
  
          while((dataMatch = hourlySalesExtractDataPattern.exec(currentReport)) !== null){
  
          let hour = Number(dataMatch.groups.time_hour);
          let transactions = Number(dataMatch.groups.customer_count);
          let hourlySales = Number(dataMatch.groups.hourly_sales.replaceAll(",",""));
          let cumulativeSales = Number(dataMatch.groups.hourly_sales_cumulative.replaceAll(",",""));
          let ticketAverage = Number(dataMatch.groups.hourly_ticket_average);
          
          if (store[currentStore][currDate].hourlySales[hour] === 0) {
            store[currentStore][currDate].hourlySales[hour] = hourlySales / daysBetween;
          }
          if (store[currentStore][currDate].hourlySalesCumulative[hour] === 0) {
            store[currentStore][currDate].hourlySalesCumulative[hour] = cumulativeSales / daysBetween;
          }
          if (store[currentStore][currDate].hourlyTicketAverage[hour] === 0) {
            store[currentStore][currDate].hourlyTicketAverage[hour] = ticketAverage / daysBetween;
          }
          if (store[currentStore][currDate].transactions[hour] === 0) {
            store[currentStore][currDate].transactions[hour] = transactions / daysBetween;
          }
  
          }
        }
  
  
      }
    }
  }
  }