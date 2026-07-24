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
  head: () => ({ meta: [{ title: "Register — AVC" }] }),
});

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  leadership_code?: string;
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
          leadership_code: data.leadership_code,
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
        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} St. Barnabas AVC</p>
      </div>

      <div className="flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="shadow-elegant border-border/60">
            <CardContent className="p-6 space-y-5">
              <Logo className="mx-auto" />
              <div>
                <h2 className="text-2xl font-bold">Create your account</h2>
                <p className="text-sm text-muted-foreground mt-1">All fields are required unless noted.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="First Name" error={errors.first_name?.message}>
                    <Input placeholder="Grace" {...register("first_name", { required: "Required" })} />
                  </Field>
                  <Field label="Last Name" error={errors.last_name?.message}>
                    <Input placeholder="Muthoni" {...register("last_name", { required: "Required" })} />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Email" error={errors.email?.message}>
                    <Input type="email" placeholder="Enter your email" {...register("email", { required: "Required" })} />
                  </Field>
                  <Field label="Phone" error={errors.phone?.message}>
                    <Input placeholder="Enter your phone number" {...register("phone", { required: "Required" })} />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Password" error={errors.password?.message}>
                    <Input type="password" placeholder="Enter your password" {...register("password", { required: "Required", minLength: 6 })} />
                  </Field>
                  <Field label="Confirm Password" error={errors.confirm?.message}>
                    <Input type="password" placeholder="Confirm your password" {...register("confirm", { required: "Required", validate: (v) => v === watch("password") || "Passwords don't match" })} />
                  </Field>
                </div>

                <div className="rounded-lg border border-dashed border-gold/60 bg-gold/5 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-gold-foreground" />
                    <Label className="text-sm font-semibold">Leadership Access Code (optional)</Label>
                  </div>
                  <Input placeholder="Leave blank for member access" {...register("leadership_code")} />
                  <p className="text-[11px] text-muted-foreground">
                    If provided, the backend validates it for the President login flow. Leave blank for normal member registration.
                  </p>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground shadow-elegant">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Account
                </Button>
              </form>
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-secondary font-medium hover:underline">
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
