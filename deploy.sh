#   1. Pulls the latest code from the current git branch
#   2. Installs dependencies (npm ci)
#   3. Ensures the Postgres container is up
#   4. Runs pending database migrations
#   5. Starts the bot with PM2, or reloads it if already running
#
set -euo pipefail

cd "$(dirname "$0")"

APP_NAME="finance-bot"
PM2_CONFIG="ecosystem.config.cjs"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
fail() { printf '\n\033[1;31mERRO:\033[0m %s\n' "$1" >&2; exit 1; }

# --- 1. Pull latest code -------------------------------------------------
if [ -d .git ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  log "Atualizando código (branch: $BRANCH)"
  git pull --ff-only origin "$BRANCH"
else
  log "Sem repositório git — pulando git pull"
fi

# --- 2. Install dependencies ---------------------------------------------
log "Instalando dependências (npm ci)"
npm ci

# --- 3. Ensure Postgres is running ---------------------------------------
# if command -v docker >/dev/null 2>&1 && [ -f docker-compose.yml ]; then
#   log "Subindo Postgres (docker compose up -d)"
#   docker compose up -d

#   # Wait until Postgres accepts connections before migrating.
#   log "Aguardando o Postgres ficar pronto"
#   for i in $(seq 1 30); do
#     if docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
#       break
#     fi
#     [ "$i" -eq 30 ] && fail "Postgres não ficou pronto a tempo."
#     sleep 1
#   done
# else
#   log "Docker/compose ausente — assumindo Postgres externo já disponível"
# fi

# --- 4. Run migrations ---------------------------------------------------
log "Aplicando migrations"
npm run migrate:latest

# --- 5. Start or reload with PM2 -----------------------------------------
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  log "Recarregando processo PM2 ($APP_NAME)"
  pm2 reload "$PM2_CONFIG" --update-env
else
  log "Iniciando processo PM2 ($APP_NAME)"
  pm2 start "$PM2_CONFIG"
fi

# Persist the process list so it survives VM reboots (requires `pm2 startup` once).
pm2 save

log "Deploy concluído com sucesso ✅"
pm2 status "$APP_NAME"
