import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Eye,
  MousePointerClick,
  Send,
  AlertCircle,
  AlertTriangle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MessageTimelineDialog from "@/components/MessageTimelineDialog";
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
import { formatDateTimeGmtMinus5, formatChartDayLabel } from "@/lib/dateTimeGmtMinus5";
import {
  buildApiMessagesExportPath,
  defaultDateRange,
  fetchApiMessagePreview,
  fetchApiMessagesListPage,
  fetchApiMessagesReport,
  platformApiMessagesListQueryKey,
  platformApiMessagesReportQueryKey,
  type MessageSort,
} from "@/lib/platformReports";
import { mailingApiV1Path } from "@/lib/api";
import DeliveryStatusBadge from "@/components/reports/DeliveryStatusBadge";
import StatusFacetFilter from "@/components/reports/StatusFacetFilter";
import AppliedFilterChips, {
  type AppliedFilterChip,
} from "@/components/reports/AppliedFilterChips";
import PageSizeSelect from "@/components/reports/PageSizeSelect";
import SortableHeader from "@/components/reports/SortableHeader";
import ExportMenu from "@/components/reports/ExportMenu";
import RateStatCard from "@/components/reports/RateStatCard";
import { getDeliveryStatusMeta } from "@/components/reports/deliveryStatusMeta";
import ApexChart from "@/components/charts/ApexChart";
import { apexPalette, baseChartOptions } from "@/lib/apexTheme";
import type { ApexOptions } from "apexcharts";

const ReportsApi = () => {
  const { token, user } = useAuth();
  const initial = useMemo(() => defaultDateRange(30), []);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [applied, setApplied] = useState({
    from: initial.from,
    to: initial.to,
    email: "",
    subject: "",
    content: "",
  });
  const [statuses, setStatuses] = useState<string[]>([]);
  const [sort, setSort] = useState<MessageSort | undefined>(undefined);
  const [pageSize, setPageSize] = useState(25);
  const [listPage, setListPage] = useState(1);
  const [previewMessageId, setPreviewMessageId] = useState<string | null>(null);
  const [timelineMessageId, setTimelineMessageId] = useState<string | null>(null);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: platformApiMessagesReportQueryKey(applied.from, applied.to),
    queryFn: () =>
      fetchApiMessagesReport(token!, applied.from, applied.to),
    enabled: !!token && applied.from <= applied.to,
  });

  const appliedFilters = {
    email: applied.email,
    subject: applied.subject,
    content: applied.content,
    statuses,
  };

  const listQuery = useQuery({
    queryKey: platformApiMessagesListQueryKey(
      applied.from,
      applied.to,
      listPage,
      pageSize,
      appliedFilters,
      sort,
    ),
    queryFn: () =>
      fetchApiMessagesListPage(
        token!,
        applied.from,
        applied.to,
        listPage,
        pageSize,
        appliedFilters,
        sort,
      ),
    enabled:
      !!token && !!user?.clientId && applied.from <= applied.to,
  });

  const previewQuery = useQuery({
    queryKey: ["platform", "reports", "api-message-preview", previewMessageId],
    queryFn: () => fetchApiMessagePreview(token!, previewMessageId!),
    enabled: !!token && !!previewMessageId,
  });

  const applyFilters = () => {
    if (from > to) return;
    setApplied({
      from,
      to,
      email: email.trim(),
      subject: subject.trim(),
      content: content.trim(),
    });
  };

  const clearSearch = () => {
    setEmail("");
    setSubject("");
    setContent("");
    setApplied((prev) => ({ ...prev, email: "", subject: "", content: "" }));
  };

  const statusesKey = statuses.join(",");
  const sortKey = sort ? `${sort.field}:${sort.dir}` : "";

  useEffect(() => {
    setListPage(1);
  }, [
    applied.from,
    applied.to,
    applied.email,
    applied.subject,
    applied.content,
    statusesKey,
    sortKey,
    pageSize,
  ]);

  useEffect(() => {
    const tp = listQuery.data?.totalPages;
    if (tp != null && tp > 0 && listPage > tp) {
      setListPage(tp);
    }
  }, [listQuery.data?.totalPages, listPage]);

  const agg = data?.aggregate;
  const percent = (numerator: number, denominator: number): string =>
    denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : "0.0";

  const exportPath = buildApiMessagesExportPath(
    applied.from,
    applied.to,
    appliedFilters,
    sort,
  );

  const filterChips: AppliedFilterChip[] = [
    ...(applied.email
      ? [
          {
            key: "email",
            label: `Correo: ${applied.email}`,
            onRemove: () => {
              setEmail("");
              setApplied((prev) => ({ ...prev, email: "" }));
            },
          },
        ]
      : []),
    ...(applied.subject
      ? [
          {
            key: "subject",
            label: `Asunto: ${applied.subject}`,
            onRemove: () => {
              setSubject("");
              setApplied((prev) => ({ ...prev, subject: "" }));
            },
          },
        ]
      : []),
    ...(applied.content
      ? [
          {
            key: "content",
            label: `Contenido: ${applied.content}`,
            onRemove: () => {
              setContent("");
              setApplied((prev) => ({ ...prev, content: "" }));
            },
          },
        ]
      : []),
    ...statuses.map((status) => ({
      key: `status-${status}`,
      label: `Estado: ${getDeliveryStatusMeta(status).label}`,
      onRemove: () => setStatuses((prev) => prev.filter((s) => s !== status)),
    })),
  ];

  const clearAllFilters = () => {
    setEmail("");
    setSubject("");
    setContent("");
    setStatuses([]);
    setApplied((prev) => ({ ...prev, email: "", subject: "", content: "" }));
  };

  const chartData =
    data?.byDay.map((row) => ({
      name: formatChartDayLabel(row.day),
      Enviados: row.total,
      Entregados: row.delivered,
      Abiertos: row.opened,
      Clicks: row.clicked,
    })) ?? [];

  const listPayload = listQuery.data;
  const detailRows = listPayload?.messages ?? [];
  const listTotal = listPayload?.total ?? 0;
  const totalPages = listPayload?.totalPages ?? 0;
  const rangeFrom =
    listTotal === 0 ? 0 : (listPage - 1) * pageSize + 1;
  const rangeTo = Math.min(listPage * pageSize, listTotal);

  return (
    <div className="space-y-6">
      <Dialog
        open={previewMessageId != null}
        onOpenChange={(open) => {
          if (!open) setPreviewMessageId(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle className="pr-8 leading-snug">
              {previewQuery.data?.subject?.trim() || "Correo enviado"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Vista previa del contenido enviado por API para este destinatario.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 min-h-0 flex-1 flex flex-col overflow-hidden">
            {previewQuery.isPending && (
              <p className="text-sm text-muted-foreground py-8 text-center">Cargando contenido…</p>
            )}
            {previewQuery.isError && (
              <p className="text-sm text-destructive py-8 text-center">
                No se pudo cargar el correo.
              </p>
            )}
            {previewQuery.data && !previewQuery.isPending && (
              <div className="rounded-md border bg-muted/20 overflow-hidden flex-1 min-h-[min(420px,50vh)] flex flex-col">
                {previewQuery.data.htmlBody ? (
                  <iframe
                    title="Vista previa del correo"
                    sandbox=""
                    srcDoc={previewQuery.data.htmlBody}
                    className="w-full flex-1 min-h-[360px] border-0 bg-background"
                  />
                ) : previewQuery.data.textBody ? (
                  <pre className="p-4 text-sm whitespace-pre-wrap font-sans overflow-auto flex-1">
                    {previewQuery.data.textBody}
                  </pre>
                ) : (
                  <p className="p-6 text-sm text-muted-foreground text-center">
                    No hay cuerpo HTML ni texto guardado para este envío.
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MessageTimelineDialog
        messageId={timelineMessageId}
        open={timelineMessageId != null}
        onOpenChange={(open) => {
          if (!open) setTimelineMessageId(null);
        }}
      />

      <div>
        <h1 className="text-2xl font-bold">Reportes · API</h1>
        <p className="text-muted-foreground mt-1">
          Envíos vía{" "}
          <code className="text-xs bg-muted px-1 rounded">
            {`POST ${mailingApiV1Path}/messages`}
          </code>{" "}
          (sin campaña), filtrados por fecha de envío o creación.
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
        <div className="space-y-2 sm:min-w-[180px] sm:flex-1">
          <Label htmlFor="rep-email">Correo</Label>
          <input
            id="rep-email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="destinatario@dominio.com"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2 sm:min-w-[180px] sm:flex-1">
          <Label htmlFor="rep-subject">Asunto</Label>
          <input
            id="rep-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Texto del asunto"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2 sm:min-w-[180px] sm:flex-1">
          <Label htmlFor="rep-content">Contenido</Label>
          <input
            id="rep-content"
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Texto del cuerpo"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={applyFilters} disabled={from > to}>
            Aplicar
          </Button>
          {(applied.email || applied.subject || applied.content) && (
            <Button type="button" variant="outline" onClick={clearSearch}>
              Limpiar
            </Button>
          )}
          <StatusFacetFilter selected={statuses} onChange={setStatuses} />
        </div>
      </div>

      {user?.clientId && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AppliedFilterChips chips={filterChips} onClearAll={clearAllFilters} />
          <div className="flex items-center gap-2 sm:ml-auto">
            <PageSizeSelect value={pageSize} onChange={setPageSize} />
            <ExportMenu
              buildPath={() => exportPath}
              filename={`reporte-api-${applied.from}_${applied.to}.csv`}
              disabled={listTotal === 0}
            />
          </div>
        </div>
      )}

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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <RateStatCard
              title="Entrega"
              percent={`${percent(agg.delivered, agg.total)}%`}
              detail={`${agg.delivered.toLocaleString()} de ${agg.total.toLocaleString()}`}
              icon={Send}
              iconColor="bg-success/10 text-success"
              tooltip="Porcentaje de mensajes aceptados por el servidor destino (enviados, entregados o en cola) sobre el total."
            />
            <RateStatCard
              title="Apertura"
              percent={`${percent(agg.opened, agg.delivered)}%`}
              detail={`${agg.opened.toLocaleString()} de ${agg.delivered.toLocaleString()}`}
              icon={Eye}
              iconColor="bg-warning/10 text-warning"
              tooltip="Porcentaje de mensajes entregados que fueron abiertos al menos una vez."
            />
            <RateStatCard
              title="Click"
              percent={`${percent(agg.clicked, agg.opened)}%`}
              detail={`${agg.clicked.toLocaleString()} de ${agg.opened.toLocaleString()}`}
              icon={MousePointerClick}
              iconColor="bg-info/10 text-info"
              tooltip="Porcentaje de mensajes abiertos con al menos un click en un enlace."
            />
            <RateStatCard
              title="Rebote"
              percent={`${percent(agg.bounced, agg.total)}%`}
              detail={`${agg.bounced.toLocaleString()} de ${agg.total.toLocaleString()}`}
              icon={AlertTriangle}
              iconColor="bg-destructive/10 text-destructive"
              tooltip="Porcentaje de mensajes que rebotaron (no pudieron entregarse) sobre el total."
            />
            <RateStatCard
              title="Queja"
              percent={`${percent(agg.complained, agg.total)}%`}
              detail={`${agg.complained.toLocaleString()} de ${agg.total.toLocaleString()}`}
              icon={Ban}
              iconColor="bg-destructive/10 text-destructive"
              tooltip="Porcentaje de destinatarios que marcaron el mensaje como spam sobre el total."
            />
          </div>

          <div className="stat-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              Actividad por día (GMT-5)
            </h3>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No hay envíos por API en este rango de fechas.
              </p>
            ) : (
              <ApexChart
                type="bar"
                height={340}
                series={[
                  { name: "Enviados", data: chartData.map((d) => d.Enviados) },
                  { name: "Entregados", data: chartData.map((d) => d.Entregados) },
                  { name: "Abiertos", data: chartData.map((d) => d.Abiertos) },
                  { name: "Clicks", data: chartData.map((d) => d.Clicks) },
                ]}
                options={{
                  ...baseChartOptions,
                  chart: { ...baseChartOptions.chart, type: "bar", stacked: false },
                  colors: [apexPalette.muted, apexPalette.success, apexPalette.warning, apexPalette.info],
                  plotOptions: {
                    bar: {
                      horizontal: false,
                      columnWidth: "65%",
                      borderRadius: 5,
                      borderRadiusApplication: "end",
                    },
                  },
                  stroke: { show: true, width: 2, colors: ["transparent"] },
                  xaxis: {
                    ...baseChartOptions.xaxis,
                    categories: chartData.map((d) => d.name),
                  },
                  yaxis: {
                    ...baseChartOptions.yaxis,
                    labels: { ...(baseChartOptions.yaxis as { labels?: object })?.labels, formatter: (v: number) => v.toLocaleString() },
                  },
                  legend: { ...baseChartOptions.legend, position: "top", horizontalAlign: "right" },
                  tooltip: { ...baseChartOptions.tooltip, shared: true, intersect: false, y: { formatter: (v: number) => v.toLocaleString() } },
                } satisfies ApexOptions}
              />
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
                    {applied.email ||
                    applied.subject ||
                    applied.content ||
                    statuses.length > 0
                      ? "No hay mensajes que coincidan con los filtros."
                      : "No hay mensajes en este rango."}
                  </p>
                )}
              {!listQuery.isPending && !listQuery.isError && detailRows.length > 0 && (
                <>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Destinatario</TableHead>
                          <SortableHeader
                            field="delivery_status"
                            label="Estado"
                            sort={sort}
                            onSort={setSort}
                          />
                          <SortableHeader
                            field="open_count"
                            label="Aperturas"
                            sort={sort}
                            onSort={setSort}
                            align="right"
                          />
                          <SortableHeader
                            field="click_count"
                            label="Clicks"
                            sort={sort}
                            onSort={setSort}
                            align="right"
                          />
                          <SortableHeader
                            field="sent_at"
                            label="Enviado"
                            sort={sort}
                            onSort={setSort}
                          />
                          <TableHead className="min-w-[160px]">Asunto</TableHead>
                          <TableHead className="w-[180px] text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailRows.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell className="font-mono text-xs max-w-[200px] truncate" title={m.to}>
                              {m.to}
                            </TableCell>
                            <TableCell>
                              <DeliveryStatusBadge status={m.deliveryStatus} />
                            </TableCell>
                            <TableCell className="text-right text-sm">{m.openCount}</TableCell>
                            <TableCell className="text-right text-sm">{m.clickCount}</TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                              {formatDateTimeGmtMinus5(m.sentAt ?? m.createdAt)}
                            </TableCell>
                            <TableCell className="text-sm max-w-[240px] truncate" title={m.subject}>
                              {m.subject || "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => setPreviewMessageId(m.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                  Ver
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => setTimelineMessageId(m.id)}
                                >
                                  <Clock className="w-4 h-4" />
                                  Tiempos
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-muted-foreground">
                        Mostrando{" "}
                        <span className="font-medium text-foreground tabular-nums">
                          {rangeFrom}–{rangeTo}
                        </span>{" "}
                        de{" "}
                        <span className="font-medium text-foreground tabular-nums">
                          {listTotal.toLocaleString()}
                        </span>
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={listPage <= 1 || listQuery.isFetching}
                          onClick={() => setListPage((p) => Math.max(1, p - 1))}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground tabular-nums px-2">
                          Página {listPage} de {totalPages}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            listPage >= totalPages || listQuery.isFetching
                          }
                          onClick={() =>
                            setListPage((p) =>
                              totalPages > 0 ? Math.min(totalPages, p + 1) : p,
                            )
                          }
                        >
                          Siguiente
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {totalPages === 1 && listTotal > 0 && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {listTotal.toLocaleString()} mensaje
                      {listTotal === 1 ? "" : "s"} en este rango.
                    </p>
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
