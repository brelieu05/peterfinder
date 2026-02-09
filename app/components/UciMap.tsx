"use client";

import { useRef, useState } from "react";
import Map, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  GeolocateControlInstance,
  Marker,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { onCampus, UCI_LOCATION } from "@/lib/utils/location";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { RankedItem } from "../page";

type UciMapProps = {
  className?: string;
  height?: string | number;
  mapStyle?: string;
  zoom?: number;
  items?: RankedItem[];
};

export function UciMap({
  className,
  height = 400,
  mapStyle = "mapbox://styles/mapbox/streets-v12",
  zoom = 15,
  items,
}: UciMapProps) {
  const geolocateRef = useRef<GeolocateControlInstance | null>(null);
  const { location } = useUserLocation();

  const mapboxToken =
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? process.env.MAPBOX_TOKEN;

  const [viewState, setViewState] = useState({
    latitude: UCI_LOCATION.latitude,
    longitude: UCI_LOCATION.longitude,
    zoom,
    bearing: 0,
    pitch: 0,
  });

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
        onLoad={() => {
          // only go to user's location if they are on campus
          if (location && onCampus(location.latitude, location.longitude)) {
            geolocateRef.current?.trigger();
          }
        }}
      >
        <NavigationControl position="top-left" />
        <GeolocateControl
          ref={geolocateRef}
          position="top-left"
          trackUserLocation
          showUserHeading
        />
        <FullscreenControl position="top-right" />
        <ScaleControl />
        {items?.map((item) => (
          <Marker
            key={item.id}
            latitude={item.latitude}
            longitude={item.longitude}
            anchor="bottom"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-lg">
                {item.rank}
              </div>
              <div className="h-2 w-1 rounded-full bg-blue-700" />
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
