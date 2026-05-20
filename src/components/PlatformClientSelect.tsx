import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminClientRow } from "@/lib/platformAdminClients";

const NONE_VALUE = "__none__";

type PlatformClientSelectProps = {
  id?: string;
  value: string;
  onChange: (clientId: string) => void;
  clients: AdminClientRow[];
  loading?: boolean;
  disabled?: boolean;
};

export function PlatformClientSelect({
  id,
  value,
  onChange,
  clients,
  loading = false,
  disabled = false,
}: PlatformClientSelectProps) {
  const knownIds = new Set(clients.map((c) => c.id));
  const orphanId = value !== "" && !knownIds.has(value) ? value : null;
  const selectValue = value === "" ? NONE_VALUE : value;

  return (
    <Select
      value={selectValue}
      onValueChange={(next) => onChange(next === NONE_VALUE ? "" : next)}
      disabled={disabled || loading}
    >
      <SelectTrigger id={id} className="font-mono text-sm">
        <SelectValue
          placeholder={loading ? "Cargando clientes…" : "Seleccionar cliente"}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>Sin cliente</SelectItem>
        {orphanId && (
          <SelectItem value={orphanId}>
            {orphanId} (no listado)
          </SelectItem>
        )}
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            {client.name} — {client.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function clientLabelById(
  clients: AdminClientRow[],
  clientId: string | null,
): string {
  if (!clientId) return "—";
  const match = clients.find((c) => c.id === clientId);
  return match ? `${match.name}` : clientId;
}
