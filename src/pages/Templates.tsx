import { LayoutTemplate } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Templates = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Plantillas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Guarda y reutiliza diseños de correo para tus campañas.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LayoutTemplate className="w-5 h-5 shrink-0" />
            Próximamente
          </CardTitle>
          <CardDescription>
            Aquí podrás crear y administrar plantillas de email.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
};

export default Templates;
