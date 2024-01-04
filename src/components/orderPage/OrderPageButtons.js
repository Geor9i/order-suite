
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
