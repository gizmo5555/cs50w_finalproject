import * as TableFunctions from './tables.js';
//Closes active loans and populates.
//Sorts table with new data by calling populataTable() and sortItemsTable();
export function closeLoan(){
    const table = document.querySelector('#activeLoansTable tbody');
    if(table){
        let alertBox = document.querySelector('#alert-box');
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
                            var json2 = response.closedLoans; 
                            TableFunctions.populataTable(json, json2, "activeLoansTable");
                            TableFunctions.sortItemsTable("activeLoansTable");
                            //TableFunctions.sortItemsTable("closedLoansTable");
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