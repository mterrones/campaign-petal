import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type AppliedFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

type AppliedFilterChipsProps = {
  chips: AppliedFilterChip[];
  onClearAll?: () => void;
};

const AppliedFilterChips = ({ chips, onClearAll }: AppliedFilterChipsProps) => {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 pr-1">
          {chip.label}
          <button
            type="button"
            aria-label={`Quitar filtro ${chip.label}`}
            className="rounded-full p-0.5 hover:bg-background/60"
            onClick={chip.onRemove}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {chips.length > 1 && onClearAll && (
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          onClick={onClearAll}
        >
          Limpiar todo
        </button>
      )}
    </div>
  );
};

export default AppliedFilterChips;
