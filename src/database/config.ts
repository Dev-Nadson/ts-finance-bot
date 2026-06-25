import knex from "knex";
import config from "../../knexfile";
import { env } from "@/libs/environments";

const envConfig = config[env.NODE_ENV];
const conn = knex(envConfig || "development");

export { conn };
