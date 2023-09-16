function generateSideBar (productsOnOrder) {

    //Generate side bar items
   
    let sideTableElement = document.createElement("table")
    sideTableElement.id = "side-table__search";
    sideScreenElement.appendChild(sideTableElement)

    for (let product in productsOnOrder) {

        if (product !== "counter") {

            let sideTableRow = domGen(`
                <tr .side-table-row>
                    <td .side-product-td>${product}</td>
                    <td .side-value-td>
                        <h3 .side-input-value-td>0</h3>
                        <div .side-menu__value-button__container>
                            <button .side-menu-value-button>+</button>
                            <button .side-menu-value-button>-</button>
                        </div>
                    </td>
                </tr>
            `)

            sideTableElement.appendChild(sideTableRow)
            if (productsOnOrder[product].order > 0) {
                sideTableRow.classList.add("hidden")
            }

        }
    }
    
    // When increment and decrement buttons are clicked
    let sideTable = document.querySelector("#side-table__search");
    let sideTableValues = sideTable.querySelectorAll('.side-input-value-td')
    sideTable.addEventListener("click", (e) => {
        let productName = e.target.parentElement.parentElement.parentElement.children[0].textContent;
        let productValueElement = e.target.parentElement.parentElement.children[0];
        if (e.target.classList.contains("side-menu-value-button")) {
            let buttonValue = e.target.innerText === "+" ? 1 : -1;
            productValueElement.textContent = Math.max(0, Number(productValueElement.textContent) + buttonValue);
            for (let val of sideTableValues) {
                if (Number(val.textContent > 0)) {
                    val.classList.add("side-input-value-td-to-add");
                } else {
                    val.classList.remove("side-input-value-td-to-add");
                }
            }
            
            productsOnOrder[productName].order = Math.max(0, Number(productValueElement.textContent));
            productsOnOrder[productName].readyToAdd = productValueElement.textContent > 0 ? true : false;
    }
})
    sideBarSearchField(productsOnOrder);

}

function sideBarSearchField (productsOnOrder) {
    let searchField = document.getElementById("output__option-bar__search-field");
    searchField.setAttribute("placeholder", "Search...")
    let addButtonElement = document.getElementById("output__option-bar__add__button");
    let tableElementRows = document.querySelectorAll("#side-table__search tr");


    searchField.addEventListener("input", () => {
         
            for (let row of tableElementRows) {
                let productName = row.children[0].textContent;
                if (searchField.value.length > 0) {
                    if (!productName.toLowerCase().includes(searchField.value.toLowerCase())) {
                        row.classList.add("hidden")
                    } else {
                        if (!productsOnOrder[productName].isInDataTable){
                            row.classList.remove("hidden")
                        }
                    }
                }else {
                        hideTableElements(productsOnOrder);
                    }
                    
                }
        

    })

// Add button functionality
    addButtonElement.addEventListener("click", () => {
        let tableElementRows = document.querySelectorAll("#side-table__search tr");
        addButtonElement.classList.remove("press__button__glow");
        for (let row of tableElementRows) {
            row.children[1].children[0].classList.remove("side-input-value-td-to-add");
            let productName = row.children[0].textContent;
            if (productsOnOrder.hasOwnProperty([productName])) {
                if (productsOnOrder[productName].readyToAdd) {
                    productTableConstructor(productsOnOrder,row.children[0].textContent, false)
                    row.children[1].children[0].textContent = "0";
                    productsOnOrder[productName].readyToAdd = false;
                    hideTableElements(productsOnOrder)
                }

            }
        }
    })

}

// Hide Elements during search and generate appropriate amount 
function hideTableElements (productsOnOrder) {
    let sideTableElementRows = document.querySelectorAll("#side-table__search tr");
    for (let row of sideTableElementRows) {
        let productName = row.children[0].textContent;
        if (productsOnOrder.hasOwnProperty(productName)) {
            if (productsOnOrder[productName].isInDataTable) {
                row.classList.add("hidden")
            }else {
                row.classList.remove("hidden")
            }
        } 
        
    }
}

//Add button animation

let sideTableContainerElement = document.querySelector('.order__table__page-side-selector__screen');
sideTableContainerElement.addEventListener("click", (e) => {
    let addButtonElement = document.getElementById("output__option-bar__add__button");
  if (e.target.tagName === "BUTTON") {
    let h3Collection = sideTableContainerElement.querySelectorAll("h3");
    for (let h3 of h3Collection) {
        if (h3.textContent !== "0") {
            addButtonElement.classList.add("press__button__glow");
            break;
        } else {
            addButtonElement.classList.remove("press__button__glow");
        }
    }
  }
})