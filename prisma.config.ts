import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
 migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js", // Changed from tsx to node since it's a JavaScript file!
  },
  datasource: {
    //  This is where Prisma 7 reads your database string for migrations!
    url: env("DATABASE_URL"), 
  },
});