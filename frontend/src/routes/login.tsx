import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/lib/auth/context";
import { authService } from "@/lib/api/services/auth";
import { toast } from "sonner";
import type { AuthUser } from "@/lib/api/services/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in — AVC Administration" }] }),
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return toast.error("Email and password are required.");
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      const user = response.data.user;
      login(user, response.data.token);
      // Skip section selection if user already has a section
      if (user.section) {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/select-section" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed. Please check your credentials.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_minmax(420px,480px)] bg-background">
      {/* Institutional left panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-border">
        <Logo invert />

        <div className="max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/50">
            <span className="h-px w-8 bg-white/30" /> Established 1987
          </div>
          <h1 className="text-3xl font-semibold leading-[1.15] tracking-tight text-white">
            Membership, finance, and repertoire management for St. Barnabas AVC.
          </h1>
          <p className="text-sm text-white/60 leading-relaxed">
            A secure administrative environment for choir leadership. All activity is logged and access is
            restricted to verified members.
          </p>

          <dl className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
            <div>
              <dt className="text-[11px] uppercase tracking-widest text-white/40">Sections</dt>
              <dd className="text-lg font-semibold text-white mt-1">4</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-widest text-white/40">Uptime</dt>
              <dd className="text-lg font-semibold text-white mt-1">99.9%</dd>
            </div>
          </dl>
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/40">
          <span>© {new Date().getFullYear()} St. Barnabas AVC</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> TLS 1.3 · SSO Ready</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo compact />
          </div>

          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Sign in</p>
            <h2 className="text-2xl font-semibold tracking-tight">Access your account</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Use your registered email and password. Access is limited to approved members.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-10 rounded-sm"
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                <button type="button" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-10 pr-10 rounded-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-muted-foreground select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-3.5 w-3.5 rounded-sm border-border accent-foreground"
              />
              Keep me signed in on this device
            </label>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Sign in
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
            <span>Need an account?</span>
            <Link to="/register" className="text-foreground font-medium hover:underline underline-offset-2">
              Request access →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
