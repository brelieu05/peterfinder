"use client";

import { useEffect, useState } from "react";

export type UserLocation = {
  latitude: number;
  longitude: number;
  timestamp: Date;
};

type UseUserLocationResult = {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
};

export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!navigator.geolocation) {
      setTimeout(() => {
        // defer state updates
        if (isMounted) {
          setError("Geolocation is not supported by this browser.");
          setLoading(false);
        }
      }, 0);
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      if (isMounted) {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date(),
        });
        setLoading(false);
      }
    };

    const errorHandler = (err: GeolocationPositionError) => {
      if (isMounted) {
        setError(err.message);
        setLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler);

    return () => {
      isMounted = false;
    };
  }, []);

  return { location, loading, error };
}
