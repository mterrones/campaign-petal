import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { EmailBlock, InnerBlock, GlobalEmailStyles, blockTypes, innerBlockTypes, COLUMN_LAYOUTS, FONT_OPTIONS, SOCIAL_NETWORKS } from "./types";
import { Trash2, Plus } from "lucide-react";

interface PropertiesPanelProps {
  selectedBlock: EmailBlock | null;
  selectedInnerData: InnerBlock | null;
  selectedInner: { blockId: string; colIndex: number; innerId: string } | null;
  onUpdateBlock: (id: string, content: Record<string, string>) => void;
  onUpdateInnerBlock: (blockId: string, colIndex: number, innerId: string, content: Record<string, string>) => void;
  onChangeColumnLayout: (blockId: string, layout: string) => void;
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2 mt-1">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
        <Input value={value} onChange={e => onChange(e.target.value)} className="flex-1 h-8 text-xs" />
      </div>
    </div>
  );
}

function PaddingControls({ content, onUpdate }: { content: Record<string, string>; onUpdate: (c: Record<string, string>) => void }) {
  return (
    <div>
      <Label className="text-xs">Padding (px)</Label>
      <div className="grid grid-cols-2 gap-1.5 mt-1">
        {["Top", "Right", "Bottom", "Left"].map(side => (
          <div key={side} className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground w-5">{side[0]}</span>
            <Input type="number" value={content[`padding${side}`] || "0"} onChange={e => onUpdate({ ...content, [`padding${side}`]: e.target.value })} className="h-7 text-xs" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AlignButtons({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs">Alineación</Label>
      <div className="flex gap-1 mt-1">
        {["left", "center", "right"].map(a => (
          <Button key={a} variant={value === a ? "default" : "outline"} size="sm" className="flex-1 text-xs h-7"
            onClick={() => onChange(a)}>
            {a === "left" ? "Izq" : a === "center" ? "Centro" : "Der"}
          </Button>
        ))}
      </div>
    </div>
  );
}

function renderBlockProps(block: { type: string; content: Record<string, string> }, onUpdate: (content: Record<string, string>) => void, onChangeLayout?: (layout: string) => void) {
  const c = block.content;
  const u = (key: string, val: string) => onUpdate({ ...c, [key]: val });

  switch (block.type) {
    case "heading":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Texto</Label>
            <Input value={c.text} onChange={e => u("text", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Nivel</Label>
            <Select value={c.level || "h1"} onValueChange={v => u("level", v)}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["h1", "h2", "h3", "h4"].map(l => <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <AlignButtons value={c.align || "left"} onChange={v => u("align", v)} />
          <ColorInput label="Color" value={c.color || "#1a1a2e"} onChange={v => u("color", v)} />
          <div>
            <Label className="text-xs">Tamaño (px)</Label>
            <Input type="number" value={c.fontSize || "24"} onChange={e => u("fontSize", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Fuente</Label>
            <Select value={c.fontFamily || ""} onValueChange={v => u("fontFamily", v)}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Global" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Global</SelectItem>
                {FONT_OPTIONS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 text-xs"><Switch checked={c.bold === "true"} onCheckedChange={v => u("bold", String(v))} /> Negrita</label>
            <label className="flex items-center gap-1.5 text-xs"><Switch checked={c.italic === "true"} onCheckedChange={v => u("italic", String(v))} /> Itálica</label>
          </div>
          <PaddingControls content={c} onUpdate={onUpdate} />
        </div>
      );
    case "text":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Contenido</Label>
            <Textarea value={c.text} onChange={e => u("text", e.target.value)} className="mt-1 text-xs" rows={4} />
          </div>
          <ColorInput label="Color" value={c.color || "#4a4a5a"} onChange={v => u("color", v)} />
          <div>
            <Label className="text-xs">Tamaño (px)</Label>
            <Input type="number" value={c.fontSize || "14"} onChange={e => u("fontSize", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Interlineado</Label>
            <Input type="number" step="0.1" value={c.lineHeight || "1.6"} onChange={e => u("lineHeight", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <PaddingControls content={c} onUpdate={onUpdate} />
        </div>
      );
    case "image":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">URL Imagen</Label>
            <Input value={c.url} onChange={e => u("url", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Texto Alt</Label>
            <Input value={c.alt || ""} onChange={e => u("alt", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Ancho (%)</Label>
            <Slider value={[parseInt(c.width || "100")]} onValueChange={v => u("width", String(v[0]))} min={10} max={100} step={5} className="mt-2" />
            <span className="text-[10px] text-muted-foreground">{c.width || 100}%</span>
          </div>
          <div>
            <Label className="text-xs">Border Radius (px)</Label>
            <Input type="number" value={c.borderRadius || "0"} onChange={e => u("borderRadius", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Enlace al click</Label>
            <Input value={c.linkUrl || ""} onChange={e => u("linkUrl", e.target.value)} className="mt-1 h-8 text-xs" placeholder="https://..." />
          </div>
          <div>
            <Label className="text-xs">Pie de imagen</Label>
            <Input value={c.caption || ""} onChange={e => u("caption", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <AlignButtons value={c.align || "center"} onChange={v => u("align", v)} />
          <PaddingControls content={c} onUpdate={onUpdate} />
        </div>
      );
    case "button":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Texto</Label>
            <Input value={c.text} onChange={e => u("text", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">URL</Label>
            <Input value={c.url || ""} onChange={e => u("url", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Estilo</Label>
            <Select value={c.style || "filled"} onValueChange={v => u("style", v)}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="filled">Relleno</SelectItem>
                <SelectItem value="outline">Contorno</SelectItem>
                <SelectItem value="pill">Píldora</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ColorInput label="Color Fondo" value={c.bgColor || "#3b82f6"} onChange={v => u("bgColor", v)} />
          <ColorInput label="Color Texto" value={c.textColor || "#ffffff"} onChange={v => u("textColor", v)} />
          <div>
            <Label className="text-xs">Border Radius (px)</Label>
            <Input type="number" value={c.borderRadius || "8"} onChange={e => u("borderRadius", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Ancho</Label>
            <Select value={c.buttonWidth || "auto"} onValueChange={v => u("buttonWidth", v)}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="full">Completo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Tamaño fuente (px)</Label>
            <Input type="number" value={c.fontSize || "14"} onChange={e => u("fontSize", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <AlignButtons value={c.align || "center"} onChange={v => u("align", v)} />
          <PaddingControls content={c} onUpdate={onUpdate} />
        </div>
      );
    case "divider":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Estilo</Label>
            <Select value={c.lineStyle || "solid"} onValueChange={v => u("lineStyle", v)}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Sólido</SelectItem>
                <SelectItem value="dashed">Guiones</SelectItem>
                <SelectItem value="dotted">Puntos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ColorInput label="Color" value={c.color || "#e5e7eb"} onChange={v => u("color", v)} />
          <div>
            <Label className="text-xs">Grosor (px)</Label>
            <Input type="number" value={c.thickness || "1"} onChange={e => u("thickness", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Ancho (%)</Label>
            <Slider value={[parseInt(c.width || "100")]} onValueChange={v => u("width", String(v[0]))} min={10} max={100} step={5} className="mt-2" />
            <span className="text-[10px] text-muted-foreground">{c.width || 100}%</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Padding Top</Label>
              <Input type="number" value={c.paddingTop || "20"} onChange={e => u("paddingTop", e.target.value)} className="mt-1 h-7 text-xs" />
            </div>
            <div>
              <Label className="text-xs">Padding Bottom</Label>
              <Input type="number" value={c.paddingBottom || "20"} onChange={e => u("paddingBottom", e.target.value)} className="mt-1 h-7 text-xs" />
            </div>
          </div>
        </div>
      );
    case "columns":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Layout</Label>
            <Select value={c.layout || "50-50"} onValueChange={v => onChangeLayout?.(v)}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COLUMN_LAYOUTS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Espacio entre columnas (px)</Label>
            <Input type="number" value={c.gap || "16"} onChange={e => u("gap", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Padding Top</Label>
              <Input type="number" value={c.paddingTop || "12"} onChange={e => u("paddingTop", e.target.value)} className="mt-1 h-7 text-xs" />
            </div>
            <div>
              <Label className="text-xs">Padding Bottom</Label>
              <Input type="number" value={c.paddingBottom || "12"} onChange={e => u("paddingBottom", e.target.value)} className="mt-1 h-7 text-xs" />
            </div>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">Selecciona un elemento dentro de las columnas para editar sus propiedades.</p>
        </div>
      );
    case "spacer":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Altura (px)</Label>
            <Slider value={[parseInt(c.height || "40")]} onValueChange={v => u("height", String(v[0]))} min={8} max={120} step={4} className="mt-2" />
            <span className="text-[10px] text-muted-foreground">{c.height || 40}px</span>
          </div>
        </div>
      );
    case "social":
      return (
        <div className="space-y-3">
          {SOCIAL_NETWORKS.map(sn => (
            <div key={sn.key}>
              <Label className="text-xs">{sn.label}</Label>
              <Input value={c[sn.key] || ""} onChange={e => u(sn.key, e.target.value)} className="mt-1 h-8 text-xs" placeholder="https://..." />
            </div>
          ))}
          <div>
            <Label className="text-xs">Estilo</Label>
            <Select value={c.iconStyle || "color"} onValueChange={v => u("iconStyle", v)}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="color">Color</SelectItem>
                <SelectItem value="mono">Monocromo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Tamaño (px)</Label>
            <Input type="number" value={c.iconSize || "24"} onChange={e => u("iconSize", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <AlignButtons value={c.align || "center"} onChange={v => u("align", v)} />
        </div>
      );
    case "footer":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Texto</Label>
            <Textarea value={c.text} onChange={e => u("text", e.target.value)} className="mt-1 text-xs" rows={2} />
          </div>
          <div>
            <Label className="text-xs">Dirección</Label>
            <Input value={c.address || ""} onChange={e => u("address", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={c.showUnsubscribe === "true"} onCheckedChange={v => u("showUnsubscribe", String(v))} />
            Mostrar link de baja
          </label>
          {c.showUnsubscribe === "true" && (
            <div>
              <Label className="text-xs">Texto del link</Label>
              <Input value={c.unsubscribeText || ""} onChange={e => u("unsubscribeText", e.target.value)} className="mt-1 h-8 text-xs" />
            </div>
          )}
          <ColorInput label="Color texto" value={c.color || "#9ca3af"} onChange={v => u("color", v)} />
          <div>
            <Label className="text-xs">Tamaño fuente (px)</Label>
            <Input type="number" value={c.fontSize || "12"} onChange={e => u("fontSize", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
        </div>
      );
    case "video":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">URL del Video</Label>
            <Input value={c.url || ""} onChange={e => u("url", e.target.value)} className="mt-1 h-8 text-xs" placeholder="https://youtube.com/..." />
          </div>
          <div>
            <Label className="text-xs">URL Thumbnail</Label>
            <Input value={c.thumbnailUrl || ""} onChange={e => u("thumbnailUrl", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Texto del botón</Label>
            <Input value={c.playButtonText || ""} onChange={e => u("playButtonText", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
        </div>
      );
    case "html":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Código HTML</Label>
            <Textarea value={c.code || ""} onChange={e => u("code", e.target.value)} className="mt-1 text-xs font-mono" rows={8} />
          </div>
        </div>
      );
    case "logo":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">URL del Logo</Label>
            <Input value={c.url || ""} onChange={e => u("url", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Texto Alt</Label>
            <Input value={c.alt || ""} onChange={e => u("alt", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Nombre de Empresa</Label>
            <Input value={c.companyName || ""} onChange={e => u("companyName", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Ancho (px)</Label>
            <Input type="number" value={c.width || "200"} onChange={e => u("width", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <AlignButtons value={c.align || "center"} onChange={v => u("align", v)} />
        </div>
      );
    case "menu": {
      let items: { text: string; url: string }[] = [];
      try { items = JSON.parse(c.items || "[]"); } catch {}
      const updateItems = (newItems: { text: string; url: string }[]) => u("items", JSON.stringify(newItems));
      return (
        <div className="space-y-3">
          <Label className="text-xs">Enlaces del Menú</Label>
          {items.map((item, i) => (
            <div key={i} className="flex gap-1 items-end">
              <div className="flex-1">
                <Input value={item.text} onChange={e => { const n = [...items]; n[i] = { ...n[i], text: e.target.value }; updateItems(n); }} className="h-7 text-xs" placeholder="Texto" />
              </div>
              <div className="flex-1">
                <Input value={item.url} onChange={e => { const n = [...items]; n[i] = { ...n[i], url: e.target.value }; updateItems(n); }} className="h-7 text-xs" placeholder="URL" />
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { const n = items.filter((_, idx) => idx !== i); updateItems(n); }}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => updateItems([...items, { text: "Link", url: "#" }])}>
            <Plus className="w-3 h-3 mr-1" /> Agregar enlace
          </Button>
          <div>
            <Label className="text-xs">Separador</Label>
            <Input value={c.separator || "|"} onChange={e => u("separator", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <ColorInput label="Color" value={c.color || "#3b82f6"} onChange={v => u("color", v)} />
          <div>
            <Label className="text-xs">Tamaño fuente (px)</Label>
            <Input type="number" value={c.fontSize || "14"} onChange={e => u("fontSize", e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
          <AlignButtons value={c.align || "center"} onChange={v => u("align", v)} />
        </div>
      );
    }
    default:
      return null;
  }
}

export function PropertiesPanel({ selectedBlock, selectedInnerData, selectedInner, onUpdateBlock, onUpdateInnerBlock, onChangeColumnLayout }: PropertiesPanelProps) {
  if (selectedInnerData && selectedInner) {
    const typeLabel = innerBlockTypes.find(b => b.type === selectedInnerData.type)?.label;
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{typeLabel} (columna)</p>
        {renderBlockProps(selectedInnerData, c => onUpdateInnerBlock(selectedInner.blockId, selectedInner.colIndex, selectedInner.innerId, c))}
      </div>
    );
  }
  if (selectedBlock) {
    const typeLabel = blockTypes.find(b => b.type === selectedBlock.type)?.label;
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{typeLabel}</p>
        {renderBlockProps(selectedBlock, c => onUpdateBlock(selectedBlock.id, c), v => onChangeColumnLayout(selectedBlock.id, v))}
      </div>
    );
  }
  return <p className="text-sm text-muted-foreground">Selecciona un bloque para editar sus propiedades</p>;
}
