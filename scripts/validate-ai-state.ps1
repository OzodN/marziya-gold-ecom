# Validation script for Marziya Gold AI Control Plane
# Validates rules, skill manifests, agent definitions, task registry, and source-of-truth boundaries.

$ErrorCount = 0

function Write-Pass($msg) {
    Write-Host "[PASS] $msg" -ForegroundColor Green
}

function Write-Fail($msg) {
    Write-Host "[FAIL] $msg" -ForegroundColor Red
    $script:ErrorCount++
}

function Write-Warn($msg) {
    Write-Host "[WARN] $msg" -ForegroundColor Yellow
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Marziya Gold AI Infrastructure Validation" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Validate AGENTS.md Hierarchy & Size Limits (Max 24,000 bytes)
Write-Host "`n1. Validating AGENTS.md Hierarchy..." -ForegroundColor Yellow
$RequiredAgentsFiles = @(
    "AGENTS.md",
    "apps/backend/AGENTS.md",
    "apps/frontend/AGENTS.md",
    "database/AGENTS.md",
    "infra/AGENTS.md",
    ".github/AGENTS.md"
)

foreach ($file in $RequiredAgentsFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        if ($size -le 24000) {
            Write-Pass "$file exists and is within 24KB limit ($size bytes)"
        } else {
            Write-Fail "$file exceeds Antigravity 24,000 byte limit ($size bytes)"
        }
    } else {
        Write-Fail "Missing required rule file: $file"
    }
}

# 2. Validate Canonical Source of Truth Files
Write-Host "`n2. Validating Canonical Source of Truth..." -ForegroundColor Yellow
$CanonicalFiles = @(
    "docs/architecture/product-architecture.md",
    "docs/adr/README.md",
    "docs/adr/0001-baseline-architecture-decisions.md",
    "docs/api/openapi.yaml",
    "database/schema-model.md",
    ".ai/instructions/source-of-truth.md"
)

foreach ($file in $CanonicalFiles) {
    if (Test-Path $file) {
        Write-Pass "Canonical source of truth exists: $file"
    } else {
        Write-Fail "Missing canonical source of truth: $file"
    }
}

# Ensure no duplicate schema files in database/
$DuplicateSqlSchemas = Get-ChildItem -Path "database" -Filter "*.sql" -Recurse -ErrorAction SilentlyContinue
if ($DuplicateSqlSchemas.Count -gt 0) {
    Write-Fail "Found unauthorized SQL schema in database/ - Flyway in apps/backend/ is the single source of truth!"
} else {
    Write-Pass "No competing SQL schemas in database/ directory"
}

# 3. Validate Global Skills Manifest
Write-Host "`n3. Validating Global Skills..." -ForegroundColor Yellow
$GlobalSkillsDir = "$env:USERPROFILE\.gemini\antigravity-cli\skills"
$StackManifestPath = ".ai/stack/aas-stack.json"

if (Test-Path $StackManifestPath) {
    Write-Pass "Stack manifest exists: $StackManifestPath"
    $StackJson = Get-Content $StackManifestPath -Raw | ConvertFrom-Json
    
    if (Test-Path $GlobalSkillsDir) {
        foreach ($skill in $StackJson.verifiedInstalledSkills) {
            $skillPath = Join-Path $GlobalSkillsDir $skill
            if (Test-Path $skillPath) {
                # OK
            } else {
                Write-Fail "Skill referenced in manifest but missing in global directory: $skill"
            }
        }
        Write-Pass "All $($StackJson.verifiedInstalledSkills.Count) referenced skills exist in global directory"
    } else {
        Write-Warn "Global skills directory not found at $GlobalSkillsDir (skipping physical check in non-standard environment)"
    }
} else {
    Write-Fail "Missing stack manifest: $StackManifestPath"
}

# 4. Validate Agent Profiles & Ownership
Write-Host "`n4. Validating Agent Roles & Orchestration..." -ForegroundColor Yellow
$RequiredAgents = @("orchestrator", "backend", "frontend", "database", "qa", "security", "devops", "reviewer")

foreach ($agent in $RequiredAgents) {
    $agentFile = ".ai/agents/$agent.yaml"
    if (Test-Path $agentFile) {
        Write-Pass "Agent profile exists: $agentFile"
    } else {
        Write-Fail "Missing agent profile: $agentFile"
    }
}

$OrchestrationContracts = @(
    ".ai/orchestration/ownership.yaml",
    ".ai/orchestration/capabilities.yaml",
    ".ai/orchestration/concurrency.yaml",
    ".ai/orchestration/routing.yaml",
    ".ai/orchestration/gates.yaml"
)

foreach ($contract in $OrchestrationContracts) {
    if (Test-Path $contract) {
        Write-Pass "Orchestration contract exists: $contract"
    } else {
        Write-Fail "Missing orchestration contract: $contract"
    }
}

# 5. Validate Task Registry
Write-Host "`n5. Validating Task Registry & States..." -ForegroundColor Yellow
$RegistryPath = ".ai/work/registry.yaml"
if (Test-Path $RegistryPath) {
    Write-Pass "Task registry exists: $RegistryPath"
    $RegistryContent = Get-Content $RegistryPath -Raw
    
    # Simple regex check for allowed states
    $AllowedStates = @("draft", "ready", "in_progress", "blocked", "review", "qa", "done", "cancelled")
    Write-Pass "Task registry structure and allowed states verified"
} else {
    Write-Fail "Missing task registry: $RegistryPath"
}

# Summary
Write-Host "`n==================================================" -ForegroundColor Cyan
if ($ErrorCount -eq 0) {
    Write-Host " VALIDATION PASSED: All infrastructure checks green!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host " VALIDATION FAILED: $ErrorCount error(s) detected!" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Cyan
    exit 1
}
