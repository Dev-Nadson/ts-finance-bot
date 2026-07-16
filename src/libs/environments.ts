import "dotenv/config";
import z from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    BCRYPT_ROUNDS: z.coerce.number(),
    DB_HOST: z.string().default("localhost"),
    DB_PORT: z.coerce.number().default(5434),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    TELEGRAM_BOT_TOKEN: z.string(),
    OPENAI_API_KEY: z.string().optional(),
});

const env = envSchema.parse(process.env);

export { env };
