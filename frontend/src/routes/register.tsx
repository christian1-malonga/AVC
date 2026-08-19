import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/layout/Logo";
import { authService } from "@/lib/api/services/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Register - AVC" }] }),
});

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
}

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    if (data.password !== data.confirm) return toast.error("Passwords don't match");
    if (data.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);

    try {
      await authService.register({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        });
      toast.success("Registration submitted");
      navigate({ to: "/pending" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_30%_20%,white_0%,transparent_40%),radial-gradient(circle_at_70%_80%,white_0%,transparent_40%)]" />
        <div className="relative">
          <Logo invert />
        </div>
        <div className="relative max-w-md space-y-4">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
            Join a choir that <span className="text-gold">lifts hearts.</span>
          </h1>
          <p className="text-white/80">
            Create your account, wait for the President's approval, then step into the ministry.
          </p>
        </div>
        <p className="relative text-xs text-white/60">
          @ {new Date().getFullYear()} St. Barnabas AVC
        </p>
      </div>

      <div className="flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-elegant border-border/60">
            <CardContent className="p-6 space-y-5">
              <Logo className="mx-auto" />
              <div>
                <h2 className="text-2xl font-bold">Create your account</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  All fields are required unless noted.
                </p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="First Name" error={errors.first_name?.message}>
                    <Input
                      placeholder="Enter your first name"
                      {...register("first_name", { required: "Required" })}
                    />
                  </Field>
                  <Field label="Last Name" error={errors.last_name?.message}>
                    <Input
                      placeholder="Enter your last name"
                      {...register("last_name", { required: "Required" })}
                    />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Email" error={errors.email?.message}>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...register("email", { required: "Required" })}
                    />
                  </Field>
                  <Field label="Phone" error={errors.phone?.message}>
                    <Input
                      placeholder="Enter your phone number"
                      {...register("phone", { required: "Required" })}
                    />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Password" error={errors.password?.message}>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...register("password", { required: "Required", minLength: 6 })}
                    />
                  </Field>
                  <Field label="Confirm Password" error={errors.confirm?.message}>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      {...register("confirm", {
                        required: "Required",
                        validate: (v) => v === watch("password") || "Passwords don't match",
                      })}
                    />
                  </Field>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary text-primary-foreground shadow-elegant"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Account
                </Button>
                <div className="relative flex items-center py-1">
                  <div className="flex-1 border-t border-border/60" />
                  <span className="px-3 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">
                    OR
                  </span>
                  <div className="flex-1 border-t border-border/60" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (window.location.href = "http://localhost:5000/api/auth/google")}
                  className="w-full h-11 border-border/70 bg-white/70 hover:bg-white"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 h-5 w-5">
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
                  Continue with Google
                </Button>
              </form>
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold underline underline-offset-4 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}







