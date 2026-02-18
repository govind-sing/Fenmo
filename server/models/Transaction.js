const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['expense', 'income'], default: 'expense' }, // Added type [cite: 67]
  amount: { type: mongoose.Types.Decimal128, required: true }, 
  category: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  idempotencyKey: { type: String, unique: true, sparse: true } 
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);