const express = require('express');

const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { authorize, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), getDashboardAnalytics);

module.exports = router;
