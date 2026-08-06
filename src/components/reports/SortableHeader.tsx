import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  MessageSort,
  MessageSortDir,
  MessageSortField,
} from "@/lib/platformReports";

type SortableHeaderProps = {
  field: MessageSortField;
  label: string;
  sort?: MessageSort;
  onSort: (sort: MessageSort) => void;
  align?: "left" | "right";
  className?: string;
};

const SortableHeader = ({
  field,
  label,
  sort,
  onSort,
  align = "left",
  className,
}: SortableHeaderProps) => {
  const isActive = sort?.field === field;
  const nextDir: MessageSortDir =
    isActive && sort?.dir === "desc" ? "asc" : "desc";

  return (
    <TableHead className={cn(align === "right" && "text-right", className)}>
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground transition-colors",
          align === "right" && "flex-row-reverse",
          isActive ? "text-foreground" : "text-muted-foreground",
        )}
        onClick={() => onSort({ field, dir: nextDir })}
      >
        {label}
        {isActive ? (
          sort?.dir === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
        )}
      </button>
    </TableHead>
  );
};

export default SortableHeader;
