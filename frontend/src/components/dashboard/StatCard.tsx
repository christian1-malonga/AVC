import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  trend?: string;
  variant?: "primary" | "gold" | "success" | "destructive" | "default";
  delay?: number;
}

const variantClasses: Record<NonNullable<StatCardProps["variant"]>, string> = {
  primary: "bg-gradient-primary text-primary-foreground",
  gold: "bg-gradient-gold text-gold-foreground",
  success: "bg-success text-success-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  default: "bg-card text-card-foreground",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  variant = "default",
  delay = 0,
}: StatCardProps) {
  const filled = variant !== "default";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className={cn("overflow-hidden shadow-soft border-border/60", variantClasses[variant])}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={cn(
                  "text-xs uppercase tracking-wider",
                  filled ? "opacity-80" : "text-muted-foreground",
                )}
              >
                {label}
              </p>
              <p className="mt-1 break-words text-2xl font-bold leading-none sm:text-3xl">
                {value}
              </p>
              {hint && (
                <p className={cn("mt-2 text-xs", filled ? "opacity-80" : "text-muted-foreground")}>
                  {hint}
                </p>
              )}
            </div>
            <div
              className={cn(
                "h-10 w-10 rounded-lg grid place-items-center shrink-0",
                filled ? "bg-white/20" : "bg-primary/10 text-primary",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
          {trend && (
            <p className={cn("text-xs mt-3 font-medium", filled ? "opacity-90" : "text-success")}>
              {trend}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
