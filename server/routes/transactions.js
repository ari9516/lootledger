const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getTransactions,
  getSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');

// IMPORTANT: /summary must come before /:id
router.get('/summary', auth, getSummary);

router.get('/', auth, getTransactions);
router.post('/', auth, createTransaction);
router.put('/:id', auth, updateTransaction);
router.delete('/:id', auth, deleteTransaction);

module.exports = router;