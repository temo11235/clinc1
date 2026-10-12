import { PrismaClient } from "@prisma/client";

// Vercel بيضيف POSTGRES_URL تلقائياً مع قاعدة البيانات، فنستخدمه لو DATABASE_URL مش موجود
if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
