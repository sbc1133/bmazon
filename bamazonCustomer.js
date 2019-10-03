const mysql = require("mysql")
const inquirer = require("inquirer")

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3306
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "password",
  database: "bmazon"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  var currentChoices;
  var qty2buy;
  var qtyInStock;
  showInventory().then(
    function (result) {
      console.table(result);
      showChoices().then((result) => {
        console.log("choices are :", result)
        currentChoices = result;
        console.log("my current choices", currentChoices)
        inquirer.prompt({
          name: "itemToBuy",
          type: "list",
          message: "what do you want to buy? Please choose item Id",
          choices: currentChoices
        }).then(function (answer) {
          console.log(answer.itemToBuy);

          if (answer.itemToBuy === 1) {
            connection.query('select stock_quantity from products where item_id=1', function (err, result) {
              if (err) throw err;
              qtyInStock = result[0].stock_quantity;
              console.log("stock for chosen item is : ", qtyInStock);
              askQuantity().then((result) => {
                qty2buy = result;
                console.log(qty2buy);
                checkStock(qtyInStock,qty2buy);
                newStockValue = qtyInStock-qty2buy;
                var sqlString = 'UPDATE products SET stock_quantity = ? WHERE item_id =?';
               //console.log(newStockValue +" and "+answer.itemToBuy)
                updateInventory(sqlString,newStockValue,answer.itemToBuy);
                showInventory().then((result)=>{
                  console.table(result)
                  connection.end();
                })
              });

            });
          } 
          else if (answer.itemToBuy == "2") {
            var qtyInStock = connection.query('select stock_quantity from products where item_id=2', function (err, result) {
              if (err) throw err;
              var qtyInStock = result[0].stock_quantity;
              console.log("stock for chosen item is : ", qtyInStock);
              askQuantity().then((result) => {
                qty2buy = result;
                console.log(qty2buy)
                checkStock(qtyInStock,qty2buy);
                newStockValue = qtyInStock-qty2buy;
                var sqlString = 'UPDATE products SET stock_quantity = ? WHERE item_id =?';
               //console.log(newStockValue +" and "+answer.itemToBuy)
                updateInventory(sqlString,newStockValue,answer.itemToBuy);
                showInventory().then((result)=>{
                  console.table(result)
                  connection.end();
                })
              });
            });
          }
        })
      })
    })

});

function askQuantity() {
  return new Promise((resolve, reject) => {
    inquirer.prompt({
      type: "input",
      name: "qtyToBuy",
      message: "How many of these you want to buy?"
    }).then(function (answer) {
      //console.log(answer.qtyToBuy);
      resolve(answer.qtyToBuy);
    })
  })
}

function updateInventory(sqlStr,newValue,column) {

  connection.query(sqlStr,[newValue,column],function(err,result){
    if (err) throw err;
   
  });

}

function showInventory() {
  return new Promise((resolve, reject) => {
    console.log("Here is the product inventory ");
    connection.query("select * from products", function (err, result) {
      if (err) reject(err);
      else resolve(result);
    });
  })
}
function checkStock(stock, qty){
  if (qty>stock){
  console.log("Not enogh stock for this purchase");
  connection.end();
  }
}
function showChoices() {
  return new Promise((resolve, reject) => {
    var choicesArray = [];
    connection.query("select item_id from products", function (err, result) {
      if (err) reject(err);
      if (result) {
        var lengthArr = result.length;

        for (var i = 0; i < lengthArr; i++) {
          choicesArray.push(Object.values(result[i]));
        }
        resolve(choicesArray.flat());
      }
    })
  })
}

