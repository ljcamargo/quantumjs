#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "=== Aggressively Rebuilding QuantumJS Monorepo ==="

echo "1. Building packages/quantumjs..."
cd packages/quantumjs
# Remove old build
rm -rf dist
npx tsc
cd ../..

echo "2. Purging Bench caches and local links..."
cd apps/bench
# Delete Next.js build cache and directories
rm -rf .next
rm -rf node_modules/.cache
# Delete the local symlink to force a clean link recreate
rm -rf node_modules/quantumjs

echo "3. Re-linking and installing bench dependencies..."
bun install --force

echo "4. Performing fresh production build..."
bun run build

echo "====================================="
echo "Rebuild complete! Caches have been aggressively purged."
echo "👉 IMPORTANT: If your 'bun dev' server was running, you MUST restart it (Ctrl+C and run 'bun dev' again) to clear the memory cache!"
echo "====================================="
