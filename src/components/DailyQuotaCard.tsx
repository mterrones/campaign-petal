import { useEffect, useState } from "react";
import {
  Gauge,
  Zap,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FlaskConical,
  XCircle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DailySendQuotaResponse } from "@/lib/platformDailyQuota";

const LIMA_TZ = "America/Lima";

function msSinceMidnightInZone(now: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const second = Number(parts.find((p) => p.type === "second")?.value ?? 0);
  return (((hour * 60 + minute) * 60 + second) * 1000);
}

function msUntilNextMidnightInZone(now: Date, timeZone: string): number {
  return 86400000 - msSinceMidnightInZone(now, timeZone);
}

function formatDurationUntilReset(ms: number): string {
  if (ms <= 0) return "0 s";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h} h ${m} min ${s} s`;
  if (m > 0) return `${m} min ${s} s`;
  return `${s} s`;
}

function RuleRow({
  label,
  current,
  target,
  ok,
}: {
  label: string;
  current: string;
  target: string;
  ok: boolean | null;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="flex items-center gap-1.5">
        <span
          className={`tabular-nums font-medium ${
            ok === null
              ? "text-muted-foreground"
              : ok
                ? "text-success"
                : "text-destructive"
          }`}
        >
          {current}
        </span>
        <span className="text-muted-foreground">/ {target}</span>
        {ok === null ? null : ok ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
        )}
      </span>
    </li>
  );
}

interface DailyQuotaCardProps {
  quota: DailySendQuotaResponse | undefined;
  isLoading: boolean;
  isError: boolean;
}

const DailyQuotaCard = ({ quota, isLoading, isError }: DailyQuotaCardProps) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const resetInLabel = formatDurationUntilReset(
    msUntilNextMidnightInZone(now, LIMA_TZ),
  );

  const remaining = quota?.remaining ?? null;
  const limit = quota?.limit ?? null;
  const used = quota?.used ?? null;

  const hasData = remaining !== null && limit !== null && used !== null;
  const usedPct =
    hasData && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const remainingPct = hasData ? 100 - usedPct : 0;

  const status: "ok" | "low" | "depleted" = !hasData
    ? "ok"
    : remaining === 0
      ? "depleted"
      : remainingPct < 20
        ? "low"
        : "ok";

  const isTest = quota?.mode === "test";

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
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative">
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
                Reinicia en {resetInLabel}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${statusConfig.badgeClass}`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusConfig.badge}
            </span>
            {isTest && (
              <span className="inline-flex items-center gap-1 rounded-full border border-info/20 bg-info/15 text-info px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                <FlaskConical className="w-3 h-3" />
                Prueba
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-4">
          <span className="text-5xl font-extrabold tracking-tight text-foreground tabular-nums">
            {isLoading ? "…" : isError ? "—" : (remaining ?? 0).toLocaleString()}
          </span>
          {hasData && (
            <span className="text-sm text-muted-foreground font-medium">
              disponibles /{" "}
              <span className="tabular-nums text-foreground">
                {limit!.toLocaleString()}
              </span>{" "}
              límite diario
            </span>
          )}
          {quota?.mode === "production" &&
            !quota.braked &&
            quota.nextLimit !== null && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Cómo aumentar mi límite
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80 text-xs">
                  <p className="font-semibold text-foreground">
                    Cómo aumentar tu límite diario
                  </p>
                  <div className="mt-2 flex items-start gap-1.5 text-foreground">
                    <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="flex-1 font-medium">
                      Vas {quota.streakDays} de {quota.requiredDays} día
                      {quota.requiredDays === 1 ? "" : "s"} cumpliendo la meta de
                      entrega
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    {Array.from({ length: quota.requiredDays }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-2 flex-1 rounded-full ${
                          i < quota.streakDays ? "bg-primary" : "bg-primary/15"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-muted-foreground">
                    {quota.current
                      ? "Según tu último día de envío:"
                      : "Cada día debe cumplir:"}
                  </p>
                  <ul className="mt-1.5 space-y-1 text-muted-foreground">
                    <RuleRow
                      label="Rebote"
                      current={
                        quota.current
                          ? `${quota.current.bouncePct.toFixed(2)}%`
                          : "—"
                      }
                      target={`≤ ${quota.thresholds?.maxBouncePct ?? 3}%`}
                      ok={
                        quota.current
                          ? quota.current.bouncePct <=
                            (quota.thresholds?.maxBouncePct ?? 3)
                          : null
                      }
                    />
                    <RuleRow
                      label="Quejas"
                      current={
                        quota.current
                          ? `${quota.current.complaintPct.toFixed(3)}%`
                          : "—"
                      }
                      target={`≤ ${quota.thresholds?.maxComplaintPct ?? 0.1}%`}
                      ok={
                        quota.current
                          ? quota.current.complaintPct <=
                            (quota.thresholds?.maxComplaintPct ?? 0.1)
                          : null
                      }
                    />
                    <RuleRow
                      label="Uso del límite"
                      current={
                        quota.current
                          ? `${Math.round(quota.current.utilizationPct)}%`
                          : "—"
                      }
                      target={`≥ ${quota.thresholds?.minUtilizationPct ?? 75}%`}
                      ok={
                        quota.current
                          ? quota.current.utilizationPct >=
                            (quota.thresholds?.minUtilizationPct ?? 75)
                          : null
                      }
                    />
                    <RuleRow
                      label="Envíos ese día"
                      current={
                        quota.current ? `${quota.current.dailyVolume}` : "—"
                      }
                      target={`≥ ${quota.thresholds?.minDailyVolume ?? 50}`}
                      ok={
                        quota.current
                          ? quota.current.dailyVolume >=
                            (quota.thresholds?.minDailyVolume ?? 50)
                          : null
                      }
                    />
                  </ul>
                  <p className="mt-2 border-t pt-2 text-muted-foreground">
                    Al cumplirlo subes a{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {quota.nextLimit.toLocaleString()}
                    </span>{" "}
                    envíos/día.
                  </p>
                </PopoverContent>
              </Popover>
            )}
        </div>

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

        {quota?.mode === "test" && (
          <div className="mt-4 rounded-xl border border-info/20 bg-background/60 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Mensajes totales usados</span>
              <span className="font-semibold text-foreground tabular-nums">
                {quota.totalUsed.toLocaleString()}
                {quota.totalLimit !== null
                  ? ` / ${quota.totalLimit.toLocaleString()}`
                  : ""}
              </span>
            </div>
            {quota.totalLimit !== null && (
              <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-info/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-info to-info/70 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      quota.totalLimit > 0
                        ? Math.round((quota.totalUsed / quota.totalLimit) * 100)
                        : 0,
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {quota?.mode === "production" &&
          (quota.braked ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                Reducimos temporalmente tu límite por métricas de rebote o quejas
                elevadas. Se restablecerá al mejorar la entrega.
              </p>
            </div>
          ) : quota.nextLimit !== null ? null : (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 p-3">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <p className="text-xs text-success">
                Estás en el nivel máximo de envío diario.
              </p>
            </div>
          ))}

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
