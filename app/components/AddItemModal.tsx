"use client";

import { useState, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
} from "@chakra-ui/react";
import Map, {
  NavigationControl,
  GeolocateControl,
  GeolocateControlInstance,
  Marker,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { UCI_LOCATION } from "@/lib/utils/location";

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

export function AddItemModal({
  isOpen,
  onClose,
  onItemAdded,
}: AddItemModalProps) {
  const toast = useToast();
  const geolocateRef = useRef<GeolocateControlInstance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast({
        title: "Location required",
        description: "Please select a location on the map",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.type) {
      toast({
        title: "Item type required",
        description: "Please select an item type",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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

      toast({
        title: "Success!",
        description: "Item has been added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

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
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent overflowY="auto" bg="#27272a" borderRadius="xl" mx={4} border="2px solid #3f3f46" maxH="90vh" boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)">
        <ModalHeader fontSize="2xl" fontWeight="bold" color="white">
          Add Lost/Found Item
        </ModalHeader>
        <ModalCloseButton color="#a1a1aa" _hover={{ bg: "#27272a" }} />
        
        <form onSubmit={handleSubmit}>
          <ModalBody pb={6} overflowY="auto">
            <div className="space-y-4">
              <FormControl isRequired>
                <FormLabel color="#d4d4d8" fontSize="sm" fontWeight="medium">
                  Item Name
                </FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Blue Wallet"
                  bg="#27272a"
                  border="1px solid #3f3f46"
                  color="white"
                  _placeholder={{ color: "#71717a" }}
                  _hover={{ borderColor: "#52525b" }}
                  _focus={{ borderColor: "#3b82f6", boxShadow: "0 0 0 1px #3b82f6" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="#d4d4d8" fontSize="sm" fontWeight="medium">
                  Item Type
                </FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  placeholder="Select item type"
                  bg="#27272a"
                  border="1px solid #3f3f46"
                  color="white"
                  _placeholder={{ color: "#71717a" }}
                  _hover={{ borderColor: "#52525b" }}
                  _focus={{ borderColor: "#3b82f6", boxShadow: "0 0 0 1px #3b82f6" }}
                >
                  {itemTypes.map((type) => (
                    <option key={type} value={type} style={{ background: "#27272a" }}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="#d4d4d8" fontSize="sm" fontWeight="medium">
                  Description
                </FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the item in detail..."
                  bg="#27272a"
                  border="1px solid #3f3f46"
                  color="white"
                  _placeholder={{ color: "#71717a" }}
                  _hover={{ borderColor: "#52525b" }}
                  _focus={{ borderColor: "#3b82f6", boxShadow: "0 0 0 1px #3b82f6" }}
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="#d4d4d8" fontSize="sm" fontWeight="medium">
                  Email
                </FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your.email@example.com"
                  bg="#27272a"
                  border="1px solid #3f3f46"
                  color="white"
                  _placeholder={{ color: "#71717a" }}
                  _hover={{ borderColor: "#52525b" }}
                  _focus={{ borderColor: "#3b82f6", boxShadow: "0 0 0 1px #3b82f6" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="#d4d4d8" fontSize="sm" fontWeight="medium">
                  Image URL (Optional)
                </FormLabel>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  bg="#27272a"
                  border="1px solid #3f3f46"
                  color="white"
                  _placeholder={{ color: "#71717a" }}
                  _hover={{ borderColor: "#52525b" }}
                  _focus={{ borderColor: "#3b82f6", boxShadow: "0 0 0 1px #3b82f6" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="#d4d4d8" fontSize="sm" fontWeight="medium">
                  Status
                </FormLabel>
                <Select
                  value={formData.islost ? "lost" : "found"}
                  onChange={(e) =>
                    setFormData({ ...formData, islost: e.target.value === "lost" })
                  }
                  bg="#27272a"
                  border="1px solid #3f3f46"
                  color="white"
                  _hover={{ borderColor: "#52525b" }}
                  _focus={{ borderColor: "#3b82f6", boxShadow: "0 0 0 1px #3b82f6" }}
                >
                  <option value="lost" style={{ background: "#27272a" }}>I Lost This Item</option>
                  <option value="found" style={{ background: "#27272a" }}>I Found This Item</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="#d4d4d8" fontSize="sm" fontWeight="medium" mb={2}>
                  Location {selectedLocation && <span className="text-blue-400 text-xs">(Selected: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)})</span>}
                </FormLabel>
                <div className="text-xs text-zinc-500 mb-2">
                  Click on the map to mark the location where the item was lost/found
                </div>
                {mapboxToken ? (
                  <div style={{ height: "300px", borderRadius: "0.5rem", overflow: "hidden" }}>
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
              </FormControl>
            </div>
          </ModalBody>

          <ModalFooter borderTop="1px solid #27272a" gap={3}>
            <Button
              variant="ghost"
              onClick={handleClose}
              color="#a1a1aa"
              _hover={{ bg: "#27272a" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              bg="#3b82f6"
              color="white"
              _hover={{ bg: "#2563eb" }}
              _active={{ bg: "#1d4ed8" }}
              isLoading={isSubmitting}
              loadingText="Adding..."
            >
              Add Item
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
