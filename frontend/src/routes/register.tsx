import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/api/services/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Register - AVC Administration" }] }),
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
function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: event.target.value });
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.password)
      return toast.error("All fields are required.");
    setLoading(true);
    try {
      const parts = form.name.trim().split(/\s+/);
      await authService.register({
        first_name: parts[0],
        last_name: parts.slice(1).join(" ") || "Member",
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      toast.success("Registration submitted for administrative approval.");
      navigate({ to: "/login" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1f1f1f] px-4 py-4 text-white sm:px-8">
      <section className="w-full max-w-[430px] rounded-[22px] border border-[#202c9a] bg-[#08084f] px-7 py-7 shadow-2xl sm:px-12 sm:py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-medium">Register</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-normal text-white">
              Name
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={update("name")}
              placeholder="Enter your full name"
              className="h-9 rounded-md border-0 bg-white text-sm text-[#202020] placeholder:text-[#b9b9bd]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-normal text-white">
              Phone Number
            </Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={update("phone")}
              placeholder="Enter your phone number"
              className="h-9 rounded-md border-0 bg-white text-sm text-[#202020] placeholder:text-[#b9b9bd]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-normal text-white">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="Enter your email address"
              className="h-9 rounded-md border-0 bg-white text-sm text-[#202020] placeholder:text-[#b9b9bd]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-normal text-white">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={update("password")}
                placeholder="Enter your password"
                className="h-9 rounded-md border-0 bg-white pr-9 text-sm text-[#202020] placeholder:text-[#b9b9bd]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b9b9bd]"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-md bg-[#515765] text-base font-normal text-white hover:bg-[#626875]"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Register
          </Button>
        </form>
        <div className="my-3 text-center text-sm text-white">or continue with</div>
        <Button
          type="button"
          variant="outline"
          onClick={() => toast.info("Google sign-in is coming soon.")}
          className="h-10 w-full rounded-md border-0 bg-white text-sm font-normal text-[#77777e] hover:bg-white"
        >
          <GoogleMark />
        </Button>
        <p className="mt-5 text-center text-xs text-white">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
