import pino from "pino";

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  redact: ["password", "passwordHash", "token", "tokenHash", "authorization"],
  ...(process.env.NODE_ENV !== "production"
    ? { transport: { target: "pino/file", options: { destination: 1 } } }
    : {}),
});
