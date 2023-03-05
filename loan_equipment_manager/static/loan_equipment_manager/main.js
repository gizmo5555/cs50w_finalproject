
import * as Tables from './tables.js';
import * as Helpers from './helpers.js';
import * as Requests from './requests.js';
import * as Equipment from './equipment.js';
import * as Loans from './loans.js';

//Global variables
let alertBoxFailure; 
let alertBox;


//Execute when DOMContent is loaded
window.addEventListener('DOMContentLoaded', (event) => {
    console.log(location.pathname);

    if(location.pathname === "/loan_request"){

        //Reference to request form
        const request_form = document.getElementById('request_form');

        //Populates categories and items in request form
        //Adds event listener to requests form and sends data to the server when submitted
        Requests.createRequest(request_form);

        //Sets calendar for loan requests
        Helpers.$datePicker();  

        //Sets min date for date picker
        Helpers.setMinLoanDate();
    }
    
    

    

    

    //Sorts items table when page accessed     
    //Tables.sortItemsTable("itemsTable");  
    Tables.sortAllTables();  

    //Adds event listener to Update Item buttons when found
    //Populates all fields with data from current row
    Tables.populateModalWindow();   



    //Add event listeners to all Accept buttons in requests page
    //Set request as accepted on submit.
    Requests.reqAccept();

    //Add event listeners to all Reject buttons in requests page
    //Set request as rejected on submit.
    Requests.reqReject();

    //Adds event listener to Save and Update item button
    //Takes form data and submits to the server
    Equipment.editLoanItem();

    //Adds event listener to Add loan equipment button
    //Submits form data to the server
    Equipment.addLoanItem();  

    //Adds event listener to Delete item button
    //Submits a request to the server to delete item
    Equipment.deleteItem();  

    //Adds event listener to Close item buttons
    //Sends a request to the server to mark loan as closed
    Loans.closeLoan();

    

})   



