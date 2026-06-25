import { env } from "@/libs/environments";
import type { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      extension: 'ts',
      directory: './src/database/migrations',
    },
  },

  production: {
    client: "postgresql",
    connection: env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      extension: 'ts',
      directory: './src/database/migrations',
    },
  }
};

export default config;
