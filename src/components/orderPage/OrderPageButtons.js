// pressing the copy script button!

function copyRMFScript() {
  let copyButtonElement = document.getElementById(
    "output__option-bar__copy__button"
  );
  
  copyButtonElement.addEventListener("click", () => {
    let rmfRelayScript = "";
    let inComingProducts = "";
  
    for (let product in productsOnOrder) {
      if (productsOnOrder[product].order > 0) {
        rmfRelayScript += `${product}: ${productsOnOrder[product].order}\n`;
      }
      let td = new Date();
      td = dateConverter(td, true);
      if (String(productsOnOrder[product].arrivalDate) === td) {
        inComingProducts += `${product}\n`;
      }
    }
  
    rmfRelayScript = `
    let data = \`${rmfRelayScript}\`;
  
    let incomingProducts = \`${inComingProducts}\`;
    incomingProducts = incomingProducts.split(\`\\n\`).filter(el => el.length > 1);
    tableElement = document.querySelectorAll("#ctl00_ph_otd_geo_ctl00 tbody tr")
    data = data.split(\`\\n\`).filter(el => el.length > 1);
    let products = {};
    
    for (let entry of data) {
        let [product, value] = entry.split(": ");
        value = Number(value);
        products[product] = value;
    }
    
    for (let row = 1; row < tableElement.length; row++) {
        let productElement = tableElement[row].cells[1].innerText;
        let productEl = tableElement[row].cells[1];
        let inputElement = tableElement[row].cells[3].firstElementChild;
        let rowIncomingDate  = tableElement[row].children[14].children[0];
        if (products.hasOwnProperty(productElement)) {
            inputElement.value = products[productElement];
            inputElement.style.backgroundColor = "#d8ffa6";
            delete products[productElement];
        }else {
          inputElement.value = "0";
        }
  
        if(incomingProducts.includes(productElement)) {
          productEl.style.backgroundColor = '#c9f8ff';
        }
  
    }`;
  
    navigator.clipboard
      .writeText(rmfRelayScript)
      .then(() => {
        alert("Script armed and ready!");
      })
      .catch((error) => {
        console.error("Unable to copy variable data:", error);
      });
  });
  
}


// Pressing the print button

function print() {
  let printButtonElement = document.getElementById(
    "output__option-bar__print__button"
  );
  printButtonElement.addEventListener("click", () => {
    let printTable = document.createElement("table");
    printTable.id = "print-table";
    printTable.style.borderCollapse = "collapse";
    printTable.style.border = "1px solid black";

    let headerTr = document.createElement("tr");
    headerTr.innerHTML = `<th></th>
            <th>Product</th>
            <th>Order</th>`;
    printTable.appendChild(headerTr);

    let counter = 1;
    for (let product in productsOnOrder) {
      if (productsOnOrder[product].order > 0) {
        let productElementTr = document.createElement("tr");

        let itemCountTd = document.createElement("td");
        Object.assign(itemCountTd, {
          textContent: counter,
          className: "count-td",
        });
        counter++;
        let productNameTdElement = document.createElement("td");
        Object.assign(productNameTdElement, {
          textContent: product,
          className: "name-td",
        });
        let orderQuantityTdElement = document.createElement("td");
        orderQuantityTdElement.className = "quantity-td";
        orderQuantityTdElement.textContent = productsOnOrder[product].order;

        productElementTr.appendChild(itemCountTd);
        productElementTr.appendChild(productNameTdElement);
        productElementTr.appendChild(orderQuantityTdElement);

        printTable.appendChild(productElementTr);

        let tableCells = printTable.getElementsByTagName("td");
        for (let i = 0; i < tableCells.length; i++) {
          tableCells[i].style.border = "1px solid black";
          tableCells[i].style.padding = "5px";
        }
      }
    }
    let printWindow = window.open("", "_blank");

    // Append the printTable to the print window's document body
    printWindow.document.body.appendChild(printTable);

    // Open the print dialog
    printWindow.print();

    // Close the print window after printing is complete (optional)
    printWindow.close();
    printTable.remove();
  });
}
