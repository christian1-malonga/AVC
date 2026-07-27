export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  host: process.env.HOST || "0.0.0.0",
  jwtSecret: process.env.JWT_SECRET || "avc-dev-secret-change-in-production",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};
