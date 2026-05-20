import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildFromHeader } from "@/lib/sendingFrom";

type SendDialogSenderFieldsProps = {
  sendingDomains: string[];
  sendDomain: string;
  sendLocalPart: string;
  sendDisplayName: string;
  disabled?: boolean;
  onDomainChange: (domain: string) => void;
  onLocalPartChange: (local: string) => void;
  onDisplayNameChange: (name: string) => void;
};

export function SendDialogSenderFields({
  sendingDomains,
  sendDomain,
  sendLocalPart,
  sendDisplayName,
  disabled,
  onDomainChange,
  onLocalPartChange,
  onDisplayNameChange,
}: SendDialogSenderFieldsProps) {
  const preview =
    sendDomain && sendLocalPart.trim()
      ? buildFromHeader(sendDisplayName, sendLocalPart, sendDomain)
      : null;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="send-domain">Dominio de envío</Label>
        <Select
          value={sendDomain}
          onValueChange={onDomainChange}
          disabled={disabled || sendingDomains.length <= 1}
        >
          <SelectTrigger id="send-domain">
            <SelectValue placeholder="Dominio" />
          </SelectTrigger>
          <SelectContent>
            {sendingDomains.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="send-display-name">Nombre visible del remitente</Label>
        <Input
          id="send-display-name"
          type="text"
          autoComplete="off"
          placeholder="Opcional — ej. Notificaciones Synlab"
          value={sendDisplayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="send-local">Dirección de envío (parte antes de @)</Label>
        <div className="flex gap-2 items-center">
          <Input
            id="send-local"
            type="text"
            autoComplete="off"
            placeholder="ej. notificaciones"
            value={sendLocalPart}
            onChange={(e) => onLocalPartChange(e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground shrink-0">
            @{sendDomain || "…"}
          </span>
        </div>
      </div>
      {preview && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          Se enviará como:{" "}
          <span className="font-medium text-foreground break-all">{preview}</span>
        </p>
      )}
    </>
  );
}
