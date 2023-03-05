import { getAssetNum} from "./equipment.js"

//Sorts all tables when domcontentloaded
export function sortAllTables(){
    $('#requests_table').DataTable({
        
        "searching": false,
        columnDefs: [
            { orderable: false, targets: [1,7] }
          ],
          order: [[1, 'asc']]
    });

    $('#itemsTable').DataTable({
        order: [1, 'asc'],
        columnDefs: [
            { targets: [1,7], orderable: false }
          ]
    });  

    $('#myLoansTable').DataTable({
        order: [[1, 'asc']]
    });    

    $('#myClosedLoansTable').DataTable({
        order: [[1, 'asc']]
    });   

    $('#activeLoansTable').DataTable({
        "searching": false,
        order: [[0, 'asc']],
        columnDefs: [
            { targets: 1, orderable: false }
          ]
    });   
    
    $('#closedLoansTable').DataTable({
        "searching": false,
        order: [[0, 'asc']],
        columnDefs: [
            { targets: 1, orderable: false }
          ]
    });   

    $('#usersTable').DataTable({
        order: [[1, 'asc']]
    }); 
}

//Sorts table based on table name when table is populated with new data retrieved by an Ajax call
export function sortItemsTable(tableName){
    let itmType = "";
    let type = "";
    let targets = null;
    //Check which table to sort
    if(tableName == "itemsTable"){
        itmType = "LEM";
        type = "asset-number";
        targets = [1,7];
    }
    else if(tableName == "requestsTable"){
        console.log("REQUESTS FOUND");
        itmType = "REQ";
        type = "asset-number";
        targets = [1,7];
    }
    else if(tableName == "activeLoansTable"){
        itmType = "LN";
        type = "loan-numer";
        targets = [1];
    }
    else if(tableName == "closedLoansTable"){
        itmType = "LN";
        type = "loan-numer";
        targets = [1];
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
 export function populataTable(jsonPayload,jsonPayload2, tableName){
    let tabl = null;
    let html = "";
    let clsdTabl = null;
    let clsdHtml = "";

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
            html += `<td><a class="btn btn-success btn-accept" id="`+jsonPayload[i].req_id+`">Accept</a><a class="btn btn-danger btn-reject" id="`+jsonPayload[i].req_id+`">Reject</a></td>`;
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
            }
            else{
                html += "<td></td>";
            }
            
            html += `<td><button type="button" id="updateItemButton" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#staticBackdrop">Update</button>
            <button type="button" id="deleteItemButton" class="btn btn-danger">Delete</button></td>`;
            html += "</tr>";
          }
    }
    else if(tableName == "activeLoansTable"){

        tabl = $("#activeLoansTable").DataTable();
        html = "";
        let tabl2 = $("#activeLoansTable");
        clsdTabl = $("#closedLoansTable").DataTable();
        clsdHtml = "";

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

          for (var i = 0; i < jsonPayload2.length; i++) {
            clsdHtml += "<tr>";
            clsdHtml += `<th scope="row">` + (i + 1) + "</th>";
            clsdHtml += "<td>" + jsonPayload2[i].loan_num + "</td>";
            clsdHtml += "<td>" + jsonPayload2[i].item + "</td>";
            clsdHtml += "<td>" + jsonPayload2[i].user + "</td>";
            clsdHtml += "<td>" + jsonPayload2[i].start_date + "</td>";
            clsdHtml += "<td>" + jsonPayload2[i].end_date + "</td>";
            clsdHtml += "</tr>";
          }
          
          clsdTabl.destroy();
          $("#closedLoansTable tbody").html(clsdHtml);
    }
    else{
        return;
    }
        tabl.destroy();        
        $("#" + tableName + " tbody").html(html);  
         
}

//Populate modal edit item window with data form current row in loan item table
export function populateModalWindow(){

    const updateButtons = $('#itemsTable').DataTable().$('button#updateItemButton');
    
    if(updateButtons){
        for(const btn of updateButtons){
            
            btn.addEventListener('click', event=>{
                let alertBoxFailure = document.getElementById('alert-box-failure');  
                alertBoxFailure.innerHTML = "";

                const assetNumField = $('input[name=asset_id]')[0];
                assetNumField.style.outline = "none";

                const row = btn.parentNode.parentNode;   
                //Get values of the row being updated             
                const assetNumber = row.querySelector('td:nth-child(2)').textContent;
                let assetNumTrimmed = assetNumber.substring(3);
                const make = row.querySelector('td:nth-child(3)').textContent;
                const model = row.querySelector('td:nth-child(4)').textContent;
                const notes = row.querySelector('td:nth-child(6)').textContent;
                //Get reference to input fields in update item form
                const assetInput = document.getElementById('asset-input');
                const makeInput = document.getElementById('make-input');
                const modelInput = document.getElementById('model-input');
                const notesInput = document.getElementById('notes-input');
                //Set update item form fields to values from current row
                assetInput.value = assetNumTrimmed;
                makeInput.value = make;
                modelInput.value = model;
                notesInput.value = notes;

                //Set equipment.js oldAssetNum and itemRow_ variables
                getAssetNum(assetNumber, row);
            })
        }
    }

}