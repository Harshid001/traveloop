const express = require('express');
const { body } = require('express-validator');
const {
  getJournals,
  getJournalsByTrip,
  getJournal,
  createJournal,
  updateJournal,
  deleteJournal
} = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.route('/')
  .get(protect, getJournals)
  .post(protect,
    [
      body('title', 'Title is required').not().isEmpty(),
      body('content', 'Content is required').not().isEmpty(),
      validateRequest,
    ],
    createJournal
  );

router.get('/trip/:tripId', protect, getJournalsByTrip);

router.route('/:id')
  .get(protect, getJournal)
  .put(protect,
    [
      body('title', 'Title must be a string').optional().isString(),
      body('content', 'Content must be a string').optional().isString(),
      validateRequest,
    ],
    updateJournal
  )
  .delete(protect, deleteJournal);

module.exports = router;