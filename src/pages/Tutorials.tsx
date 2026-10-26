import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Tutorials = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary shrink-0" />
          Tutoriales
        </h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          Recorridos animados para aprender a usar la plataforma paso a paso.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tu primera campaña</CardTitle>
          <CardDescription>
            Ingresar, crear una plantilla, enviar una prueba, lanzar la campaña a una agenda y revisar los reportes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-[16/10] w-full overflow-hidden rounded-lg border bg-muted">
            <iframe
              src="/tutoriales/primera-campana.html"
              title="Tutorial: tu primera campaña"
              className="h-full w-full"
              loading="lazy"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tutorials;
