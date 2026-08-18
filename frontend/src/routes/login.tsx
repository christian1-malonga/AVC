import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/lib/auth/context";
import { authService } from "@/lib/api/services/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in - AVC Administration" }] }),
});

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.42Z"
      />
      <path
        fill="#34A853"
        d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.7Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.78A5.85 5.85 0 0 1 6.23 12c0-.62.11-1.22.31-1.78V7.69H3.3A9.73 9.73 0 0 0 2.27 12c0 1.57.38 3.05 1.03 4.31l3.24-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.19c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.28 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z"
      />
    </svg>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email || !password) return toast.error("Email and password are required.");
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      login(response.data.user, response.data.token);
      navigate({ to: "/select-section" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#173a82] px-4 py-10 pb-24 text-[#11133f]">
      <section className="w-full max-w-[600px] rounded-[22px] bg-[#f1f1f3] px-8 py-10  shadow-2xl sm:px-16 sm:py-12">
        <div className="flex flex-col items-center text-center">
          <Logo hideText large className="h-24 w-24" />
          <div className="mt-3 text-center">
            <p className="font-serif text-[17px] font-bold uppercase leading-tight tracking-[-0.02em] text-[#101553]">
              ST. BARNABAS
              <br />
              AMAZING VOICES CHOIR
            </p>
            <p className="mt-2 font-serif text-sm text-[#101553]">Sing Praises to the Lord</p>
          </div>
        </div>
        <div className="mx-auto mt-8 w-full max-w-[282px]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                className="h-9 rounded-md border-[#56565f] bg-white text-sm"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => toast.info("Password reset is coming soon.")}
                  className="text-sm font-medium text-[#e1b84d] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-9 rounded-md border-[#56565f] bg-white pr-9 text-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c8c8cc]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-md bg-[#ffad08] text-base font-medium text-[#171717] hover:bg-[#f4a300]"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Sign in
            </Button>
          </form>
          <div className="my-3 flex items-center gap-2 text-xs">
            <span className="h-px flex-1 bg-[#6f6f75]" />
            <span>OR</span>
            <span className="h-px flex-1 bg-[#6f6f75]" />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.info("Google sign-in is coming soon.")}
            className="h-10 w-full rounded-md border-[#56565f] bg-white text-sm font-normal text-[#77777e] hover:bg-white"
          >
            <GoogleMark />
            <span className="ml-3">Continue with Google</span>
          </Button>
          <p className="mt-6 text-center text-xs text-[#e1b84d]">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </section>
      <footer className="absolute inset-x-0 bottom-0 flex h-14 items-center justify-center bg-[#071e3d] px-4 text-center text-xs text-white/80">
        © 2026 St. Barnabas Amazing Voices Choir. All rights Reserved
      </footer>
    </main>
  );
}
