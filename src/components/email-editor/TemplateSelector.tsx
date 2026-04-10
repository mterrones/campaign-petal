import { useMemo } from "react";
import { emailTemplates } from "./templates";
import { EmailBlock, GlobalEmailStyles, defaultGlobalStyles } from "./types";
import { exportHtml } from "./htmlExport";

interface TemplateSelectorProps {
  onSelect: (blocks: EmailBlock[], styles?: Partial<GlobalEmailStyles>) => void;
  onSkip: () => void;
}

function TemplatePreview({ blocks, globalStyles }: { blocks: EmailBlock[]; globalStyles?: Partial<GlobalEmailStyles> }) {
  const html = useMemo(() => {
    if (blocks.length === 0) return "";
    const merged = { ...defaultGlobalStyles, ...globalStyles };
    return exportHtml(blocks, merged, "Preview");
  }, [blocks, globalStyles]);

  if (blocks.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50">
        <span className="text-3xl text-muted-foreground/40">✏️</span>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      className="w-[600px] h-[420px] origin-top-left pointer-events-none border-0"
      style={{ transform: "scale(0.32)", transformOrigin: "top left" }}
      tabIndex={-1}
      title="Preview"
    />
  );
}

export function TemplateSelector({ onSelect, onSkip }: TemplateSelectorProps) {
  return (
    <div className="max-w-5xl mx-auto py-8">
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
            <div className="aspect-[3/4] overflow-hidden bg-muted relative">
              <TemplatePreview blocks={tpl.blocks} globalStyles={tpl.globalStyles} />
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
