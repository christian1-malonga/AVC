import { FastifyInstance } from "fastify";
import { v4 as uuid } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import db from "../db.js";
import { requireAuth } from "../plugins/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

export default async function documentRoutes(fastify: FastifyInstance) {
  // GET /documents/meetings/
  fastify.get("/documents/meetings/", { preHandler: requireAuth }, async (_request, _reply) => {
    const rows = db.prepare(`
      SELECT d.*, u.full_name as uploaded_by_name FROM documents d
      LEFT JOIN users u ON u.id = d.uploaded_by
      WHERE d.category = 'minutes'
      ORDER BY d.uploaded_at DESC
    `).all() as any[];

    return {
      data: rows.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        file: `/uploads/${path.basename(r.file_path)}`,
        uploaded_by_name: r.uploaded_by_name,
        uploaded_at: r.uploaded_at,
        size: r.size,
      })),
    };
  });

  // GET /documents/general/
  fastify.get("/documents/general/", { preHandler: requireAuth }, async (_request, _reply) => {
    const rows = db.prepare(`
      SELECT d.*, u.full_name as uploaded_by_name FROM documents d
      LEFT JOIN users u ON u.id = d.uploaded_by
      WHERE d.category IN ('debt', 'general', 'announcement')
      ORDER BY d.uploaded_at DESC
    `).all() as any[];

    return {
      data: rows.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        file: `/uploads/${path.basename(r.file_path)}`,
        uploaded_by_name: r.uploaded_by_name,
        uploaded_at: r.uploaded_at,
        size: r.size,
      })),
    };
  });

  // POST /documents/meetings/ — multipart handled by @fastify/multipart
  fastify.post("/documents/meetings/", { preHandler: requireAuth }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ detail: "No file uploaded." });
    }

    const filename = `${uuid()}${path.extname(data.filename)}`;
    const filepath = path.join(UPLOADS_DIR, filename);
    const buffer = await data.toBuffer();
    await require("fs").promises.writeFile(filepath, buffer);

    const id = uuid();
    db.prepare("INSERT INTO documents (id, title, category, file_path, uploaded_by, size) VALUES (?, ?, ?, ?, ?, ?)").run(
      id, data.filename, "minutes", filepath, request.user!.userId, buffer.length
    );

    return {
      data: {
        id,
        title: data.filename,
        category: "minutes",
        file: `/uploads/${filename}`,
        uploaded_by_name: "",
        uploaded_at: new Date().toISOString(),
        size: buffer.length,
      },
    };
  });

  // POST /documents/general/
  fastify.post("/documents/general/", { preHandler: requireAuth }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ detail: "No file uploaded." });
    }

    const filename = `${uuid()}${path.extname(data.filename)}`;
    const filepath = path.join(UPLOADS_DIR, filename);
    const buffer = await data.toBuffer();
    await require("fs").promises.writeFile(filepath, buffer);

    const id = uuid();
    db.prepare("INSERT INTO documents (id, title, category, file_path, uploaded_by, size) VALUES (?, ?, ?, ?, ?, ?)").run(
      id, data.filename, "general", filepath, request.user!.userId, buffer.length
    );

    return {
      data: {
        id,
        title: data.filename,
        category: "general",
        file: `/uploads/${filename}`,
        uploaded_by_name: "",
        uploaded_at: new Date().toISOString(),
        size: buffer.length,
      },
    };
  });

  // DELETE /documents/:id/
  fastify.delete<{ Params: { id: string } }>("/documents/:id/", { preHandler: requireAuth }, async (request, reply) => {
    const doc = db.prepare("SELECT * FROM documents WHERE id = ?").get(request.params.id) as any;
    if (!doc) {
      return reply.status(404).send({ detail: "Document not found." });
    }

    db.prepare("DELETE FROM documents WHERE id = ?").run(request.params.id);

    try {
      await require("fs").promises.unlink(doc.file_path);
    } catch { /* file may already be gone */ }

    return { data: { detail: "Deleted." } };
  });
}
