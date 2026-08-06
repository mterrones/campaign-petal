import { ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DELIVERY_STATUS_OPTIONS } from "./deliveryStatusMeta";

type StatusFacetFilterProps = {
  selected: string[];
  onChange: (next: string[]) => void;
};

const StatusFacetFilter = ({ selected, onChange }: StatusFacetFilterProps) => {
  const selectedSet = new Set(selected);

  const toggle = (value: string) => {
    const next = new Set(selectedSet);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onChange(
      DELIVERY_STATUS_OPTIONS.filter((option) => next.has(option.value)).map(
        (option) => option.value,
      ),
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <ListFilter className="h-4 w-4" />
          Estado
          {selected.length > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
              {selected.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-medium">Filtrar por estado</span>
          {selected.length > 0 && (
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => onChange([])}
            >
              Limpiar
            </button>
          )}
        </div>
        <div className="space-y-0.5">
          {DELIVERY_STATUS_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Checkbox
                checked={selectedSet.has(option.value)}
                onCheckedChange={() => toggle(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StatusFacetFilter;
