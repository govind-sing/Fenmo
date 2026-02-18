const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

//
// @route   POST /api/transactions
// @desc    Create new transaction (income or expense)
// @access  Private
//
router.post('/', protect, async (req, res) => {
  const {
    amount,
    category,
    description,
    date,
    type,
    idempotencyKey
  } = req.body;

  // 🔹 1. Validation
  if (!amount || Number(amount) <= 0) {
    return res
      .status(400)
      .json({ message: "Please provide a valid positive amount." });
  }

  if (!type || !['income', 'expense'].includes(type)) {
    return res
      .status(400)
      .json({ message: "Type must be either 'income' or 'expense'." });
  }

  if (!date) {
    return res.status(400).json({ message: "Date is required." });
  }

  if (!category || !description) {
    return res
      .status(400)
      .json({ message: "Category and description are required." });
  }

  try {
    // 🔹 2. Idempotency check (prevents duplicate submissions)
    if (idempotencyKey) {
      const existing = await Transaction.findOne({ idempotencyKey });
      if (existing) {
        return res.status(200).json(existing);
      }
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      category,
      description,
      date,
      type, // 'income' or 'expense'
      idempotencyKey
    });

    res.status(201).json(transaction);

  } catch (error) {
    console.error("Create transaction error:", error);
    res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
});


//
// @route   GET /api/transactions
// @desc    Get all transactions (with filtering + sorting)
// @access  Private
//
router.get('/', protect, async (req, res) => {
  const { category, sort, type } = req.query;

  let query = { user: req.user._id };

  // 🔹 Filters
  if (category) {
    query.category = category;
  }

  if (type && ['income', 'expense'].includes(type)) {
    query.type = type;
  }

  try {
    let apiQuery = Transaction.find(query);

    // 🔹 Sorting
    if (sort === 'date_desc') {
      apiQuery = apiQuery.sort({ date: -1 });
    } else if (sort === 'date_asc') {
      apiQuery = apiQuery.sort({ date: 1 });
    }

    const transactions = await apiQuery;

    res.json(transactions);

  } catch (error) {
    console.error("Fetch transactions error:", error);
    res.status(500).json({ message: "Server error." });
  }
});


// @route DELETE /api/transactions/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) return res.status(404).json({ message: "Not found" });
    
    // Ensure the user owns this transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await transaction.deleteOne();
    res.json({ message: "Transaction removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route PUT /api/transactions/:id
router.post('/:id', protect, async (req, res) => { // Using POST or PUT to update
  try {
    const { amount, category, description, date, type } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (transaction && transaction.user.toString() === req.user._id.toString()) {
      transaction.amount = amount || transaction.amount;
      transaction.category = category || transaction.category;
      transaction.description = description || transaction.description;
      transaction.date = date || transaction.date;
      transaction.type = type || transaction.type;

      const updatedTransaction = await transaction.save();
      res.json(updatedTransaction);
    } else {
      res.status(404).json({ message: "Transaction not found or unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;