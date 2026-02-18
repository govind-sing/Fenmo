const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// This route is protected. Only logged-in users can reach it.
router.get('/profile', protect, (req, res) => {
  res.json({
    message: "Authorized access",
    user: req.user // req.user was attached by our middleware
  });
});

module.exports = router;