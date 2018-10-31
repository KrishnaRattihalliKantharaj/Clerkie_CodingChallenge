/**
 * Created by Krishna.R.K on 10/30/2018.
 */
const mongoose = require('mongoose');
var Model  = require('./dbTransactionSchema');

mongoose.connect('mongodb://localhost/interview_challenge');

var findAllRecurringTransactionNames = ()=>{
    return Model.find({is_recurring:true}, "name");
};

var getCmpNameWithRecurringTrans = (cmpName)=>{
  return Model.find({name: new RegExp('^'+cmpName)});
};

module.exports.getCmpNameWithRecurringTrans = getCmpNameWithRecurringTrans;
module.exports.findAllRecurringTransactionNames = findAllRecurringTransactionNames;