"use client";

import { useEffect, useState } from "react";
import Map, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  Marker,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

type UciMapProps = {
  className?: string;
  height?: string | number;
  mapStyle?: string;
  zoom?: number;
};

const UCI_COORDINATES = {
  latitude: 33.64607201522202,
  longitude: -117.84273146416213,
};

export function UciMap({
  className,
  height = 400,
  mapStyle = "mapbox://styles/mapbox/streets-v12",
  zoom = 15,
}: UciMapProps) {
  const mapboxToken =
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? process.env.MAPBOX_TOKEN;

  const [viewState, setViewState] = useState({
    latitude: UCI_COORDINATES.latitude,
    longitude: UCI_COORDINATES.longitude,
    zoom,
    bearing: 0,
    pitch: 0,
  });

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setViewState((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));
      },
      () => {
        // keep default UCI view
      },
    );
  }, []);

  if (!mapboxToken) {
    return (
      <div className="flex justify-center">
        Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in environment.
      </div>
    );
  }

  return (
    <div
      className={className}
      style={
        typeof height === "number"
          ? { height: `${height}px`, width: "100%" }
          : { height, width: "100%" }
      }
    >
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%", borderRadius: "0.75rem" }}
        mapStyle={mapStyle}
        mapboxAccessToken={mapboxToken}
      >
        <NavigationControl position="top-left" />
        <GeolocateControl
          position="top-left"
          trackUserLocation
          showUserHeading
        />
        <FullscreenControl position="top-right" />
        <ScaleControl />
        {userLocation && (
          <Marker
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            anchor="center"
          >
            <div className="h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white ring-offset-2 ring-offset-blue-500" />
          </Marker>
        )}
      </Map>
    </div>
  );
}
