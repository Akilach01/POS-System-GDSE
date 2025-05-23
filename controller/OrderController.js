import{order_db}from '../db/db.js';
import{customer_db}from '../db/db.js';
import{item_db}from '../db/db.js';
import{orderDetails_db}from '../db/db.js';
import OrderDetailsModel from '../model/orderDetailsModel.js';
import itemSoldModel from '../model/itemSoldmodel.js';
import { Validation } from '../Util/Validation.js';
import OrderModel from '../model/OrderModel.js';

// order table
let tbody = $("#orderTBody");


let btnSave = $("#orderSave");
let btnUpdate = $("#orderUpdate");
let btnDelete = $("#orderDelete");
let btnReset = $("#orderReset");

//item and customer selection
let comboItem = $("#ItemIdSelector");
let comboCustomer = $("#CustomerSelector");

let lblOrderId = $("#lblOrderId");


//sold items
let itemSold = [];

//full
let FullAmount = 0;

btnReset.on('click', function(){
    pageReset();
})

pageReset();
function pageReset(){
    //hide details
    $('#custDetails').css('display','none');
    $('#itemDetails').css('display','none');

    //disable some buttons
    btnSave.prop("disabled", false);
    btnDelete.prop("disabled", true);
    btnReset.prop("disabled", true);
    btnUpdate.prop("disabled", true);

    $("#txtQty").prop('disabled',true);


    genarateNewOrderId();

    disableBalance();
    disableDiscount();
    loadTable();


    //clear selections
    comboCustomer.val("Choose");
    comboItem.val("Choose");
    $("#txtQty").val("");
}

function disableBalance(){
    $("#txtBalance").prop( "disabled", true);
}

function disableDiscount(){
    $("#txtDiscount").prop( "disabled", true);
}

function loadCustomerIdsToDropDown(){
    comboCustomer.html("<option selected>Choose</option>");
    for(let i = 0; i < customer_db.length; i++){
        comboCustomer.append("<option>"+ customer_db[i].custId +"</option>");
    }
}

function loadItemIdsToDropDown(){
    comboItem.html("<option selected>Choose</option>");
    for(let i = 0; i < item_db.length; i++){
        comboItem.append("<option>"+ item_db[i].item_Id +"</option>");
    }
}

$("#Orders").on("mouseenter", async function(){
   //load items and cust
    loadCustomerIdsToDropDown();
    loadItemIdsToDropDown();
})

comboCustomer.on("click", function(){
    if(customer_db.length == 0){
        Swal.fire("There is no Customers yet..\n  Save new Customer Before Placing Orders!");
    }else{
        let selectedCustomer = comboCustomer.val();


        let index;
        let check = false;
        for(let i = 0; i < customer_db.length; i++){
            if(selectedCustomer == customer_db[i].custId){
                index = i;
                check = true;
            }
        }


        if(check){

            $("#cName").html(customer_db[index].custFname + " " + customer_db[index].cuatLname);
            $("#cAddress").html(customer_db[index].custAddress);


            $('#custDetails').css('display','block');
        }else{
            //details dissapper if choose is selected
            $('#custDetails').css('display','none');
        }
    }
})

let itemIndex;
comboItem.on('click', function(e){
    if(item_db.length == 0){
        Swal.fire("There are no Items..\n  Save new Item Before Placing Orders!");
    }else{
        let selectedItem = comboItem.val();


        let index ;
        let check = false;
        for(let i = 0; i < item_db.length; i++){
            if(selectedItem == item_db[i].item_Id){
                index = i;
                check = true;
            }
        }

        if(check){

            $("#iName").html(item_db[index].item_Name);
            $("#iQty").html(item_db[index].item_qty);
            $("#iprice").html(item_db[index].item_price);

            itemIndex = index;

            //show details
            $('#itemDetails').css('display','block');
            $("#txtQty").prop('disabled',false);
        }else{

            $('#itemDetails').css('display','none');
            $("#txtQty").prop('disabled',true);
        }
    }
})


$("#txtQty").on("keyup", function () {
    // Get input value and convert to number
    const itemsBuy = parseFloat($("#txtQty").val()) || 0;


    if (!item_db || !item_db[itemIndex]) {
        Swal.fire("Error", "Item data not found!", "error");
        $("#Total").html("INVALID");
        return;
    }

    const itemPrice = item_db[itemIndex].item_price;
    const qtyOnHand = item_db[itemIndex].item_qty;

    // validate inputs
    if (isNaN(itemsBuy) || itemsBuy < 0) {
        Swal.fire("Invalid Input", "Please enter a quantity!", "warning");
        $("#txtQty").val(""); // Clear invalid input
        $("#Total").html("Rs 0");
        return;
    }

    if (itemsBuy === 0) {
        Swal.fire("Invalid Quantity", " items can't be empty!", "warning");
        $("#txtQty").val(""); // Clear invalid input
        $("#Total").html("Rs 0");
        return;
    }

    if (itemsBuy > qtyOnHand) {
        Swal.fire("Out of Stock", "Not enough stocks to fulfill your request!", "warning");
        $("#txtQty").val(""); // Clear invalid input
        $("#Total").html("Rs 0");
        return;
    }

    // Calculate and display total
    const total = (itemPrice * itemsBuy).toFixed(2); // Round to 2 decimal places
    $("#Total").html(`Rs ${total}`);
});

genarateNewOrderId();
function genarateNewOrderId(){
    let maxId = 0;

    for (let i = 0; i < order_db.length; i++) {
        let idNum = parseInt(order_db[i].orderId.replace("O", ""));
        if (idNum > maxId) {
            maxId = idNum;
        }
    }

    let nextId = "O" + String(maxId + 1).padStart(3, "0");
    $("#lblOrderId").text(nextId);
}



$("#addToCart").on("click", function(){
    let lblId = lblOrderId.text();
    let Buyingqty = parseFloat($("#txtQty").val());
    let itemId = comboItem.val();

    //check if nempty
    if (!$("#txtQty").val() || isNaN(Buyingqty)) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid Data',
            text: 'Null or missing value detected in Qty',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
        });
        return;
    }


    let itemIndex = item_db.findIndex(item => item.item_Id === itemId);
    if (itemIndex === -1) {
        Swal.fire("Item Not Found", "Selected item doesn't exist!", "error");
        return;
    }


    //check item id and order id
    let isUpdated = false;
    for(let i = 0; i < orderDetails_db.length; i++){
        if(lblId == orderDetails_db[i].orderId){
            if(itemId == orderDetails_db[i].itemId){

                let bought = parseFloat(orderDetails_db[i].qty);
                let total = bought + Buyingqty;

                if(total <= parseFloat(item_db[itemIndex].item_qty)){
                    //UPDATE
                    orderDetails_db[i].qty = total;
                    
                    isUpdated = true;
                    loadTable();
                    loadFullAmount();
                }else{
                    Swal.fire("Invalid Quantity", "not Enough qty!", "warning");
                }
                return;
            }
        }
    }


    if(!isUpdated){
        let orderdetails = new OrderDetailsModel(lblId, itemId, Buyingqty);
        orderDetails_db.push(orderdetails);

        loadTable();
        loadFullAmount();
    }
})


function loadFullAmount(){
    FullAmount = 0;
    // CALCULATE THE TOTAL
    for(let i = 0; i < orderDetails_db.length; i++){
       if($("#lblOrderId").html() == orderDetails_db[i].orderId){
            for(let j = 0; j < item_db.length; j++){
                if(orderDetails_db[i].itemId == item_db[j].item_Id){
                    let tot = orderDetails_db[i].qty * item_db[j].item_price;
                    FullAmount += tot;
                }
            }
       }
    }

    $("#FullAmount").html("Rs " + FullAmount + "/=")
}

function loadTable(){
    let table = $("#orderTBody");
    table.empty();

    for(let i =0; i < orderDetails_db.length; i++){
        if($("#lblOrderId").html() == orderDetails_db[i].orderId){

            let row = document.createElement('tr');

            // Create table cells
            const orderIdCell = document.createElement('td');
            orderIdCell.textContent = orderDetails_db[i].orderId || ''; // Fallback for undefined
            row.appendChild(orderIdCell);

            const itemIdCell = document.createElement('td');
            itemIdCell.textContent = orderDetails_db[i].itemId || '';
            row.appendChild(itemIdCell);

            const qtyCell = document.createElement('td');
            qtyCell.textContent = orderDetails_db[i].qty || '';
            row.appendChild(qtyCell);

            // Create Remove button
            const buttonCell = document.createElement('td');
            const removeButton = document.createElement('button');
            removeButton.className = 'btn-danger p-1';
            removeButton.textContent = 'Remove';
            removeButton.dataset.orderId = orderDetails_db[i].orderId; // Unique identifier for the row
            removeButton.addEventListener('click', () => {

                Swal.fire({
                    title: 'Are you sure?',
                    text: "Do you want to delete this item?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete it!',
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed) {
                        
                        //delete
                        orderDetails_db.splice(i,1);
                        row.remove(); // Remove row from DOM
                        loadFullAmount();

                        Swal.fire(
                            'Deleted!',
                            'The item has been deleted.',
                            'success'
                        );
                    }
                });

            });
            buttonCell.appendChild(removeButton);
            row.appendChild(buttonCell);

            // Append row to table
            tbody.append(row);
        }
    }
}


//place order
$("#PlaceOrder").on('click', function(){
    // CHECK If COMBO CUSTOMER IS != CHOOSE
    if(FullAmount != 0){
        if(comboCustomer.val() != 'Choose'){
            if(FullAmount <= $("#txtCash").val()){
                placeOrderNow();
            }
        }else{
            Swal.fire({
                icon: 'warning',
                title: 'Customer Not Selected',
                text: 'Please select a customer before adding to cart.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
        }
    }else{
        Swal.fire({
            icon: 'warning',
            title: 'No Items Added',
            text: 'Please add at least one item to the cart before placing the order.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
        });
    }
})


function placeOrderNow(){
    let orderId = $("#lblOrderId").text();
    let customerId = comboCustomer.val();
    let date = new Date();
    let orderDetails = [];


    for(let i = 0; i < orderDetails_db.length; i++){
        if(orderDetails_db[i].orderId == orderId){

            //calculate ne item quantity
            let itemid = orderDetails_db[i].itemId;
            for(let j = 0; j < item_db.length; j++){
                if(item_db[j].item_Id == itemid){
                    item_db[j].item_qty -= orderDetails_db[i].qty;
                }
            }

            orderDetails.push(orderDetails_db[i]);
        }
    }

    let order = new OrderModel(orderId, customerId, orderDetails, date);
    order_db.push(order);
    // console.log(order);

    let balance = $("#txtCash").val() - FullAmount;
    $("#txtBalance").val(balance);
    $("#txtDiscount").val("0%");

    //order placed action
    Swal.fire({
    icon: 'success',
    title: 'Order Placed!',
    text: 'Your order has been successfully placed.',
    confirmButtonColor: '#3085d6',
    confirmButtonText: 'OK'
    });

    pageReset();
}


$("#CancelOrder").on('click', function(){
    //removes all data related to order
    removeOrderdeialItems();
    pageReset();
})


function removeOrderdeialItems(){
    let orderId = $("#lblOrderId").text();
    for(let i = 0; i < orderDetails_db.length; i++){
        if(orderDetails_db[i].orderId == orderId){
            orderDetails_db.splice(i, 1);
        }
    }

    $("#txtCash").val("");
    $("#txtBalance").val("");
    $("#txtDiscount").val("");
    $("#Total").html("Rs 0.00/=");
}


console.log("pos system works fine ")