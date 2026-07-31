const express = require('express');
const { generateCsrfToken } = require('../middleware/csrf');

const router = express.Router();

router.get('/csrf-token', (req, res, next) => {
  try {
    const token = generateCsrfToken(req, res);
    res.json({ success: true, csrfToken: token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
