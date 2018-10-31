# Dependencies
Java Script ES7, Node, Express, MongoDB, Mongoose

# Modules
## 1. Upsert transactions:
This will take a list of transactions and add them to the database and will identify the recurring transactions and returns the active
recurring transactions to date.

### Logic
This api adds all the transaction into database. The program analyzes the transaction inserted to database and predicts next and previous posiible dates for the transaction and also predicts the amount. The Error margin for date difference is around 4 and the amount for the transaction is not more than 20% of the predicted transaction. Then the transaction is a recurring transaction.

## 2. Get Recurring transactions:

The transactions grouped to be recurring in the upsert transaction api will be filtered again for any possible mismatch. If found will be removed from the JSON array.

# Request format:

Run the app.js file and the following are the request format for Upsert Transaction and Get recurring transactions.

## Upsert tranaction:
```
Post request url: http://localhost:1984/
Example Body of the post request: 
[
   {
      "user_id":"42u642q3dojnxicxuo-1",
      "trans_id":100,
      "name":"Netflix",
      "amount":13.99,
      "date":"2018-08-29T18:42:14.963Z"
   },
   {
      "user_id":"42u642q3dojnxicxuo-1",
      "trans_id":101,
      "name":"Netflix",
      "amount":13.99,
      "date":"2018-09-29T18:42:14.963Z"
   },
   {
      "user_id":"42u642q3dojnxicxuo-1",
      "trans_id":102,
      "name":"Netflix",
      "amount":13.99,
      "date":"2018-10-29T18:42:14.963Z"
   }
]
```

## Get Recurring Transactions:
```
Get request: http://localhost:1984/
```
