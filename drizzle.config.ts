import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema/**/*.ts",
  out: "./drizzle/migrations",
  dialect: "mysql",
  verbose: true,
  dbCredentials: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT) ?? 3306,
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ?? "sistren",
  },
});
