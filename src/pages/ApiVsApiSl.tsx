import { Link } from "react-router-dom";
import { ArrowLeft, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiVsApiSlDocs } from "@/components/ApiVsApiSlDocs";

const ApiVsApiSl = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitCompare className="h-7 w-7 text-primary shrink-0" />
            API vs API SL
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
            Elija el host según su etapa: integración directa con feedback inmediato, o
            gateway resiliente con aceptación asíncrona.
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 w-full sm:w-auto" asChild>
          <Link to="/api-keys?tab=api-key">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a documentación
          </Link>
        </Button>
      </div>

      <ApiVsApiSlDocs />
    </div>
  );
};

export default ApiVsApiSl;
