import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Type, Image, Minus, Square, Columns, Eye, Save, Send, GripVertical, Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BlockType = "heading" | "text" | "image" | "button" | "divider" | "columns";
type InnerBlockType = Exclude<BlockType, "columns" | "divider">;

interface InnerBlock {
  id: string;
  type: InnerBlockType;
  content: Record<string, string>;
}

interface EmailBlock {
  id: string;
  type: BlockType;
  content: Record<string, string>;
  columns?: InnerBlock[][]; // columns[0] = left column blocks, columns[1] = right column blocks
}

const blockTypes: { type: BlockType; icon: React.ElementType; label: string }[] = [
  { type: "heading", icon: Type, label: "Título" },
  { type: "text", icon: Type, label: "Texto" },
  { type: "image", icon: Image, label: "Imagen" },
  { type: "button", icon: Square, label: "Botón" },
  { type: "divider", icon: Minus, label: "Separador" },
  { type: "columns", icon: Columns, label: "Columnas" },
];

const innerBlockTypes: { type: InnerBlockType; icon: React.ElementType; label: string }[] = [
  { type: "heading", icon: Type, label: "Título" },
  { type: "text", icon: Type, label: "Texto" },
  { type: "image", icon: Image, label: "Imagen" },
  { type: "button", icon: Square, label: "Botón" },
];

const defaultContent: Record<string, Record<string, string>> = {
  heading: { text: "Título principal", align: "center" },
  text: { text: "Escribe tu contenido aquí. Puedes agregar párrafos, enlaces y más." },
  image: { url: "https://placehold.co/600x200/3b82f6/ffffff?text=Tu+Imagen", alt: "Imagen" },
  button: { text: "Click Aquí", url: "#", align: "center" },
  divider: {},
};

const EmailEditor = () => {
  const [blocks, setBlocks] = useState<EmailBlock[]>([
    { id: "1", type: "image", content: { url: "https://placehold.co/600x120/3b82f6/ffffff?text=MailFlow", alt: "Header" } },
    { id: "2", type: "heading", content: { text: "¡Bienvenido a nuestro Newsletter!", align: "center" } },
    { id: "3", type: "text", content: { text: "Estamos encantados de tenerte aquí. Descubre las últimas novedades y mantente al día con las mejores ofertas." } },
    { id: "4", type: "columns", content: {}, columns: [
      [
        { id: "4a", type: "image", content: { url: "https://placehold.co/280x150/3b82f6/ffffff?text=Producto+1", alt: "Producto 1" } },
        { id: "4b", type: "text", content: { text: "Descubre nuestro producto estrella con descuento especial." } },
        { id: "4c", type: "button", content: { text: "Comprar", url: "#", align: "center" } },
      ],
      [
        { id: "4d", type: "image", content: { url: "https://placehold.co/280x150/10b981/ffffff?text=Producto+2", alt: "Producto 2" } },
        { id: "4e", type: "text", content: { text: "Nuevo lanzamiento disponible solo por tiempo limitado." } },
        { id: "4f", type: "button", content: { text: "Ver Más", url: "#", align: "center" } },
      ],
    ]},
    { id: "5", type: "divider", content: {} },
    { id: "6", type: "text", content: { text: "Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!" } },
  ]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedInner, setSelectedInner] = useState<{ blockId: string; colIndex: number; innerId: string } | null>(null);
  const [subject, setSubject] = useState("¡Novedades de este mes!");
  const [previewName, setPreviewName] = useState("Newsletter Abril");
  const [activeTab, setActiveTab] = useState("edit");

  // Drag & Drop state
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [draggedNewType, setDraggedNewType] = useState<BlockType | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  // Inner column drag state
  const [draggedInner, setDraggedInner] = useState<{ blockId: string; colIndex: number; innerId: string } | null>(null);
  const [draggedInnerNewType, setDraggedInnerNewType] = useState<InnerBlockType | null>(null);
  const [innerDropTarget, setInnerDropTarget] = useState<{ blockId: string; colIndex: number; innerIndex: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- Top-level block operations ---
  const addBlock = (type: BlockType, atIndex?: number) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content: type === "columns" ? {} : { ...defaultContent[type] },
      ...(type === "columns" ? { columns: [[], []] } : {}),
    };
    const newBlocks = [...blocks];
    if (atIndex !== undefined) {
      newBlocks.splice(atIndex, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    setBlocks(newBlocks);
    setSelectedBlock(newBlock.id);
    setSelectedInner(null);
  };

  const updateBlock = (id: string, content: Record<string, string>) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlock === id) { setSelectedBlock(null); setSelectedInner(null); }
  };

  // --- Inner block operations ---
  const addInnerBlock = (blockId: string, colIndex: number, type: InnerBlockType, atIndex?: number) => {
    setBlocks(blocks.map((b) => {
      if (b.id !== blockId || !b.columns) return b;
      const newCols = b.columns.map((col, ci) => {
        if (ci !== colIndex) return col;
        const newInner: InnerBlock = { id: Date.now().toString() + Math.random(), type, content: { ...defaultContent[type] } };
        const newCol = [...col];
        if (atIndex !== undefined) {
          newCol.splice(atIndex, 0, newInner);
        } else {
          newCol.push(newInner);
        }
        setSelectedInner({ blockId, colIndex, innerId: newInner.id });
        setSelectedBlock(null);
        return newCol;
      });
      return { ...b, columns: newCols };
    }));
  };

  const updateInnerBlock = (blockId: string, colIndex: number, innerId: string, content: Record<string, string>) => {
    setBlocks(blocks.map((b) => {
      if (b.id !== blockId || !b.columns) return b;
      const newCols = b.columns.map((col, ci) => {
        if (ci !== colIndex) return col;
        return col.map((inner) => inner.id === innerId ? { ...inner, content } : inner);
      });
      return { ...b, columns: newCols };
    }));
  };

  const removeInnerBlock = (blockId: string, colIndex: number, innerId: string) => {
    setBlocks(blocks.map((b) => {
      if (b.id !== blockId || !b.columns) return b;
      const newCols = b.columns.map((col, ci) => {
        if (ci !== colIndex) return col;
        return col.filter((inner) => inner.id !== innerId);
      });
      return { ...b, columns: newCols };
    }));
    if (selectedInner?.innerId === innerId) setSelectedInner(null);
  };

  // --- Drag from sidebar (new block) ---
  const handleSidebarDragStart = (e: React.DragEvent, type: BlockType) => {
    setDraggedNewType(type);
    setDraggedBlockId(null);
    setDraggedInner(null);
    setDraggedInnerNewType(null);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", type);
  };

  // --- Drag existing block (reorder) ---
  const handleBlockDragStart = (e: React.DragEvent, blockId: string) => {
    e.stopPropagation();
    setDraggedBlockId(blockId);
    setDraggedNewType(null);
    setDraggedInner(null);
    setDraggedInnerNewType(null);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", blockId);
  };

  // --- Drag inner block (reorder within column) ---
  const handleInnerBlockDragStart = (e: React.DragEvent, blockId: string, colIndex: number, innerId: string) => {
    e.stopPropagation();
    setDraggedInner({ blockId, colIndex, innerId });
    setDraggedBlockId(null);
    setDraggedNewType(null);
    setDraggedInnerNewType(null);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", innerId);
  };

  // --- Canvas drop zone ---
  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (draggedInner || draggedInnerNewType) return; // inner drag, don't affect canvas
    e.dataTransfer.dropEffect = draggedNewType ? "copy" : "move";

    const canvas = canvasRef.current;
    if (!canvas) return;

    const blockElements = canvas.querySelectorAll("[data-block-id]");
    let newDropIndex = blocks.length;

    for (let i = 0; i < blockElements.length; i++) {
      const rect = blockElements[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        newDropIndex = i;
        break;
      }
    }
    setDropIndex(newDropIndex);
  }, [blocks.length, draggedNewType, draggedInner, draggedInnerNewType]);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (draggedInner || draggedInnerNewType) return;
    const targetIndex = dropIndex ?? blocks.length;

    if (draggedNewType) {
      addBlock(draggedNewType, targetIndex);
    } else if (draggedBlockId) {
      const fromIndex = blocks.findIndex((b) => b.id === draggedBlockId);
      if (fromIndex === -1) return;
      const newBlocks = [...blocks];
      const [moved] = newBlocks.splice(fromIndex, 1);
      const adjustedIndex = targetIndex > fromIndex ? targetIndex - 1 : targetIndex;
      newBlocks.splice(adjustedIndex, 0, moved);
      setBlocks(newBlocks);
    }

    resetDragState();
  }, [dropIndex, draggedNewType, draggedBlockId, blocks, draggedInner, draggedInnerNewType]);

  // --- Column drop zone ---
  const handleColumnDragOver = (e: React.DragEvent, blockId: string, colIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Accept inner drags or new non-column types dropped into columns
    const isInnerDrag = !!draggedInner;
    const isNewTypeForColumn = draggedNewType && draggedNewType !== "columns" && draggedNewType !== "divider";
    if (!isInnerDrag && !isNewTypeForColumn) return;

    e.dataTransfer.dropEffect = isInnerDrag ? "move" : "copy";

    const block = blocks.find((b) => b.id === blockId);
    if (!block?.columns) return;
    const col = block.columns[colIndex];

    const target = e.currentTarget as HTMLElement;
    const innerEls = target.querySelectorAll("[data-inner-id]");
    let newIndex = col.length;

    for (let i = 0; i < innerEls.length; i++) {
      const rect = innerEls[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        newIndex = i;
        break;
      }
    }

    setInnerDropTarget({ blockId, colIndex, innerIndex: newIndex });
    setDropIndex(null);
  };

  const handleColumnDrop = (e: React.DragEvent, blockId: string, colIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const targetIdx = innerDropTarget?.innerIndex ?? 0;

    if (draggedInner) {
      // Move inner block (possibly across columns)
      setBlocks(prev => {
        const newBlocks = prev.map(b => {
          if (b.id !== draggedInner.blockId && b.id !== blockId) return b;
          return { ...b, columns: b.columns?.map((col, ci) => [...col]) };
        });

        // Remove from source
        const srcBlock = newBlocks.find(b => b.id === draggedInner.blockId);
        if (!srcBlock?.columns) return prev;
        const srcCol = srcBlock.columns[draggedInner.colIndex];
        const srcIdx = srcCol.findIndex(i => i.id === draggedInner.innerId);
        if (srcIdx === -1) return prev;
        const [moved] = srcCol.splice(srcIdx, 1);

        // Insert at target
        const tgtBlock = newBlocks.find(b => b.id === blockId);
        if (!tgtBlock?.columns) return prev;
        const tgtCol = tgtBlock.columns[colIndex];
        const adjustedIdx = (draggedInner.blockId === blockId && draggedInner.colIndex === colIndex && targetIdx > srcIdx)
          ? targetIdx - 1 : targetIdx;
        tgtCol.splice(adjustedIdx, 0, moved);

        return newBlocks;
      });
    } else if (draggedNewType && draggedNewType !== "columns" && draggedNewType !== "divider") {
      addInnerBlock(blockId, colIndex, draggedNewType as InnerBlockType, targetIdx);
    }

    resetDragState();
  };

  const resetDragState = () => {
    setDraggedBlockId(null);
    setDraggedNewType(null);
    setDropIndex(null);
    setDraggedInner(null);
    setDraggedInnerNewType(null);
    setInnerDropTarget(null);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    if (canvasRef.current && !canvasRef.current.contains(e.relatedTarget as Node)) {
      setDropIndex(null);
    }
  };

  // --- Render blocks ---
  const renderInnerContent = (inner: InnerBlock) => {
    switch (inner.type) {
      case "heading":
        return (
          <h2 style={{ textAlign: (inner.content.align as any) || "left", fontSize: "18px", fontWeight: "bold", margin: "8px 0", color: "#1a1a2e" }}>
            {inner.content.text}
          </h2>
        );
      case "text":
        return (
          <p style={{ fontSize: "13px", lineHeight: "1.5", color: "#4a4a5a", margin: "8px 0" }}>
            {inner.content.text}
          </p>
        );
      case "image":
        return (
          <img src={inner.content.url} alt={inner.content.alt} style={{ width: "100%", borderRadius: "6px", margin: "8px 0" }} />
        );
      case "button":
        return (
          <div style={{ textAlign: (inner.content.align as any) || "center", margin: "8px 0" }}>
            <a href={inner.content.url} style={{
              display: "inline-block", padding: "10px 20px", backgroundColor: "hsl(217, 91%, 60%)",
              color: "#ffffff", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "600",
            }}>
              {inner.content.text}
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  const renderBlock = (block: EmailBlock, isPreview = false) => {
    switch (block.type) {
      case "heading":
        return (
          <h1 style={{ textAlign: (block.content.align as any) || "left", fontSize: "24px", fontWeight: "bold", margin: "16px 0", color: "#1a1a2e" }}>
            {block.content.text}
          </h1>
        );
      case "text":
        return (
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4a4a5a", margin: "12px 0" }}>
            {block.content.text}
          </p>
        );
      case "image":
        return (
          <img src={block.content.url} alt={block.content.alt} style={{ width: "100%", borderRadius: "8px", margin: "12px 0" }} />
        );
      case "button":
        return (
          <div style={{ textAlign: (block.content.align as any) || "center", margin: "16px 0" }}>
            <a href={block.content.url} style={{
              display: "inline-block", padding: "12px 28px", backgroundColor: "hsl(217, 91%, 60%)",
              color: "#ffffff", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "600",
            }}>
              {block.content.text}
            </a>
          </div>
        );
      case "divider":
        return <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />;
      case "columns":
        if (isPreview) {
          return (
            <div style={{ display: "flex", gap: "16px", margin: "12px 0" }}>
              {block.columns?.map((col, ci) => (
                <div key={ci} style={{ flex: 1 }}>
                  {col.map((inner) => (
                    <div key={inner.id}>{renderInnerContent(inner)}</div>
                  ))}
                </div>
              ))}
            </div>
          );
        }
        return (
          <div style={{ display: "flex", gap: "12px", margin: "12px 0" }}>
            {block.columns?.map((col, ci) => (
              <div
                key={ci}
                onDragOver={(e) => handleColumnDragOver(e, block.id, ci)}
                onDrop={(e) => handleColumnDrop(e, block.id, ci)}
                className={`flex-1 rounded-lg border-2 border-dashed p-2 min-h-[80px] transition-colors ${
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
                      onDragStart={(e) => handleInnerBlockDragStart(e, block.id, ci, inner.id)}
                      onDragEnd={resetDragState}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInner({ blockId: block.id, colIndex: ci, innerId: inner.id });
                        setSelectedBlock(null);
                      }}
                      className={`group/inner relative rounded-md transition-all cursor-pointer ${
                        draggedInner?.innerId === inner.id ? "opacity-30" : ""
                      } ${
                        selectedInner?.innerId === inner.id
                          ? "ring-2 ring-primary/70 shadow-sm"
                          : "hover:ring-1 hover:ring-border"
                      }`}
                    >
                      <div className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/inner:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-3 h-3 text-muted-foreground" />
                      </div>
                      {renderInnerContent(inner)}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeInnerBlock(block.id, ci, inner.id); }}
                        className="absolute -right-2 -top-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground items-center justify-center text-xs opacity-0 group-hover/inner:opacity-100 transition-opacity hidden group-hover/inner:flex"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {innerDropTarget?.blockId === block.id && innerDropTarget?.colIndex === ci && innerDropTarget?.innerIndex === col.length && (
                  <div className="h-0.5 bg-primary rounded-full mx-1 my-0.5 animate-pulse" />
                )}
                {/* Add block button for column */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full mt-1 py-1.5 rounded-md border border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors flex items-center justify-center gap-1 text-xs">
                      <Plus className="w-3 h-3" /> Agregar
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {innerBlockTypes.map((bt) => (
                      <DropdownMenuItem key={bt.type} onClick={() => addInnerBlock(block.id, ci, bt.type)}>
                        <bt.icon className="w-3.5 h-3.5 mr-2" /> {bt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const selectedBlockData = blocks.find((b) => b.id === selectedBlock);
  const selectedInnerData = selectedInner
    ? blocks.find((b) => b.id === selectedInner.blockId)?.columns?.[selectedInner.colIndex]?.find((i) => i.id === selectedInner.innerId)
    : null;

  const DropIndicator = () => (
    <div className="h-1 bg-primary rounded-full mx-2 my-1 transition-all animate-pulse" />
  );

  // --- Properties panel content ---
  const renderProperties = () => {
    if (selectedInnerData && selectedInner) {
      return (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {innerBlockTypes.find((b) => b.type === selectedInnerData.type)?.label} (columna)
          </p>
          {renderBlockProperties(selectedInnerData, (content) => updateInnerBlock(selectedInner.blockId, selectedInner.colIndex, selectedInner.innerId, content))}
        </div>
      );
    }
    if (selectedBlockData) {
      if (selectedBlockData.type === "columns") {
        return (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Columnas</p>
            <p className="text-xs text-muted-foreground">Seleccioná un elemento dentro de las columnas para editarlo, o arrastrá bloques del panel izquierdo.</p>
          </div>
        );
      }
      return (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {blockTypes.find((b) => b.type === selectedBlockData.type)?.label}
          </p>
          {renderBlockProperties(selectedBlockData, (content) => updateBlock(selectedBlockData.id, content))}
        </div>
      );
    }
    return <p className="text-sm text-muted-foreground">Selecciona un bloque para editar sus propiedades</p>;
  };

  const renderBlockProperties = (block: { type: string; content: Record<string, string> }, onUpdate: (content: Record<string, string>) => void) => {
    switch (block.type) {
      case "heading":
        return (
          <>
            <div>
              <Label className="text-xs">Texto</Label>
              <Input value={block.content.text} onChange={(e) => onUpdate({ ...block.content, text: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Alineación</Label>
              <div className="flex gap-1 mt-1">
                {["left", "center", "right"].map((a) => (
                  <Button key={a} variant={block.content.align === a ? "default" : "outline"} size="sm" className="flex-1 text-xs"
                    onClick={() => onUpdate({ ...block.content, align: a })}>
                    {a === "left" ? "Izq" : a === "center" ? "Centro" : "Der"}
                  </Button>
                ))}
              </div>
            </div>
          </>
        );
      case "text":
        return (
          <div>
            <Label className="text-xs">Contenido</Label>
            <Textarea value={block.content.text} onChange={(e) => onUpdate({ ...block.content, text: e.target.value })} className="mt-1" rows={4} />
          </div>
        );
      case "image":
        return (
          <>
            <div>
              <Label className="text-xs">URL de Imagen</Label>
              <Input value={block.content.url} onChange={(e) => onUpdate({ ...block.content, url: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Texto Alt</Label>
              <Input value={block.content.alt} onChange={(e) => onUpdate({ ...block.content, alt: e.target.value })} className="mt-1" />
            </div>
          </>
        );
      case "button":
        return (
          <>
            <div>
              <Label className="text-xs">Texto</Label>
              <Input value={block.content.text} onChange={(e) => onUpdate({ ...block.content, text: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">URL</Label>
              <Input value={block.content.url} onChange={(e) => onUpdate({ ...block.content, url: e.target.value })} className="mt-1" />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/campaigns">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <Input
              value={previewName}
              onChange={(e) => setPreviewName(e.target.value)}
              className="text-lg font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0"
              placeholder="Nombre de la campaña"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Save className="w-4 h-4 mr-2" /> Guardar</Button>
          <Button><Send className="w-4 h-4 mr-2" /> Enviar</Button>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        {/* Sidebar - draggable block types */}
        <div className="w-20 flex flex-col gap-2 sticky top-8">
          <p className="text-[10px] text-muted-foreground text-center font-medium uppercase tracking-wider mb-1">Bloques</p>
          {blockTypes.map((bt) => (
            <div
              key={bt.type}
              draggable
              onDragStart={(e) => handleSidebarDragStart(e, bt.type)}
              onDragEnd={resetDragState}
              className="w-[72px] h-[64px] rounded-xl bg-card border flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none"
              title={`Arrastra "${bt.label}" al editor`}
            >
              <bt.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{bt.label}</span>
            </div>
          ))}
        </div>

        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="edit">Editar</TabsTrigger>
              <TabsTrigger value="preview"><Eye className="w-3.5 h-3.5 mr-1.5" /> Vista Previa</TabsTrigger>
            </TabsList>

            <TabsContent value="edit">
              <div className="bg-card rounded-xl border shadow-sm p-4 mb-4">
                <Label className="text-xs text-muted-foreground">Asunto del Email</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1" placeholder="Asunto..." />
              </div>

              {/* Drop zone canvas */}
              <div
                ref={canvasRef}
                onDragOver={handleCanvasDragOver}
                onDrop={handleCanvasDrop}
                onDragLeave={handleCanvasDragLeave}
                className={`bg-card rounded-xl border shadow-sm transition-colors min-h-[400px] ${
                  (draggedNewType || draggedBlockId) && !draggedInner ? "border-primary/40 border-dashed" : ""
                }`}
              >
                <div style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px", backgroundColor: "#ffffff" }}>
                  {blocks.length === 0 && !draggedNewType && !draggedBlockId && (
                    <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                      <GripVertical className="w-8 h-8 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium">Arrastra bloques aquí</p>
                      <p className="text-xs mt-1">Usa los bloques del panel izquierdo</p>
                    </div>
                  )}

                  {blocks.map((block, index) => (
                    <div key={block.id}>
                      {dropIndex === index && <DropIndicator />}

                      <div
                        data-block-id={block.id}
                        draggable
                        onDragStart={(e) => handleBlockDragStart(e, block.id)}
                        onDragEnd={resetDragState}
                        onClick={() => { setSelectedBlock(block.id); setSelectedInner(null); }}
                        className={`group relative rounded-lg transition-all cursor-pointer ${
                          draggedBlockId === block.id ? "opacity-30" : ""
                        } ${
                          selectedBlock === block.id
                            ? "ring-2 ring-primary shadow-sm"
                            : "hover:ring-1 hover:ring-border"
                        }`}
                      >
                        <div className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                          <div className="bg-card border rounded-md p-0.5 shadow-sm">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>

                        {renderBlock(block)}

                        <button
                          onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                          className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-destructive text-destructive-foreground items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {dropIndex === blocks.length && blocks.length > 0 && <DropIndicator />}

                  {blocks.length === 0 && (draggedNewType || draggedBlockId) && (
                    <div className="py-16 text-center text-primary border-2 border-primary/30 border-dashed rounded-xl bg-primary/5">
                      <p className="text-sm font-medium">Suelta aquí para agregar</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-destructive/50" />
                    <span className="w-3 h-3 rounded-full bg-warning/50" />
                    <span className="w-3 h-3 rounded-full bg-success/50" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">Vista previa del email</span>
                </div>
                <div className="p-4 bg-muted/30">
                  <div className="bg-card rounded-lg p-3 mb-4 border text-sm">
                    <p><strong>De:</strong> tu@empresa.com</p>
                    <p><strong>Asunto:</strong> {subject}</p>
                  </div>
                  <div style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid hsl(214, 32%, 91%)" }}>
                    {blocks.map((block) => (
                      <div key={block.id}>{renderBlock(block, true)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Properties panel */}
        <div className="w-72 sticky top-8">
          <div className="bg-card rounded-xl border shadow-sm p-4">
            <h3 className="font-semibold text-sm mb-4">Propiedades</h3>
            {renderProperties()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailEditor;
