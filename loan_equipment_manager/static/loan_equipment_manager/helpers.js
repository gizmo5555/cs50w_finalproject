//Date picker for loan request
export const $datePicker = function(){
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

//Retrieves categories from Loan item model and populates the category select element when adding new loan item.
//Also populates item select field when calling request loan function.
export function getItemCategories(categoryDataBox,itemsDataBox,buttonType){    

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
            let alertBox = document.getElementById('alert-box');
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
export function populateAssetNumber(){
    let alertBoxFailure = document.querySelector('#alert-box-failure');
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

//Minium date for loan request (date >= today)
export function setMinLoanDate(){
    const start_date = document.querySelector('#start');
    
    if(start_date){
        start_date.addEventListener('change', e=>{
            var date = $('#start').val();
            console.log(date);
            $('#end').attr('min', date);
        })
    }   
}