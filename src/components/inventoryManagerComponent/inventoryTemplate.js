//Create Inventory Screen
let mainContainer = document.querySelector('.inventory-template__main-container');


//Generate Inventory Screen
let invScreenPref = {
  mainClassName: ['inventory-record-container', 'inventory-product-rules-container'],
  titleBarText: ['Inventory Record', 'Product Rules'],
  category1: ['Day span', 'State'],
  category2: ['ID', 'Link ID'],
}

for (let i = 0;i < 2;i++) {
  let linkBtn = i === 1 ? `<button .inventory-record-button>Link</button>` : '';
  let container = domGen(`
  <div .${invScreenPref.mainClassName[i]}>
  <div .inventory-title__bar>${invScreenPref.titleBarText[i]}</div>
      <div .inventory-record__category-bar>
          <span .inventory-record-category-name>Name</span>
          <span .inventory-record-category-date>Category</span>
          <span .inventory-record-category-date>Date</span>
          <span .inventory-record-category-day-span>${invScreenPref.category1[i]}</span>
          <span .inventory-record-category-state>${invScreenPref.category2[i]}</span>
      </div>
  <div .inventory-record__content__container></div>
  <div .navigation__bar>
      <div .nav-splitter .create-nav>
      <button #inventory-add-record-button .inventory-record-button>+</button>
      </div>  
      <div .nav-splitter>
          ${linkBtn}
          <button .inventory-record-button>Edit</button>
          <button .inventory-record-button>Delete</button>
      </div>
  </div>
</div>
`)
mainContainer.appendChild(container);
}


//Create Inventory Template Form
let inventoryTemplateForm = document.querySelector('.inventory-template__create-form__inactive');
let addInventoryButton = document.getElementById('inventory-add-record-button');
let inventoryMainContainer = document.querySelector('.inventory__main-container');

addInventoryButton.addEventListener('click', inventoryRecordTemplate);


async function inventoryRecordTemplate () {

      let createInventoryForm = domGen(`
        <div .page-cover>
          <div .inventory-form__container>
            <form .inventory-form>
            <label for="inventory-process-textarea">Inventory Report Processor</label>
            <textarea name="inventory-process-textarea" .inventory-process-textarea placeholder="Paste inventory report here!"></textarea>
            <div .inventory-content-groups__container>
              <h3 .inventory-content--categories-title>Discovered Groups</h3>
              <ul .inventory-content-box>
                <li>Ambient Packaging</li>
                <li>Frozen Product</li>
              </ul>
              <ul .inventory-content-box>
                <li>Report Span: 200 days</li>
                <li>Start Date: 01/01/2023</li>
                <li>End Date: 06/06/2023</li>
              </ul>
            <button .inventory-process-btn >Process</button>
            </form>
              </div>
            </div>
          </div>
        </div>
        `) 
      inventoryMainContainer.insertBefore(createInventoryForm, inventoryMainContainer.firstChild);

  //Check if inventory report is valid
  let textArea = document.querySelector('.inventory-process-textarea');

  textArea.addEventListener('input', (e) => {
    let reportProcessor = inventoryHarvest (textArea.value);
    console.log(reportProcessor);
  })
  let form = document.querySelector('.inventory-form');
  form.addEventListener('submit', (e)=> {
   e.preventDefault();
    createInventoryForm.remove();
   
 }) 
}