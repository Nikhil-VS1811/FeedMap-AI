import { useState } from 'react';
import { createRoot } from 'react-dom/client';

import DonationFilterPanel from './components/DonationFilterPanel';
import './index.css';

const Preview = () => {
  const [filters, setFilters] = useState({
    category: 'cooked_food',
    expiryLevel: 'critical',
    priorityLevel: 'HIGH',
    quantityMax: '75',
    quantityMin: '20',
    search: 'rice',
    sortBy: 'highest_priority',
  });

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <DonationFilterPanel filters={filters} loading={false} onChange={setFilters} resultCount={5} />
      </div>
    </main>
  );
};

createRoot(document.getElementById('root')).render(<Preview />);
