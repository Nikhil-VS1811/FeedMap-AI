import { MapPin, Package, X } from 'lucide-react';
import { useState } from 'react';

import ImageUploader from './ImageUploader';

const categories = [
  { value: 'cooked_food', label: 'Cooked Food' },
  { value: 'raw_food', label: 'Raw Food' },
  { value: 'fruits_vegetables', label: 'Fruits & Vegetables' },
  { value: 'grains', label: 'Grains' },
  { value: 'packaged_food', label: 'Packaged Food' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'other', label: 'Other' },
];

const initialForm = {
  category: 'cooked_food',
  expiryTime: '',
  image: '',
  latitude: '',
  longitude: '',
  pickupAddress: '',
  quantity: '',
  title: '',
};

const DonationFormModal = ({ error, onClose, onSubmit, submitting }) => {
  const [form, setForm] = useState(initialForm);
  const [imageUploading, setImageUploading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (imageUploading) {
      return;
    }

    onSubmit({
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-4 py-4 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-soft">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Add Food Donation</h2>
            <p className="text-sm text-ink-500">Share pickup details so NGOs can discover available food.</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-ink-500 hover:bg-slate-100"
            onClick={onClose}
            aria-label="Close donation form"
          >
            <X size={20} />
          </button>
        </div>

        <form className="space-y-5 p-5" onSubmit={handleSubmit}>
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-ink-700">Title</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Fresh lunch boxes"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink-700">Quantity</span>
              <div className="mt-1 flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100">
                <Package size={18} className="text-ink-500" />
                <input
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm outline-none"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="25 meals"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink-700">Category</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink-700">Expiry time</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                type="datetime-local"
                name="expiryTime"
                value={form.expiryTime}
                onChange={handleChange}
                required
              />
            </label>

            <div className="sm:col-span-2">
              <ImageUploader
                onUploaded={(image) => setForm((current) => ({ ...current, image }))}
                onUploadingChange={setImageUploading}
                value={form.image}
              />
            </div>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-ink-700">Pickup address</span>
              <div className="mt-1 flex items-start rounded-lg border border-slate-300 px-3 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100">
                <MapPin size={18} className="mt-3 text-ink-500" />
                <textarea
                  className="min-h-24 w-full resize-y border-0 bg-transparent px-3 py-3 text-sm outline-none"
                  name="pickupAddress"
                  value={form.pickupAddress}
                  onChange={handleChange}
                  placeholder="Restaurant, street, area, city"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink-700">Latitude</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                type="number"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                min="-90"
                max="90"
                step="any"
                placeholder="12.9716"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink-700">Longitude</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                type="number"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                min="-180"
                max="180"
                step="any"
                placeholder="77.5946"
                required
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-slate-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || imageUploading}
              className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {imageUploading ? 'Uploading image...' : submitting ? 'Creating...' : 'Create donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationFormModal;
