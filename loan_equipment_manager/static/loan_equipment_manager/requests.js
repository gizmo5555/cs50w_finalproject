import * as Helpers from './helpers.js';
import * as TableFunctions from './tables.js';

//Create new request
export function createRequest(request_form){   
    if(request_form){   
        
        //Reference variables 
        let itemsDataBox = document.getElementById('itemselection');
        let categoryDataBox = document.getElementById('category');
        const startDate = document.getElementById('start');
        const endDate = document.getElementById('end');
        
        let selectedItem = "";  
        let startDateSelected = "";
        let endDateSelected = "";

        let alertBox = document.querySelector('#alert-box');        

        startDate.addEventListener('change', e=>{
            startDateSelected = startDate.value
            
        })

        endDate.addEventListener('change', e=>{
            endDateSelected = endDate.value
        })   

        Helpers.getItemCategories(categoryDataBox,itemsDataBox, "request");

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

//Called when Reject button in Manage Request view is clicked. Sets loan to rejected.
//Calls populateTable and sortItemTable functions to populate the table with new data without page refresh.
export function reqReject(){

    const table = document.querySelector('#requests_table tbody');
    if(table){
        table.addEventListener('click', e=>{
            e.preventDefault();
            if(e.target.classList.contains('btn-reject')){
                const reqId = e.target.id;
                const parent = e.target.parentNode.parentNode;
                let alertBox = document.querySelector('#alert-box');
                console.log("PARENT" , parent);

                $.ajax({
                    type:'GET',
                    url: `/reject_request/${reqId}`,
                    headers: {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'},
                    data: {
                        'item_id': reqId
                    },
                    success: function(response){
                        var json = response.requests;    
                        alertBox.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">
                        The request has been rejected.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;
                    TableFunctions.populataTable(json, null, "requests_table");
                    parent.remove();
                    TableFunctions.sortItemsTable("requests_table");
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
        })
    }
}

//Called when Accept button in Manage Request view is clicked. Sets loan to rejected.
//Calls populateTable and sortItemTable functions to populate the table with new data without page refresh.
export function reqAccept(){

    const table = document.querySelector('#requests_table tbody');
    if(table){
        table.addEventListener('click', e=>{
            e.preventDefault();
            if(e.target.classList.contains('btn-accept')){
                const reqId = e.target.id;
                const parent = e.target.parentNode.parentNode;
                let alertBox = document.querySelector('#alert-box');
                console.log("PARENT" , parent);
                
                $.ajax({
                    type:'GET',
                    url: `/accept_request/${reqId}`,
                    headers: {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'},
                    data: {
                        'item_id': reqId
                    },
                    success: function(response){            
                        var json = response.requests;        
                        alertBox.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">
                        The request has been accepted.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;
                    TableFunctions.populataTable(json,null, "requests_table");
                    parent.remove();
                    TableFunctions.sortItemsTable("requests_table");
                    },
                    error: function(response){
                        alertBox.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        There was an error when accepting the request. Contact your administrator.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;
                    }
            
                })
            }
        })

    }

}
