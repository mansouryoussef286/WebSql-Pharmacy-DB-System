//to open the pharmacy database
var myDB = openDatabase("Pharmacy Database", 1.0, "pharmacy's database", "10*1024*1024");

//#region Adding a user to the database
function addUser() {
    var userName = document.getElementById("userName").value;
    var userPassword = document.getElementById("userPw").value;
    myDB.transaction(function(tx) {
        tx.executeSql("select userName, password from Users_table where userName = ?;", [userName],
            function(tx, result) {
                //check if this username exists
                if (result.rows[0]) {
                    alert("this username already exists!");
                } else {
                    //insert the new username and password
                    tx.executeSql("insert into Users_table(userName, password) values(?,?)", [userName, md5(userPassword)],
                        function(tx, result) {
                            alert("user added successfully! \nusername: " + userName + ",password: " + userPassword);
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
}
//#endregion

//#region Removing a user from the database
function removeUser() {
    var userName = document.getElementById("userName").value;
    var userPassword = document.getElementById("userPw").value;
    myDB.transaction(function(tx) {
        tx.executeSql("select userName, password from Users_table where userName = ?;", [userName],
            function(tx, result) {
                //check if this username exists
                if (result.rows[0]) {
                    tx.executeSql("delete from Users_table where userName = ? and password = ?", [userName, md5(userPassword)],
                        function(tx, result) {
                            alert("user has been removed successfully! \nusername: " + userName + ",password: " + userPassword);
                        },
                        function(error) {
                            console.log(error);
                        });
                } else {
                    //insert the new username and password
                    alert("this username doesn't exist");
                }
            },
            function(tx, error) {
                console.log(error);
            });
    });
}
//#endregion