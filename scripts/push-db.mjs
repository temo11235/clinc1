import { execSync } from "node:child_process";

const url =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;

if (!url) {
  console.warn("⚠️ مفيش DATABASE_URL ولا POSTGRES_URL، اتخطى إنشاء الجداول. اتأكد من إعدادات Environment Variables في Vercel.");
  process.exit(0);
}

process.env.DATABASE_URL = url;
execSync("npx prisma db push --skip-generate", { stdio: "inherit", env: process.env });
