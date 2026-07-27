import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import db from "../db.js";
import { generateToken, requireAuth } from "../plugins/auth.js";
import type { JwtPayload } from "../plugins/auth.js";

interface RegisterBody {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  leadership_code?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface SectionBody {
  section: string;
}

interface ProfileBody {
  full_name?: string;
  phone?: string;
  section?: string;
}

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/register/
  fastify.post<{ Body: RegisterBody }>("/auth/register/", async (request, reply) => {
    const { first_name, last_name, email, phone, password, leadership_code } = request.body;

    if (!email || !password || !first_name || !last_name) {
      return reply.status(400).send({ detail: "Missing required fields." });
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return reply.status(400).send({ detail: "Email already registered." });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = uuid();
    const full_name = `${first_name} ${last_name}`;
    const date_joined = new Date().toISOString();

    let role = "member";
    if (leadership_code === "AVC-ADMIN-2025") role = "president";

    db.prepare(`
      INSERT INTO users (id, full_name, email, phone, password_hash, role, approved, date_joined)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, full_name, email, phone, password_hash, role, role === "president" ? 1 : 0, date_joined);

    const user = {
      id, full_name, email, phone, role,
      section: null,
      date_joined,
      approved: role === "president",
      is_approved: role === "president",
      avatar: null,
    };

    return { data: { user } };
  });

  // POST /auth/login/
  fastify.post<{ Body: LoginBody }>("/auth/login/", async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ detail: "Email and password required." });
    }

    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!row) {
      return reply.status(401).send({ detail: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return reply.status(401).send({ detail: "Invalid email or password." });
    }

    const token = generateToken({ userId: row.id, email: row.email, role: row.role });

    const user = {
      id: row.id,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      section: row.section,
      date_joined: row.date_joined,
      approved: !!row.approved,
      is_approved: !!row.approved,
      avatar: row.avatar,
    };

    return { data: { token, user } };
  });

  // GET /auth/me/
  fastify.get("/auth/me/", { preHandler: requireAuth }, async (request, reply) => {
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(request.user!.userId) as any;
    if (!row) {
      return reply.status(404).send({ detail: "User not found." });
    }

    return {
      data: {
        id: row.id,
        full_name: row.full_name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        section: row.section,
        date_joined: row.date_joined,
        approved: !!row.approved,
        is_approved: !!row.approved,
        avatar: row.avatar,
      },
    };
  });

  // POST /auth/logout/
  fastify.post("/auth/logout/", async (_request, _reply) => {
    return { data: {} };
  });

  // POST /auth/section/
  fastify.post<{ Body: SectionBody }>("/auth/section/", { preHandler: requireAuth }, async (request, reply) => {
    const { section } = request.body;
    const validSections = ["bass", "tenor", "alto", "soprano"];
    if (!validSections.includes(section)) {
      return reply.status(400).send({ detail: "Invalid section." });
    }

    db.prepare("UPDATE users SET section = ? WHERE id = ?").run(section, request.user!.userId);
    return { data: { detail: "Section set.", section } };
  });

  // PATCH /accounts/profile/
  fastify.patch<{ Body: ProfileBody }>("/accounts/profile/", { preHandler: requireAuth }, async (request, reply) => {
    const { full_name, phone, section } = request.body;
    const updates: string[] = [];
    const values: any[] = [];

    if (full_name !== undefined) { updates.push("full_name = ?"); values.push(full_name); }
    if (phone !== undefined) { updates.push("phone = ?"); values.push(phone); }
    if (section !== undefined) { updates.push("section = ?"); values.push(section); }

    if (updates.length > 0) {
      values.push(request.user!.userId);
      db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }

    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(request.user!.userId) as any;
    return {
      data: {
        id: row.id,
        full_name: row.full_name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        section: row.section,
        date_joined: row.date_joined,
        approved: !!row.approved,
        is_approved: !!row.approved,
        avatar: row.avatar,
      },
    };
  });
}
