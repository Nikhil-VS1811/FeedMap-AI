const express = require('express');

const {
  acceptDonation,
  assignDelivery,
  createDonation,
  getAcceptedDonations,
  getAllDonations,
  getAssignedDeliveries,
  getAvailableDonations,
  getDonationRecommendation,
  getDonorDonations,
  getNearbyDonations,
  getPrioritizedDonations,
  rejectDonation,
  removeDonation,
  updateDonationStatus,
} = require('../controllers/donationController');
const { authorize, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('donor'), createDonation);
router.get('/', protect, authorize('admin'), getAllDonations);
router.get('/available', protect, getAvailableDonations);
router.get('/nearby', protect, getNearbyDonations);
router.get('/prioritized', protect, authorize('ngo', 'admin'), getPrioritizedDonations);
router.get('/my-donations', protect, authorize('donor'), getDonorDonations);
router.get('/delivery/assigned', protect, authorize('delivery'), getAssignedDeliveries);
router.get('/accepted', protect, authorize('ngo'), getAcceptedDonations);
router.get('/assigned', protect, authorize('delivery'), getAssignedDeliveries);
router.get('/admin/all', protect, authorize('admin'), getAllDonations);
router.get('/:id/recommendation', protect, getDonationRecommendation);
router.put('/:id/accept', protect, authorize('ngo'), acceptDonation);
router.patch('/:id/accept', protect, authorize('ngo'), acceptDonation);
router.patch('/:id/reject', protect, authorize('ngo'), rejectDonation);
router.patch('/:id/assign-delivery', protect, authorize('admin'), assignDelivery);
router.put('/:id/status', protect, updateDonationStatus);
router.patch('/:id/status', protect, updateDonationStatus);

// Temporary compatibility aliases for existing screens while the app moves to the new API names.
router.get('/active', protect, getAvailableDonations);
router.get('/mine', protect, authorize('donor'), getDonorDonations);
router.delete('/:id', protect, authorize('admin'), removeDonation);

module.exports = router;
