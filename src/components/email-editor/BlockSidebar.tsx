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
    <div className="w-[88px] flex flex-col gap-1.5 sticky top-8">
      <p className="text-[10px] text-muted-foreground text-center font-medium uppercase tracking-wider mb-1">Bloques</p>
      {blockTypes.map((bt) => {
        const Icon = iconMap[bt.icon] || Type;
        return (
          <div
            key={bt.type}
            draggable
            onDragStart={(e) => onDragStart(e, bt.type)}
            onDragEnd={onDragEnd}
            className="w-[80px] h-[56px] rounded-lg bg-card border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none"
            title={`Arrastra "${bt.label}" al editor`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[9px] font-medium leading-tight">{bt.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function getInnerBlockIcon(iconName: string) {
  return iconMap[iconName] || Type;
}
