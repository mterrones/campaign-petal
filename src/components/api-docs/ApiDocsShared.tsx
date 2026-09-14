import type { ComponentType, ReactNode } from "react";
import { Copy, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function DocsSection({
  title,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {title}
      </Label>
      {children}
    </div>
  );
}

export function CopyablePre({
  content,
  onCopy,
  className,
}: {
  content: string;
  onCopy: (text: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative group", className)}>
      <pre className="bg-muted rounded-lg p-3 pr-10 text-[11px] overflow-x-auto whitespace-pre-wrap leading-snug">
        {content}
      </pre>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1.5 right-1.5 h-7 w-7 opacity-70 group-hover:opacity-100 print:hidden"
        onClick={() => onCopy(content)}
        aria-label="Copiar"
      >
        <Copy className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export type CurlExample = {
  label: string;
  command: string;
};

export function CurlExampleGroup({
  examples,
  onCopy,
}: {
  examples: CurlExample[];
  onCopy: (text: string) => void;
}) {
  return (
    <div className="space-y-3">
      {examples.map((example) => (
        <div key={example.label}>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {example.label}
          </p>
          <CopyablePre
            content={example.command}
            onCopy={onCopy}
            className="mt-1"
          />
        </div>
      ))}
    </div>
  );
}

const quickNavItems = [
  { id: "post-ejemplos", label: "Ejemplo POST" },
  { id: "post-referencia", label: "Referencia POST" },
  { id: "get-message", label: "GET messages" },
] as const;

export function DocsQuickNav() {
  return (
    <nav
      aria-label="Secciones de documentación"
      className="hidden lg:flex flex-wrap gap-2 sticky top-[4.5rem] z-[5] py-2 -mx-1 px-1 bg-background/95 backdrop-blur-sm border-b border-border/50 mb-2 print:hidden"
    >
      {quickNavItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="text-[11px] font-medium px-2.5 py-1 rounded-md border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export { Code2 as DocsCodeIcon };
