import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

async function authPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest("user", undefined);

  fastify.addHook("onRequest", async (request: FastifyRequest, _reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return;

    try {
      const token = authHeader.slice(7);
      request.user = verifyToken(token);
    } catch {
      // Invalid token — leave user undefined
    }
  });
}

export default fp(authPlugin, { name: "auth" });

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    reply.status(401).send({ detail: "Authentication required." });
    return;
  }
}
