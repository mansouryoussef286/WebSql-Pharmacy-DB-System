//#region Adding the admin user info and creating the database

// On loading of the system login page
// creating the websql database for the system
var myDB = openDatabase("Pharmacy Database", 1.0, "pharmacy's database", "10*1024*1024");
myDB.transaction(function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS Users_table (userName unique, password)");
});

// adding the admin info
myDB.transaction(function(tx) {
    tx.executeSql("insert into Users_table(userName, password) values(?,?)", ["systemAdmin", md5("admin1234")]);
});
//#endregion

//#region Verifying the loging user
function login() {
    var userName = document.getElementById("userName").value;
    var userPassword = document.getElementById("userPw").value;
    //selecting a user from database for this username
    myDB.transaction(function(tx) {
        tx.executeSql("select userName, password from Users_table where userName = ?;", [userName],
            function(tx, result) {
                //check if this username exists
                if (result.rows[0]) {
                    //check if the pw matches its pw in the DB
                    if (md5(userPassword) == result.rows[0].password) {
                        alert("logged in");
                        if (userName === "systemAdmin") {
                            //open admin page
                            location.assign("../Html/adminHomePage.html");
                        } else {
                            //open users page
                            location.assign("../Html/usersHomePage.html");
                        }
                    } else {
                        alert("invalid password");
                    }
                } else {
                    alert("invalid username");
                }
            },
            function(tx, error) {
                console.log(error);
            });
    });

}

//#endregion