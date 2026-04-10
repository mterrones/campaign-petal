import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { GlobalEmailStyles, FONT_OPTIONS } from "./types";

interface GlobalStylesProps {
  styles: GlobalEmailStyles;
  onChange: (styles: GlobalEmailStyles) => void;
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

export function GlobalStyles({ styles, onChange }: GlobalStylesProps) {
  const u = (key: keyof GlobalEmailStyles, val: string) => onChange({ ...styles, [key]: val });

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estilos Globales</h4>

      <ColorInput label="Fondo del body" value={styles.bodyBgColor} onChange={v => u("bodyBgColor", v)} />
      <ColorInput label="Fondo del contenido" value={styles.contentBgColor} onChange={v => u("contentBgColor", v)} />

      <div>
        <Label className="text-xs">Fuente global</Label>
        <Select value={styles.fontFamily} onValueChange={v => u("fontFamily", v)}>
          <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Ancho del email (px)</Label>
        <Slider value={[parseInt(styles.emailWidth)]} onValueChange={v => u("emailWidth", String(v[0]))} min={400} max={800} step={10} className="mt-2" />
        <span className="text-[10px] text-muted-foreground">{styles.emailWidth}px</span>
      </div>

      <div>
        <Label className="text-xs">Padding general (px)</Label>
        <Input type="number" value={styles.padding} onChange={e => u("padding", e.target.value)} className="mt-1 h-8 text-xs" />
      </div>

      <ColorInput label="Color de enlaces" value={styles.linkColor} onChange={v => u("linkColor", v)} />

      <div>
        <Label className="text-xs">Preheader</Label>
        <Textarea value={styles.preheaderText} onChange={e => u("preheaderText", e.target.value)} className="mt-1 text-xs" rows={2} placeholder="Texto que aparece en la preview del inbox..." />
      </div>

      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">Remitente</h4>

      <div>
        <Label className="text-xs">Nombre</Label>
        <Input value={styles.senderName} onChange={e => u("senderName", e.target.value)} className="mt-1 h-8 text-xs" />
      </div>
      <div>
        <Label className="text-xs">Email</Label>
        <Input value={styles.senderEmail} onChange={e => u("senderEmail", e.target.value)} className="mt-1 h-8 text-xs" />
      </div>
      <div>
        <Label className="text-xs">Responder a</Label>
        <Input value={styles.replyTo} onChange={e => u("replyTo", e.target.value)} className="mt-1 h-8 text-xs" />
      </div>
    </div>
  );
}
