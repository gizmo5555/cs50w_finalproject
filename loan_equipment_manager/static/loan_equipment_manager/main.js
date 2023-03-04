//Create new request
function createRequest(request_form){   
    if(request_form){   
        
        //Reference variables 
        let itemsDataBox = document.getElementById('itemselection');
        let categoryDataBox = document.getElementById('category');
        const startDate = document.getElementById('start');
        const endDate = document.getElementById('end');
        
        let selectedItem = "";  
        let startDateSelected = "";
        let endDateSelected = "";

        startDate.addEventListener('change', e=>{
            startDateSelected = startDate.value
            
        })

        endDate.addEventListener('change', e=>{
            endDateSelected = endDate.value
        })   

        getItemCategories(categoryDataBox,itemsDataBox, "request");

        itemsDataBox.addEventListener('change', e=>{
            selectedItem = itemsDataBox.options[itemsDataBox.selectedIndex].id
            alertBox.innerHTML = "";        
        })      
        request_form.addEventListener('submit', e=>{
            e.preventDefault()
            selectedItem = selectedItem;
            categoryDataBox = categoryDataBox;
            const token = $("#request_form").find('input[name=csrfmiddlewaretoken]').val()
            const selectedCat = categoryDataBox.options[categoryDataBox.selectedIndex].text
            
            if(selectedItem == "..." || selectedCat == "..." || startDateSelected == "" || endDateSelected == ""){
                alertBox.innerHTML = `<div class="alert alert-warning alert-dismissible fade show"  role="alert">
                    Please make sure all fields are populated before making a request.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
                return;
            }     
            
            $.ajax({
                type:'POST',
                url: 'create_request/',
                headers: {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'},
                data: {
                    "csrfmiddlewaretoken" : token,
                    'item_id': selectedItem,
                    'start_date':startDateSelected,
                    'end_date':endDateSelected
                },
                success: function(response){
                    if(response.created == "requested"){
                        alertBox.innerHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
                        This item has already been requested. Refresh your page
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`
                    return false;
                    }
                    alertBox.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">
                    Your request has been created!
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
                $("#request_form")[0].reset();
                },
                error: function(response){
                    alertBox.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    There was a problem when creating your request. Please try again.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
                $("#request_form")[0].reset();
                }
    
            })
        })
    }
    else{
        return;
    }

}

//Populate modal edit item window with data form current row in loan item table
function populateModalWindow(){
    let make_ = null;
    let model_ = null;
    let notes_ = null;
    const updateButtons = $('#itemsTable').DataTable().$('button#updateItemButton');
    if(updateButtons){
        for(const btn of updateButtons){
            btn.addEventListener('click', event=>{
                alertBoxFailure = document.getElementById('alert-box-failure');  
                alertBoxFailure.innerHTML = "";
                const assetNumField = $('input[name=asset_id]')[0];
                assetNumField.style.outline = "none";
                const row = btn.parentNode.parentNode;                
                const assetNumber = row.querySelector('td:nth-child(2)').textContent;
                let assetNumTrimmed = assetNumber.substring(3);
                const make = row.querySelector('td:nth-child(3)').textContent;
                const model = row.querySelector('td:nth-child(4)').textContent;
                const notes = row.querySelector('td:nth-child(6)').textContent;

                assetNumber_ = row.querySelector('td:nth-child(2)');
                make_ = row.querySelector('td:nth-child(3)');
                model_ = row.querySelector('td:nth-child(4)');
                notes_ = row.querySelector('td:nth-child(6)');

                const assetInput = document.getElementById('asset-input');
                const makeInput = document.getElementById('make-input');
                const modelInput = document.getElementById('model-input');
                const notesInput = document.getElementById('notes-input');

                assetInput.value = assetNumTrimmed;
                makeInput.value = make;
                modelInput.value = model;
                notesInput.value = notes;

                asset_number_for_edit = assetNumber;
            })
        }
    }

}

//Adds click event listener to Delete button on equipment table and calls delete_item view to delete current item
function deleteItem(){
    //const deleteItemButton = $('#itemsTable').DataTable().$('button#deleteItemButton');
    const table = document.querySelector('#itemsTable tbody');
    if(table){
        table.addEventListener('click', e=>{
            e.preventDefault();
            if(e.target.id === 'deleteItemButton'){

                const rowIndex = e.target.closest('tr');
                const assetNum = rowIndex.querySelector('td:nth-child(2)').textContent;
                const token = $("#edit_item").find('input[name=csrfmiddlewaretoken]').val()
                console.log(assetNum);
                let alertBoxFailure = document.querySelector('#alert-box-items-failure'); 
                let alertBox = document.querySelector('#alert-box'); 
                alertBox.innerHTML = "";
                alertBoxFailure.innerHTML = "";
                console.log(alertBoxFailure, alertBox);
                                
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
                        populataTable(jsonData, "itemsTable");
                        sortItemsTable("itemsTable");
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

//Edits selected item from equipment list by calling a view with ajax. 
function editLoanItem(alertBoxFailure,alertBox){
    const editButton = document.querySelector('#edit_item_btn');
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

            alertBoxFailure = document.getElementById('alert-box-failure');  
            alertBox = document.getElementById('alert-box');

            //Call edit_item view and pass input field values as data
            $.ajax({
                type:'POST',
                url: 'edit_item/',
                headers: {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'},
                data: {
                    "csrfmiddlewaretoken" : token,
                    'asset_num_new': "LEM" + assetNum.val(),
                    'asset_num_old' : asset_number_for_edit,
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
                        modalWindow.modal('hide');
                        assetNumber_.innerHTML = "LEM" + assetNum.val();
                        make_.innerHTML = make.val();
                        model_.innerHTML = model.val();
                        notes_.innerHTML = notes.val();
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
function addLoanItem(){
    const addNewItemBtn = document.querySelector('#addNewItem');
    const btn = document.querySelector('#add_item_btn')
    const token = $("#add_item").find('input[name=csrfmiddlewaretoken]').val()
    let categoryDataBox = document.getElementById('category');

    if(addNewItemBtn){
        addNewItemBtn.addEventListener('click', e=>{

            const newItemModal = document.querySelector('div[name=new_item_modal]');

            if(newItemModal.getAttribute("aria-hidden") == "true"){
                let assetNum = $('#add_item').find('span[name=new_asset_number]');
                populateAssetNumber()
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
        getItemCategories(categoryDataBox, null, "newItem");
        
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
                                    
                                    populataTable(jsonData, "itemsTable");
                                    sortItemsTable("itemsTable");

                                    make.innerHTML = "";
                                    model.innerHTML = "";
                                    notes.innerHTML = "";
                                    populateModalWindow();
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

//Closes active loans and populates.
//Sorts table with new data by calling populataTable() and sortItemsTable();
function closeLoan(){
    const table = document.querySelector('#activeLoansTable tbody');
    if(table){
        alertBox = document.querySelector('#alert-box');
        table.addEventListener('click', e=>{
            e.preventDefault();
            if(e.target.tagName === 'A'){
                const rowIndex = e.target.closest('tr');
                const loanNumber = rowIndex.querySelector('td:nth-child(2)').textContent;
                const token = $("#nav-tabContent").find('input[name=csrfmiddlewaretoken]').val()

                $.ajax({
                    type:'POST',
                    headers: {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'},
                    url: 'close_loan/',
                    data: {
                        "csrfmiddlewaretoken" : token,
                        'loan_num' : loanNumber
                    },
                    success: function(response){
                        if(response.closed == false){
                            alertBox.innerHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
                            Error when closing loan. Check logs
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                        }
                        else if(response.closed == null){
                            alertBox.innerHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
                            Loan does not exist.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                        }
                        else if(response.closed == 'Unauthorized'){
                            alertBox.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                            You are unathorized to perform this action.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                        }
                        else {
                            alertBox.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">
                            Loan has been succesfully closed.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                            var json = response.loans; 
                            populataTable(json, "activeLoansTable");
                            sortItemsTable("activeLoansTable");
                        }
                    },
                    error: function(response){
                        alertBox.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        Error when closing loan. Check logs
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;
                    }
        
                })
            }
        })
    }
    else{
        return;
    }
}
//Date picker for loan request
$datePicker = function(){
    var dtToday = new Date();
    
    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if(month < 10)
        month = '0' + month.toString();
    if(day < 10)
        day = '0' + day.toString();
    
    var minDate = year + '-' + month + '-' + day;
    $('#start').attr('min', minDate);   
    $('#end').attr('min', minDate);

};
//Minium date for loan request (date >= today)
function setMinLoanDate(){
    var date = $('#start').val();
    $('#end').attr('min', date);
}

//Called when Accept button in Manage Request view is clicked. Sets loan to rejected.
//Calls populateTable and sortItemTable functions to populate the table with new data without page refresh.
function reqAccept(id){
    
    const reqId = id;
    const itemId = document.querySelector(".REQ"+reqId).id;
    const parent = document.querySelector(".REQ"+reqId).parentNode;
    let alertBox = document.querySelector('#alert-box');

    $.ajax({
        type:'GET',
        url: `/accept_request/${reqId}`,
        headers: {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'},
        data: {
            'item_id': itemId
        },
        success: function(response){            
            var json = response.requests;        
            alertBox.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">
            The request has been accepted.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
        populataTable(json, "requests_table");
        parent.remove();
        sortItemsTable("requests_table");
        },
        error: function(response){
            alertBox.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            There was an error when accepting the request. Contact your administrator.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
        }

    })
    
}
//Called when Reject button in Manage Request view is clicked. Sets loan to rejected.
//Calls populateTable and sortItemTable functions to populate the table with new data without page refresh.
function reqReject(id){
    
    const reqId = id;
    const itemId = document.querySelector(".REQ"+reqId).id;
    const parent = document.querySelector(".REQ"+reqId).parentNode;
    let alertBox = document.querySelector('#alert-box');
    $.ajax({
        type:'GET',
        url: `/reject_request/${reqId}`,
        headers: {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'},
        data: {
            'item_id': itemId
        },
        success: function(response){
            var json = response.requests;    
            alertBox.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">
            The request has been rejected.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
        populataTable(json, "requests_table");
        parent.remove();
        sortItemsTable("requests_table");
        },
        error: function(response){
            var json = response.created;
            alertBox.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            There was an error when rejecting the request. Contact your administrator.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
        }

    })
   
}
//Retrieves categories from Loan item model and populates the category select element when adding new loan item.
//Also populates item select field when calling request loan function.
function getItemCategories(categoryDataBox,itemsDataBox,buttonType){    

    $.ajax({
        type: 'GET', 
        url: '/categories-json',
        success: function(response){
            
            const itemData = response.data
            itemData.map(item=>{
                const option = document.createElement('option')
                option.textContent = item[0]
                option.setAttribute('class', 'item')
                option.setAttribute('value', item[0])
                categoryDataBox.appendChild(option)
                })
        },
        error: function(error){
            console.log(error)
        }
    })

    if(buttonType == "request"){
        
        categoryDataBox.addEventListener('change', e=>{
            const selectedCat = categoryDataBox.options[categoryDataBox.selectedIndex].text
            itemsDataBox.innerHTML = ""
            alertBox = document.getElementById('alert-box');
            alertBox.innerHTML = ""
    
            $.ajax({
                type:'GET',
                url:`items-json/${selectedCat}/`,
                success: function(response){

                    const itemData = response.data    
                    const option = document.createElement('option')
                    option.textContent = "..."
                    option.setAttribute('class', 'item')
                    option.setAttribute('value', "...")
                    itemsDataBox.appendChild(option)
    
                    itemData.map(item=>{
                    const option = document.createElement('option')
                    option.textContent = item.make + " " +  item.model
                    option.setAttribute('class', 'item')
                    option.setAttribute('value', item.make + item.model)
                    option.setAttribute('id', item.id)
                    itemsDataBox.appendChild(option)
                })        
                },
                error: function(error){
                    console.log(error)
                }
            })
            
        })
    }

}
//Populates asset number field when adding new item
function populateAssetNumber(){
    alertBoxFailure = document.querySelector('#alert-box-failure');
    return new Promise(function(resolve){
        $.ajax({
            type:'GET',
            url: 'get_asset_number/',
            data: {
    
                    },
                    success: function(response){
                        resolve(response.data.toString());
                    },
                    error: function(response){
                        alertBoxFailure.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        The system could not obtain the next asset number. Please contact the administrator.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                      </div>`;
                    }
        })
    })
}
//Sorts table based on table name when table is populated with new data retrieved by an Ajax call
function sortItemsTable(tableName){
    let itmType = "";
    let type = "";
    //Check which table to sort
    if(tableName == "itemsTable"){
        itmType = "LEM";
        type = "asset-number";
        targets = [1,7];
    }
    else if(tableName == "requestsTable"){
        itmType = "REQ";
        type = "asset-number";
        targets = [1,7];
    }
    else if(tableName == "activeLoansTable"){
        itmType = "LN";
        type = "loan-numer";
        targets = [1,6];
    }

    jQuery.fn.dataTable.ext.type.order['asset-number-pre'] = function (data) {
        var match = data.match(new RegExp('^' + itmType + '(\\d+)$'));
        if (match) {
          return parseInt(match[1], 10);
        } else {
          return 0;
        }
      };
      
      var dataTable = jQuery('#'+tableName).DataTable({
        "searching": false,
        "columnDefs": [
          { "orderable": true, "targets": targets, "type": "asset-number" }
        ],
        "order": [[1, 'desc']]
      });
      var tableHeader = jQuery('#'+tableName+' th:eq(1)');
      if (tableHeader.length > 0) {
            tableHeader.click();
      }

}

//Populates table based on table name and data payload when item in table is manipulated by a button(update, accept, reject, close)
function populataTable(jsonPayload, tableName){
    let tabl = null;
    let html = "";

    if(tableName == "requests_table"){

        tabl = $("#requests_table").DataTable();
        html = "";

        for (var i = 0; i < jsonPayload.length; i++) {
            html += "<tr>";
            html += `<th scope="row">` + (i + 1) + "</th>";
            html += `<td id="`+ jsonPayload[i].req_id + `">` + jsonPayload[i].req_num + `</td>`;
            html += `<td class="REQ`+ jsonPayload[i].req_id + `" id="`+ jsonPayload[i].item_id + `">` + jsonPayload[i].make + `</td>`;
            html += "<td>" + jsonPayload[i].model + "</td>";
            html += "<td>" + jsonPayload[i].start_date + "</td>";
            html += "<td>" + jsonPayload[i].end_date + "</td>";
            html += "<td>" + jsonPayload[i].username + "</td>";
            html += `<td><a class="btn btn-success btn-accept" id="`+jsonPayload[i].req_id+`" onclick="reqAccept(this.id)">Accept</a><a class="btn btn-danger btn-reject" id="`+jsonPayload[i].req_id+`" onclick="reqReject(this.id)">Reject</a></td>`;
            html += "</tr>";
          }
          
    }
    else if(tableName == "itemsTable"){
        
        tabl = $("#itemsTable").DataTable();
        html = "";

        for (var i = 0; i < jsonPayload.length; i++) {
            html += "<tr>";
            html += `<th scope="row">` + (i + 1) + "</th>";
            html += "<td>" + jsonPayload[i].asset_number + "</td>";
            html += "<td>" + jsonPayload[i].make + "</td>";
            html += "<td>" + jsonPayload[i].model + "</td>";
            html += "<td>" + jsonPayload[i].on_loan + "</td>";
            html += "<td>" + jsonPayload[i].notes + "</td>";
            if(jsonPayload[i].user){
                html += "<td>" + jsonPayload[i].user + "</td>";
                console.log("<td>"+jsonPayload[i].user+"</td>");
            }
            else{
                html += "<td></td>";
                console.log("<td></td>");
            }
            
            html += `<td><button type="button" id="updateItemButton" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#staticBackdrop">Update</button>
            <button type="button" id="deleteItemButton" class="btn btn-danger">Delete</button></td>`;
            html += "</tr>";
          }
    }
    else if(tableName == "activeLoansTable"){

        tabl = $("#activeLoansTable").DataTable();
        html = "";

        for (var i = 0; i < jsonPayload.length; i++) {
            html += "<tr>";
            html += `<th scope="row">` + (i + 1) + "</th>";
            html += "<td>" + jsonPayload[i].loan_num + "</td>";
            html += "<td>" + jsonPayload[i].item + "</td>";
            html += "<td>" + jsonPayload[i].user + "</td>";
            html += "<td>" + jsonPayload[i].start_date + "</td>";
            html += "<td>" + jsonPayload[i].end_date + "</td>";
            html += `<td><a class="btn btn-danger" id="closeLoanBtn">Close Loan</a></td>`;
            html += "</tr>";
          }          
    }
    else{
        return;
    }
        tabl.destroy();
        $("#" + tableName + " tbody").html(html);    
}

//Global variables
let alertBoxFailure; 
let alertBox;
let asset_number_for_edit = "";  
let assetNumber_ = null;

//Execute when DOMContent is loaded
window.addEventListener('DOMContentLoaded', (event) => {
    $datePicker();  
    
    //Sorting for all tables on the website     
    sortItemsTable("itemsTable");

    $('#requests_table').DataTable({
        "searching": false,
        columnDefs: [
            { orderable: false, targets: 7 }
          ],
          order: [[1, 'asc']]
    });

    $('#myLoansTable').DataTable({
        order: [[1, 'asc']]
    });    

    $('#myClosedLoansTable').DataTable({
        order: [[1, 'asc']]
    });   

    $('#activeLoansTable').DataTable({
        "searching": false,
        order: [[1, 'asc']]
    });   
    
    $('#closedLoansTable').DataTable({
        "searching": false,
        order: [[1, 'asc']]
    });   
    
    $('#usersTable').DataTable({
        order: [[1, 'asc']]
    }); 
           
    const request_form = document.getElementById('request_form');
    /*const csrf = document.getElementById('csrfmiddlewaretoken');  
    const item_row = document.querySelectorAll('#item');    
    const accept_btn = document.querySelectorAll('.btn-accept');
    const reject_btn = document.querySelectorAll('.btn_reject');  */       
    

    //Call to various functions
    createRequest(request_form);
    populateModalWindow();
    editLoanItem();
    closeLoan();
    addLoanItem();  
    deleteItem();  
    

})   



