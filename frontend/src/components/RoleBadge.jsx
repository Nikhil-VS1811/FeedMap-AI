const roleLabels = {
  admin: 'Admin',
  delivery: 'Delivery',
  donor: 'Donor',
  ngo: 'NGO',
};

const RoleBadge = ({ role }) => (
  <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
    {roleLabels[role] || role}
  </span>
);

export default RoleBadge;
