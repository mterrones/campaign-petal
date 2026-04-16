import { useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { BarChart3, Eye, MousePointerClick, Send, AlertCircle } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import type { ApiMessageListItem } from "@/lib/platformReports";
import {
  defaultDateRange,
  fetchApiMessagesListPage,
  fetchApiMessagesReport,
  platformApiMessagesListQueryKey,
  platformApiMessagesReportQueryKey,
} from "@/lib/platformReports";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function deliveryStatusLabel(status: string): string {
  const map: Record<string, string> = {
    queued: "En cola",
    sent: "Enviado",
    delivered: "Entregado",
    failed: "Fallido",
    bounced: "Rebotado",
  };
  return map[status] ?? status;
}

function deliveryStatusClass(status: string): string {
  if (status === "sent" || status === "delivered") return "text-emerald-700 dark:text-emerald-400";
  if (status === "queued") return "text-muted-foreground";
  if (status === "failed") return "text-destructive";
  if (status === "bounced") return "text-amber-700 dark:text-amber-400";
  return "";
}

function formatMessageWhen(m: ApiMessageListItem): string {
  const iso = m.sentAt ?? m.createdAt;
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

const ReportsApi = () => {
  const { token, user } = useAuth();
  const initial = useMemo(() => defaultDateRange(30), []);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [applied, setApplied] = useState({ from: initial.from, to: initial.to });

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: platformApiMessagesReportQueryKey(applied.from, applied.to),
    queryFn: () =>
      fetchApiMessagesReport(token!, applied.from, applied.to),
    enabled: !!token && applied.from <= applied.to,
  });

  const listQuery = useInfiniteQuery({
    queryKey: platformApiMessagesListQueryKey(applied.from, applied.to),
    queryFn: ({ pageParam }) =>
      fetchApiMessagesListPage(token!, applied.from, applied.to, pageParam, 50),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled:
      !!token && !!user?.clientId && applied.from <= applied.to,
  });

  const applyFilters = () => {
    if (from > to) return;
    setApplied({ from, to });
  };

  const agg = data?.aggregate;
  const chartData =
    data?.byDay.map((row) => ({
      name: row.day.slice(5),
      Enviados: row.total,
      Entregados: row.delivered,
      Abiertos: row.opened,
      Clicks: row.clicked,
    })) ?? [];

  const detailRows =
    listQuery.data?.pages.flatMap((p) => p.messages) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes · API</h1>
        <p className="text-muted-foreground mt-1">
          Envíos vía <code className="text-xs bg-muted px-1 rounded">POST /v1/messages</code> (sin campaña), filtrados por fecha de envío o creación.
        </p>
      </div>

      {data?.noClient && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <p>
            Tu usuario no tiene un cliente asociado. Las estadísticas de API usan el{" "}
            <span className="font-medium">client_id</span> de la clave API; asocia un cliente a tu cuenta para ver datos.
          </p>
        </div>
      )}

      <div className="stat-card flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="rep-from">Desde</Label>
          <input
            id="rep-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rep-to">Hasta</Label>
          <input
            id="rep-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button type="button" onClick={applyFilters} disabled={from > to}>
          Aplicar
        </Button>
      </div>

      {isPending && (
        <p className="text-muted-foreground text-sm">Cargando datos…</p>
      )}

      {isError && (
        <p className="text-destructive text-sm">
          {error instanceof Error ? error.message : "Error al cargar reportes"}
          <Button variant="link" className="ml-2 p-0 h-auto" onClick={() => refetch()}>
            Reintentar
          </Button>
        </p>
      )}

      {!isPending && !isError && agg && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total mensajes" value={agg.total.toLocaleString()} icon={Send} />
            <StatCard
              title="Entregados"
              value={agg.delivered.toLocaleString()}
              icon={Send}
              iconColor="bg-success/10 text-success"
            />
            <StatCard
              title="Abiertos"
              value={agg.opened.toLocaleString()}
              icon={Eye}
              iconColor="bg-warning/10 text-warning"
            />
            <StatCard
              title="Clicks"
              value={agg.clicked.toLocaleString()}
              icon={MousePointerClick}
              iconColor="bg-info/10 text-info"
            />
          </div>

          <div className="stat-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              Actividad por día (UTC)
            </h3>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No hay envíos por API en este rango de fechas.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Enviados" fill="hsl(214, 32%, 60%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Entregados" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Abiertos" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Clicks" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {user?.clientId && (
            <div className="stat-card">
              <h3 className="font-semibold mb-4">Detalle de envíos</h3>
              {listQuery.isPending && (
                <p className="text-sm text-muted-foreground py-6">Cargando mensajes…</p>
              )}
              {listQuery.isError && (
                <p className="text-destructive text-sm">
                  No se pudo cargar el listado.
                </p>
              )}
              {!listQuery.isPending &&
                !listQuery.isError &&
                detailRows.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No hay mensajes en este rango.
                  </p>
                )}
              {!listQuery.isPending && !listQuery.isError && detailRows.length > 0 && (
                <>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Fecha y hora</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Para</TableHead>
                          <TableHead className="min-w-[180px]">Asunto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailRows.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell className="whitespace-nowrap text-sm font-mono tabular-nums">
                              {formatMessageWhen(m)}
                            </TableCell>
                            <TableCell
                              className={`text-sm font-medium ${deliveryStatusClass(m.deliveryStatus)}`}
                            >
                              {deliveryStatusLabel(m.deliveryStatus)}
                            </TableCell>
                            <TableCell className="text-sm max-w-[220px] truncate" title={m.to}>
                              {m.to}
                            </TableCell>
                            <TableCell className="text-sm max-w-[280px] truncate" title={m.subject}>
                              {m.subject || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {listQuery.hasNextPage && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={listQuery.isFetchingNextPage}
                        onClick={() => listQuery.fetchNextPage()}
                      >
                        {listQuery.isFetchingNextPage ? "Cargando…" : "Cargar más"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsApi;
