#!/usr/bin/env bash
# Run this once after creating a new worktree for this project.
# Usage: bash scripts/worktree-setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKTREE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MAIN_REPO_DIR="/Users/mariomiletta/Dev Projects/builder-directory"
ENV_SOURCE="$MAIN_REPO_DIR/.env.local"
ENV_DEST="$WORKTREE_DIR/.env.local"

echo "Setting up worktree: $WORKTREE_DIR"

# --- .env.local symlink ---
if [ ! -f "$ENV_SOURCE" ]; then
  echo "ERROR: $ENV_SOURCE not found. Create it in the main repo first."
  exit 1
fi

if [ -L "$ENV_DEST" ]; then
  echo "  .env.local symlink already exists — skipping"
elif [ -f "$ENV_DEST" ]; then
  echo "  .env.local exists as a real file — replacing with symlink"
  rm "$ENV_DEST"
  ln -s "$ENV_SOURCE" "$ENV_DEST"
else
  ln -s "$ENV_SOURCE" "$ENV_DEST"
  echo "  .env.local symlinked"
fi

# --- npm install ---
echo "  Installing dependencies..."
cd "$WORKTREE_DIR"
npm install --silent
echo "  Done"

echo ""
echo "Worktree ready. Run: npm run dev"
