import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Search } from "lucide-react";
import { toast } from "sonner";
import { documentsService, type DocItem } from "@/lib/api/services/documents";

export const Route = createFileRoute("/_app/documents")({
  component: DocumentsPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Documents — AVC" }] }),
});

function DocumentsPage() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    documentsService
      .listAll()
      .then((response) => setDocuments(response.data))
      .catch(() => toast.error("Unable to load documents."));
  }, []);

  const filtered = documents.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Documents</h2>
          <p className="text-sm text-muted-foreground">Meeting minutes, debt statements, and choir resources.</p>
        </div>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="pl-9 w-64" />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border/70 bg-muted/50 p-8 text-center text-sm text-muted-foreground md:col-span-3">
            No documents found.
          </div>
        ) : (
          filtered.map((d) => (
            <Card key={d.id} className="shadow-soft hover:shadow-elegant transition">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm truncate">{d.title}</CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">{d.category}</p>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge variant="secondary">{new Date(d.uploaded_at).toLocaleDateString()}</Badge>
                <Button size="sm" variant="outline" asChild>
                  <a href={d.file} target="_blank" rel="noreferrer">
                    <Download className="h-3 w-3 mr-1" /> Open
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
