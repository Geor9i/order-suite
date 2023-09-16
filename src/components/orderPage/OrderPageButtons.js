// pressing the copy script button!
let copyButtonElement = document.getElementById("output__option-bar__copy__button")

copyButtonElement.addEventListener("click", () => {
  let rmfRelayScript = "";
  let inComingProducts = '';

  for (let product in productsOnOrder) {
    if (productsOnOrder[product].order > 0) {
      rmfRelayScript += `${product}: ${productsOnOrder[product].order}\n`
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

  }`

  navigator.clipboard.writeText(rmfRelayScript)
    .then(() => {
      alert('Script armed and ready!');
    })
    .catch((error) => {
      console.error('Unable to copy variable data:', error);
    });
})

// Pressing the print button
let printButtonElement = document.getElementById("output__option-bar__print__button");
printButtonElement.addEventListener("click", () => {
  let printTable = document.createElement("table");
  printTable.id = "print-table";
  printTable.style.borderCollapse = 'collapse';
  printTable.style.border = '1px solid black';

  let headerTr = document.createElement("tr");
  headerTr.innerHTML = `<th></th>
            <th>Product</th>
            <th>Order</th>`
  printTable.appendChild(headerTr)

  let counter = 1;
  for (let product in productsOnOrder) {

    if (productsOnOrder[product].order > 0) {
      let productElementTr = document.createElement("tr");

      let itemCountTd = document.createElement("td");
      Object.assign(itemCountTd, {
        textContent: counter,
        className: "count-td"
      })
      counter++;
      let productNameTdElement = document.createElement("td");
      Object.assign(productNameTdElement, {
        textContent: product,
        className: "name-td"
      })
      let orderQuantityTdElement = document.createElement("td");
      orderQuantityTdElement.className = "quantity-td"
      orderQuantityTdElement.textContent = productsOnOrder[product].order




      productElementTr.appendChild(itemCountTd);
      productElementTr.appendChild(productNameTdElement);
      productElementTr.appendChild(orderQuantityTdElement);


      printTable.appendChild(productElementTr)

      let tableCells = printTable.getElementsByTagName('td');
      for (let i = 0; i < tableCells.length; i++) {
        tableCells[i].style.border = '1px solid black';
        tableCells[i].style.padding = '5px';
      }
    }
  }
  let printWindow = window.open('', '_blank');

  // Append the printTable to the print window's document body
  printWindow.document.body.appendChild(printTable);

  // Open the print dialog
  printWindow.print();

  // Close the print window after printing is complete (optional)
  printWindow.close();;
  printTable.remove();
})

// pressing the Update button
let inputInvolved = false;
let updateButton = document.getElementById("output__option-bar__update__button")
updateButton.addEventListener("click", () => {
  inputInvolved = false;
  updateButton.classList.remove("press__button__glow");
  let tableElementRows = document.querySelectorAll(".product-table-tbody tr")

  for (let i = 0; i < tableElementRows.length; i++) {
    let productName = tableElementRows[i].children[0].textContent;
    let orderAmount = Number(tableElementRows[i].children[1].children[0].textContent);
    let isChecked = tableElementRows[i].children[7].children[0].checked;

    if (productsOnOrder.hasOwnProperty(productName)) {
      productsOnOrder[productName].order = orderAmount;
    }

    if (orderAmount <= 0 || !isChecked) {
      productsOnOrder[productName].order = 0;
      productsOnOrder[productName].isInDataTable = false;
      tableElementRows[i].remove();
      hideTableElements(productsOnOrder);
    }
  }

})


// Update button animation

let orderTableContainerElement = document.querySelector('.order__table__page-output-order');
orderTableContainerElement.addEventListener("click", (e) => {
  if (e.target.tagName === "INPUT" && e.target.type === "checkbox" && !inputInvolved) {
    let checkBoxCollection = Array.from(document.querySelectorAll('.data-table tr td input[type="checkbox"]'));
    for (let box of checkBoxCollection) {
      if (!box.checked) {
        updateButton.classList.add("press__button__glow");
        break;
      } else {
        updateButton.classList.remove("press__button__glow");
      }
    }
  }
// Pressing the +/- button on the order table
  if (e.target.tagName === "BUTTON") {
    inputInvolved = true;
    let value = e.target.parentElement.parentElement.children[0];
    let productName = e.target.parentElement.parentElement.parentElement.children[0].textContent;

    updateButton.classList.add("press__button__glow");
    let buttonValue = e.target.textContent === "+" ? 1 : -1;
    value.textContent = Math.max(0, Number(value.textContent) + buttonValue);
    productsOnOrder[productName].order = Math.max(0, Number(value.textContent));
  }

  if (e.target.tagName === "INPUT" && e.target.classList.contains("order-quantity-input")) {
    updateButton.classList.add("press__button__glow");
  }
})
