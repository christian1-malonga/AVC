import { FastifyInstance } from "fastify";
import { v4 as uuid } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import db from "../db.js";
import { requireAuth } from "../plugins/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

export default async function musicRoutes(fastify: FastifyInstance) {
  // GET /music/
  fastify.get("/music/", { preHandler: requireAuth }, async (request, _reply) => {
    const query = request.query as Record<string, string>;
    let sql = "SELECT * FROM songs WHERE 1=1";
    const params: any[] = [];

    if (query.q) {
      sql += " AND title LIKE ?";
      params.push(`%${query.q}%`);
    }
    if (query.category) {
      sql += " AND category = ?";
      params.push(query.category);
    }

    sql += " ORDER BY upload_date DESC";
    const rows = db.prepare(sql).all(...params) as any[];

    return {
      data: rows.map((r) => ({
        id: r.id,
        title: r.title,
        composer: r.composer,
        category: r.category,
        pdf_file: r.pdf_file ? `/uploads/${path.basename(r.pdf_file)}` : null,
        docx_file: r.docx_file ? `/uploads/${path.basename(r.docx_file)}` : null,
        audio_file: r.audio_file ? `/uploads/${path.basename(r.audio_file)}` : null,
        upload_date: r.upload_date ? r.upload_date.slice(0, 10) : r.upload_date,
      })),
    };
  });

  // GET /music/:id/
  fastify.get<{ Params: { id: string } }>("/music/:id/", { preHandler: requireAuth }, async (request, reply) => {
    const row = db.prepare("SELECT * FROM songs WHERE id = ?").get(request.params.id) as any;
    if (!row) {
      return reply.status(404).send({ detail: "Song not found." });
    }

    return {
      data: {
        id: row.id,
        title: row.title,
        composer: row.composer,
        category: row.category,
        pdf_file: row.pdf_file ? `/uploads/${path.basename(row.pdf_file)}` : null,
        docx_file: row.docx_file ? `/uploads/${path.basename(row.docx_file)}` : null,
        audio_file: row.audio_file ? `/uploads/${path.basename(row.audio_file)}` : null,
        upload_date: row.upload_date ? row.upload_date.slice(0, 10) : row.upload_date,
      },
    };
  });

  // POST /music/
  fastify.post("/music/", { preHandler: requireAuth }, async (request, reply) => {
    const parts: Record<string, any> = {};
    let title = "";
    let composer = "";
    let category = "general";

    for await (const part of request.parts()) {
      if (part.type === "file") {
        const filename = `${uuid()}${path.extname(part.filename)}`;
        const filepath = path.join(UPLOADS_DIR, filename);
        const buffer = await part.toBuffer();
        await require("fs").promises.writeFile(filepath, buffer);
        parts[part.fieldname] = filepath;
      } else {
        const val = part.value as string;
        if (part.fieldname === "title") title = val;
        if (part.fieldname === "composer") composer = val;
        if (part.fieldname === "category") category = val;
      }
    }

    const id = uuid();
    const upload_date = new Date().toISOString();

    db.prepare(
      "INSERT INTO songs (id, title, composer, category, pdf_file, docx_file, audio_file, upload_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(id, title, composer, category, parts.pdf_file || null, parts.docx_file || null, parts.audio_file || null, upload_date);

    return {
      data: {
        id,
        title,
        composer,
        category,
        pdf_file: parts.pdf_file ? `/uploads/${path.basename(parts.pdf_file)}` : null,
        docx_file: parts.docx_file ? `/uploads/${path.basename(parts.docx_file)}` : null,
        audio_file: parts.audio_file ? `/uploads/${path.basename(parts.audio_file)}` : null,
        upload_date: upload_date.slice(0, 10),
      },
    };
  });

  // DELETE /music/:id/
  fastify.delete<{ Params: { id: string } }>("/music/:id/", { preHandler: requireAuth }, async (request, reply) => {
    const song = db.prepare("SELECT * FROM songs WHERE id = ?").get(request.params.id) as any;
    if (!song) {
      return reply.status(404).send({ detail: "Song not found." });
    }

    db.prepare("DELETE FROM songs WHERE id = ?").run(request.params.id);

    for (const field of ["pdf_file", "docx_file", "audio_file"]) {
      if (song[field]) {
        try { await require("fs").promises.unlink(song[field]); } catch { /* ignore */ }
      }
    }

    return { data: { detail: "Deleted." } };
  });
}
