#!/usr/bin/env bash
# Validation script for Marziya Gold AI Control Plane (Bash / CI version)
set -eo pipefail

ERRORS=0

pass() {
  echo -e "\033[32m[PASS]\033[0m $1"
}

fail() {
  echo -e "\033[31m[FAIL]\033[0m $1"
  ERRORS=$((ERRORS + 1))
}

echo "=================================================="
echo " Marziya Gold AI Infrastructure Validation (CI)"
echo "=================================================="

# 1. Rules files
for file in "AGENTS.md" "apps/backend/AGENTS.md" "apps/frontend/AGENTS.md" "database/AGENTS.md" "infra/AGENTS.md" ".github/AGENTS.md"; do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file")
    if [ "$size" -le 24000 ]; then
      pass "$file exists and is within 24KB limit ($size bytes)"
    else
      fail "$file exceeds 24,000 bytes ($size bytes)"
    fi
  else
    fail "Missing rule file: $file"
  fi
done

# 2. Canonical sources of truth
for file in "docs/architecture/product-architecture.md" "docs/adr/README.md" "docs/adr/0001-baseline-architecture-decisions.md" "docs/api/openapi.yaml" "database/schema-model.md" "docs/design/ux-criteria.md" ".ai/instructions/source-of-truth.md"; do
  if [ -f "$file" ]; then
    pass "Canonical file exists: $file"
  else
    fail "Missing canonical file: $file"
  fi
done

# 3. No duplicate SQL in database/
sql_count=$(find database -name "*.sql" 2>/dev/null | wc -l)
if [ "$sql_count" -gt 0 ]; then
  fail "Found SQL files in database/ - Flyway in apps/backend/ is the single source of truth"
else
  pass "No competing SQL schemas in database/"
fi

# 4. Agent profiles
for agent in orchestrator backend frontend database qa security devops reviewer ux-reviewer; do
  if [ -f ".ai/agents/${agent}.yaml" ]; then
    pass "Agent profile exists: .ai/agents/${agent}.yaml"
  else
    fail "Missing agent profile: .ai/agents/${agent}.yaml"
  fi
done

# 5. Orchestration contracts
for contract in ownership capabilities concurrency routing gates; do
  if [ -f ".ai/orchestration/${contract}.yaml" ]; then
    pass "Orchestration contract exists: .ai/orchestration/${contract}.yaml"
  else
    fail "Missing orchestration contract: .ai/orchestration/${contract}.yaml"
  fi
done

echo "=================================================="
if [ "$ERRORS" -eq 0 ]; then
  echo -e "\033[32mVALIDATION PASSED: All checks clean!\033[0m"
  exit 0
else
  echo -e "\033[31mVALIDATION FAILED: $ERRORS error(s) detected\033[0m"
  exit 1
fi
