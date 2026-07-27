import { FastifyInstance } from "fastify";
import { v4 as uuid } from "uuid";
import db from "../db.js";
import { requireAuth } from "../plugins/auth.js";

export default async function notificationRoutes(fastify: FastifyInstance) {
  // GET /notifications/
  fastify.get("/notifications/", { preHandler: requireAuth }, async (request, _reply) => {
    const rows = db.prepare(
      "SELECT * FROM notifications WHERE user_id IS NULL OR user_id = ? ORDER BY created_at DESC"
    ).all(request.user!.userId) as any[];

    return {
      data: rows.map((r) => ({
        id: r.id,
        type: r.type,
        message: r.message,
        is_read: !!r.is_read,
        created_at: r.created_at,
      })),
    };
  });

  // POST /notifications/:id/read/
  fastify.post<{ Params: { id: string } }>("/notifications/:id/read/", { preHandler: requireAuth }, async (request, reply) => {
    const result = db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(request.params.id);

    if (result.changes === 0) {
      return reply.status(404).send({ detail: "Notification not found." });
    }

    return { data: { detail: "Marked as read." } };
  });

  // POST /notifications/announcements/
  fastify.post<{ Body: { message: string } }>("/notifications/announcements/", { preHandler: requireAuth }, async (request, reply) => {
    const { message } = request.body;

    if (!message?.trim()) {
      return reply.status(400).send({ detail: "Message is required." });
    }

    const id = uuid();
    db.prepare(
      "INSERT INTO notifications (id, type, message, is_read, created_at) VALUES (?, 'announcement', ?, 0, datetime('now'))"
    ).run(id, message.trim());

    return { data: { detail: "Announcement sent." } };
  });
}
