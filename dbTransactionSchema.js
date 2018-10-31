/**
 * Created by Krishna.R.K on 10/28/2018.
 */
const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    name: String,
    date: Date,
    amount: Number,
    trans_id: String,
    user_id: String,
    is_recurring: Boolean
});

module.exports = mongoose.model('Model', transactionSchema);