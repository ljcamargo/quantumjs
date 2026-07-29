#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Publish @quantum-js/dsl to npm
# ─────────────────────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
PKG_DIR="$ROOT/packages/quantumjs"

echo "═══════════════════════════════════════════════════════════════════════"
echo " Publishing @quantum-js/dsl"
echo "═══════════════════════════════════════════════════════════════════════"

# 1. Build the package
echo ""
echo "→ Building..."
cd "$PKG_DIR"
bun run build

# 2. Verify the build output
if [ ! -d "dist" ]; then
    echo "ERROR: Build did not produce dist/ directory."
    exit 1
fi
echo "  ✓ dist/ generated"

# 3. Check npm login
echo ""
echo "→ Checking NPM authentication..."
npm whoami 2>/dev/null || npm login

# 4. Publish
echo ""
echo "→ Publishing..."
cd "$PKG_DIR"
npm publish --access public

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo " ✓ @quantum-js/dsl published successfully"
echo "═══════════════════════════════════════════════════════════════════════"
