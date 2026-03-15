"use client";

import { useState, useRef, useEffect } from "react";
import Map, {
  NavigationControl,
  GeolocateControl,
  GeolocateControlInstance,
  Marker,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { UCI_LOCATION } from "@/lib/utils/location";
import useUserLocation from "@/lib/hooks/useUserLocation";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded?: () => void;
}

const itemTypes = [
  "wallet",
  "keys",
  "phone",
  "bag",
  "glasses",
  "jewelry",
  "electronics",
  "clothing",
  "other",
];

interface Toast {
  title: string;
  description: string;
  type: "success" | "error";
}

export function AddItemModal({
  isOpen,
  onClose,
  onItemAdded,
}: AddItemModalProps) {
  const { location } = useUserLocation();
  const geolocateRef = useRef<GeolocateControlInstance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const mapboxToken =
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? process.env.MAPBOX_TOKEN;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    email: "",
    image: "",
    islost: true,
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [viewState, setViewState] = useState({
    latitude: UCI_LOCATION.latitude,
    longitude: UCI_LOCATION.longitude,
    zoom: 15,
    bearing: 0,
    pitch: 0,
  });

  useEffect(() => {
    if (!selectedLocation && location) {
      setSelectedLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setViewState((prev) => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    }
  }, [location, selectedLocation]);

  const showToast = (title: string, description: string, type: "success" | "error") => {
    setToast({ title, description, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMapClick = (event: any) => {
    const { lngLat } = event;
    setSelectedLocation({
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLocation) {
      showToast(
        "Location required",
        "Please select a location on the map",
        "error"
      );
      return;
    }

    if (!formData.type) {
      showToast(
        "Item type required",
        "Please select an item type",
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        location: [
          selectedLocation.latitude.toString(),
          selectedLocation.longitude.toString(),
        ],
        date: now,
        itemdate: now,
        email: formData.email,
        image: formData.image || "",
        islost: formData.islost,
        isresolved: false,
        ishelped: false,
        is_deleted: false,
        foundby: null,
      };

      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      showToast(
        "Success!",
        "Item has been added successfully",
        "success"
      );

      setFormData({
        name: "",
        description: "",
        type: "",
        email: "",
        image: "",
        islost: true,
      });
      setSelectedLocation(null);
      onItemAdded?.();
      onClose();
    } catch (error) {
      showToast(
        "Error",
        "Failed to add item. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      type: "",
      email: "",
      image: "",
      islost: true,
    });
    setSelectedLocation(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {toast && (
        <div className="fixed top-4 right-4 z-[60] max-w-md">
          <div className={`p-4 rounded-lg shadow-lg ${
            toast.type === "success" 
              ? "bg-green-900 border border-green-700" 
              : "bg-red-900 border border-red-700"
          }`}>
            <h3 className="font-semibold text-white mb-1">{toast.title}</h3>
            <p className="text-sm text-zinc-300">{toast.description}</p>
          </div>
        </div>
      )}
      
      <div className="relative bg-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-zinc-700 shadow-2xl">
        <div className="sticky top-0 bg-zinc-800 z-10 flex items-center justify-between p-6 pb-4 border-b border-zinc-700">
          <h2 className="text-2xl font-bold text-white">
            Add Lost/Found Item
          </h2>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:bg-zinc-700 rounded-lg p-2 transition-colors"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
                Item Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Blue Wallet"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-zinc-600"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-zinc-300 mb-1">
                Item Type <span className="text-red-400">*</span>
              </label>
              <select
                id="type"
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-zinc-600"
              >
                <option value="" className="bg-zinc-800">Select item type</option>
                {itemTypes.map((type) => (
                  <option key={type} value={type} className="bg-zinc-800">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the item in detail..."
                rows={3}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-zinc-600 resize-none"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-zinc-600"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-zinc-300 mb-1">
                Image URL (Optional)
              </label>
              <input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-zinc-600"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-zinc-300 mb-1">
                Status <span className="text-red-400">*</span>
              </label>
              <select
                id="status"
                value={formData.islost ? "lost" : "found"}
                onChange={(e) =>
                  setFormData({ ...formData, islost: e.target.value === "lost" })
                }
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-zinc-600"
              >
                <option value="lost" className="bg-zinc-800">I Lost This Item</option>
                <option value="found" className="bg-zinc-800">I Found This Item</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Location <span className="text-red-400">*</span>
                {selectedLocation && (
                  <span className="text-blue-400 text-xs ml-2">
                    (Selected: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)})
                  </span>
                )}
              </label>
              <div className="text-xs text-zinc-500 mb-2">
                Click on the map to mark the location where the item was lost/found
              </div>
              {mapboxToken ? (
                <div className="h-[300px] rounded-lg overflow-hidden">
                  <Map
                    {...viewState}
                    onMove={(evt) => setViewState(evt.viewState)}
                    onClick={handleMapClick}
                    style={{ width: "100%", height: "100%" }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    mapboxAccessToken={mapboxToken}
                    cursor="crosshair"
                  >
                    <NavigationControl position="top-left" />
                    <GeolocateControl
                      ref={geolocateRef}
                      position="top-left"
                      trackUserLocation
                    />
                    {selectedLocation && (
                      <Marker
                        latitude={selectedLocation.latitude}
                        longitude={selectedLocation.longitude}
                        anchor="bottom"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
                          <div className="h-2 w-1 rounded-full bg-red-600" />
                        </div>
                      </Marker>
                    )}
                  </Map>
                </div>
              ) : (
                <div className="text-zinc-400 text-sm">Map unavailable</div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-zinc-800 border-t border-zinc-700 p-6 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-zinc-400 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
