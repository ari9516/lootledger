const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getJournalEntries,
  getJournalSummary,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} = require('../controllers/journalController');

router.get('/', auth, getJournalEntries);
router.get('/summary', auth, getJournalSummary);
router.post('/', auth, createJournalEntry);
router.put('/:id', auth, updateJournalEntry);
router.delete('/:id', auth, deleteJournalEntry);

module.exports = router;