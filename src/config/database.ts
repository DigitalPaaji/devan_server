import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
import { PrismaClient } from "../generated/prisma/client";

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing from the .env file");
}


export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

const adapter = new PrismaPg(pool);


export const prisma = new PrismaClient({
  adapter,

  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

export const connectDatabase = async (): Promise<void> => {
  await prisma.$connect();

  const result = await pool.query<{
    database_name: string;
    database_user: string;
    current_time: Date;
  }>(`
    SELECT
      current_database() AS database_name,
      current_user AS database_user,
      CURRENT_TIMESTAMP AS current_time
  `);

  console.log("PostgreSQL connected successfully");
  console.log("Database:", result.rows[0].database_name);
  console.log("User:", result.rows[0].database_user);
};