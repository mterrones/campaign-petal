import { useEffect, useState, useMemo } from "react";
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

/* ── Floating envelopes animation ── */
interface Envelope {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
  opacity: number;
}

const FloatingEnvelopes = () => {
  const envelopes = useMemo<Envelope[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: 8 + Math.random() * 84,
      size: 18 + Math.random() * 22,
      delay: Math.random() * 6,
      duration: 10 + Math.random() * 8,
      rotate: -30 + Math.random() * 60,
      opacity: 0.06 + Math.random() * 0.09,
    })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {envelopes.map((e) => (
        <div
          key={e.id}
          className="absolute animate-float-envelope"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.duration}s`,
            opacity: e.opacity,
            transform: `rotate(${e.rotate}deg)`,
          }}
        >
          {/* Paper plane / envelope SVG */}
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="4" y="14" width="56" height="36" rx="4" fill="currentColor" className="text-primary-foreground" />
            <path d="M4 18l28 18 28-18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
            <path d="M4 50l20-16M60 50L40 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary/60" />
          </svg>
        </div>
      ))}

      {/* A few paper-plane style shapes */}
      {[0, 1, 2].map((i) => (
        <div
          key={`plane-${i}`}
          className="absolute animate-float-plane"
          style={{
            left: `${15 + i * 30}%`,
            width: 28 + i * 6,
            height: 28 + i * 6,
            animationDelay: `${2 + i * 3}s`,
            animationDuration: `${12 + i * 4}s`,
            opacity: 0.08 + i * 0.03,
          }}
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M4 24l40-18-12 18 12 18L4 24z" fill="currentColor" className="text-primary-foreground" />
            <path d="M32 24H16" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" />
          </svg>
        </div>
      ))}
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
        {/* Floating envelopes */}
        <FloatingEnvelopes />
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
