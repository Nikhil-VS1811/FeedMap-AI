const asyncHandler = require('../utils/asyncHandler');
const { User } = require('../models/User');

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin route accessed successfully',
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

const updateNgoApproval = asyncHandler(async (req, res) => {
  const { ngoApprovalStatus } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(ngoApprovalStatus)) {
    res.status(400);
    throw new Error('NGO approval status must be pending, approved, or rejected');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'ngo') {
    res.status(400);
    throw new Error('Only NGO users can be approved or rejected');
  }

  user.ngoApprovalStatus = ngoApprovalStatus;
  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

module.exports = {
  getAllUsers,
  getProfile,
  getAdminDashboard,
  updateNgoApproval,
};
