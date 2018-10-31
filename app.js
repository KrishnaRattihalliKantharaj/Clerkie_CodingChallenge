/**
 * Created by Krishna.R.K on 10/23/2018.
 */
const express = require("express");
const mongoose = require("mongoose");
const database = require('./db');
const bodyParser = require("body-parser");
const app = express();
var Model  = require('./dbTransactionSchema');

mongoose.connect('mongodb://localhost/interview_challenge');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/',function (request, response) {
    getRecurringTransactions(request, response);
});

app.post('/', function (request, response) {
    upsertTransactions(request, response);
});



// this method will analyze all input trans' is_recurring and put them into the database

// var inputArr=[];
async function upsertTransactions (request, response) {
    var value = false;
    var objArr = [];
    var objArrLength = objArr.length;
    let transArr = request.body;
    setTimeout(function (response) {
        if(!value) {
            response.json("Server Timeout 10S")
        }
    },10000);
    if (!transArr || transArr.length === 0) {
        return;
    }
    await Model.count((err,data)=>{
        if(data===0){
            objArr=[];
        }
    });
    for (let i = 0; i < transArr.length; i++) {
        await isPresent(transArr[i]).then(isRecur=>{
            let obj = {
                name: transArr[i].name,
                date: new Date(transArr[i].date),
                amount: parseFloat(transArr[i].amount),
                trans_id: parseInt(transArr[i].trans_id),
                user_id: parseInt(transArr[i].user_id),
                is_recurring: true
            };
            return obj;
        }).then(obj => {
            objArr.push(obj);
        });
    }
    //write to database
    var ctr = 0;
    await objArr.forEach(obj=>{
        Model.find({trans_id:obj.trans_id}).then(result=>{
            ctr++;
            if(result!==0){
                Model.create(obj,(err,data)=>{
                    if(err){
                        console.log(err);
                    }
                })
            }
            if(ctr===objArr.length){
                value=true;
                getRecurringTransactions(request, response);
            }
        });
    });
}

//find Recurring transaction for a specific company
function findRecurringCompany(resolve, nameSet){
    var arr=[];
    //console.log(nameSet);
    nameSet.forEach(value=>{
        Model.find({name: new RegExp('^'+value), is_recurring:true}, (err, result)=>{
            var nxt = findNext(result);

            arr.push(nxt);
            if(arr.length===nameSet.size){
                resolve(arr);
            }
        });
    });
}

//This function gets all the recurring transactions until now
var getRecurringTransactions = (request, response)=>{

    //Name Set holds all the names of the companies unique
    var nameSet = new Set();
    var value = false;

    setTimeout(function (response) {
        if(!value) {
            response.json("Server Timeout 10S")
        }
    },10000);

    database.findAllRecurringTransactionNames()
    .then(result=>{
        for(var i=0;i<result.length;i++){
            nameSet.add(result[i].name.split(' ')[0]);
        }
        return nameSet;
    })
    .then(nameSet=>{
        return new Promise((resolve, reject)=> {
            findRecurringCompany(resolve, nameSet);
        });
    })
    .then(arr=>{
        arr.sort((valueA, valueB)=>{
            return valueA-valueB;
        });
        for(var i=0;i<arr.length;i++){
            if(arr[i].transactions.length===1){
                arr.splice(i,1);
                continue;
            }
            var amount = arr[i].next_amt;
            var prvAmount = amount * 0.8;
            var nextAmount = amount * 1.2;
            var tempArr = arr[i].transactions;
            for(var j=0;j<tempArr.length;j++){
                if(tempArr[j].amount>=nextAmount || tempArr[j].amount<=prvAmount){
                    var key = tempArr[j]._id;
                    arr[i].transactions.splice(j,1);
                }
            }
        }
        console.log("Result: "+JSON.stringify(arr));
        value=true;
        response.json(arr);
    })
    .catch(err=>{
        console.log(err);
    });
};


function findNext(arr) {
    arr.sort((a, b) => {
        if(a.date>b.date)return 1;
        else if(a.date<b.date)return -1;
        return 0;
    });
    let nextInterval = 0;
    let nextAmount = arr[0].amount;
    let newDate = new Date(arr[arr.length - 1].date);

    for (let i = 1; i < arr.length; i++) {
        nextInterval += Math.abs(arr[i].date - arr[i - 1].date);
        nextAmount += arr[i].amount;
        delete arr[i]._id;
    }

    nextInterval = nextInterval / (arr.length - 1);
    nextAmount = nextAmount / arr.length;
    newDate.setTime(newDate.getTime() + nextInterval);
    newDate.setHours(arr[arr.length - 1].date.getHours());
    let res = {
        name: arr[arr.length - 1].name,
        user_id: arr[arr.length - 1].user_id,
        next_amt: nextAmount.toFixed(2),
        next_date: newDate,
        transactions: arr
    }
    return res;
}

// Function to check if the Transaction is recurring or not
async function isPresent(trans){
    let cmpName = trans.name.split(' ')[0];
    let is_present;
    var daysError = 345600000;// 4 days of error margin
    await Model.find({name: new RegExp('^'+cmpName)},(err,res)=>{
        console.log("ReachedHere1");
        if(res.length===0){
            console.log("ReachedHere4");
            is_present=true;
        }else{
            console.log("ReachedHere2");
            Model.find({name: new RegExp('^'+cmpName)},(err, res)=>{
                let nextTransaction = findNext(res);
                var amtError1 = nextTransaction.next_amt * 0.8;//amout error margin of 20% less than the current amount
                var amtError2 = nextTransaction.next_amt * 1.2;//amout error margin of 20% more than the current amount
                let calculatedDate = Math.abs(new Date(trans.date) - new Date(nextTransaction.next_date)) < daysError; // within 4 days
                let calculatedAmout = trans.amount > amtError1 && trans.amount < amtError2; // Difference must be of error margin 20% above or below
                trans.is_recurring=true;
                if(calculatedDate && calculatedAmout){
                    console.log("ReachedHere3");
                    is_present = true;
                }else{
                    is_present = true;
                }
            })
        }
    });
    return is_present;
}


var server = app.listen(1984, function () {
    console.log("Running the Server on port 1984");
});

