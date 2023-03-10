import * as Helpers from './helpers.js';
import * as Tables from './tables.js';


//Adds click event listener to Delete button on equipment table and calls delete_item view to delete current item
export function deleteItem(){
    //const deleteItemButton = $('#itemsTable').DataTable().$('button#deleteItemButton');
    const table = document.querySelector('#itemsTable tbody');
    if(table){
        table.addEventListener('click', e=>{
            e.preventDefault();
            if(e.target.id === 'deleteItemButton'){

                const rowIndex = e.target.closest('tr');
                const assetNum = rowIndex.querySelector('td:nth-child(2)').textContent;
                const token = $("#edit_item").find('input[name=csrfmiddlewaretoken]').val()
                let alertBoxFailure = document.querySelector('#alert-box-items-failure'); 
                let alertBox = document.querySelector('#alert-box'); 
                alertBox.innerHTML = "";
                alertBoxFailure.innerHTML = "";
                                
                $.ajax({
                type:'POST',
                url: 'delete_item/',
                headers: {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'},
                data: {
                    "csrfmiddlewaretoken" : token,
                    'asset_num':assetNum
                    },
                    success: function(response){
                    if(response.deleted == true){
                        alertBox.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">
                        This item has been deleted successfuly.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                        const jsonData = JSON.parse(response.json);
                        Tables.populataTable(jsonData,null, "itemsTable");
                        Tables.sortItemsTable("itemsTable");
                    }
                    else{
                        alertBoxFailure.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        This item ` + response.response + `.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                    }
                    },
                    error: function(response){
                        alertBoxFailure.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        There was an error when deleting this item. Please contact your administrator.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;
                    }
                    })

            }})
    }
}

    
let oldAssetNum_ = "";
let itemRow_ = "";

function setAssetNumber(oldAsset, itemRow)
{ 
    oldAssetNum_ = oldAsset; 
    itemRow_ = itemRow;
    
}
//Export funciton for use in tables.js. Gets old assetNumber and reference to table row
export { setAssetNumber as getAssetNum };

//Edits selected item from equipment list by calling a view with ajax. 
export function editLoanItem(){
    const editButton = document.querySelector('#edit_item_btn');
    //const parent = editButton.parentNode.parentNode;
    
    //const secondInput = document.querySelectorAll('form#edit_item input, form#edit_item button')[1];
    
    if(editButton){
        editButton.addEventListener('click', e=>{
            e.preventDefault();
            //Store edit form input fields values
            const token = $("#edit_item").find('input[name=csrfmiddlewaretoken]').val()
            const assetNum = $("#edit_item").find('input[name=asset_id]');
            const make = $("#edit_item").find('input[name=make]');
            const model = $("#edit_item").find('input[name=model]');
            const notes = $("#edit_item").find('input[name=notes]');
            const assetNumField = $('input[name=asset_id]')[0];
            const modalWindow = $('#staticBackdrop');

            let alertBoxFailure = document.getElementById('alert-box-failure');  
            let alertBox = document.getElementById('alert-box');

            //Call edit_item view and pass input field values as data
            $.ajax({
                type:'POST',
                url: 'edit_item/',
                headers: {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'},
                data: {
                    "csrfmiddlewaretoken" : token,
                    'asset_num_new': "LEM" + assetNum.val(),
                    'asset_num_old' : oldAssetNum_,
                    'make': make.val(),
                    'model': model.val(), 
                    'notes': notes.val()
                },
                success: function(response){
                    if(response.exists == true){
                        assetNumField.style.outline = "thin solid #ff5959";
                        alertBoxFailure.innerHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
                        This asset number already exists. Choose a different number
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                      </div>`;
                    }
                    else{
                        assetNumField.style.outline = "none";
                        alertBox.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">
                        You have succesfully updated this item.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                      </div>`;

                        let assetTD = itemRow_.querySelector('td:nth-child(2)');
                        let makeTD = itemRow_.querySelector('td:nth-child(3)');
                        let modelTD = itemRow_.querySelector('td:nth-child(4)');
                        let noteTD = itemRow_.querySelector('td:nth-child(6)');

                        modalWindow.modal('hide');
                        assetTD.textContent = "LEM" + assetNum.val();
                        makeTD.textContent = make.val();
                        modelTD.textContent = model.val();
                        noteTD.textContent = notes.val();

                    }
                },
                error: function(response){
                    alertBoxFailure.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    There was an error when editing this item. Please contact your administrator.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>`;
                }
    
            })
        })
    }

}

//Adds a new loan item to the database.
//Populates table with new data by calling populateTable() and sortItemTable() functions.
export function addLoanItem(){
    const addNewItemBtn = document.querySelector('#addNewItem');
    const btn = document.querySelector('#add_item_btn')
    const token = $("#add_item").find('input[name=csrfmiddlewaretoken]').val()
    let categoryDataBox = document.getElementById('category');

    if(addNewItemBtn){
        addNewItemBtn.addEventListener('click', e=>{

            const newItemModal = document.querySelector('div[name=new_item_modal]');

            if(newItemModal.getAttribute("aria-hidden") == "true"){
                let assetNum = $('#add_item').find('span[name=new_asset_number]');
                Helpers.populateAssetNumber()
                .then(function(success){
                    assetNum[0].innerHTML = success;
                })
                let make = $("#add_item").find('input[name=make]');
                let model = $("#add_item").find('input[name=model]');
                let notes = $("#add_item").find('input[name=notes]');

                make[0].value = "";
                model[0].value = "";
                notes[0].value = "";
                categoryDataBox.selectedIndex = 0;

            }
        })
    }
    
    if(btn){
        Helpers.getItemCategories(categoryDataBox, null, "newItem");
        
        let make = $("#add_item").find('input[name=make]');
        let model = $("#add_item").find('input[name=model]');
        let notes = $("#add_item").find('input[name=notes]');
        let assetNum = $("#add_item").find('span[name=new_asset_number]');
        let modalWindow = $('#staticBackdropAddItem');
        let alertBox = document.querySelector('#alert-box');
        let alertBoxFailure = document.querySelector('#alert-box-failure');

        btn.addEventListener('click', e=>{
            e.preventDefault();
            $.ajax({
                type:'POST',
                headers: {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'},
                url: 'create_loan_item/',
                data: {"csrfmiddlewaretoken" : token, 
                        "make": make.val(),
                        "model": model.val(),
                        "notes": notes.val(),
                        "category": categoryDataBox.options[categoryDataBox.selectedIndex].text,
                        "assetNum": assetNum[0].textContent
                        },
                        success: function(response){
                            if(response.success == true){
                                alertBox.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">
                            You have succesfully added a new loan item.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                            modalWindow.modal('hide');

                            $.ajax({
                                type: "GET",
                                url: "manage_equipment",
                                headers: {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'},
                                dataType: "json",
                                success: function(data) {
                                    const jsonData = JSON.parse(data);
                                    
                                    Tables.populataTable(jsonData,null, "itemsTable");
                                    Tables.sortItemsTable("itemsTable");

                                    make.innerHTML = "";
                                    model.innerHTML = "";
                                    notes.innerHTML = "";
                                    Tables.populateModalWindow();
                                },
                                error: function(textStatus, errorThrown) {
                                  console.log(textStatus + ": " + errorThrown);
                                }
                              });
                
                            }
                            else{
                                alertBoxFailure.innerHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
                                There was a problem adding your device. Try again.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>`;
                            }
                        },
                        error: function(response){
                            alertBoxFailure.innerHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
                                There was an error when adding your item. Contact your administrator.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>`;
                        }
            })
        })        
    }
    else{
        return;
    }

}

