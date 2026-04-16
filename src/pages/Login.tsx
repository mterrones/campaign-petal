import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import logoImg from "@/assets/enviamas-logo-full.png";

/* ── Paper plane doing a figure-8 with trail ── */
const PaperPlaneAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 600 500"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Figure-8 path */}
          <path
            id="figure8"
            d="M300,250
               C300,140 450,80 450,190
               C450,300 300,360 300,250
               C300,140 150,80 150,190
               C150,300 300,360 300,250Z"
            fill="none"
          />
          {/* Gradient for the trail */}
          <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="60%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Trail — animated dashed stroke following same path */}
        <use
          href="#figure8"
          stroke="url(#trailGrad)"
          strokeWidth="2"
          strokeDasharray="80 520"
          strokeLinecap="round"
          fill="none"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="600"
            to="0"
            dur="8s"
            repeatCount="indefinite"
          />
        </use>

        {/* Secondary softer trail */}
        <use
          href="#figure8"
          stroke="white"
          strokeOpacity="0.08"
          strokeWidth="6"
          strokeDasharray="60 540"
          strokeLinecap="round"
          fill="none"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="600"
            to="0"
            dur="8s"
            repeatCount="indefinite"
          />
        </use>

        {/* Sparkle dots along trail */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} r="2" fill="white" opacity="0">
            <animateMotion dur="8s" repeatCount="indefinite" begin={`${i * 0.3}s`}>
              <mpath href="#figure8" />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0;0.5;0"
              dur="1.5s"
              repeatCount="indefinite"
              begin={`${i * 0.3}s`}
            />
          </circle>
        ))}

        {/* The paper plane */}
        <g>
          <animateMotion
            dur="8s"
            repeatCount="indefinite"
            rotate="auto"
          >
            <mpath href="#figure8" />
          </animateMotion>
          {/* plane body */}
          <polygon
            points="-14,0 10,-5 10,5"
            fill="white"
            opacity="0.9"
          />
          {/* wing fold line */}
          <line x1="-8" y1="0" x2="8" y2="0" stroke="white" strokeOpacity="0.3" strokeWidth="0.8" />
          {/* top wing */}
          <polygon
            points="-4,-1 8,-5 6,0"
            fill="white"
            opacity="0.6"
          />
        </g>
      </svg>
    </div>
  );
};
const loginSchema = z.object({
  email: z.string().min(1, "Ingresa el correo").email("Correo no válido"),
  password: z.string().min(1, "Ingresa la contraseña"),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const { user, login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (status === "ready" && user) {
      navigate(from, { replace: true });
    }
  }, [status, user, navigate, from]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
      toast.success("Sesión iniciada");
      navigate(from, { replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        toast.error("Correo o contraseña incorrectos");
      } else {
        toast.error("No se pudo iniciar sesión. Intenta de nuevo.");
      }
    }
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Cargando…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        {/* Paper plane animation */}
        <PaperPlaneAnimation />
        {/* Decorative shapes */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-foreground/5" />
          <div className="absolute bottom-20 -right-16 w-72 h-72 rounded-full bg-primary-foreground/5" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-primary-foreground/5" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground w-full">
          <div>
            <img src={logoImg} alt="EnviaMas" className="h-10 w-auto brightness-0 invert" />
          </div>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              Email marketing que impulsa resultados
            </h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              Crea campañas efectivas, automatiza envíos y analiza el rendimiento de tus correos en una sola plataforma.
            </p>
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold">99.5%</p>
                <p className="text-sm text-primary-foreground/70">Tasa de entrega</p>
              </div>
              <div>
                <p className="text-3xl font-bold">+50K</p>
                <p className="text-sm text-primary-foreground/70">Campañas enviadas</p>
              </div>
              <div>
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm text-primary-foreground/70">Soporte activo</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} EnviaMas. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <img src={logoImg} alt="EnviaMas" className="h-10 w-auto" />
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg shadow-foreground/5 space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Bienvenido de vuelta
              </h2>
              <p className="text-muted-foreground text-sm">
                Ingresa tus credenciales para acceder a tu cuenta
              </p>
            </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  autoComplete="email"
                  className="pl-10 h-11"
                  disabled={form.formState.isSubmitting}
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline font-medium"
                  onClick={() => toast.info("Contacta a soporte para restablecer tu contraseña")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-11"
                  disabled={form.formState.isSubmitting}
                  {...form.register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold gap-2 group"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Ingresando…
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>
          </div>

          <p className="text-center text-xs text-muted-foreground pt-4">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              className="text-primary font-medium hover:underline"
              onClick={() => toast.info("Contacta a ventas para crear tu cuenta")}
            >
              Solicita acceso
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
