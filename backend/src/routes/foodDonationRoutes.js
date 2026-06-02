const express = require('express');

const {
  acceptDonation,
  createDonation,
  getAcceptedDonations,
  getActiveDonations,
  getAllDonations,
  getAssignedDeliveries,
  getDonorDonations,
  removeDonation,
  updateDonationStatus,
} = require('../controllers/foodDonationController');
const { authorize, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('donor'), createDonation);
router.get('/mine', protect, authorize('donor'), getDonorDonations);
router.get('/active', protect, getActiveDonations);
router.get('/accepted', protect, authorize('ngo'), getAcceptedDonations);
router.get('/assigned', protect, authorize('delivery'), getAssignedDeliveries);
router.get('/admin/all', protect, authorize('admin'), getAllDonations);
router.patch('/:id/accept', protect, authorize('ngo'), acceptDonation);
router.patch('/:id/status', protect, updateDonationStatus);
router.delete('/:id', protect, authorize('admin'), removeDonation);

module.exports = router;
