import { FastifyInstance } from "fastify";
import { v4 as uuid } from "uuid";
import db from "../db.js";
import { requireAuth } from "../plugins/auth.js";

export default async function receiptRoutes(fastify: FastifyInstance) {
  // GET /receipts/ — all receipts (admin) or own (member)
  fastify.get("/receipts/", { preHandler: requireAuth }, async (request, _reply) => {
    let rows: any[];
    if (["president", "secretary"].includes(request.user!.role)) {
      rows = db.prepare(`
        SELECT r.*, u.full_name as user_name FROM receipts r
        JOIN users u ON u.id = r.user_id ORDER BY r.uploaded_at DESC
      `).all() as any[];
    } else {
      rows = db.prepare(`
        SELECT r.*, u.full_name as user_name FROM receipts r
        JOIN users u ON u.id = r.user_id WHERE r.user_id = ? ORDER BY r.uploaded_at DESC
      `).all(request.user!.userId) as any[];
    }
    return { data: rows };
  });

  // POST /receipts/ — upload receipt
  fastify.post("/receipts/", { preHandler: requireAuth }, async (request, reply) => {
    const data = await request.file();
    if (!data) return reply.status(400).send({ detail: "No file uploaded." });

    const filename = `${uuid()}-${data.filename}`;
    const filepath = `uploads/receipts/${filename}`;
    const buffer = await data.toBuffer();
    await require("fs").promises.mkdir(require("path").join(require("path").dirname(filepath)), { recursive: true });
    await require("fs").promises.writeFile(filepath, buffer);

    const id = uuid();
    const fields = data.fields as Record<string, any> || {};

    db.prepare(
      "INSERT INTO receipts (id, user_id, title, file_path, amount, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))"
    ).run(id, fields.user_id?.value || request.user!.userId, data.filename, "/" + filepath, Number(fields.amount?.value) || 0, request.user!.userId);

    return { data: { id, title: data.filename, file: "/" + filepath, detail: "Receipt uploaded." } };
  });
}
