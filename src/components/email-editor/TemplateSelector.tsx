import { emailTemplates } from "./templates";
import { EmailBlock, GlobalEmailStyles } from "./types";

interface TemplateSelectorProps {
  onSelect: (blocks: EmailBlock[], styles?: Partial<GlobalEmailStyles>) => void;
  onSkip: () => void;
}

export function TemplateSelector({ onSelect, onSkip }: TemplateSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Elegí una plantilla</h2>
        <p className="text-muted-foreground mt-2">Comenzá con una plantilla prediseñada o desde cero</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {emailTemplates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl.blocks, tpl.globalStyles)}
            className="group text-left rounded-xl border bg-card overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all"
          >
            <div className="aspect-[14/10] overflow-hidden bg-muted">
              <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm text-foreground">{tpl.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{tpl.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
