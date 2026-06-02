import { ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { uploadDonationImage } from '../api/uploadApi';
import { dismissToast, showError, showLoading, showSuccess, showWarning } from '../utils/toast';
import FoodImage from './FoodImage';

const maxFileSize = 5 * 1024 * 1024;
const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const ImageUploader = ({ onUploaded, onUploadingChange, value }) => {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(value);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const localPreviewRef = useRef('');

  useEffect(() => {
    if (!localPreviewRef.current) {
      setPreview(value);
    }
  }, [value]);

  useEffect(
    () => () => {
      if (localPreviewRef.current) {
        window.URL.revokeObjectURL(localPreviewRef.current);
      }
    },
    []
  );

  const resetLocalPreview = () => {
    if (localPreviewRef.current) {
      window.URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = '';
    }
  };

  const setUploadState = (nextUploading) => {
    setUploading(nextUploading);
    onUploadingChange?.(nextUploading);
  };

  const uploadFile = async (file) => {
    if (!file) {
      return;
    }

    if (!supportedTypes.has(file.type)) {
      showWarning('Choose a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > maxFileSize) {
      showWarning('Image must be 5MB or smaller.');
      return;
    }

    resetLocalPreview();
    localPreviewRef.current = window.URL.createObjectURL(file);
    setPreview(localPreviewRef.current);
    setProgress(0);
    setUploadState(true);
    const toastId = showLoading('Uploading image...');

    try {
      const { data } = await uploadDonationImage(file, setProgress);
      console.log('[image uploader] uploaded', data);
      resetLocalPreview();
      setPreview(data.imageUrl);
      onUploaded(data.imageUrl);
      dismissToast(toastId);
      showSuccess('Image uploaded successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Could not upload image.';
      console.log('[image uploader] upload failed', error);
      dismissToast(toastId);
      showError(message);
      resetLocalPreview();
      setPreview(value);
    } finally {
      setUploadState(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    uploadFile(event.dataTransfer.files?.[0]);
  };

  const handleRemove = () => {
    resetLocalPreview();
    setPreview('');
    setProgress(0);
    onUploaded('');
  };

  return (
    <div>
      <span className="text-sm font-medium text-ink-700">Food image</span>
      <label
        className={`mt-1 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-5 py-6 text-center transition-colors ${
          dragging ? 'border-primary-600 bg-primary-50' : 'border-slate-300 bg-slate-50 hover:border-primary-500 hover:bg-primary-50/50'
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading}
          onChange={(event) => uploadFile(event.target.files?.[0])}
          type="file"
        />
        <UploadCloud className="text-primary-600" size={26} />
        <span className="mt-2 text-sm font-semibold text-ink-900">Drop a food image here or browse</span>
        <span className="mt-1 text-xs text-ink-500">JPG, JPEG, PNG, or WEBP up to 5MB</span>
      </label>

      {uploading && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-ink-600">
            <span>Uploading image</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-primary-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {preview && (
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <FoodImage alt="Food donation preview" className="h-44 w-full" src={preview} />
          <div className="flex items-center justify-between px-3 py-2">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-ink-600">
              <ImagePlus size={15} />
              Image ready
            </span>
            <button
              type="button"
              className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
              onClick={handleRemove}
              aria-label="Remove food image"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
