import { useState } from "react";
import { ArrowLeft, Type, Image, Minus, Square, Columns, MousePointerClick, Eye, Save, Send, GripVertical, Trash2, Plus } from "lucide-react";
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

  const addBlock = (type: BlockType) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content: { ...defaultContent[type] },
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock.id);
  };

  const updateBlock = (id: string, content: Record<string, string>) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[idx + dir]] = [newBlocks[idx + dir], newBlocks[idx]];
    setBlocks(newBlocks);
  };

  const renderBlock = (block: EmailBlock, isPreview = false) => {
    const selected = selectedBlock === block.id && !isPreview;
    const wrapper = isPreview ? "" : `relative cursor-pointer rounded-lg transition-all ${selected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-border"}`;

    switch (block.type) {
      case "heading":
        return (
          <div className={wrapper} onClick={() => !isPreview && setSelectedBlock(block.id)}>
            <h1 style={{ textAlign: (block.content.align as any) || "left", fontSize: "24px", fontWeight: "bold", margin: "16px 0", color: "#1a1a2e" }}>
              {block.content.text}
            </h1>
          </div>
        );
      case "text":
        return (
          <div className={wrapper} onClick={() => !isPreview && setSelectedBlock(block.id)}>
            <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4a4a5a", margin: "12px 0" }}>
              {block.content.text}
            </p>
          </div>
        );
      case "image":
        return (
          <div className={wrapper} onClick={() => !isPreview && setSelectedBlock(block.id)}>
            <img src={block.content.url} alt={block.content.alt} style={{ width: "100%", borderRadius: "8px", margin: "12px 0" }} />
          </div>
        );
      case "button":
        return (
          <div className={wrapper} onClick={() => !isPreview && setSelectedBlock(block.id)} style={{ textAlign: (block.content.align as any) || "center", margin: "16px 0" }}>
            <a href={block.content.url} style={{
              display: "inline-block", padding: "12px 28px", backgroundColor: "hsl(217, 91%, 60%)",
              color: "#ffffff", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "600",
            }}>
              {block.content.text}
            </a>
          </div>
        );
      case "divider":
        return (
          <div className={wrapper} onClick={() => !isPreview && setSelectedBlock(block.id)}>
            <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />
          </div>
        );
      case "columns":
        return (
          <div className={wrapper} onClick={() => !isPreview && setSelectedBlock(block.id)}>
            <div style={{ display: "flex", gap: "16px", margin: "12px 0" }}>
              <div style={{ flex: 1, padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", fontSize: "14px", color: "#4a4a5a" }}>
                {block.content.left}
              </div>
              <div style={{ flex: 1, padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", fontSize: "14px", color: "#4a4a5a" }}>
                {block.content.right}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const selectedBlockData = blocks.find((b) => b.id === selectedBlock);

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
        <div className="w-16 flex flex-col gap-2 sticky top-8">
          {blockTypes.map((bt) => (
            <button
              key={bt.type}
              onClick={() => addBlock(bt.type)}
              className="w-14 h-14 rounded-xl bg-card border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              title={bt.label}
            >
              <bt.icon className="w-4 h-4" />
              <span className="text-[9px]">{bt.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="edit">Editar</TabsTrigger>
              <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            </TabsList>

            <TabsContent value="edit">
              <div className="bg-card rounded-xl border shadow-sm p-4 mb-4">
                <Label className="text-xs text-muted-foreground">Asunto del Email</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1" placeholder="Asunto..." />
              </div>

              <div className="bg-card rounded-xl border shadow-sm">
                <div style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px", backgroundColor: "#ffffff" }}>
                  {blocks.map((block) => (
                    <div key={block.id} className="group relative">
                      <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex flex-col gap-0.5 transition-opacity">
                        <button onClick={() => moveBlock(block.id, -1)} className="text-muted-foreground hover:text-foreground text-xs">▲</button>
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                        <button onClick={() => moveBlock(block.id, 1)} className="text-muted-foreground hover:text-foreground text-xs">▼</button>
                      </div>
                      {renderBlock(block)}
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-destructive text-destructive-foreground items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {blocks.length === 0 && (
                    <div className="py-20 text-center text-muted-foreground">
                      <p className="text-sm">Agrega bloques desde el panel izquierdo para diseñar tu email</p>
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
