import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Music, Upload, Search, Play, FileText, FileArchive, Volume2 } from "lucide-react";
import { StatCard } from "./StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "@tanstack/react-router";
import { musicService, type Song } from "@/lib/api/services/music";
import { MemberDashboard } from "./MemberDashboard";
import { DashboardFooter } from "./DashboardFooter";
import { toast } from "sonner";

export function CustodianDashboard() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [q, setQ] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<"ALL" | "PDF" | "DOCX">("ALL");
  const [openSong, setOpenSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    musicService
      .list()
      .then((response) => setSongs(response.data))
      .catch(() => toast.error("Unable to load music library."))
      .finally(() => setLoading(false));
  }, []);

  const pdfCount = songs.filter((song) => !!song.pdf_file).length;
  const docxCount = songs.filter((song) => !!song.docx_file).length;

  const filteredSongs = songs.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(q.toLowerCase()) || (s.composer && s.composer.toLowerCase().includes(q.toLowerCase()));
    if (!matchesSearch) return false;
    if (fileTypeFilter === "PDF") return !!s.pdf_file;
    if (fileTypeFilter === "DOCX") return !!s.docx_file;
    return true;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Music Library Workspace</h2>
          <p className="text-sm text-muted-foreground">
            Manage sheet music, score documents, and accompanying audio recordings.
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: "/uploads" })}
          className="w-full bg-gradient-primary text-primary-foreground shadow-elegant sm:w-auto"
        >
          <Upload className="mr-2 h-4 w-4" /> Upload Music
        </Button>
      </motion.div>

      {/* Clean StatCards: Total Songs, Clickable PDF, Clickable DOCX */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Songs"
          value={`${songs.length}`}
          icon={Music}
          variant="primary"
          hint="Auto-updates on upload"
        />
        <div
          onClick={() => setFileTypeFilter(fileTypeFilter === "PDF" ? "ALL" : "PDF")}
          className={`cursor-pointer transition ${fileTypeFilter === "PDF" ? "ring-2 ring-primary rounded-xl" : ""}`}
        >
          <StatCard
            label="PDF Documents"
            value={`${pdfCount}`}
            icon={FileText}
            variant="gold"
            delay={0.05}
            hint={fileTypeFilter === "PDF" ? "Click to show all" : "Click to filter PDFs"}
          />
        </div>
        <div
          onClick={() => setFileTypeFilter(fileTypeFilter === "DOCX" ? "ALL" : "DOCX")}
          className={`cursor-pointer transition ${fileTypeFilter === "DOCX" ? "ring-2 ring-primary rounded-xl" : ""}`}
        >
          <StatCard
            label="DOCX Files"
            value={`${docxCount}`}
            icon={FileArchive}
            variant="success"
            delay={0.1}
            hint={fileTypeFilter === "DOCX" ? "Click to show all" : "Click to filter DOCX"}
          />
        </div>
      </div>

      {/* Filter and Songs List with side-by-side Document & Audio Display */}
      <Card className="shadow-soft">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Repertoire Scores & Audio</CardTitle>
            {fileTypeFilter !== "ALL" && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setFileTypeFilter("ALL")}>
                Filter: {fileTypeFilter} ✕
              </Badge>
            )}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title or composer..."
              className="w-full pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredSongs.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border border-border/60 bg-card hover:border-primary/40 transition gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center shrink-0">
                    <Music className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm sm:text-base">{s.title}</p>
                      <Badge variant="outline" className="text-[10px] capitalize">{s.category}</Badge>
                    </div>
                    {s.composer && <p className="text-xs text-muted-foreground">Composer: {s.composer}</p>}
                  </div>
                </div>

                {/* Side-by-side Document Links & Audio Preview */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {s.pdf_file && (
                    <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                      <a href={s.pdf_file} target="_blank" rel="noreferrer">
                        <FileText className="h-3.5 w-3.5 mr-1 text-red-500" /> PDF Score
                      </a>
                    </Button>
                  )}
                  {s.docx_file && (
                    <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                      <a href={s.docx_file} target="_blank" rel="noreferrer">
                        <FileArchive className="h-3.5 w-3.5 mr-1 text-blue-500" /> DOCX Score
                      </a>
                    </Button>
                  )}
                  {s.audio_file ? (
                    <div className="flex items-center gap-2 bg-muted/60 px-3 py-1 rounded-md border text-xs">
                      <Volume2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <audio controls src={s.audio_file} className="h-6 w-36 sm:w-44" />
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic px-2">No audio attached</span>
                  )}
                </div>
              </motion.div>
            ))}
            {filteredSongs.length === 0 && !loading && (
              <div className="rounded-xl border border-border/70 bg-muted/50 p-8 text-center text-sm text-muted-foreground">
                No songs match the selected criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shared Core Member Overview */}
      <div className="border-t border-border/60 pt-6">
        <h3 className="text-lg font-semibold mb-4">Core Member Overview</h3>
        <MemberDashboard />
      </div>
      <DashboardFooter />
    </div>
  );
}
