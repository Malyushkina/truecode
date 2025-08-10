#!/usr/bin/env bash
set -euo pipefail

# Resolve project root (one level up from this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

COMPOSE_FILES=( -f "${ROOT_DIR}/docker-compose.yml" -f "${ROOT_DIR}/docker-compose.dev.yml" )

# Prefer Docker Compose V2 (docker compose), fallback to V1 (docker-compose)
if docker compose version >/dev/null 2>&1; then
  COMPOSE_BIN=(docker compose)
else
  COMPOSE_BIN=(docker-compose)
fi

usage() {
  cat <<EOF
Usage: $(basename "$0") <command>

Commands:
  up         Build images (if needed), start services in background and wait for backend health
  restart    Recreate containers (without removing volumes)
  build      Force rebuild images
  seed       Run database seed inside backend container
  down       Stop and remove containers (keeps volumes/data)
  down:all   Stop and remove containers AND volumes (data loss)
  logs       Tail logs for backend and frontend
  ps         Show services status

Examples:
  $(basename "$0") up
  $(basename "$0") logs
EOF
}

run_compose() {
  "${COMPOSE_BIN[@]}" "${COMPOSE_FILES[@]}" "$@"
}

ensure_node_22() {
  local desired_major=22
  local current=""
  if command -v node >/dev/null 2>&1; then
    current="$(node -v 2>/dev/null || true)"
    if [[ "$current" =~ ^v([0-9]+) ]]; then
      if [[ "${BASH_REMATCH[1]}" == "$desired_major" ]]; then
        echo "Node ${current} detected (OK)"
        return 0
      fi
    fi
  fi

  # Try NVM
  if [[ -z "${NVM_DIR:-}" && -d "$HOME/.nvm" ]]; then
    export NVM_DIR="$HOME/.nvm"
  fi
  if [[ -s "${NVM_DIR:-}/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    . "${NVM_DIR}/nvm.sh"
    echo "Switching Node via nvm to v${desired_major}..."
    nvm install ${desired_major} >/dev/null 2>&1 || true
    nvm use ${desired_major} >/dev/null 2>&1 || true
    current="$(node -v 2>/dev/null || true)"
    echo "Node ${current:-unknown} active"
    return 0
  fi

  # Try Volta
  if command -v volta >/dev/null 2>&1; then
    echo "Switching Node via Volta to v${desired_major}..."
    volta install "node@${desired_major}" >/dev/null 2>&1 || true
    volta pin "node@${desired_major}" >/dev/null 2>&1 || true
    current="$(node -v 2>/dev/null || true)"
    echo "Node ${current:-unknown} active"
    return 0
  fi

  echo "[WARN] Node.js v${desired_major} recommended. Install nvm or Volta to auto-switch. Current: ${current:-not installed}" >&2
}

wait_for_backend() {
  local url="http://localhost:3002/products"
  local tries=60
  local delay=2
  echo "Waiting for backend to become healthy at ${url} ..."
  local code=""
  for ((i=1; i<=tries; i++)); do
    code=$(curl -s -o /dev/null -w "%{http_code}" "${url}" || true)
    if [[ "${code}" == "200" ]]; then
      echo "Backend is healthy (HTTP 200)."
      return 0
    fi
    printf "."
    sleep "${delay}"
  done
  echo -e "\nTimeout waiting for backend. Last HTTP code: ${code:-none}"
  return 1
}

cmd_up() {
  run_compose up -d --build
  # Show quick status snapshot
  run_compose ps || true
  # Wait for health but do not fail pipeline if not yet ready
  wait_for_backend || true
  echo
  echo "Open UI:    http://localhost:3000"
  echo "Open API:   http://localhost:3002/products"
}

cmd_restart() {
  run_compose down
  run_compose up -d --build
  run_compose ps
}

cmd_build() {
  run_compose build --pull || run_compose build
}

cmd_seed() {
  # Seed DB via backend container
  run_compose exec -T backend npm run db:seed || {
    echo "Seed failed. Ensure backend is running." >&2
    exit 1
  }
}

cmd_down() {
  run_compose down
}

cmd_down_all() {
  run_compose down -v
}

cmd_logs() {
  run_compose logs -f backend frontend
}

cmd_ps() {
  run_compose ps
}

main() {
  ensure_node_22 || true
  local cmd="${1:-}" || true
  case "${cmd}" in
    up)           cmd_up ;;
    restart)      cmd_restart ;;
    build)        cmd_build ;;
    seed)         cmd_seed ;;
    down)         cmd_down ;;
    down:all)     cmd_down_all ;;
    logs)         cmd_logs ;;
    ps)           cmd_ps ;;
    ""|help|-h|--help) usage ;;
    *) echo "Unknown command: ${cmd}"; usage; exit 1 ;;
  esac
}

main "$@" 