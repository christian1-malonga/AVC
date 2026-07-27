import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Music, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { voiceNotesService, type VoiceNote } from "@/lib/api/services/voice-notes";
import { useAuth } from "@/lib/auth/context";

export const Route = createFileRoute("/_app/voice-notes")({
  component: VoiceNotesPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Voice Notes — AVC" }] }),
});

function VoiceNotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    voiceNotesService
      .list()
      .then((res) => setNotes(res.data))
      .catch(() => toast.error("Failed to load voice notes."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    try {
      await voiceNotesService.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Voice note deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Voice Notes</h2>
        <p className="text-sm text-muted-foreground">Practice recordings and voice guidance clips.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((n) => (
          <Card key={n.id} className="shadow-soft hover:shadow-elegant transition">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center">
                <Mic className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm truncate">{n.title}</CardTitle>
                <p className="text-xs text-muted-foreground capitalize">{n.category}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{n.uploaded_by_name}</span>
                <span>{formatSize(n.size)}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <a href={n.file} target="_blank" rel="noreferrer">
                    <Play className="h-3 w-3 mr-1" /> Play
                  </a>
                </Button>
                {(user?.role === "custodian" || user?.role === "president") && (
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(n.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && notes.length === 0 && (
          <div className="rounded-xl border border-border/70 bg-muted/50 p-8 text-center text-sm text-muted-foreground md:col-span-3">
            No voice notes available.
          </div>
        )}
      </div>
    </div>
  );
}
