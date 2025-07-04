import { item_db } from '../db/db.js';
import { Validation } from '../Util/Validation.js';


let lblItemId = document.getElementById("itemId");
let txtItemName = document.getElementById("itemName");
let txtItemQty = document.getElementById("itemQty");
let txtItemPrice = document.getElementById("itemPrice");

// button for manage items
let btnSave = document.getElementById("itemSaveBtn");
let btnDelete = document.getElementById("itemDeleteBtn");
let btnUpdate = document.getElementById("itemUpdateBtn");
let btnReset = document.getElementById("itemResetBtn");

resetPage();

btnReset.addEventListener("click", function(){
    resetPage();
})

genarateNextId();
function genarateNextId(){
    let maxId = 0;

    for (let i = 0; i < item_db.length; i++) {
        let idNum = parseInt(item_db[i].item_Id.replace("I", ""));
        if (idNum > maxId) {
            maxId = idNum;
        }
    }

    let nextId = "I" + String(maxId + 1).padStart(3, "0");
    lblItemId.innerText = nextId;
}

btnSave.addEventListener('click', function(){
    saveItems();
})

function saveItems(){
    if(isValidToSave()){
        // itemobject
        let itemObj = {
            item_Id : lblItemId.innerText,
            item_Name : txtItemName.value,
            item_qty : txtItemQty.value,
            item_price : txtItemPrice.value
        }

        item_db.push(itemObj);

        resetPage();
    }
}

function isValidToSave(){
    if(Validation.isItemNameValid(txtItemName.value)){
        if(Validation.isIntegerValid(parseInt(txtItemQty.value))){
            if(Validation.isDoubleValid(txtItemPrice.value)){
                return true;
            }else{
                Swal.fire({
                    icon: "error",
                    title: "Invalid Price",
                    text: "Please enter a valid price like- 100 or 100.00.",
                });
            }
        }else{
           Swal.fire({
                icon: "error",
                title: "Invalid Quantity",
                text: "Please enter a valid number for item quantity.",
            });
        }
    }else{
        Swal.fire("Item Name is not Valid! Or Item name can't be empty");
    }
    return false;
}

btnUpdate.addEventListener('click', function(){
     let check = 0;
    for(let i = 0; i < item_db.length; i++){
        if(lblItemId.innerText == item_db[i].item_Id){
            check = 1;
        }
    }

    if(check != 0){
        updateItems();
    }else{
        Swal.fire("please select the Item you need to Update!!..");
    }
})

function updateItems(){
    // checks if it's valid
    if(isValidToSave()){


        let index;
        for(let i = 0; i < item_db.length; i++){
            if(lblItemId.innerText == item_db[i].item_Id){
                index = i;
            }
        }


        item_db[index].item_Name = txtItemName.value;
        item_db[index].item_qty = txtItemQty.value;
        item_db[index].item_price = txtItemPrice.value;

        // page refresh to default
        resetPage();
    }
}

btnDelete.addEventListener('click', function(){
    let check = 0;
    for(let i = 0; i < item_db.length; i++){
        if(lblItemId.innerText == item_db[i].item_Id){
            check = 1;
        }
    }

    if(check != 0){
        deleteItems();
    }else{
        Swal.fire("please select the Item to delete!!..");
    }
})

function deleteItems(){
    const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
    },
    buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
    title: "want to delete this sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
    reverseButtons: true
    }).then((result) => {
    if (result.isConfirmed) {
        //HERE DELETE
        deleteItemObj();
        swalWithBootstrapButtons.fire({
        title: "Deleted!",
        text: "record has been deleted.",
        icon: "success"
        });

        resetPage();

    } else if (

        result.dismiss === Swal.DismissReason.cancel
    ) {
        swalWithBootstrapButtons.fire({
        title: "Cancelled",
        text: "Your record is safe :)",
        icon: "error"
        });
    }
    });
}

function deleteItemObj(){
    let index;
    for(let i = 0; i < item_db.length; i++){
        if(lblItemId.innerText == item_db[i].item_Id){
            index = i;
        }
    }

    console.log(item_db[index]);
    item_db.splice(index,1);
}

function resetPage(){
    btnDelete.disabled = true;
    btnReset.disabled = true;
    btnUpdate.disabled = true;
    btnSave.disabled = false;
    loadTable();
    cleartext();
}


function loadTable(){
    // item table body
    let tbody = document.getElementById("itemTbody");
    tbody.innerHTML = "";
    
    for(let i = 0; i < item_db.length; i++){
        let row = document.createElement("tr");

        let cellId = document.createElement("td");
        cellId.textContent = item_db[i].item_Id;

        let cellName = document.createElement("td");
        cellName.textContent = item_db[i].item_Name;

        let cellQty = document.createElement("td");
        cellQty.textContent = item_db[i].item_qty;

        let cellPrice = document.createElement("td");
        cellPrice.textContent = item_db[i].item_price;

        row.appendChild(cellId);
        row.appendChild(cellName);
        row.appendChild(cellQty);
        row.appendChild(cellPrice);

        tbody.appendChild(row);
    }
}

function cleartext(){
    genarateNextId();

    txtItemName.value = "";
    txtItemPrice.value = "";
    txtItemQty.value = "";
}

let tbody = document.getElementById("itemTbody");
tbody.addEventListener('click', function(e){
    let row = e.target.closest('tr');
    let cell = row.children;

    for(let i = 0; i < item_db.length; i++){
        if(cell[0].innerText == item_db[i].item_Id){
            lblItemId.innerText = item_db[i].item_Id;
            txtItemName.value = item_db[i].item_Name;
            txtItemQty.value = item_db[i].item_qty;
            txtItemPrice.value = item_db[i].item_price;


            btnDelete.disabled = false;
            btnUpdate.disabled = false;
            btnReset.disabled = false;
            btnSave.disabled = true;
        }
    }
})