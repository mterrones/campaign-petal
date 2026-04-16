import { Gauge, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

interface DailyQuotaCardProps {
  remaining: number | null;
  limit: number | null;
  used: number | null;
  isLoading: boolean;
  isError: boolean;
}

const DailyQuotaCard = ({
  remaining,
  limit,
  used,
  isLoading,
  isError,
}: DailyQuotaCardProps) => {
  const hasData = remaining !== null && limit !== null && used !== null;
  const usedPct = hasData && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const remainingPct = hasData ? 100 - usedPct : 0;

  // Status: low when <20% remaining, depleted when 0
  const status: "ok" | "low" | "depleted" =
    !hasData ? "ok"
    : remaining === 0 ? "depleted"
    : remainingPct < 20 ? "low"
    : "ok";

  const statusConfig = {
    ok: {
      badge: "Disponible",
      badgeClass: "bg-success/15 text-success border-success/20",
      Icon: CheckCircle2,
    },
    low: {
      badge: "Cuota baja",
      badgeClass: "bg-warning/15 text-warning border-warning/20",
      Icon: AlertTriangle,
    },
    depleted: {
      badge: "Agotada",
      badgeClass: "bg-destructive/15 text-destructive border-destructive/20",
      Icon: AlertTriangle,
    },
  }[status];

  const StatusIcon = statusConfig.Icon;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-5 shadow-sm">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/30 shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary/80">
                Envíos pendientes hoy
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Hora de Lima · Reinicia a las 00:00
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${statusConfig.badgeClass}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusConfig.badge}
          </span>
        </div>

        {/* Big number */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-5xl font-extrabold tracking-tight text-foreground tabular-nums">
            {isLoading ? "…" : isError ? "—" : (remaining ?? 0).toLocaleString()}
          </span>
          {hasData && (
            <span className="text-sm text-muted-foreground font-medium">
              / {limit!.toLocaleString()} disponibles
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="relative h-2.5 overflow-hidden rounded-full bg-primary/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                status === "depleted"
                  ? "bg-gradient-to-r from-destructive to-destructive/70"
                  : status === "low"
                    ? "bg-gradient-to-r from-warning to-warning/70"
                    : "bg-gradient-to-r from-primary to-primary/70"
              }`}
              style={{ width: `${usedPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-foreground tabular-nums">
                {hasData ? used!.toLocaleString() : "—"}
              </span>
              enviados
            </span>
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">
                {hasData ? `${remainingPct}%` : "—"}
              </span>{" "}
              restante
            </span>
          </div>
        </div>

        {isError && (
          <p className="text-xs text-destructive mt-3">
            No se pudo cargar la cuota.
          </p>
        )}
      </div>
    </div>
  );
};

export default DailyQuotaCard;
