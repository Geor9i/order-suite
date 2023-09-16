
export class Util {


  
  // Warning message printer!
  
  
  //Convert orderDays from name strings to a numbered day array
  
  
 
  //=========================================================================
  
 
  
 
  
  //Side function used with domGen
   domFunctions() {
    return {
      generateHours(select) {
        for (let i = 0; i < 24; i++) {
          let option = document.createElement("option");
          option.textContent = i < 10 ? `0${i}:00` : `${i}:00`;
  
          let option2 = document.createElement("option");
          option2.textContent = i < 10 ? `0${i}:15` : `${i}:15`;
          
          let option3 = document.createElement("option");
          option3.textContent = i < 10 ? `0${i}:30` : `${i}:30`;
          
          let option4 = document.createElement("option");
          option4.textContent = i < 10 ? `0${i}:45` : `${i}:45`;
          select.appendChild(option);
          select.appendChild(option2);
          select.appendChild(option3);
          select.appendChild(option4);
        }
      },
      generateWeekdays(select) {
        for (let i = 0; i < 7; i++) {
          let option = document.createElement("option");
          option.textContent = getWeekDay(i);
          select.appendChild(option);
          
        }
      }
    };
  }
  
  
  //Function to reduce non focused values in arr for a total of 100
   keepWithin100(arr, focusedIndex) {
    function sumArr(arr) {
      return arr.reduce((acc, curr) => acc + curr);
    }
    let sum = sumArr(arr);
    if (sum > 100) {
      let focusedNum = arr[focusedIndex];
      let reduceTotalBy = sum - 100;
      let sideSum = sum - focusedNum;
      if (sideSum > 0) {
      let adjusted = [];
      for (let i = 0;i < arr.length;i++) {
        if (i !== focusedIndex) {
          adjusted.push(arr[i] / sideSum);
        } else adjusted.push(0);
      }
      let corrected = [];
      for (let i = 0;i < arr.length;i++) {
        if (i !== focusedIndex) {
          corrected.push(reduceTotalBy * adjusted[i]);
        } else corrected.push(0);
      }
      for (let i = 0;i < arr.length;i++) {
        if (i !== focusedIndex) {
          arr[i] -= corrected[i];
      }
    }
      }
    }
      
      
    return arr;
  }
  
  //Generate tableRows for products
   productTableConstructor(currentOrderProducts, product, append = true) {
    let tableBody = document.querySelector(".product-table-tbody");
  
    if (!currentOrderProducts[product].isInDataTable) {
      currentOrderProducts[
        product
      ].id = `${currentOrderProducts[product].count}__product`;
  
      let productElementTr = domGen(`
          <tr .product-table-tr #${currentOrderProducts[product].count}__product>
              <td .product-name-td>${product}</td>
  
              <td .order-quantity-td>
                  <h3 .order-quantity-value>${currentOrderProducts[product].order}
                  </h3>
                  <div .value-button__container>
                  <button .value-button>-</button>
                  <button .value-button>+</button>
                  </div>
              </td>
              <td .product-usage-td>${currentOrderProducts[product].usage}</td>
              <td .product-price-td>${currentOrderProducts[product].price}</td>
              <td .product-onhand-td>${currentOrderProducts[product].onHand}</td>
              <td .order-day-onhand-td>${currentOrderProducts[product].stockOnOrderDay}</td>
              <td .post-delivery-quantity-td>${currentOrderProducts[product].nextOrderDayOnHand}</td>
              <td .keep-checkbox-td>
                  <input .order__checkbox type="checkbox" checked="true">
                  </input>
              </td>
          </tr>
      `);
  
      if (append) {
        tableBody.appendChild(productElementTr);
      } else {
        tableBody.prepend(productElementTr);
      }
      currentOrderProducts[product].isInDataTable = true;
    }
  }
  
   


    
  }