const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceDate: Date,
  invoiceNumber: Number,
  invoiceAmount: Number,
});

module.exports = mongoose.model('Invoice', invoiceSchema);
