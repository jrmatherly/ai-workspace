# Mise Configuration Guide

Comprehensive guide for implementing [mise](https://mise.jdx.dev) as the unified development tool and task runner for the AI/MCP multi-repo workspace. Based on January 2026 documentation and analysis.

> **Note:** This is a **multi-repo workspace**, not a monorepo. Each subdirectory is an independent git repository. mise's task discovery feature (which uses "monorepo" terminology) works equally well for this structure. See [multi-repo-workspace-guide.md](./multi-repo-workspace-guide.md) for architectural details.

---

## Table of Contents

1. [Overview](#overview)
2. [Why Mise for This Workspace](#why-mise-for-this-workspace)
3. [Configuration Architecture](#configuration-architecture)
4. [Root Configuration](#root-configuration)
5. [Project Configurations](#project-configurations)
6. [Cross-Project Tasks](#cross-project-tasks)
7. [Implementation Guide](#implementation-guide)
8. [Migration from Makefile](#migration-from-makefile)
9. [CI/CD Integration](#cicd-integration)
10. [References](#references)

---

## Overview

### What is Mise?

[Mise](https://mise.jdx.dev) (mise-en-place) is a polyglot development tool manager and task runner that:

- Manages tool versions (Go, Node.js, Python, etc.) per-project
- Provides a modern task runner (similar to Make but with dependency tracking)
- Supports hierarchical configuration with inheritance
- Enables cross-project task organization (works for both monorepos and multi-repo workspaces)

### Current State vs Proposed

| Aspect | Current | With Mise |
| -------- | --------- | ----------- |
| Tool versions | Implicit/manual | Explicit in `mise.toml` |
| Task runner | Makefiles (inconsistent) | Unified mise tasks |
| Dependencies | Manual `go install` | Auto-installed |
| Cross-project ops | Must cd into each | `mise //project:task` |
| CI caching | Manual setup | Built-in source tracking |

---

## Why Mise for This Workspace

### 1. Polyglot Support

The AI/MCP multi-repo workspace uses multiple languages:

- **Go 1.25** (primary)
- **Node.js 24** (SvelteKit frontend, Active LTS)
- **Python 3.14** (obot-tools ML components)
- **Various CLI tools** (golangci-lint, helm, kubectl, etc.)

Mise manages all of these with a single configuration file.

### 2. Cross-Project Task Discovery

With mise's task discovery feature (`experimental_monorepo_root`), mise automatically discovers tasks in subdirectories:

```bash
# Run tests in all projects
mise '//...:test'

# Run specific project task
mise //nah:validate-ci

# Run from within project (uses local context)
cd nah && mise :test
```

### 3. Source/Output Tracking

Mise can skip tasks if sources haven't changed:

```toml
[tasks.build]
run = "go build -o bin/app"
sources = ["**/*.go", "go.mod", "go.sum"]
outputs = ["bin/app"]
```

### 4. Tool Inheritance

Root-level tools are inherited by all projects, with override capability:

```text
AI/mise.toml          → go = "1.25", golangci-lint = "2.8.0"
  └── nah/mise.toml   → (inherits go, can override)
  └── obot-entraid/mise.toml → node = "24" (adds frontend tools)
```

### 5. Consistent Developer Experience

Every developer gets the same tools automatically:

```bash
cd AI
mise install     # Installs all tools
mise run test    # Runs with correct tool versions
```

---

## Configuration Architecture

### File Hierarchy

```text
AI/                                    # Workspace root
├── mise.toml                          # Root config (shared tools, cross-project settings)
├── mise.local.toml                    # Local overrides (gitignored)
│
├── obot-entraid/
│   ├── mise.toml                      # Project config (inherits root + adds frontend tools)
│   └── ui/user/
│       └── mise.toml                  # Sub-project (inherits parent + frontend-specific)
│
├── nah/
│   └── mise.toml                      # Project config (inherits root, Go-only)
│
├── kinm/
│   └── mise.toml                      # Project config
│
├── mcp-oauth-proxy/
│   └── mise.toml                      # Project config
│
├── obot-tools/
│   ├── mise.toml                      # Tools collection config
│   └── openai-model-provider/
│       └── mise.toml                  # Individual provider config
│
├── mcp-catalog/
│   └── mise.toml                      # YAML validation tools
│
└── namegenerator/
    └── mise.toml                      # Minimal Go config
```

### Inheritance Model

```text
Root mise.toml
├── [tools] → Inherited by all projects
├── [env] → Inherited by all projects
├── [settings] → Inherited by all projects
└── [tasks] → Available as //root:taskname

Project mise.toml (e.g., nah/)
├── [tools] → Overrides/extends root
├── [env] → Overrides/extends root
└── [tasks] → Available as //nah:taskname or :taskname when in dir
```

---

## Root Configuration

### mise.toml (Workspace Root)

```toml
#:schema https://mise.jdx.dev/schema/mise.json
# AI/MCP Multi-Repo Workspace Root Configuration
# https://mise.jdx.dev

# =============================================================================
# SETTINGS
# =============================================================================

[settings]
# Enable experimental features for cross-project task discovery
# Note: mise uses "monorepo" terminology for this feature, but it works for multi-repo workspaces
experimental = true

[settings.task]
# Reduce search depth for performance (projects are at depth 1-2)
monorepo_depth = 3
# Exclude common directories from task search
monorepo_exclude_dirs = ["node_modules", ".archive", "vendor", "dist", "build", ".venv", ".git"]

# =============================================================================
# ENVIRONMENT VARIABLES
# =============================================================================

[env]
# Go environment
GOPATH = "{{env.HOME}}/go"
GOBIN = "{{env.HOME}}/go/bin"
CGO_ENABLED = "0"

# Mise cross-project task discovery mode
MISE_EXPERIMENTAL = "1"

# =============================================================================
# SHARED TOOLS
# =============================================================================

[tools]
# Core languages
go = "1.25"
node = "24"
python = "3.14"

# Go tooling (via aqua for version pinning)
"aqua:golangci/golangci-lint" = "2.8.0"

# Git and CI tools
"aqua:cli/cli" = "latest"  # GitHub CLI

# Optional: Kubernetes tools (uncomment if needed)
# "aqua:kubernetes/kubernetes/kubectl" = "1.35"
# "aqua:helm/helm" = "3.19"

# =============================================================================
# WORKSPACE CONFIGURATION
# =============================================================================

[monorepo]  # Note: mise uses "monorepo" as the config key name
# Specify project roots for task discovery
config_roots = [
    "obot-entraid",
    "nah",
    "kinm",
    "mcp-oauth-proxy",
    "obot-tools",
    "mcp-catalog",
    "namegenerator"
]

# =============================================================================
# ROOT-LEVEL TASKS
# =============================================================================

[tasks.help]
description = "Show available workspace tasks"
run = """
echo "AI/MCP Multi-Repo Workspace - mise tasks"
echo ""
echo "Cross-project commands:"
echo "  mise //...:test          - Test all projects"
echo "  mise //...:validate      - Validate all projects"
echo "  mise //...:validate-ci   - CI validation for all projects"
echo ""
echo "Single project:"
echo "  mise //nah:test          - Test nah only"
echo "  mise //obot-entraid:dev  - Run obot-entraid dev server"
echo ""
echo "View all tasks:"
echo "  mise tasks --all"
"""

[tasks.all]
alias = "validate-all"
description = "Run validate-ci on all Go projects"
depends = [
    "//nah:validate-ci",
    "//kinm:validate-ci",
    "//obot-entraid:validate-ci",
    "//mcp-oauth-proxy:validate-ci",
    "//namegenerator:validate"
]

[tasks.test-all]
description = "Run tests on all Go projects"
depends = [
    "//nah:test",
    "//kinm:test",
    "//obot-entraid:test",
    "//mcp-oauth-proxy:test",
    "//namegenerator:test"
]

[tasks.tidy-all]
description = "Run go mod tidy on all projects"
run = """
for dir in obot-entraid nah kinm mcp-oauth-proxy namegenerator; do
    echo "=== Tidying $dir ==="
    cd $dir && go mod tidy && cd ..
done
echo "Done!"
"""

[tasks.status]
description = "Show git status across all projects"
run = """
echo "=== Multi-Repo Workspace Git Status ==="
git status --short
echo ""
for dir in obot-entraid nah kinm mcp-oauth-proxy obot-tools mcp-catalog namegenerator; do
    changes=$(git status --short "$dir" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$changes" -gt 0 ]; then
        echo "$dir: $changes change(s)"
    fi
done
"""

[tasks.deps-check]
description = "Check for outdated Go dependencies"
run = """
echo "Checking for outdated dependencies..."
for dir in obot-entraid nah kinm mcp-oauth-proxy namegenerator; do
    echo "=== $dir ==="
    cd $dir && go list -u -m all 2>/dev/null | grep '\[' || echo "  All up to date"
    cd ..
done
"""

[tasks.clean]
description = "Clean build artifacts across all projects"
run = """
echo "Cleaning build artifacts..."
find . -name "bin" -type d -not -path "*/node_modules/*" -not -path "*/.archive/*" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.test" -type f -delete 2>/dev/null || true
find . -name "coverage.out" -type f -delete 2>/dev/null || true
find . -name "coverage.html" -type f -delete 2>/dev/null || true
echo "Done!"
"""
```

### mise.local.toml.example

```toml
# Local overrides (copy to mise.local.toml, which is gitignored)
# Use for machine-specific settings

[env]
# Override paths if needed
# GOPATH = "/custom/path/go"

# Development database
# DATABASE_URL = "postgres://localhost:5432/obot_dev"

# Debug settings
# GPTSCRIPT_DEBUG = "true"

[tools]
# Override tool versions for local development
# go = "1.24"  # Use older version for testing
```

---

## Project Configurations

### nah/mise.toml

```toml
#:schema https://mise.jdx.dev/schema/mise.json
# nah - Kubernetes Controller Framework
# Inherits: go, golangci-lint from root

[env]
# Project-specific environment
PROJECT_NAME = "nah"

[tasks.generate]
description = "Generate deep copy methods"
run = "go generate ./..."
sources = ["**/*.go", "!**/*_generated*.go"]
outputs = ["**/*_generated*.go"]

[tasks.tidy]
description = "Tidy Go modules"
run = "go mod tidy"

[tasks.fmt]
description = "Format Go code"
run = "go fmt ./..."

[tasks.vet]
description = "Run go vet"
run = "go vet ./..."

[tasks.lint]
alias = "validate"
description = "Run golangci-lint"
run = "golangci-lint run"
depends = ["fmt"]

[tasks.test]
description = "Run all tests"
run = "go test ./..."
sources = ["**/*.go", "go.mod", "go.sum"]

[tasks.test-race]
description = "Run tests with race detector"
run = "go test -race ./..."

[tasks.test-cover]
description = "Run tests with coverage"
run = "go test -cover ./..."

[tasks.validate-ci]
description = "CI validation (generate, tidy, check dirty)"
run = """
go generate ./...
go mod tidy
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    git status --porcelain --untracked-files=no
    echo "Encountered dirty repo!"
    exit 1
fi
"""
depends = ["lint"]

[tasks.ci]
description = "Full CI pipeline"
depends = ["validate-ci", "test"]
```

### obot-entraid/mise.toml

```toml
#:schema https://mise.jdx.dev/schema/mise.json
# obot-entraid - MCP Platform (Go + SvelteKit)
# Inherits: go, golangci-lint from root
# Adds: node, pnpm for frontend

[tools]
# Frontend tools
node = "24"
"npm:pnpm" = "9"

[env]
PROJECT_NAME = "obot-entraid"

# =============================================================================
# GO TASKS
# =============================================================================

[tasks.build]
description = "Build Go binary"
run = "go build -o bin/obot"
sources = ["**/*.go", "go.mod", "go.sum"]
outputs = ["bin/obot"]

[tasks.test]
description = "Run Go tests (excludes integration)"
run = "go test ./..."
sources = ["**/*.go"]

[tasks.test-integration]
description = "Run integration tests"
run = "go test -tags=integration ./tests/integration/..."

[tasks.lint]
alias = "validate"
description = "Run Go linters"
run = "golangci-lint run"

[tasks.tidy]
description = "Tidy Go modules"
run = "go mod tidy"

[tasks.generate]
description = "Generate Go code"
run = "go generate ./..."

[tasks.validate-go-code]
description = "Full Go validation"
run = """
go mod tidy
go generate ./...
golangci-lint run
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    echo "Uncommitted changes detected!"
    exit 1
fi
"""

# =============================================================================
# FRONTEND TASKS
# =============================================================================

[tasks.ui-install]
description = "Install UI dependencies"
dir = "ui/user"
run = "pnpm install"
sources = ["ui/user/package.json", "ui/user/pnpm-lock.yaml"]
outputs = ["ui/user/node_modules"]

[tasks.ui-dev]
description = "Start UI dev server"
dir = "ui/user"
run = "pnpm run dev"
depends = ["ui-install"]

[tasks.ui-build]
description = "Build production UI"
dir = "ui/user"
run = "pnpm run build"
depends = ["ui-install"]
sources = ["ui/user/src/**/*", "ui/user/static/**/*"]
outputs = ["ui/user/.svelte-kit"]

[tasks.ui-check]
description = "TypeScript type checking"
dir = "ui/user"
run = "pnpm run check"
depends = ["ui-install"]

[tasks.ui-lint]
description = "Lint UI code"
dir = "ui/user"
run = "pnpm run lint"
depends = ["ui-install"]

[tasks.ui-format]
description = "Format UI code"
dir = "ui/user"
run = "pnpm run format"
depends = ["ui-install"]

[tasks.ui-ci]
description = "Full UI CI pipeline"
dir = "ui/user"
run = "pnpm run ci"
depends = ["ui-install"]

[tasks.ui]
alias = "build-ui"
description = "Build complete UI"
depends = ["ui-build"]

# =============================================================================
# COMBINED TASKS
# =============================================================================

[tasks.dev]
description = "Run full dev environment (Go + SvelteKit)"
run = "./tools/dev.sh"

[tasks.dev-open]
description = "Run dev environment and open browser"
run = "./tools/dev.sh --open"

[tasks.all]
description = "Build UI + Go binary"
depends = ["ui-build", "build"]

[tasks.validate-ci]
description = "Full CI validation"
depends = ["validate-go-code", "ui-ci"]

[tasks.ci]
description = "Complete CI pipeline"
depends = ["validate-ci", "test"]
```

### mcp-oauth-proxy/mise.toml

```toml
#:schema https://mise.jdx.dev/schema/mise.json
# mcp-oauth-proxy - OAuth 2.1 Proxy
# Inherits: go, golangci-lint from root

[env]
PROJECT_NAME = "mcp-oauth-proxy"

[tasks.build]
description = "Build binary"
run = "go build -o bin/mcp-oauth-proxy"
sources = ["**/*.go", "go.mod", "go.sum"]
outputs = ["bin/mcp-oauth-proxy"]

[tasks.test]
description = "Run all tests"
run = "go test ./..."

[tasks.test-short]
description = "Run fast unit tests"
run = "go test -short ./..."

[tasks.test-race]
description = "Run tests with race detector"
run = "go test -race ./..."

[tasks.test-cover]
description = "Generate coverage report"
run = "go test -coverprofile=coverage.out ./... && go tool cover -html=coverage.out -o coverage.html"
outputs = ["coverage.out", "coverage.html"]

[tasks.lint]
alias = "validate"
description = "Run linters"
run = "golangci-lint run"

[tasks.tidy]
description = "Tidy modules"
run = "go mod tidy"

[tasks.fmt]
description = "Format code"
run = "go fmt ./..."

[tasks.vet]
description = "Run go vet"
run = "go vet ./..."

[tasks.validate-ci]
description = "CI validation"
run = """
go mod tidy
go fmt ./...
golangci-lint run
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    echo "Dirty repo!"
    exit 1
fi
"""

[tasks.ci]
description = "Full CI pipeline"
run = """
go fmt ./...
go vet ./...
golangci-lint run
go test ./...
"""

[tasks.demo]
description = "Run SQLite demo"
run = "./demo_sqlite.sh"
```

### namegenerator/mise.toml

```toml
#:schema https://mise.jdx.dev/schema/mise.json
# namegenerator - Random Name Generator Library
# Inherits: go from root
# Minimal config - no Makefile originally

[env]
PROJECT_NAME = "namegenerator"

[tasks.test]
description = "Run tests"
run = "go test ./..."

[tasks.test-race]
description = "Run tests with race detector (important - NOT thread-safe!)"
run = "go test -race ./..."

[tasks.test-cover]
description = "Run tests with coverage"
run = "go test -cover ./..."

[tasks.fmt]
description = "Format code"
run = "go fmt ./..."

[tasks.vet]
description = "Run go vet"
run = "go vet ./..."

[tasks.tidy]
description = "Tidy modules"
run = "go mod tidy"

[tasks.validate]
description = "Full validation"
depends = ["fmt", "vet", "tidy", "test"]

[tasks.ci]
description = "CI pipeline"
depends = ["validate"]
```

### obot-tools/mise.toml

```toml
#:schema https://mise.jdx.dev/schema/mise.json
# obot-tools - Tools, Model Providers, Auth Providers Collection
# Inherits: go, python from root
# Mixed language project

[tools]
python = "3.14"
"pipx:black" = "latest"
"pipx:ruff" = "latest"

[env]
PROJECT_NAME = "obot-tools"

[tasks.build]
description = "Build all Go components"
run = """
for dir in $(find . -name "go.mod" -not -path "*/.archive/*" -exec dirname {} \;); do
    echo "=== Building $dir ==="
    cd $dir && go build ./... && cd - > /dev/null
done
"""

[tasks.test]
description = "Test all Go components"
run = """
for dir in $(find . -name "go.mod" -not -path "*/.archive/*" -exec dirname {} \;); do
    echo "=== Testing $dir ==="
    cd $dir && go test ./... && cd - > /dev/null
done
"""

[tasks.tidy]
description = "Tidy all Go modules"
run = """
for dir in $(find . -name "go.mod" -not -path "*/.archive/*" -exec dirname {} \;); do
    echo "=== Tidying $dir ==="
    cd $dir && go mod tidy && cd - > /dev/null
done
"""

[tasks.lint-go]
description = "Lint Go code"
run = """
for dir in $(find . -name "go.mod" -not -path "*/.archive/*" -exec dirname {} \;); do
    echo "=== Linting $dir ==="
    cd $dir && golangci-lint run 2>/dev/null || true && cd - > /dev/null
done
"""

[tasks.lint-python]
description = "Lint Python code"
run = """
echo "Running ruff..."
ruff check . --fix || true
echo "Running black..."
black . || true
"""

[tasks.lint]
alias = "validate"
description = "Lint all code"
depends = ["lint-go", "lint-python"]

[tasks.package-tools]
description = "Package user-facing tools"
run = "make package-tools"

[tasks.package-providers]
description = "Package model/auth providers"
run = "make package-providers"
```

---

## Cross-Project Tasks

> **Note:** mise uses "monorepo" terminology for its cross-project task feature, but it works equally well for multi-repo workspaces.

### Task Execution Syntax

```bash
# Absolute path (from anywhere in repo)
mise //nah:test
mise //obot-entraid:dev

# Current directory (when inside project)
cd nah && mise :test

# Wildcards
mise '//...:test'           # All projects' test tasks
mise '//obot-*:build'       # All obot-* projects
mise '//nah:*'              # All tasks in nah
```

### Task Dependencies

```toml
[tasks.ci]
depends = [
    "validate-ci",       # Same project
    "//shared:build",    # Another project
    { tasks = ["test", "lint"] }  # Parallel execution
]
```

### Source/Output Tracking

```toml
[tasks.build]
run = "go build -o bin/app"
sources = ["**/*.go", "go.mod"]  # Inputs
outputs = ["bin/app"]            # Outputs

# Skips if outputs newer than sources
```

### File Watching

```bash
# Watch and re-run on changes
mise watch -t build

# Watch specific sources
mise watch -t test --glob "**/*.go"
```

---

## Implementation Guide

### Phase 1: Initial Setup (Day 1)

```bash
# 1. Install mise
curl https://mise.jdx.dev/install.sh | sh

# 2. Add to shell (bash example)
echo 'eval "$(mise activate bash)"' >> ~/.bashrc

# 3. Create root config
cat > mise.toml << 'EOF'
[settings]
experimental = true

[tools]
go = "1.25"
"aqua:golangci/golangci-lint" = "2.8.0"
EOF

# 4. Install tools
mise install

# 5. Verify
mise doctor
```

### Phase 2: Add Project Configs (Day 2-3)

1. Create `mise.toml` in each project
2. Define project-specific tasks
3. Test task execution: `mise :test`, `mise :validate`

### Phase 3: Enable Cross-Project Task Discovery (Day 4)

1. Add `experimental_monorepo_root = true` to root config (mise uses "monorepo" for this feature)
2. Set `MISE_EXPERIMENTAL=1` in environment
3. Test cross-project tasks: `mise //nah:test`

### Phase 4: CI Integration (Day 5)

1. Update GitHub Actions to use mise
2. Cache mise data directory
3. Run tasks via mise in CI

---

## Migration from Makefile

### Mapping Targets

| Makefile | mise.toml |
| ---------- | ----------- |
| `make build` | `[tasks.build]` |
| `make test` | `[tasks.test]` |
| `make validate` | `[tasks.lint]` or `[tasks.validate]` |
| `make validate-ci` | `[tasks.validate-ci]` |
| `make setup-ci-env` | Replaced by `[tools]` |

### Example Migration

**Before (Makefile):**

```makefile
validate-ci:
 go generate
 go mod tidy
 if [ -n "$$(git status --porcelain)" ]; then exit 1; fi
```

**After (mise.toml):**

```toml
[tasks.validate-ci]
description = "CI validation"
run = """
go generate ./...
go mod tidy
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    echo "Dirty repo!"
    exit 1
fi
"""
depends = ["lint"]
```

### Keeping Both (Transitional)

```makefile
# Makefile (wrapper)
.PHONY: test validate build

test:
 mise run test

validate:
 mise run validate

build:
 mise run build
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup mise
        uses: jdx/mise-action@v2
        with:
          experimental: true

      - name: Cache mise
        uses: actions/cache@v4
        with:
          path: |
            ~/.local/share/mise
            ~/.cache/mise
          key: mise-${{ runner.os }}-${{ hashFiles('**/mise.toml') }}
          restore-keys: |
            mise-${{ runner.os }}-

      - name: Install tools
        run: mise install

      - name: Validate
        run: mise run validate-ci

      - name: Test
        run: mise run test
```

### Per-Project CI with Change Detection

```yaml
name: nah CI

on:
  push:
    paths:
      - 'nah/**'
      - 'mise.toml'
      - '.github/workflows/nah-*.yml'

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: nah
    steps:
      - uses: actions/checkout@v4

      - uses: jdx/mise-action@v2
        with:
          experimental: true

      - name: Validate & Test
        run: |
          mise run validate-ci
          mise run test
```

---

## References

### Official Documentation

- [Mise Documentation](https://mise.jdx.dev)
- [Mise Monorepo Tasks](https://mise.jdx.dev/tasks/monorepo.html)
- [Mise Task Configuration](https://mise.jdx.dev/tasks/task-configuration.html)
- [Mise GitHub Repository](https://github.com/jdx/mise)

### Related Discussions

- [Introducing Monorepo Tasks - GitHub Discussion](https://github.com/jdx/mise/discussions/6564)
- [Mise Monorepo Best Practices](https://mise.jdx.dev/tasks/monorepo.html)

### Community Resources

- [Better Stack - Getting Started with Mise](https://betterstack.com/community/guides/scaling-nodejs/mise-explained/)
- [Mise Aqua Backend](https://mise.jdx.dev/dev-tools/backends/aqua.html)

---

*Document Version: 1.0.0*
*Last Updated: January 2026*
*Mise Version: 2026.1.3+*
