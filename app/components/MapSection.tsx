import { UciMap } from "@/app/components/UciMap";
import { RankedItem } from "@/app/page";
import { Building } from "@/lib/utils/buildings";

interface MapSectionProps {
  items: RankedItem[];
  selectedBuilding: Building | null;
  locationStale?: boolean;
}

export function MapSection({ items, selectedBuilding, locationStale }: MapSectionProps) {
  return (
    <div className="w-full lg:w-1/2 p-4 lg:p-8 h-64 lg:h-full">
      <UciMap
        height="100%"
        className="h-full"
        items={items}
        selectedBuilding={selectedBuilding}
        locationStale={locationStale}
      />
    </div>
  );
}
