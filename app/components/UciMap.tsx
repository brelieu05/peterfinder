"use client";

import { useRef, useState, useEffect } from "react";
import Map, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  GeolocateControlInstance,
  Marker,
  MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { onCampus, UCI_LOCATION } from "@/lib/utils/location";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { RankedItem } from "../page";
import { ItemModal } from "./ItemModal";
import { Building } from "@/lib/utils/buildings";

type UciMapProps = {
  className?: string;
  height?: string | number;
  mapStyle?: string;
  zoom?: number;
  items?: RankedItem[];
  selectedBuilding?: Building | null;
};

export function UciMap({
  className,
  height = 400,
  mapStyle = "mapbox://styles/mapbox/streets-v12",
  zoom = 15,
  items,
  selectedBuilding,
}: UciMapProps) {
  const geolocateRef = useRef<GeolocateControlInstance | null>(null);
  const mapRef = useRef<MapRef | null>(null);
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

  const [selectedItem, setSelectedItem] = useState<RankedItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fly to selected building when it changes
  useEffect(() => {
    if (selectedBuilding && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedBuilding.lng, selectedBuilding.lat],
        zoom: 17,
        duration: 2000, // 2 second animation
      });
    }
  }, [selectedBuilding]);

  const handleMarkerClick = (item: RankedItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

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
        ref={mapRef}
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
        
        {/* Selected Building Label */}
        {selectedBuilding && (
          <Marker
            latitude={selectedBuilding.lat}
            longitude={selectedBuilding.lng}
            anchor="center"
          >
            <div className="px-2 py-1 bg-green-600 rounded-lg shadow-lg text-sm font-semibold text-white whitespace-nowrap border-2 border-white">
              {selectedBuilding.name}
            </div>
          </Marker>
        )}
        
        {/* Item Markers */}
        {items?.map((item) => (
          <Marker
            key={item.id}
            latitude={item.latitude}
            longitude={item.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(item);
            }}
          >
            <div
              className="flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-110"
              role="button"
              tabIndex={0}
              onClick={() => handleMarkerClick(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleMarkerClick(item);
                }
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-lg hover:bg-blue-700 transition-colors">
                {item.rank}
              </div>
              <div className="h-2 w-1 rounded-full bg-blue-700" />
            </div>
          </Marker>
        ))}
      </Map>
      <ItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItem}
      />
    </div>
  );
}
