import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";

export const Route = createFileRoute("/pending")({
  component: PendingPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Awaiting Approval — AVC" }] }),
});

function PendingPage() {
  return (
    <div className="min-h-screen bg-gradient-hero grid place-items-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_20%_30%,white,transparent_40%),radial-gradient(circle_at_80%_70%,white,transparent_40%)]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-lg">
        <Card className="shadow-elegant border-border/60">
          <CardContent className="p-8 text-center space-y-5">
            <Logo className="mx-auto" />
            <div className="mx-auto h-16 w-16 rounded-full bg-gold/20 grid place-items-center">
              <Clock className="h-8 w-8 text-gold-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Waiting for approval</h1>
            <p className="text-muted-foreground">
              Your account has been created successfully and is <span className="font-medium text-foreground">waiting
              for approval from the President</span>. You'll be notified once approved.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
                <CheckCircle2 className="h-4 w-4" />
                Account created
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning">
                <Clock className="h-4 w-4" />
                Awaiting review
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" /> We'll email you at your registered address.
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
