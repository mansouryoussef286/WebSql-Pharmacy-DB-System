//OPEN the pharmacy database
//#region On load
var myDB = openDatabase("Pharmacy Database", 1.0, "pharmacy's database", "10*1024*1024");
//creating the items table if not existing
myDB.transaction(function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS Items (" +
        "itemID INTEGER PRIMARY KEY," +
        "itemName TEXT," +
        "quantity INTEGER," +
        "picture TEXT)");
});

//creating the invoices table if not existing
myDB.transaction(function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS Invoices (" +
        "invoiceID INTEGER PRIMARY KEY AUTOINCREMENT," +
        "date TIMESTAMP DEFAULT(datetime('now', 'localtime'))," +
        "customerName TEXT," +
        "type TEXT," +
        "itemID INTEGER," +
        "quantity INTEGER," +
        "FOREIGN KEY (itemID) REFERENCES Items(itemID))",
        null,
        function(tx, result) {
            // console.log(result);
        },
        function(tx, error) {
            console.log(error.message);
        });
});
//#region multiple items per invoice
// myDB.transaction(function(tx) {
//     tx.executeSql("CREATE TABLE IF NOT EXISTS Invoices (" +
//         "invoiceID INTEGER PRIMARY KEY AUTOINCREMENT," +
//         "date TIMESTAMP DEFAULT(datetime('now', 'localtime'))," +
//         "customerName TEXT," +
//         "type TEXT)",
//         null,
//         //on succes create the invoice-items table with their relations
//         function(tx, result) {
//             tx.executeSql("CREATE TABLE IF NOT EXISTS Invoices_Items (" +
//                 "invoiceID INTEGER," +
//                 "itemID INTEGER," +
//                 "quantity INTEGER," +
//                 "FOREIGN KEY (invoiceID) REFERENCES Invoices(invoiceID)," +
//                 "FOREIGN KEY (itemID) REFERENCES Items(itemID))"
//             );
//         },
//         function(tx, error) {
//             console.log(error.message);
//         });
// });
//#endregion

updateItems();
updateInvoices();
showItems();
showInvoices();
//#endregion


//ITEMS:-
//#region Adding/removing items in the database
function addItem() {
    var itemID = document.getElementById("itemID").value;
    var itemName = document.getElementById("itemName").value;
    var itemQuantity = document.getElementById("itemQuantity").value;
    var itemImg = localStorage.myimage;
    if (!itemID || !itemQuantity) {
        alert("item's ID and/or quantity is required");
        return;
    }
    myDB.transaction(function(tx) {
        tx.executeSql("select * from Items where itemID = ?;", [itemID],
            function(tx, result) {
                //check if this item exists
                if (result.rows[0]) {
                    //get the previous quantity
                    var prvQuantity;
                    var newQ;
                    tx.executeSql("select quantity from Items where itemID = ?", [itemID],
                        function(tx, result) {
                            prvQuantity = result.rows[0].quantity;
                            newQ = parseInt(prvQuantity) + parseInt(itemQuantity);
                            //update the existing item
                            tx.executeSql("update Items set itemID = ?, itemName = ?, quantity = ?, picture = ? where itemID =?", [itemID, itemName, newQ, itemImg, itemID],
                                function(tx, result) {
                                    alert("items updated successfully!");
                                },
                                function(tx, error) {
                                    console.log(error);
                                });
                        },
                        function(tx, error) {
                            console.log(error);
                        });
                } else {
                    //add the new item
                    tx.executeSql("insert into Items(itemID, itemName, quantity, picture) values(?,?,?,?)", [itemID, itemName, itemQuantity, itemImg],
                        function(tx, result) {
                            alert("items added successfully!");
                        },
                        function(error) {
                            console.log(error);
                        });
                }
            },
            function(tx, error) {
                console.log(error);
            });
    });
    updateItems();
}

// Removing items from the database
function removeItem() {
    var itemID = document.getElementById("itemID").value;
    var itemName = document.getElementById("itemName").value;
    var itemQuantity = document.getElementById("itemQuantity").value;
    var itemImg = localStorage.myimage;
    if (!itemID) {
        alert("item's ID is required");
        return;
    }
    myDB.transaction(function(tx) {
        tx.executeSql("select * from Items where itemID = ?;", [itemID],
            function(tx, result) {
                //check if this item exists
                if (result.rows[0]) {
                    //check if the user entered any quantity
                    if (!itemQuantity) {
                        //remove all item from database
                        tx.executeSql("delete from items where itemID = ?", [itemID],
                            function(tx, result) {
                                alert("item is deleted successfully!");
                            },
                            function(tx, error) {
                                console.log(error);
                            });
                    } else {
                        //if the user entered quantity and pressed remove item
                        //deduct this quantity from the item's quantity
                        tx.executeSql("select quantity from Items where itemID = ?", [itemID],
                            function(tx, result) {
                                var prvQuantity = result.rows[0].quantity;
                                //getting previous quantity and check the amount
                                if (parseInt(prvQuantity) >= parseInt(itemQuantity)) {
                                    newQ = parseInt(prvQuantity) - parseInt(itemQuantity);
                                    //update the existing item
                                    tx.executeSql("update Items set itemID = ?, itemName = ?, quantity = ?, picture = ? where itemID =?", [itemID, itemName, newQ, itemImg, itemID],
                                        function(tx, result) {
                                            alert("items updated successfully!");
                                        },
                                        function(tx, error) {
                                            console.log(error);
                                        });
                                }
                            },
                            function(tx, error) {
                                console.log(error);
                            });
                    }
                } else {
                    //item doesnot exit
                    alert("item doesn't exist!");
                }
            },
            function(tx, error) {
                console.log(error);
            });
    });
    updateItems();
}

//#region  image controls 
var video = document.getElementById("videoElement");
var canvas = document.querySelector("#showscreenshot");
var img = document.querySelector("#showscreenshotimg");
async function startCamera(e) {
    e.preventDefault();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        }, )
        video.srcObject = stream;
    }
    video.classList.toggle("hide");
}

function stop(e) {
    e.preventDefault();
    var stream = video.srcObject;
    var tracks = stream.getTracks();
    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        track.stop();
    }
    video.srcObject = null;
    video.classList.toggle("hide");

}

function takescreenshot(e) {
    e.preventDefault();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    // Other browsers will fall back to image/png
    let imgAsStr = canvas.toDataURL("image/webp");
    // console.log(imgAsStr);
    localStorage.myimage = imgAsStr;
    setTimeout(clrls, 5000);

    function clrls() {
        localStorage.myimage = "";
    }
    // img.src = canvas.toDataURL("image/webp");
    canvas.classList.toggle("hide");
}
//#endregion

//show items button
function showItems() {
    var table = document.getElementsByClassName("table-container");
    table[0].classList.toggle("hide");
}

//update items table in UI
function updateItems() {
    var itemsTableBody = document.getElementsByClassName("itemsTableBody")[0];
    myDB.transaction(function(tx) {
        tx.executeSql("select itemID, itemName, quantity, picture from items ",
            null,
            function(tx, result) {
                // console.log(result);
                let htmlCode = "";
                for (let i = 0; i < result.rows.length; i++) {
                    let currentRecord = result.rows[i];
                    //to check if the image exists
                    var imgsrc = currentRecord.picture;
                    if (!currentRecord.picture) {
                        imgsrc = "";
                    }
                    htmlCode += `
                    <tr>
                        <td>
                            ${currentRecord.itemID}
                        </td>
                        <td>
                            ${currentRecord.itemName}
                        </td>
                        <td>
                            ${currentRecord.quantity}
                        </td>
                        <td>
                            <img width="100px" src="${imgsrc}">
                        </td>
                    </tr>
                    `
                }
                itemsTableBody.innerHTML = htmlCode;
            },
            function(tx, err) {
                console.log(err);
                alert(err.message);
            })
    })
}
//#endregion


//INVOICES:-
//#region Saving Invoices
//adding new item input on click in the UI
function addAnotherItem() {
    var myInputItem = document.getElementsByClassName("itemID");
    var inputItem = myInputItem[0].cloneNode(true);
    var itemsDiv = document.getElementById("item-Invoice");
    itemsDiv.appendChild(inputItem);
    var myQuantityItem = document.getElementsByClassName("IVitemQuantity");
    var quantityItem = myQuantityItem[0].cloneNode(true);
    itemsDiv.appendChild(quantityItem);
}
//restoring the original view of the item div in the UI
function restoreItemDiv() {
    var itemsDiv = document.getElementById("item-Invoice");
    itemsDiv.innerHTML = `<input class="itemID" type="number" placeholder="item ID">
        <input id="addItemsBtn" type="button" value="Add Items" onclick="addAnotherItem()">
        <input class="IVitemQuantity" type="number" placeholder="item quantity">`;
    var customerName = document.getElementById("customerName");
    customerName.value = "";
}

//show invoices button
function showInvoices() {
    document.getElementsByClassName("table-container")[1].classList.toggle("hide");
}

//update invoices table in UI
function updateInvoices() {
    var itemsTableBody = document.getElementsByClassName("itemsTableBody")[1];
    myDB.transaction(function(tx) {
        tx.executeSql("select invoiceID, date, customerName, type, itemID, quantity from Invoices;",
            null,
            function(tx, result) {
                // console.log(result);
                let htmlCode = "";
                for (let i = 0; i < result.rows.length; i++) {
                    let currentRecord = result.rows[i];
                    htmlCode += `
                    <tr>
                        <td>
                            ${currentRecord.invoiceID}
                        </td>
                        <td>
                            ${currentRecord.date}
                        </td>
                        <td>
                            ${currentRecord.customerName}
                        </td>
                        <td>
                            ${currentRecord.type}
                        </td>
                        <td>
                            ${currentRecord.itemID}
                        </td>
                        <td>
                            ${currentRecord.quantity}
                        </td>
                        
                    </tr>
                    `
                }
                itemsTableBody.innerHTML = htmlCode;
            },
            function(tx, err) {
                console.log(err);
                alert(err.message);
            })
    })
}

//saving the invoice according to the invoice type
function saveInvoice() {
    var typeofInvoice = document.getElementById("buy");
    //check if its buy or sell
    if (typeofInvoice.checked) {
        //buy
        buyInvoice();
    } else {
        //sell
        sellInvoice();
    }
    updateInvoices();
}

function buyInvoice() {
    var itemID = document.getElementById("IVitemID").value;
    var itemQuantity = document.getElementById("IVitemQuantity").value;
    var customerName = document.getElementById("customerName").value;
    //adding the invoice in the database
    if (!itemID || !itemQuantity || !customerName) {
        alert("ID, Quantity and customer name are needed!");
    } else {
        myDB.transaction(function(tx) {
            tx.executeSql("INSERT INTO Invoices(customerName, type, itemID, quantity) values(?,?,?,?)", [customerName, "buy", itemID, itemQuantity],
                //on success: checking in the items table if the item exists or not
                function(tx, result) {
                    tx.executeSql("select quantity from Items where itemID = ?", [itemID],
                        function(tx, result) {
                            //if the item exists increase its quantity
                            if (result.rows[0]) {
                                var newQ = parseInt(result.rows[0].quantity) + parseInt(itemQuantity);
                                tx.executeSql("UPDATE Items set quantity = ? where itemID = ?", [newQ, itemID]);
                            } else { //if not then add this item in the database
                                tx.executeSql("insert into Items(itemID, itemName, quantity) values(?,?,?)", [itemID, "no name added", itemQuantity]);
                            }
                        },
                        function(tx, err) {
                            console.log(err.message);
                        })
                },
                function(tx, err) {
                    console.log(err.message);
                });
        });
        updateItems();
        updateInvoices();
    }
}

function sellInvoice() {
    var itemID = document.getElementById("IVitemID").value;
    var itemQuantity = document.getElementById("IVitemQuantity").value;
    var customerName = document.getElementById("customerName").value;
    if (!itemID || !itemQuantity || !customerName) {
        alert("ID, Quantity and customer name are needed!");
    } else {
        //check if the item quantity is available
        myDB.transaction(function(tx) {
            tx.executeSql("select quantity from Items where itemID = ?", [itemID],
                function(tx, result) {
                    //on success check if the quantity is available
                    if (result.rows[0]) {
                        if (result.rows[0].quantity >= itemQuantity) {
                            newQ = result.rows[0].quantity - itemQuantity;
                            // if item is available: save the invoice
                            tx.executeSql("INSERT INTO Invoices(customerName, type, itemID, quantity) values(?,?,?,?)", [customerName, "sell", itemID, itemQuantity],
                                function(tx, result) {
                                    // on success deduct the quantity from the items
                                    tx.executeSql("update Items set quantity = ? where itemID = ?", [newQ, itemID],
                                        function(tx, result) {
                                            console.log("finally");

                                        },
                                        function(tx, err) {
                                            console.log(err);
                                        })
                                },
                                function(tx, err) {
                                    console.log(err);
                                })
                        } else {
                            alert("this item isn't available, there are only \"" + result.rows[0].quantity + "\" items");
                        }
                    } else {
                        alert("this item doesn't exist!");
                    }
                },
                function(tx, err) {
                    console.log(err);
                })
        });
        updateInvoices();
        updateItems();
    }
}





//#region buy invoice with multiple items
// function buyInvoicee() {
//     var itemIDArray = document.getElementsByClassName("itemID");
//     var itemQuantityArray = document.getElementsByClassName("IVitemQuantity");
//     var customerName = document.getElementById("customerName").value;
//     //adding the invoice in the database
//     myDB.transaction(function(tx) {
//         tx.executeSql("INSERT INTO Invoices(customerName, type) values(?,?)", [customerName, "buy"],
//             //on success: adding items each in the invoice-items table
//             function(tx, result) {
//                 //getting the invoice id to use as a foreign key
//                 var IVid;
//                 tx.executeSql("select max(invoiceID) as max FROM Invoices",
//                     null,
//                     //on success: iterating and entiring the bought items in the table 
//                     function(tx, result) {
//                         IVid = result.rows[0].max;
//                         for (var i = 0; i < itemIDArray.length; i++) {
//                             var itemQuantity = itemQuantityArray[i].value;
//                             var itemID = itemIDArray[i].value;
//                             tx.executeSql("INSERT INTO Invoices_Items(invoiceID,itemID,quantity)" +
//                                 "values(?,?,?)", [IVid, itemID, itemQuantity],
//                                 //on success check either adding this item to the items table
//                                 //or update the item if it already exist
//                                 function(tx, result) {
//                                     tx.executeSql("select quantity from Items where itemID = ?", [itemID],
//                                         //if there is already an item
//                                         function(tx, result) {
//                                             if (result.rows[0]) {
//                                                 //update the existing item
//                                                 tx.executeSql("UPDATE Items " +
//                                                     "SET quantity =(select quantity from Items where itemID = ?) + ?" +
//                                                     "WHERE itemID = ?", [itemID, itemQuantity, itemID])
//                                             } else {
//                                                 //insert the new item
//                                                 tx.executeSql("INSERT INTO Items(itemID, itemName, quantity)" +
//                                                     "values(?,?,?) ", [itemID, "no name", itemQuantity])
//                                             }
//                                         },
//                                         function(tx, err) {
//                                             console.log(err);
//                                         }
//                                     )
//                                 },
//                                 function(tx, error) {
//                                     console.log(error);
//                                 }
//                             );
//                         }
//                         restoreItemDiv();
//                     });
//             },
//             function(tx, error) {
//                 console.log(error.message);
//             });
//     });
// }
//#endregion
// check items in the stock
/**function checkItems() {
 * 
    var itemIDArray = document.getElementsByClassName("itemID");
    var itemQuantityArray = document.getElementsByClassName("IVitemQuantity");
    var customerName = document.getElementById("customerName").value;
    //check on the availablity of the items in the database
    for (var i = 0; i < itemIDArray.length; i++) {
        var IDD = itemIDArray[i].value;
        var qqq = itemQuantityArray[i].value;
        //IIFE to avoid closure problem
        (function(i, IDD, qqq) {
            myDB.transaction(function(tx) {
                //check if the items' quantity is enough
                tx.executeSql("SELECT * FROM Items Where itemID = ?;", [IDD],
                    function(tx, result) {
                        //check if the item exists
                        if (result.rows[0]) {
                            console.log(result.rows[0].quantity);
                            if (qqq <= result.rows[0].quantity) {
                                //if there are enough items more than the quantity return tru
                                alert(`item no.:${i+1} is available`);
                            } else {
                                //not enough quantity in the store
                                alert(`item no.:${i+1} isn't enough`);
                            }
                        } else {
                            alert(`item no.:${i+1} doesnot exist`);
                        }
                    },
                    function(tx, err) {
                        console.log(err.message);
                    });
            })
        })(i, IDD, qqq)
    }
}
 */
/* check item quantity async

// async function checkItemQuantity(itemID, itemQuantity) {
//     var retVal = false;
//     await

//     function() {
//         return new Promise((resolve, reject) => {
//             //here our function should be implemented 
//             myDB.transaction(function(tx) {
//                     tx.executeSql("SELECT * FROM Items Where itemID = ?", [itemID],
//                         function(tx, result) {
//                             //check if the item exists
//                             if (result.rows[0]) {
//                                 console.log(result.rows[0].quantity);
//                                 if (itemQuantity < result.rows[0].quantity) {
//                                     //if there are enough items more than the quantity return tru
//                                     console.log("items available");
//                                     retVal = true;
//                                 } else {
//                                     console.log("items not enough");
//                                 }
//                             } else {
//                                 console.log("item doesnot exist");
//                             }
//                         },
//                         function(tx, err) {
//                             console.log(err.message);
//                         });
//                 }),
//                 function(tx, err) {
//                     console.log(err);
//                 }
//             resolve(retVal);
//         });
//     }

//     return retVal;
// }
// console.log(checkItemQuantity(1001, 150));
// console.log("*********");
*/
//#endregion