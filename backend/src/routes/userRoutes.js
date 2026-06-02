const express = require('express');

const { getAdminDashboard, getAllUsers, getProfile, updateNgoApproval } = require('../controllers/userController');
const { authorize, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);
router.get('/admin/all', protect, authorize('admin'), getAllUsers);
router.patch('/admin/:id/ngo-approval', protect, authorize('admin'), updateNgoApproval);

module.exports = router;
