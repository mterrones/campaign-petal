import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadBlob, fetchBlob } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type ExportMenuProps = {
  buildPath: () => string;
  filename: string;
  disabled?: boolean;
};

const ExportMenu = ({ buildPath, filename, disabled }: ExportMenuProps) => {
  const { token } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleCsvExport = async () => {
    if (!token || isExporting) return;
    setIsExporting(true);
    try {
      const blob = await fetchBlob(buildPath(), token);
      downloadBlob(blob, filename);
    } catch {
      toast("No se pudo exportar el reporte.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={disabled || isExporting || !token}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => void handleCsvExport()}>
          <FileText className="mr-2 h-4 w-4" />
          Descargar CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;
