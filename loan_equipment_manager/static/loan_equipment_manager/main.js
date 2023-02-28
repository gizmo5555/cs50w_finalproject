window.addEventListener('DOMContentLoaded', (event) => {
    $datePicker();
    

    $('#itemsTable').DataTable({
        "searching": false,
        columnDefs: [
            { orderable: false, targets: [1,7] }
          ],
        order: [[0, 'asc']]
    });

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



    populateModalWindow();
    editLoanItem();
    closeLoan();
    addLoanItem();

    const alertBox = document.getElementById('alert-box');    
    const request_form = document.getElementById('request_form');
    const csrf = document.getElementById('csrfmiddlewaretoken');  
    const startDate = document.getElementById('start');
    const endDate = document.getElementById('end');
    const item_row = document.querySelectorAll('#item');    
    const accept_btn = document.querySelectorAll('.btn-accept');
    const reject_btn = document.querySelectorAll('.btn_reject');
    let asset_number_for_edit = "";

    var startDateSelected = ""
    var endDateSelected = ""
    var selectedItem = ""       
    var categoryDataBox = document.getElementById('category')
    var itemsDataBox = document.getElementById('itemselection')
    
    //Variables to store column values of item being edited in Manage Equipent table
    let assetNumber_ = null
    let make_ = null
    let model_ = null
    let notes_ = null
  
    jQuery(document).ready(function($) {
        $(".clickable-row").click(function() {
            window.location = $(this).data("href");
        });
    });

    item_row.forEach(row => {
        var innerTxt = row.innerHTML
        var [first, ...rest] = innerTxt.split("</th>");
        var thdata = first.replaceAll(' ','')
        var itemId = thdata.replace('<thscope="row">','')
        


        /*row.addEventListener('click', e=>{
            var url = `manage_item/${itemId}/`
            window.location = $(this).data(`href/${itemId}`);
            $.ajax({
                type:'GET',
                url:`manage_item/${itemId}/`,

                    success: function(response){
                        console.log(response)
                    },
                    error: function(response){

                    }
            })
        })*/
        innerTxt = ""
    })


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

    categoryDataBox.addEventListener('change', e=>{
        console.log(categoryDataBox.options[categoryDataBox.selectedIndex].text)
        const selectedCat = categoryDataBox.options[categoryDataBox.selectedIndex].text
        itemsDataBox.innerHTML = ""
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

    itemsDataBox.addEventListener('change', e=>{
        selectedItem = itemsDataBox.options[itemsDataBox.selectedIndex].id
        alertBox.innerHTML = ""
    })

    startDate.addEventListener('change', e=>{
        startDateSelected = startDate.value
        
    })

    endDate.addEventListener('change', e=>{
        endDateSelected = endDate.value
    })   
    
    /*//Request form ajax call to create_loan/ view
    request_form.addEventListener('submit', e=>{
        e.preventDefault()
        const token = $("#request_form").find('input[name=csrfmiddlewaretoken]').val()
        $.ajax({
            type:'POST',
            url: 'create_loan/',
            data: {
                "csrfmiddlewaretoken" : token,
                'item_id': selectedItem,
                'start_date':startDateSelected,
                'end_date':endDateSelected
            },
            success: function(response){
                console.log(response)
                alertBox.innerHTML = `<div class="alert alert-success" role="alert">
                Your request has been created!
            </div>`
            },
            error: function(response){
                alertBox.innerHTML = `<div class="alert alert-danger" role="alert">
                There was a problem when creating your request. Please try again.
            </div>`
            }

        })
    })*/

    //Request form ajax call to create_loan/ view
    request_form.addEventListener('submit', e=>{
        e.preventDefault()
        const token = $("#request_form").find('input[name=csrfmiddlewaretoken]').val()
        const selectedCat = categoryDataBox.options[categoryDataBox.selectedIndex].text
        
        if(selectedItem == "" || selectedCat == ""){
            alertBox.innerHTML = `<div class="alert alert-warning" role="alert">
                Please select an item and category before submitting the request.
            </div>`
            return;
        }
        else if (startDateSelected == "" || endDateSelected == ""){
            alertBox.innerHTML = `<div class="alert alert-warning" role="alert">
                Please select a start and end date before submitting the request.
            </div>`
            return;
        }        
        
        $.ajax({
            type:'POST',
            url: 'create_request/',
            data: {
                "csrfmiddlewaretoken" : token,
                'item_id': selectedItem,
                'start_date':startDateSelected,
                'end_date':endDateSelected
            },
            success: function(response){
                if(response.created == "requested"){
                    alertBox.innerHTML = `<div class="alert alert-warning" role="alert">
                    This item has already been requested. Refresh your page
                </div>`
                return false;
                }
                alertBox.innerHTML = `<div class="alert alert-success" role="alert">
                Your request has been created!
            </div>`
            $("#request_form")[0].reset();
            },
            error: function(response){
                alertBox.innerHTML = `<div class="alert alert-danger" role="alert">
                There was a problem when creating your request. Please try again.
            </div>`
            $("#request_form")[0].reset();
            }

        })
    })

})   

//Populate modal edit item window with data form current row in loan item table
function populateModalWindow(){
    let updateButtons = document.querySelectorAll('#updateItemButton');
    if(updateButtons){
        for(const btn of updateButtons){
            btn.addEventListener('click', event=>{
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

                console.log(assetNumber_, make_, model_, notes_);     

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

//Edits selected item from equipment list by calling a view with ajax. 
function editLoanItem(){
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
            const alertBoxFailure = document.getElementById('alert-box-failure');  

            //Call edit_item view and pass input field values as data
            $.ajax({
                type:'POST',
                url: 'edit_item/',
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
                    alertBox.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    There was an error when editing this item. Please contact your administrator.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>`;
                }
    
            })
        })
    }
}

//Adds a new loan item to the database 
function addLoanItem(){
    const btn = document.querySelector('#addNewItem')
    btn.addEventListener('click', e=>{
        $.ajax({
            type:'POST',
            url: 'create_loan_item/',
            data: {"csrfmiddlewaretoken" : token}
        })
    })
}


//Closes active loans
function closeLoan(){
    const closeBtn = document.querySelectorAll('#closeLoanBtn');
    if(closeBtn){
        for(const btn of closeBtn){        
            btn.addEventListener('click', e=>{
                const row = btn.parentNode.parentNode;
                const loanNumber = row.querySelector('td:nth-child(2)').textContent;
                const token = $("#nav-tabContent").find('input[name=csrfmiddlewaretoken]').val()
                

                //Call close_loan view and pass loan nubmer as data
                $.ajax({
                    type:'POST',
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
                            row.remove();
                        }
                    },
                    error: function(response){
                        alertBox.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        Error when closing loan. Check logs
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;
                    }
        
                })
            })
        }
    }
}

const alertBox = document.getElementById('alert-box')  

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

function setMinLoanDate(){
    var date = $('#start').val();
    $('#end').attr('min', date);
}

function reqAccept(id){
    
    const reqId = id;
    const itemId = document.querySelector(".REQ"+reqId).id;
    const parent = document.querySelector(".REQ"+reqId).parentNode;

    $.ajax({
        type:'GET',
        url: `/accept_request/${reqId}`,
        headers: {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'},
        data: {
            'item_id': itemId
        },
        success: function(response){

            var json = response;            
            alertBox.innerHTML = `<div class="alert alert-success" role="alert">
            The request has been accepted.
        </div>`
        parent.remove();
        },
        error: function(response){
            var json = response.created;
            alertBox.innerHTML = `<div class="alert alert-danger" role="alert">
            There was a problem when creating your request. Please try again.
        </div>`
        }

    })
    
}

function reqReject(id){
    
    const reqId = id;
    const itemId = document.querySelector(".REQ"+reqId).id;
    const parent = document.querySelector(".REQ"+reqId).parentNode;
    $.ajax({
        type:'GET',
        url: `/reject_request/${reqId}`,
        headers: {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'},
        data: {
            'item_id': itemId
        },
        success: function(response){
            var json = response;            
            alertBox.innerHTML = `<div class="alert alert-info" role="alert">
            The request has been rejected.
        </div>`
        parent.remove();
        },
        error: function(response){
            var json = response.created;
            alertBox.innerHTML = `<div class="alert alert-danger" role="alert">
            There was a problem when creating your request. Please try again.
        </div>`
        }

    })
   
}

/*$(function(){
    $(".btn-accept").bind('click', function(e){
      
    })
})*/