import "dotenv/config";
import z from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    BCRYPT_ROUNDS: z.coerce.number(),
    DATABASE_URL: z.string(),
    TELEGRAM_BOT_TOKEN: z.string(),
    OPENAI_API_KEY: z.string().optional(),
});

const env = envSchema.parse(process.env);

export { env };
