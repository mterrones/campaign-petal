import { Type, AlignLeft, Image, Square, Minus, Columns, ArrowUpDown, Share2, FileText, Play, Code, Menu } from "lucide-react";
import { BlockType, blockTypes, innerBlockTypes, InnerBlockType } from "./types";

const iconMap: Record<string, React.ElementType> = {
  Type, AlignLeft, Image, Square, Minus, Columns, ArrowUpDown, Share2, FileText, Play, Code, Menu,
};

interface BlockSidebarProps {
  onDragStart: (e: React.DragEvent, type: BlockType) => void;
  onDragEnd: () => void;
}

export function BlockSidebar({ onDragStart, onDragEnd }: BlockSidebarProps) {
  return (
    <div className="w-[100px] flex flex-col gap-2 sticky top-8 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
      <p className="text-xs text-muted-foreground text-center font-medium uppercase tracking-wider mb-1">Bloques</p>
      {blockTypes.map((bt) => {
        const Icon = iconMap[bt.icon] || Type;
        return (
          <div
            key={bt.type}
            draggable
            onDragStart={(e) => onDragStart(e, bt.type)}
            onDragEnd={onDragEnd}
            className="w-[92px] h-[72px] rounded-lg bg-card border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none"
            title={`Arrastra "${bt.label}" al editor`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium leading-tight">{bt.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function getInnerBlockIcon(iconName: string) {
  return iconMap[iconName] || Type;
}
