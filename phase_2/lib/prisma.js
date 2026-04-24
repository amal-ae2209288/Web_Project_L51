import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis;
const adapter = new PrismaBetterSqlite3(
  {
    url: process.env.DATABASE_URL || "file:./prisma/dev.db",
  },
  {
    timestampFormat: "unixepoch-ms",
  }
);

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
