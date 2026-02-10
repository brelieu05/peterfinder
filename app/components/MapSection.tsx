import { UciMap } from "@/app/components/UciMap";
import { RankedItem } from "@/app/page";

interface MapSectionProps {
  items: RankedItem[];
  hasLocation: boolean;
}

export function MapSection({ items, hasLocation }: MapSectionProps) {
  return (
    <div className="w-full lg:w-1/2 p-4 lg:p-8 h-64 lg:h-full">
      <UciMap
        height="100%"
        className="h-full"
        items={hasLocation ? items : []}
      />
    </div>
  );
}
