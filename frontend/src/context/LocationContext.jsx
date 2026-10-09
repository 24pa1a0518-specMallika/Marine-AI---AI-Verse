import React, { createContext, useContext, useState, useEffect } from 'react';

export const PRESET_LOCATIONS = [
  {
    name: 'Kakinada Coast',
    lat: 16.98,
    lon: 82.24,
    coordsText: '16.9800° N, 82.2400° E',
    zone: 'Kakinada Offshore'
  },
  {
    name: 'Vizag Offshore',
    lat: 17.6868,
    lon: 83.2185,
    coordsText: '17.6868° N, 83.2185° E',
    zone: 'Visakhapatnam Port'
  },
  {
    name: 'Machilipatnam',
    lat: 16.1824,
    lon: 81.1378,
    coordsText: '16.1824° N, 81.1378° E',
    zone: 'Krishna Estuary'
  },
  {
    name: 'Chennai Port',
    lat: 13.0827,
    lon: 80.2707,
    coordsText: '13.0827° N, 80.2707° E',
    zone: 'Chennai Port Outer'
  },
  {
    name: 'Srikakulam Coast',
    lat: 18.3377,
    lon: 84.1264,
    coordsText: '18.3377° N, 84.1264° E',
    zone: 'Kalingapatnam Deep Sea'
  }
];

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(() => {
    try {
      const saved = localStorage.getItem('marine_ai_selected_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Number.isFinite(parsed.lat) && Number.isFinite(parsed.lon)) {
          return parsed;
        }
      }
    } catch (e) {
      // Fallback to default
    }
    return PRESET_LOCATIONS[0];
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshLocationData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const setLocation = (newLoc) => {
    let normalized = null;

    if (typeof newLoc === 'string') {
      // Look up preset by name or zone
      const found = PRESET_LOCATIONS.find(
        p => p.name.toLowerCase() === newLoc.toLowerCase() ||
             p.zone.toLowerCase() === newLoc.toLowerCase()
      );
      if (found) normalized = found;
    } else if (newLoc && typeof newLoc === 'object') {
      const lat = Number(newLoc.lat ?? newLoc.latitude);
      const lon = Number(newLoc.lon ?? newLoc.longitude);

      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        // Validate geographic ranges
        const safeLat = Math.max(-90, Math.min(90, lat));
        const safeLon = Math.max(-180, Math.min(180, lon));

        const existingPreset = PRESET_LOCATIONS.find(
          p => Math.abs(p.lat - safeLat) < 0.05 && Math.abs(p.lon - safeLon) < 0.05
        );

        normalized = {
          name: newLoc.name || existingPreset?.name || `Custom (${safeLat.toFixed(4)}° N, ${safeLon.toFixed(4)}° E)`,
          lat: Number(safeLat.toFixed(6)),
          lon: Number(safeLon.toFixed(6)),
          coordsText: `${Math.abs(safeLat).toFixed(4)}° ${safeLat >= 0 ? 'N' : 'S'}, ${Math.abs(safeLon).toFixed(4)}° ${safeLon >= 0 ? 'E' : 'W'}`,
          zone: newLoc.zone || existingPreset?.zone || 'Custom Marine Sector',
          isCustom: !existingPreset
        };
      }
    }

    if (normalized) {
      setLocationState(normalized);
      setRefreshTrigger((prev) => prev + 1);
      try {
        localStorage.setItem('marine_ai_selected_location', JSON.stringify(normalized));
      } catch (e) {
        // LocalStorage fallback
      }
    }
  };

  const setLocationPreset = (preset) => {
    setLocation(preset);
  };

  const setSelectedLocationByName = (name) => {
    setLocation(name);
  };

  const setCustomCoordinates = (lat, lon, name) => {
    setLocation({ lat, lon, name: name || 'Custom Coordinates' });
  };

  const contextValue = {
    location,
    selectedLocation: location,
    presets: PRESET_LOCATIONS,
    setLocation,
    setLocationPreset,
    setSelectedLocationByName,
    setCustomCoordinates,
    refreshLocationData,
    refreshTrigger
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    return {
      location: PRESET_LOCATIONS[0],
      selectedLocation: PRESET_LOCATIONS[0],
      presets: PRESET_LOCATIONS,
      setLocation: () => {},
      setLocationPreset: () => {},
      setSelectedLocationByName: () => {},
      setCustomCoordinates: () => {},
      refreshLocationData: () => {},
      refreshTrigger: 0
    };
  }
  return context;
}

export default LocationContext;
