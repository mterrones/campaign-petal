import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FilePlus, LayoutTemplate, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listUserTemplates, type UserTemplate } from "@/lib/userTemplates";
import { emailTemplates } from "@/components/email-editor/templates";
import { exportHtml } from "@/components/email-editor/htmlExport";
import {
  defaultGlobalStyles,
  type EmailBlock,
  type GlobalEmailStyles,
} from "@/components/email-editor/types";

function Preview({
  blocks,
  globalStyles,
  subject,
}: {
  blocks: EmailBlock[];
  globalStyles?: Partial<GlobalEmailStyles>;
  subject?: string;
}) {
  const html = useMemo(() => {
    if (!blocks || blocks.length === 0) return "";
    const merged = { ...defaultGlobalStyles, ...(globalStyles ?? {}) };
    return exportHtml(blocks, merged, subject || "Preview");
  }, [blocks, globalStyles, subject]);

  if (!html) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/40">
        <FilePlus className="w-8 h-8 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      className="absolute inset-0 w-full h-full pointer-events-none border-0"
      style={{
        transform: "scale(0.32)",
        transformOrigin: "top left",
        width: "313%",
        height: "313%",
      }}
      tabIndex={-1}
      title="Preview"
    />
  );
}

const CampaignNew = () => {
  const navigate = useNavigate();
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);

  useEffect(() => {
    setUserTemplates(listUserTemplates());
  }, []);

  const goEditor = (param?: string) => {
    if (param) {
      navigate(`/campaigns/editor?template=${encodeURIComponent(param)}`);
    } else {
      navigate(`/campaigns/editor?template=blank`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Nueva campaña
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Elige una plantilla para empezar o comienza desde cero.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => goEditor("blank")}
          className="text-left rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FilePlus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm">Empezar en blanco</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lienzo vacío. Arrastra los bloques que necesites.
            </p>
          </div>
        </button>
        <Link
          to="/templates/new"
          className="text-left rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm">Crear nueva plantilla</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Diseña una plantilla reutilizable antes de enviarla.
            </p>
          </div>
        </Link>
      </div>

      {/* User templates */}
      {userTemplates.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Tus plantillas
            </h2>
            <Link
              to="/templates"
              className="text-xs text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {userTemplates.slice(0, 8).map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => goEditor(`user:${tpl.id}`)}
                className="text-left rounded-xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/40 transition-all"
              >
                <div className="aspect-[3/4] overflow-hidden bg-muted relative">
                  <Preview
                    blocks={tpl.blocks}
                    globalStyles={tpl.globalStyles}
                    subject={tpl.subject}
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{tpl.name}</h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {tpl.description || tpl.subject || "Sin descripción"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Predefined templates */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Plantillas predefinidas
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {emailTemplates
            .filter((t) => t.id !== "blank")
            .map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => goEditor(`builtin:${tpl.id}`)}
                className="text-left rounded-xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/40 transition-all"
              >
                <div className="aspect-[3/4] overflow-hidden bg-muted relative">
                  <Preview blocks={tpl.blocks} globalStyles={tpl.globalStyles} />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{tpl.name}</h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {tpl.description}
                  </p>
                </div>
              </button>
            ))}
        </div>
      </section>
    </div>
  );
};

export default CampaignNew;
