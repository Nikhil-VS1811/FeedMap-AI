import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo } from 'react';

import {
  categoryOptions,
  defaultDonationFilters,
  expiryOptions,
  priorityOptions,
  sortOptions,
} from '../utils/donationFilters';

const findLabel = (options, value) => options.find((option) => option.value === value)?.label;

const DonationFilterPanel = ({ filters, loading, onChange, resultCount }) => {
  const activeFilters = useMemo(
    () =>
      [
        filters.search && { key: 'search', label: `Search: ${filters.search}` },
        filters.category && { key: 'category', label: findLabel(categoryOptions, filters.category) },
        filters.priorityLevel && { key: 'priorityLevel', label: `${findLabel(priorityOptions, filters.priorityLevel)} Priority` },
        filters.expiryLevel && { key: 'expiryLevel', label: findLabel(expiryOptions, filters.expiryLevel) },
        filters.quantityMin && { key: 'quantityMin', label: `Min: ${filters.quantityMin}` },
        filters.quantityMax && { key: 'quantityMax', label: `Max: ${filters.quantityMax}` },
      ].filter(Boolean),
    [filters]
  );

  const updateFilter = (key, value) => {
    console.log('[ngo filters] update', { key, value });
    onChange((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    console.log('[ngo filters] clear');
    onChange(defaultDonationFilters);
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-primary-600" size={18} />
            <h2 className="text-lg font-semibold text-ink-900">Find Donations</h2>
          </div>
          <p className="mt-1 text-sm text-ink-500">{loading ? 'Updating results...' : `${resultCount} ${resultCount === 1 ? 'Donation' : 'Donations'} Found`}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={activeFilters.length === 0}
          onClick={clearFilters}
        >
          <RotateCcw size={16} />
          Clear filters
        </button>
      </div>

      <div className="space-y-4 p-5">
        <label className="block">
          <span className="text-sm font-medium text-ink-700">Search donations</span>
          <div className="mt-1 flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100">
            <Search className="text-ink-500" size={18} />
            <input
              className="w-full border-0 bg-transparent px-3 py-3 text-sm outline-none"
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Search pizza, biryani, rice..."
              type="search"
              value={filters.search}
            />
          </div>
        </label>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-ink-700">Category</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
              onChange={(event) => updateFilter('category', event.target.value)}
              value={filters.category}
            >
              {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink-700">Priority</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
              onChange={(event) => updateFilter('priorityLevel', event.target.value)}
              value={filters.priorityLevel}
            >
              {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink-700">Expiry urgency</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
              onChange={(event) => updateFilter('expiryLevel', event.target.value)}
              value={filters.expiryLevel}
            >
              {expiryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink-700">Min quantity</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
              min="0"
              onChange={(event) => updateFilter('quantityMin', event.target.value)}
              placeholder="0"
              type="number"
              value={filters.quantityMin}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink-700">Max quantity</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
              min="0"
              onChange={(event) => updateFilter('quantityMax', event.target.value)}
              placeholder="Any"
              type="number"
              value={filters.quantityMax}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink-700">Sort by</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
              onChange={(event) => updateFilter('sortBy', event.target.value)}
              value={filters.sortBy}
            >
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {activeFilters.map((filter) => (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:border-primary-500"
                key={filter.key}
                onClick={() => updateFilter(filter.key, '')}
              >
                {filter.label}
                <X size={14} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DonationFilterPanel;
