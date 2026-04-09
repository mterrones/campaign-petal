import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Type, Image, Minus, Square, Columns, Eye, Save, Send, GripVertical, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type BlockType = "heading" | "text" | "image" | "button" | "divider" | "columns";

interface EmailBlock {
  id: string;
  type: BlockType;
  content: Record<string, string>;
}

const blockTypes: { type: BlockType; icon: React.ElementType; label: string }[] = [
  { type: "heading", icon: Type, label: "Título" },
  { type: "text", icon: Type, label: "Texto" },
  { type: "image", icon: Image, label: "Imagen" },
  { type: "button", icon: Square, label: "Botón" },
  { type: "divider", icon: Minus, label: "Separador" },
  { type: "columns", icon: Columns, label: "Columnas" },
];

const defaultContent: Record<BlockType, Record<string, string>> = {
  heading: { text: "Título principal", align: "center" },
  text: { text: "Escribe tu contenido aquí. Puedes agregar párrafos, enlaces y más." },
  image: { url: "https://placehold.co/600x200/3b82f6/ffffff?text=Tu+Imagen", alt: "Imagen" },
  button: { text: "Click Aquí", url: "#", align: "center" },
  divider: {},
  columns: { left: "Columna izquierda", right: "Columna derecha" },
};

const EmailEditor = () => {
  const [blocks, setBlocks] = useState<EmailBlock[]>([
    { id: "1", type: "image", content: { url: "https://placehold.co/600x120/3b82f6/ffffff?text=MailFlow", alt: "Header" } },
    { id: "2", type: "heading", content: { text: "¡Bienvenido a nuestro Newsletter!", align: "center" } },
    { id: "3", type: "text", content: { text: "Estamos encantados de tenerte aquí. Descubre las últimas novedades y mantente al día con las mejores ofertas." } },
    { id: "4", type: "button", content: { text: "Ver Más", url: "#", align: "center" } },
    { id: "5", type: "divider", content: {} },
    { id: "6", type: "text", content: { text: "Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!" } },
  ]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [subject, setSubject] = useState("¡Novedades de este mes!");
  const [previewName, setPreviewName] = useState("Newsletter Abril");
  const [activeTab, setActiveTab] = useState("edit");

  // Drag & Drop state
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [draggedNewType, setDraggedNewType] = useState<BlockType | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addBlock = (type: BlockType, atIndex?: number) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content: { ...defaultContent[type] },
    };
    if (atIndex !== undefined) {
      const newBlocks = [...blocks];
      newBlocks.splice(atIndex, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }
    setSelectedBlock(newBlock.id);
  };

  const updateBlock = (id: string, content: Record<string, string>) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
  };

  // --- Drag from sidebar (new block) ---
  const handleSidebarDragStart = (e: React.DragEvent, type: BlockType) => {
    setDraggedNewType(type);
    setDraggedBlockId(null);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", type);
  };

  // --- Drag existing block (reorder) ---
  const handleBlockDragStart = (e: React.DragEvent, blockId: string) => {
    e.stopPropagation();
    setDraggedBlockId(blockId);
    setDraggedNewType(null);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", blockId);
  };

  // --- Canvas drop zone ---
  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedNewType ? "copy" : "move";

    // Calculate drop index based on mouse position
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
  }, [blocks.length, draggedNewType]);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const targetIndex = dropIndex ?? blocks.length;

    if (draggedNewType) {
      // New block from sidebar
      addBlock(draggedNewType, targetIndex);
    } else if (draggedBlockId) {
      // Reorder existing block
      const fromIndex = blocks.findIndex((b) => b.id === draggedBlockId);
      if (fromIndex === -1) return;
      const newBlocks = [...blocks];
      const [moved] = newBlocks.splice(fromIndex, 1);
      const adjustedIndex = targetIndex > fromIndex ? targetIndex - 1 : targetIndex;
      newBlocks.splice(adjustedIndex, 0, moved);
      setBlocks(newBlocks);
    }

    setDraggedBlockId(null);
    setDraggedNewType(null);
    setDropIndex(null);
  }, [dropIndex, draggedNewType, draggedBlockId, blocks]);

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the canvas entirely
    if (canvasRef.current && !canvasRef.current.contains(e.relatedTarget as Node)) {
      setDropIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedBlockId(null);
    setDraggedNewType(null);
    setDropIndex(null);
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
        return (
          <div style={{ display: "flex", gap: "16px", margin: "12px 0" }}>
            <div style={{ flex: 1, padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", fontSize: "14px", color: "#4a4a5a" }}>
              {block.content.left}
            </div>
            <div style={{ flex: 1, padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", fontSize: "14px", color: "#4a4a5a" }}>
              {block.content.right}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const selectedBlockData = blocks.find((b) => b.id === selectedBlock);

  const DropIndicator = () => (
    <div className="h-1 bg-primary rounded-full mx-2 my-1 transition-all animate-pulse" />
  );

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
              onDragEnd={handleDragEnd}
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
                  (draggedNewType || draggedBlockId) ? "border-primary/40 border-dashed" : ""
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
                      {/* Drop indicator before this block */}
                      {dropIndex === index && <DropIndicator />}

                      <div
                        data-block-id={block.id}
                        draggable
                        onDragStart={(e) => handleBlockDragStart(e, block.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedBlock(block.id)}
                        className={`group relative rounded-lg transition-all cursor-pointer ${
                          draggedBlockId === block.id ? "opacity-30" : ""
                        } ${
                          selectedBlock === block.id
                            ? "ring-2 ring-primary shadow-sm"
                            : "hover:ring-1 hover:ring-border"
                        }`}
                      >
                        {/* Drag handle */}
                        <div className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                          <div className="bg-card border rounded-md p-0.5 shadow-sm">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>

                        {renderBlock(block)}

                        {/* Delete button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                          className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-destructive text-destructive-foreground items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Drop indicator at the end */}
                  {dropIndex === blocks.length && blocks.length > 0 && <DropIndicator />}

                  {/* Empty drop zone hint when dragging */}
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
            {selectedBlockData ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {blockTypes.find((b) => b.type === selectedBlockData.type)?.label}
                </p>
                {selectedBlockData.type === "heading" && (
                  <>
                    <div>
                      <Label className="text-xs">Texto</Label>
                      <Input value={selectedBlockData.content.text} onChange={(e) => updateBlock(selectedBlockData.id, { ...selectedBlockData.content, text: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Alineación</Label>
                      <div className="flex gap-1 mt-1">
                        {["left", "center", "right"].map((a) => (
                          <Button key={a} variant={selectedBlockData.content.align === a ? "default" : "outline"} size="sm" className="flex-1 text-xs"
                            onClick={() => updateBlock(selectedBlockData.id, { ...selectedBlockData.content, align: a })}>
                            {a === "left" ? "Izq" : a === "center" ? "Centro" : "Der"}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {selectedBlockData.type === "text" && (
                  <div>
                    <Label className="text-xs">Contenido</Label>
                    <Textarea value={selectedBlockData.content.text} onChange={(e) => updateBlock(selectedBlockData.id, { ...selectedBlockData.content, text: e.target.value })} className="mt-1" rows={4} />
                  </div>
                )}
                {selectedBlockData.type === "image" && (
                  <>
                    <div>
                      <Label className="text-xs">URL de Imagen</Label>
                      <Input value={selectedBlockData.content.url} onChange={(e) => updateBlock(selectedBlockData.id, { ...selectedBlockData.content, url: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Texto Alt</Label>
                      <Input value={selectedBlockData.content.alt} onChange={(e) => updateBlock(selectedBlockData.id, { ...selectedBlockData.content, alt: e.target.value })} className="mt-1" />
                    </div>
                  </>
                )}
                {selectedBlockData.type === "button" && (
                  <>
                    <div>
                      <Label className="text-xs">Texto</Label>
                      <Input value={selectedBlockData.content.text} onChange={(e) => updateBlock(selectedBlockData.id, { ...selectedBlockData.content, text: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">URL</Label>
                      <Input value={selectedBlockData.content.url} onChange={(e) => updateBlock(selectedBlockData.id, { ...selectedBlockData.content, url: e.target.value })} className="mt-1" />
                    </div>
                  </>
                )}
                {selectedBlockData.type === "columns" && (
                  <>
                    <div>
                      <Label className="text-xs">Columna Izquierda</Label>
                      <Textarea value={selectedBlockData.content.left} onChange={(e) => updateBlock(selectedBlockData.id, { ...selectedBlockData.content, left: e.target.value })} className="mt-1" rows={3} />
                    </div>
                    <div>
                      <Label className="text-xs">Columna Derecha</Label>
                      <Textarea value={selectedBlockData.content.right} onChange={(e) => updateBlock(selectedBlockData.id, { ...selectedBlockData.content, right: e.target.value })} className="mt-1" rows={3} />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Selecciona un bloque para editar sus propiedades</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailEditor;
