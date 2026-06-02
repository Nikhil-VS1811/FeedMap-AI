import { Expand, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { placeholderImage, resolveImageUrl } from '../utils/imageUrl';

const FoodImage = ({ alt, className = 'h-40 w-full', enableLightbox = true, src }) => {
  const [failed, setFailed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imageUrl = failed ? placeholderImage : resolveImageUrl(src);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);

  const image = (
    <img
      alt={alt || 'Food donation'}
      className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      onError={() => {
        setFailed(true);
        setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      src={imageUrl}
    />
  );

  return (
    <>
      <div className={`group relative overflow-hidden bg-slate-100 ${className}`}>
        {!loaded && <div className="absolute inset-0 animate-pulse bg-slate-200" />}
        {enableLightbox ? (
          <button
            type="button"
            aria-label={`Open ${alt || 'food donation'} image`}
            className="h-full w-full cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
          >
            {image}
            <span className="absolute right-2 top-2 rounded-md bg-slate-950/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Expand size={15} />
            </span>
          </button>
        ) : (
          image
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-4"
          onClick={() => setLightboxOpen(false)}
          role="presentation"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-md bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close image preview"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={22} />
          </button>
          <img
            alt={alt || 'Food donation'}
            className="max-h-[88vh] max-w-[94vw] rounded-lg object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            src={imageUrl}
          />
        </div>
      )}
    </>
  );
};

export default FoodImage;
