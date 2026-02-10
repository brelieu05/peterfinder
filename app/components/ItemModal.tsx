"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { RankedItem } from "../page";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RankedItem | null;
}

export function ItemModal({ isOpen, onClose, item }: ItemModalProps) {
  if (!item) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent bg="#18181b" borderRadius="xl" mx={4} border="1px solid #27272a">
        <ModalHeader fontSize="2xl" fontWeight="bold" color="white" pb={2}>
          {item.name}
        </ModalHeader>
        <ModalCloseButton
          color="#a1a1aa"
          _hover={{ bg: "#27272a" }}
        />
        <ModalBody pb={6}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900">
                <span className="text-xl font-bold text-blue-300">
                  #{item.rank}
                </span>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Ranking</p>
                <p className="text-xs text-zinc-500">
                  Based on distance and recency
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-300 mb-1">
                Item Type
              </p>
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-900 text-blue-300 capitalize">
                {item.itemType}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-300 mb-1">
                Description
              </p>
              <p className="text-sm text-zinc-400">{item.description}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-300 mb-1">
                Distance from You
              </p>
              <p className="text-sm text-zinc-400">
                {item.distance.toFixed(2)} km away
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-300 mb-1">Lost At</p>
              <p className="text-sm text-zinc-400">{formatDate(item.lostAt)}</p>
              <p className="text-xs text-zinc-500 mt-1">
                {item.hoursSinceLost.toFixed(0)} hours ago
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-300 mb-1">Location</p>
              <p className="text-sm text-zinc-400 font-mono">
                {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
