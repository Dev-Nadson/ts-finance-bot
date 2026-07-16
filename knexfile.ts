import { env } from "@/libs/environments";
import type { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    },
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
    connection: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    },
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
