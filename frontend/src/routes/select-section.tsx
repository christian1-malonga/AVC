import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Music2, Music3, Music4, Music, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { authService } from "@/lib/api/services/auth";
import { Logo } from "@/components/layout/Logo";
import { toast } from "sonner";

const SECTIONS = [
  { id: "soprano", name: "Soprano", tagline: "Highest voices, bright & soaring", icon: Music4, color: "from-pink-500 to-rose-500" },
  { id: "alto", name: "Alto", tagline: "Warm, rich middle range", icon: Music3, color: "from-amber-500 to-orange-500" },
  { id: "tenor", name: "Tenor", tagline: "Bright male voices with power", icon: Music2, color: "from-emerald-500 to-teal-500" },
  { id: "bass", name: "Bass", tagline: "The deep foundation of harmony", icon: Music, color: "from-indigo-500 to-blue-600" },
] as const;

export const Route = createFileRoute("/select-section")({
  component: SelectSectionPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Choose your section — AVC" }] }),
});

function SelectSectionPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  async function handleContinue() {
    if (!selected) return;
    setSaving(true);

    try {
      await authService.setSection(selected);
      updateUser({ section: selected as "bass" | "tenor" | "alto" | "soprano" });
      toast.success(`Welcome to the ${selected} section!`);
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      // If user already has a section (403), just go to dashboard
      if (error?.response?.status === 403) {
        toast("Section already set. Redirecting to dashboard.");
        navigate({ to: "/dashboard" });
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to set section. Please try again.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-6 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_20%_30%,white,transparent_40%)]" />
      <div className="relative w-full max-w-5xl">
        <div className="flex justify-center mb-6">
          <Logo invert />
        </div>
        <div className="text-center mb-8 text-white">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold">
            Choose your <span className="text-gold">choir section</span>
          </motion.h1>
          <p className="mt-2 text-white/80 text-sm">This helps us tailor your rehearsals and sheet music.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTIONS.map((s, i) => {
            const isActive = selected === s.id;
            return (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                onClick={() => setSelected(s.id)}
                className={`relative text-left rounded-2xl p-5 bg-card border-2 transition shadow-soft ${
                  isActive ? "border-gold shadow-elegant" : "border-transparent hover:border-white/40"
                }`}
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${s.color} grid place-items-center text-white shadow-glow mb-4`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="text-lg font-bold text-foreground">🎵 {s.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.tagline}</p>
                {isActive && (
                  <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-gold text-gold-foreground grid place-items-center">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selected || saving}
            size="lg"
            className="bg-gold hover:bg-gold/90 text-gold-foreground shadow-glow px-8"
          >
            Continue to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
