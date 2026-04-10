import { InnerBlock, EmailBlock, GlobalEmailStyles, COLUMN_LAYOUTS, SOCIAL_NETWORKS } from "./types";
import { GripVertical, Trash2, Copy, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { innerBlockTypes } from "./types";
import { getInnerBlockIcon } from "./BlockSidebar";

interface BlockRendererProps {
  block: EmailBlock;
  isPreview?: boolean;
  globalStyles: GlobalEmailStyles;
  selectedBlock: string | null;
  selectedInner: { blockId: string; colIndex: number; innerId: string } | null;
  draggedBlockId: string | null;
  draggedInner: { blockId: string; colIndex: number; innerId: string } | null;
  innerDropTarget: { blockId: string; colIndex: number; innerIndex: number } | null;
  previewMode: "desktop" | "mobile";
  onBlockDragStart: (e: React.DragEvent, blockId: string) => void;
  onInnerBlockDragStart: (e: React.DragEvent, blockId: string, colIndex: number, innerId: string) => void;
  onColumnDragOver: (e: React.DragEvent, blockId: string, colIndex: number) => void;
  onColumnDrop: (e: React.DragEvent, blockId: string, colIndex: number) => void;
  onSelectBlock: (id: string) => void;
  onSelectInner: (data: { blockId: string; colIndex: number; innerId: string }) => void;
  onRemoveBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onRemoveInnerBlock: (blockId: string, colIndex: number, innerId: string) => void;
  onDuplicateInnerBlock: (blockId: string, colIndex: number, innerId: string) => void;
  onAddInnerBlock: (blockId: string, colIndex: number, type: any) => void;
  onResetDrag: () => void;
  onInlineEdit?: (blockId: string, field: string, value: string) => void;
  onInlineEditInner?: (blockId: string, colIndex: number, innerId: string, field: string, value: string) => void;
}

function renderSocialPreview(content: Record<string, string>) {
  const size = parseInt(content.iconSize || "24");
  const networks = SOCIAL_NETWORKS.filter(sn => content[sn.key]);
  const colors: Record<string, string> = { facebook: "#1877F2", instagram: "#E4405F", twitter: "#000", linkedin: "#0A66C2", youtube: "#FF0000" };
  return (
    <div style={{ textAlign: (content.align as any) || "center", padding: "8px 0" }}>
      {networks.map(sn => (
        <span key={sn.key} style={{ display: "inline-block", margin: "0 6px", fontSize: size, fontWeight: "bold", color: content.iconStyle === "color" ? colors[sn.key] : "#666" }}>
          {sn.label.charAt(0)}
        </span>
      ))}
      {networks.length === 0 && <span style={{ color: "#ccc", fontSize: 13 }}>Configurar redes sociales</span>}
    </div>
  );
}

function renderMenuPreview(content: Record<string, string>) {
  let items: { text: string; url: string }[] = [];
  try { items = JSON.parse(content.items || "[]"); } catch {}
  const sep = content.separator || "|";
  return (
    <div style={{ textAlign: (content.align as any) || "center", padding: "12px 0", fontSize: `${content.fontSize || 14}px` }}>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span style={{ color: "#ccc", margin: "0 8px" }}>{sep}</span>}
          <a href={item.url} style={{ color: content.color || "#3b82f6", textDecoration: "none" }}>{item.text}</a>
        </span>
      ))}
    </div>
  );
}

function InnerContent({ inner, globalStyles }: { inner: InnerBlock; globalStyles: GlobalEmailStyles }) {
  const c = inner.content;
  const pad = { paddingTop: `${c.paddingTop || 0}px`, paddingRight: `${c.paddingRight || 0}px`, paddingBottom: `${c.paddingBottom || 0}px`, paddingLeft: `${c.paddingLeft || 0}px` };

  switch (inner.type) {
    case "heading": {
      const Tag = (c.level || "h1") as keyof JSX.IntrinsicElements;
      return <Tag style={{ ...pad, textAlign: (c.align as any) || "left", fontSize: `${c.fontSize || 24}px`, fontWeight: c.bold === "true" ? "bold" : "normal", fontStyle: c.italic === "true" ? "italic" : "normal", color: c.color || "#1a1a2e", fontFamily: c.fontFamily || globalStyles.fontFamily, margin: 0 }}>{c.text}</Tag>;
    }
    case "text":
      return <p style={{ ...pad, fontSize: `${c.fontSize || 14}px`, lineHeight: c.lineHeight || "1.6", color: c.color || "#4a4a5a", margin: 0, fontFamily: globalStyles.fontFamily }}>{c.text}</p>;
    case "image": {
      const img = <img src={c.url} alt={c.alt || ""} style={{ width: `${c.width || 100}%`, borderRadius: `${c.borderRadius || 0}px`, display: "block", margin: "0 auto" }} />;
      return (
        <div style={{ ...pad, textAlign: (c.align as any) || "center" }}>
          {c.linkUrl ? <a href={c.linkUrl} target="_blank" rel="noopener noreferrer">{img}</a> : img}
          {c.caption && <p style={{ fontSize: "12px", color: "#999", margin: "4px 0 0" }}>{c.caption}</p>}
        </div>
      );
    }
    case "button": {
      const btnBg = c.style === "outline" ? "transparent" : c.bgColor || "#3b82f6";
      const btnColor = c.style === "outline" ? c.bgColor || "#3b82f6" : c.textColor || "#fff";
      const border = c.style === "outline" ? `2px solid ${c.bgColor || "#3b82f6"}` : "none";
      const radius = c.style === "pill" ? "25px" : `${c.borderRadius || 8}px`;
      const width = c.buttonWidth === "full" ? "100%" : "auto";
      return (
        <div style={{ ...pad, textAlign: (c.align as any) || "center" }}>
          <a href={c.url || "#"} style={{ display: width === "100%" ? "block" : "inline-block", width, padding: "12px 28px", backgroundColor: btnBg, color: btnColor, border, borderRadius: radius, textDecoration: "none", fontSize: `${c.fontSize || 14}px`, fontWeight: 600, textAlign: "center", fontFamily: globalStyles.fontFamily, boxSizing: "border-box" }}>{c.text}</a>
        </div>
      );
    }
    case "spacer":
      return <div style={{ height: `${c.height || 40}px` }} />;
    case "social":
      return renderSocialPreview(c);
    case "video":
      return (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <a href={c.url} target="_blank" rel="noopener noreferrer">
            <img src={c.thumbnailUrl || "https://placehold.co/600x340/1a1a2e/ffffff?text=▶"} alt="Video" style={{ width: "100%", borderRadius: "8px" }} />
          </a>
        </div>
      );
    default:
      return null;
  }
}

function BlockContent({ block, globalStyles }: { block: EmailBlock; globalStyles: GlobalEmailStyles }) {
  const c = block.content;
  switch (block.type) {
    case "heading":
    case "text":
    case "image":
    case "button":
    case "spacer":
    case "social":
    case "video":
      return <InnerContent inner={block as any} globalStyles={globalStyles} />;
    case "divider":
      return <hr style={{ border: "none", borderTop: `${c.thickness || 1}px ${c.lineStyle || "solid"} ${c.color || "#e5e7eb"}`, width: `${c.width || 100}%`, margin: `${c.paddingTop || 20}px auto ${c.paddingBottom || 20}px` }} />;
    case "footer":
      return (
        <div style={{ textAlign: "center", padding: "24px 16px", color: c.color || "#9ca3af", fontSize: `${c.fontSize || 12}px`, fontFamily: globalStyles.fontFamily }}>
          <p style={{ margin: "0 0 8px" }}>{c.text}</p>
          {c.address && <p style={{ margin: "0 0 8px" }}>{c.address}</p>}
          {c.showUnsubscribe === "true" && <a href="#" style={{ color: c.color || "#9ca3af", textDecoration: "underline" }}>{c.unsubscribeText || "Cancelar suscripción"}</a>}
        </div>
      );
    case "html":
      return <div dangerouslySetInnerHTML={{ __html: c.code || "" }} />;
    case "logo":
      return (
        <div style={{ textAlign: (c.align as any) || "center", padding: "16px 0" }}>
          <img src={c.url} alt={c.alt || ""} style={{ width: `${c.width || 200}px` }} />
          {c.companyName && <p style={{ fontSize: "14px", fontWeight: 600, margin: "8px 0 0", fontFamily: globalStyles.fontFamily }}>{c.companyName}</p>}
        </div>
      );
    case "menu":
      return renderMenuPreview(c);
    default:
      return null;
  }
}

export function BlockRenderer(props: BlockRendererProps) {
  const { block, isPreview, globalStyles, selectedBlock, selectedInner, draggedBlockId, draggedInner, innerDropTarget, previewMode } = props;

  if (isPreview) {
    if (block.type === "columns") {
      const layout = COLUMN_LAYOUTS.find(l => l.value === (block.content.layout || "50-50")) || COLUMN_LAYOUTS[0];
      const isMobile = previewMode === "mobile";
      return (
        <div style={{ display: isMobile ? "block" : "flex", gap: `${block.content.gap || 16}px`, padding: `${block.content.paddingTop || 12}px 0 ${block.content.paddingBottom || 12}px` }}>
          {block.columns?.map((col, ci) => (
            <div key={ci} style={{ width: isMobile ? "100%" : `${layout.widths[ci]}%`, marginBottom: isMobile ? "16px" : 0 }}>
              {col.map(inner => <InnerContent key={inner.id} inner={inner} globalStyles={globalStyles} />)}
            </div>
          ))}
        </div>
      );
    }
    return <BlockContent block={block} globalStyles={globalStyles} />;
  }

  // Edit mode
  if (block.type === "columns") {
    const layout = COLUMN_LAYOUTS.find(l => l.value === (block.content.layout || "50-50")) || COLUMN_LAYOUTS[0];
    return (
      <div style={{ display: "flex", gap: `${block.content.gap || 16}px`, padding: `${block.content.paddingTop || 12}px 0 ${block.content.paddingBottom || 12}px` }}>
        {block.columns?.map((col, ci) => (
          <div
            key={ci}
            style={{ width: `${layout.widths[ci]}%` }}
            onDragOver={(e) => props.onColumnDragOver(e, block.id, ci)}
            onDrop={(e) => props.onColumnDrop(e, block.id, ci)}
            className={`rounded-lg border-2 border-dashed p-2 min-h-[80px] transition-colors ${
              innerDropTarget?.blockId === block.id && innerDropTarget?.colIndex === ci
                ? "border-primary/50 bg-primary/5"
                : "border-border/40 bg-muted/20"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {col.map((inner, innerIdx) => (
              <div key={inner.id}>
                {innerDropTarget?.blockId === block.id && innerDropTarget?.colIndex === ci && innerDropTarget?.innerIndex === innerIdx && (
                  <div className="h-0.5 bg-primary rounded-full mx-1 my-0.5 animate-pulse" />
                )}
                <div
                  data-inner-id={inner.id}
                  draggable
                  onDragStart={(e) => props.onInnerBlockDragStart(e, block.id, ci, inner.id)}
                  onDragEnd={props.onResetDrag}
                  onClick={(e) => { e.stopPropagation(); props.onSelectInner({ blockId: block.id, colIndex: ci, innerId: inner.id }); }}
                  className={`group/inner relative rounded-md transition-all cursor-pointer ${
                    draggedInner?.innerId === inner.id ? "opacity-30" : ""
                  } ${
                    selectedInner?.innerId === inner.id ? "ring-2 ring-primary/70 shadow-sm" : "hover:ring-1 hover:ring-border"
                  }`}
                >
                  <div className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/inner:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <InnerContent inner={inner} globalStyles={globalStyles} />
                  <div className="absolute -right-2 -top-2 flex gap-0.5 opacity-0 group-hover/inner:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); props.onDuplicateInnerBlock(block.id, ci, inner.id); }} className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                      <Copy className="w-2.5 h-2.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); props.onRemoveInnerBlock(block.id, ci, inner.id); }} className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {innerDropTarget?.blockId === block.id && innerDropTarget?.colIndex === ci && innerDropTarget?.innerIndex === col.length && (
              <div className="h-0.5 bg-primary rounded-full mx-1 my-0.5 animate-pulse" />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full mt-1 py-1.5 rounded-md border border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors flex items-center justify-center gap-1 text-xs">
                  <Plus className="w-3 h-3" /> Agregar
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {innerBlockTypes.map((bt) => {
                  const Icon = getInnerBlockIcon(bt.icon);
                  return (
                    <DropdownMenuItem key={bt.type} onClick={() => props.onAddInnerBlock(block.id, ci, bt.type)}>
                      <Icon className="w-3.5 h-3.5 mr-2" /> {bt.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    );
  }

  return <BlockContent block={block} globalStyles={globalStyles} />;
}
