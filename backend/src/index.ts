import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";

import { config } from "./config.js";
import { initDb } from "./db.js";
import authPlugin from "./plugins/auth.js";

import authRoutes from "./routes/auth.js";
import memberRoutes from "./routes/members.js";
import debtRoutes from "./routes/debts.js";
import attendanceRoutes from "./routes/attendance.js";
import documentRoutes from "./routes/documents.js";
import musicRoutes from "./routes/music.js";
import notificationRoutes from "./routes/notifications.js";
import statsRoutes from "./routes/stats.js";
import receiptRoutes from "./routes/receipts.js";
import voiceNoteRoutes from "./routes/voice-notes.js";
import auditLogRoutes from "./routes/audit-logs.js";
import birthdayRoutes from "./routes/birthdays.js";
import bulkDebtRoutes from "./routes/bulk-debts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  initDb();

  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.FRONTEND_URL ? config.frontendUrl : true,
    credentials: true,
  });

  await app.register(fastifyMultipart, {
    limits: { fileSize: 50 * 1024 * 1024 },
  });

  await app.register(fastifyStatic, {
    root: path.join(__dirname, "..", "uploads"),
    prefix: "/uploads/",
    decorateReply: false,
  });

  await app.register(authPlugin);

  // Register routes
  await app.register(authRoutes);
  await app.register(memberRoutes);
  await app.register(debtRoutes);
  await app.register(attendanceRoutes);
  await app.register(documentRoutes);
  await app.register(musicRoutes);
  await app.register(notificationRoutes);
  await app.register(statsRoutes);
  await app.register(receiptRoutes);
  await app.register(voiceNoteRoutes);
  await app.register(auditLogRoutes);
  await app.register(birthdayRoutes);
  await app.register(bulkDebtRoutes);

  // Health check
  app.get("/api/health", async () => ({ status: "ok" }));

  try {
    await app.listen({ port: config.port, host: config.host });
    console.log(`Server running at http://localhost:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
