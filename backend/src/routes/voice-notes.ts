import { FastifyInstance } from "fastify";
import { v4 as uuid } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import db from "../db.js";
import { requireAuth } from "../plugins/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads", "voice");

export default async function voiceNoteRoutes(fastify: FastifyInstance) {
  // GET /voice-notes/
  fastify.get("/voice-notes/", { preHandler: requireAuth }, async (_request, _reply) => {
    const rows = db.prepare(`
      SELECT v.*, u.full_name as uploaded_by_name FROM voice_notes v
      LEFT JOIN users u ON u.id = v.uploaded_by
      ORDER BY v.uploaded_at DESC
    `).all() as any[];

    return {
      data: rows.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        file: `/uploads/voice/${path.basename(r.file_path)}`,
        uploaded_by_name: r.uploaded_by_name,
        uploaded_at: r.uploaded_at,
        size: r.size,
      })),
    };
  });

  // POST /voice-notes/
  fastify.post("/voice-notes/", { preHandler: requireAuth }, async (request, reply) => {
    const data = await request.file();
    if (!data) return reply.status(400).send({ detail: "No file uploaded." });

    await require("fs").promises.mkdir(UPLOADS_DIR, { recursive: true });
    const filename = `${uuid()}${path.extname(data.filename)}`;
    const filepath = path.join(UPLOADS_DIR, filename);
    const buffer = await data.toBuffer();
    await require("fs").promises.writeFile(filepath, buffer);

    const fields = data.fields as Record<string, any> || {};
    const id = uuid();
    db.prepare(
      "INSERT INTO voice_notes (id, title, file_path, category, uploaded_by, size) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(id, fields.title?.value || data.filename, filepath, fields.category?.value || "general", request.user!.userId, buffer.length);

    return {
      data: {
        id,
        title: fields.title?.value || data.filename,
        category: fields.category?.value || "general",
        file: `/uploads/voice/${filename}`,
        size: buffer.length,
      },
    };
  });

  // DELETE /voice-notes/:id/
  fastify.delete<{ Params: { id: string } }>("/voice-notes/:id/", { preHandler: requireAuth }, async (request, reply) => {
    const note = db.prepare("SELECT * FROM voice_notes WHERE id = ?").get(request.params.id) as any;
    if (!note) return reply.status(404).send({ detail: "Note not found." });

    db.prepare("DELETE FROM voice_notes WHERE id = ?").run(request.params.id);
    try { await require("fs").promises.unlink(note.file_path); } catch { /* ignore */ }
    return { data: { detail: "Deleted." } };
  });
}
