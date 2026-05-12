const express = require('express');
const {
  getJournals,
  getJournalsByTrip,
  getJournal,
  createJournal,
  updateJournal,
  deleteJournal
} = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getJournals)
  .post(protect, createJournal);

router.get('/trip/:tripId', protect, getJournalsByTrip);

router.route('/:id')
  .get(protect, getJournal)
  .put(protect, updateJournal)
  .delete(protect, deleteJournal);

module.exports = router;
