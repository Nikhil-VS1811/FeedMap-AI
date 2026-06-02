import L from 'leaflet';
import { LocateFixed, RefreshCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import { getAvailableDonations } from '../api/donationApi';
import { getExpiryLevel, getRemainingTimeText, sortByExpiryUrgency } from '../utils/expiryUtils';

const categoryLabels = {
  bakery: 'Bakery',
  cooked_food: 'Cooked Food',
  dairy: 'Dairy',
  fruits_vegetables: 'Fruits & Vegetables',
  grains: 'Grains',
  other: 'Other',
  packaged_food: 'Packaged Food',
  raw_food: 'Raw Food',
};

const userLocationIcon = L.divIcon({
  className: '',
  html: '<div class="h-4 w-4 rounded-full border-2 border-white bg-sky-500 shadow-lg ring-4 ring-sky-200"></div>',
  iconAnchor: [8, 8],
  iconSize: [16, 16],
});

const getDonationPosition = (donation) => {
  const latitude = Number(donation.latitude);
  const longitude = Number(donation.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return [latitude, longitude];
};

const getUrgency = (donation) => {
  const level = getExpiryLevel(donation);
  const urgencyMap = {
    GRAY: { color: '#64748b', label: 'Expired' },
    GREEN: { color: '#16a34a', label: 'Fresh' },
    RED: { color: '#dc2626', label: 'Critical' },
    YELLOW: { color: '#d97706', label: 'Expiring Soon' },
  };

  return urgencyMap[level] || urgencyMap.GREEN;
};

const createDonationIcon = (donation) => {
  const urgency = getUrgency(donation);
  const pulse = getExpiryLevel(donation) === 'RED' ? 'animation:pulse 1.4s infinite;' : '';

  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:9999px;border:3px solid #fff;background:${urgency.color};box-shadow:0 10px 18px rgba(15,23,42,.25);transition:transform .2s ease;${pulse}"></div>`,
    iconAnchor: [14, 14],
    iconSize: [28, 28],
    popupAnchor: [0, -14],
  });
};

const FitMapBounds = ({ donations, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    const positions = donations.map(getDonationPosition).filter(Boolean);

    if (userLocation) {
      positions.push([userLocation.latitude, userLocation.longitude]);
    }

    if (positions.length === 0) {
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 13);
      return;
    }

    map.fitBounds(positions, { padding: [36, 36], maxZoom: 14 });
  }, [donations, map, userLocation]);

  return null;
};

const DEFAULT_CITY_CENTER = [12.9716, 77.5946];

const DonationMap = ({ donations = [], filters = {}, loading = false, onAcceptDonation, onDetails, onDonationsLoaded, refreshKey = 0, showAcceptActions = false }) => {
  const [localDonations, setLocalDonations] = useState(donations);
  const [mapError, setMapError] = useState('');
  const [mapLoading, setMapLoading] = useState(loading);
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    setLocalDonations(sortByExpiryUrgency(donations));
  }, [donations]);

  useEffect(() => {
    let mounted = true;

    const loadMapDonations = async () => {
      setMapError('');
      setMapLoading(true);

      try {
        const { data } = await getAvailableDonations(filters);
        const sortedDonations = data.donations;
        console.log('[donation map] fetched available donations', sortedDonations);
        if (mounted) {
          setLocalDonations(sortedDonations);
          onDonationsLoaded?.(sortedDonations);
        }
      } catch (apiError) {
        const message = apiError.response?.data?.message || 'Could not load map donations.';
        if (mounted) {
          setMapError(message);
        }
        console.log('[donation map] load error', apiError.response?.data || apiError.message);
      } finally {
        if (mounted) {
          setMapLoading(false);
        }
      }
    };

    loadMapDonations();

    return () => {
      mounted = false;
    };
  }, [filters, localRefreshKey, onDonationsLoaded, refreshKey]);

  const validDonations = useMemo(() => localDonations.filter((donation) => getDonationPosition(donation)), [localDonations]);

  const mapCenter = useMemo(() => {
    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }

    const firstDonationPosition = validDonations.length ? getDonationPosition(validDonations[0]) : null;
    return firstDonationPosition || DEFAULT_CITY_CENTER;
  }, [userLocation, validDonations]);

  const requestUserLocation = () => {
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Location is not supported by this browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        console.log('[donation map] user location', position.coords.latitude, position.coords.longitude);
        setLocating(false);
      },
      () => {
        setLocationError('Could not access your location. Check browser permissions and try again.');
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 10000,
      }
    );
  };

  return (
    <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">Donation Map</h2>
          <p className="text-sm text-ink-500">
            {mapLoading ? 'Loading donation locations...' : `${validDonations.length} available donation locations`}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-slate-50"
            onClick={() => setLocalRefreshKey((current) => current + 1)}
            disabled={mapLoading}
          >
            <RefreshCcw size={17} />
            Refresh markers
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-slate-50"
            onClick={requestUserLocation}
            disabled={locating}
          >
            <LocateFixed size={17} />
            {locating ? 'Locating...' : 'Use my location'}
          </button>
        </div>
      </div>

      {mapError && <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">{mapError}</div>}

      {locationError && (
        <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          {locationError}
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-b border-slate-200 px-5 py-3 text-xs font-medium text-ink-700">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#16a34a]" /> Fresh</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#d97706]" /> Expiring Soon</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#dc2626]" /> Critical</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-500" /> Expired</span>
      </div>

      <div className="relative h-[360px] w-full sm:h-[430px] lg:h-[520px]">
        {mapLoading && (
          <div className="absolute inset-x-4 top-4 z-[500] rounded-lg bg-white/95 px-4 py-3 text-sm font-medium text-ink-700 shadow-soft">
            Loading live map markers...
          </div>
        )}
        <MapContainer center={mapCenter} zoom={validDonations.length ? 12 : 5} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitMapBounds donations={validDonations} userLocation={userLocation} />

          {userLocation && (
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userLocationIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-ink-900">Your location</p>
                </div>
              </Popup>
            </Marker>
          )}

          {validDonations.map((donation) => {
            const position = getDonationPosition(donation);
            const expiry = new Date(donation.expiryTime);

            return (
              <Marker key={`${donation._id}-${donation.status}-${donation.expiryTime}`} position={position} icon={createDonationIcon(donation)}>
                <Popup>
                  <div className="min-w-52 space-y-1 text-sm">
                    <p className="font-semibold text-ink-900">{donation.title}</p>
                    <p>
                      <span className="font-medium">Quantity:</span> {donation.quantity}
                    </p>
                    <p>
                      <span className="font-medium">Category:</span> {categoryLabels[donation.category] || donation.category}
                    </p>
                    <p>
                      <span className="font-medium">Expiry:</span> {expiry.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Remaining:</span> {getRemainingTimeText(donation)}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> {donation.status}
                    </p>
                    <p>
                      <span className="font-medium">Donor:</span> {donation.donor?.name || 'Unknown donor'}
                    </p>
                    <p>
                      <span className="font-medium">Pickup:</span> {donation.pickupAddress}
                    </p>
                    <p>
                      <span className="font-medium">Urgency:</span> {getUrgency(donation).label}
                    </p>
                    <p>
                      <span className="font-medium">AI Priority:</span> {donation.priorityLevel || 'LOW'} ({donation.priorityScore || 0}/100)
                    </p>
                    <div className="mt-3 flex flex-col gap-2">
                      {onDetails && (
                        <button
                          type="button"
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-slate-50"
                          onClick={() => onDetails(donation)}
                        >
                          View Details
                        </button>
                      )}
                      {showAcceptActions && onAcceptDonation && (
                        <button
                          type="button"
                          disabled={getExpiryLevel(donation) === 'GRAY'}
                          className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => onAcceptDonation(donation)}
                        >
                          {getExpiryLevel(donation) === 'GRAY' ? 'Expired' : 'Accept Donation'}
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </section>
  );
};

export default DonationMap;
