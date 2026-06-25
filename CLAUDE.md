# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Telegram bot for personal finance management, built with TypeScript. Uses grammY as the Telegram bot framework, Knex.js with PostgreSQL for persistence, and OpenAI for AI-powered financial insights.

## Commands

```bash
# Development (watch mode with tsx)
npm run start:dev

# Database
npm run migrate:latest       # apply all pending migrations
npm run migrate:list         # list applied/pending migrations
npm run migrate:make -- <name>  # create a new migration file
npm run migrate:down         # rollback one migration
npm run migrate:rollback     # rollback all migrations

# PostgreSQL via Docker
docker compose up -d
```

No build step for development - `tsx` runs TypeScript directly. No test suite currently.

The `start:dev` script includes `--no-network-family-autoselection --dns-result-order=ipv4first` to prevent Node.js native fetch (undici) from hanging on IPv6 when no IPv6 route is available.

## Environment Variables

Required in `.env`:
```
DATABASE_URL=          # PostgreSQL connection string
TELEGRAM_BOT_TOKEN=    # BotFather token
BCRYPT_ROUNDS=         # Number of bcrypt salt rounds (e.g. 10)
OPENAI_API_KEY=        # Optional - only needed for AI insights feature
NODE_ENV=development
```

Docker Compose database default: `postgresql://postgres:docker@localhost:5432/finance_db`

## Architecture

### Three-layer structure inside `src/bot/`

- **`frontend/commands/`** - grammY `Composer` instances that define Telegram commands and callback queries. No business logic. Entry point to conversations via `ctx.conversation.enter("name")`.
- **`frontend/conversations/`** - multi-step conversational flows using `@grammyjs/conversations` v2. Orchestrate the dialog, then delegate to controllers for data operations.
- **`backend/controllers/`** - single-operation orchestrators: extract data from inputs, call repositories, return a reply string.
- **`backend/repositories/`** - all direct database access via `conn` (Knex instance). Return plain strings, never grammY types.

Data flows:
```
frontend/commands  →  ctx.conversation.enter()  →  frontend/conversations
                                                         ↓
                  frontend/commands  →  controller  →  repository  →  DB
```

### Composing the Bot

`server.ts` creates a `Bot<BotContext>` (where `BotContext = ConversationFlavor<Context>`) and mounts middleware in this order:

1. `conversations()` - installs the conversations plugin
2. `createConversation(fn)` - registers each conversation by its function name
3. `index_commands` - the root Composer for all commands and callbacks

`frontend/commands/index.ts` aggregates per-feature Composers via `index_commands.use(...)`.

### Conversations (`@grammyjs/conversations` v2)

- Each conversation is an `async function(conversation, ctx)` exported from `frontend/conversations/<categoria>/`.
- The conversation identifier equals the **function name** - must match what's passed to `ctx.conversation.enter("function_name")`.
- Side effects (DB calls, external APIs) must be wrapped in `conversation.external(() => ...)` to be replay-safe.
- Use `conversation.waitFor("message:text")` to pause and wait for the next text message.

**Index structure (mirrors the commands pattern):**

```
frontend/conversations/
  index.ts                     ← all_conversations = [...accounts_conversations, ...]
  accounts/
    index.ts                   ← accounts_conversations = [create_account_conversation, ...]
    create-account-conversation.ts
  expenses/
    index.ts                   ← expenses_conversations = [...]
  incomes/
    index.ts                   ← incomes_conversations = [...]
```

`server.ts` iterates `all_conversations` with `for...of` + `createConversation(fn)` - never register conversations individually in `server.ts`.

**To add a new conversation:**
1. Create the file in `frontend/conversations/<categoria>/`
2. Add the function to the array in `frontend/conversations/<categoria>/index.ts`
3. Done - `conversations/index.ts` and `server.ts` pick it up automatically via spread.

### Naming Conventions

- **Files**: `kebab-case` for all files (e.g. `create-user-controller.ts`, `accounts-menu.ts`).
- **Functions and variables**: `snake_case` throughout (e.g. `create_user_controller`, `telegram_id`).
- **Exports**: named exports only, no default exports except `knexfile.ts`.
- **Database IDs**: CUID2 strings (24 chars) via `create_id()` from `@/libs/utils`. Exception: `users-accounts` join table uses an auto-increment integer PK.
- **Migrations**: named `<timestamp>_<kebab-description>.ts`.

### Path Alias

`@/` maps to `src/`. Use it for all internal imports (e.g. `@/libs/environments`, `@/database/config`).

### Database Schema

- `users` - Telegram users identified by `telegram_id` (string). Has `active_account_id` (string, nullable) to track the currently active account.
- `accounts` - financial accounts with a bcrypt-hashed password. Many-to-many with users via `users-accounts`.
- `users-accounts` - join table linking users to accounts. Auto-increment PK (`user_account_id`).
- `expenses` - linked to both `account_id` and `user_id`. `value` stored as integer. `competence` stores the month/period string.
- `incomes` - migration file exists but table definition is not yet implemented.

Soft deletes use `deleted_at` / `delete_at` timestamps (naming inconsistency exists in migrations - match whatever the table uses).

### Libs

- `@/libs/environments` - Zod-validated env; always import `env` from here, never from `process.env` directly.
- `@/libs/utils` - exports `create_id()` (CUID2) and `hash_password(text)` (bcrypt using `env.BCRYPT_ROUNDS`). Use `hash_password` from here instead of importing bcrypt directly in repositories.
- `@/libs/dayjs` - dayjs wrapper (stub, to be implemented).
- `@/libs/openai` - OpenAI client wrapper (stub, to be implemented).

### Callback Query Keys

Callback query string identifiers use `snake_case` and are the coupling point between `InlineKeyboard` button definitions and `callbackQuery()` handlers (e.g. `"accounts_menu"`, `"acc_add"`, `"main_menu"`). Keep them consistent across both sides.
