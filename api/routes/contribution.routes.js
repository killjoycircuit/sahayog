const express = require('express');
const router = express.Router();
const {
  createContribution,
  getUserContributions,
  getContributionInvoice,
  emailInvoice,
  getContributionStats
} = require('../controllers/contribution.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// All contribution routes require authentication
router.use(authenticateToken);

// POST /api/contributions - Create new contribution
router.post('/contributions', createContribution);

// GET /api/contributions/user/:userId - Get user contributions
router.get('/contributions/user/:userId', getUserContributions);

// GET /api/contributions/stats/:userId - Get contribution statistics
router.get('/contributions/stats/:userId', getContributionStats);

// GET /api/contributions/:id/invoice - Get contribution invoice (generated on-demand)
router.get('/contributions/:id/invoice', getContributionInvoice);

// POST /api/contributions/:id/email-invoice - Email invoice
router.post('/contributions/:id/email-invoice', emailInvoice);

module.exports = router;