# Multi-Repo Workspace Management Guide

Best practices and enhancement opportunities for the AI/MCP multi-repo workspace. Based on January 2026 research and analysis of the current project structure.

> **Note:** This is a **multi-repo workspace**, not a monorepo. Each subdirectory is an independent git repository. See [multi-repo-workspace-guide.md](./multi-repo-workspace-guide.md) for architectural details.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Industry Best Practices (2026)](#industry-best-practices-2026)
4. [Gap Analysis](#gap-analysis)
5. [Enhancement Recommendations](#enhancement-recommendations)
6. [Implementation Guide](#implementation-guide)
7. [References](#references)

---

## Executive Summary

### Current Strengths

| Area | Status | Notes |
| ------ | -------- | ------- |
| Project Independence | Excellent | Each project has own go.mod, Makefile, documentation |
| Documentation | Excellent | AGENTS.md, CLAUDE.md, per-project CLAUDE.md |
| CI/CD Per-Project | Good | Most projects have workflows |
| CODEOWNERS | Partial | 3/7 projects have CODEOWNERS |
| Claude Code Integration | Good | Root-level review/triage workflows |

### Key Gaps Identified

| Gap | Impact | Effort to Fix |
| ----- | -------- | -------------- |
| No root-level CODEOWNERS | Medium | Low |
| No Go Workspace for local dev | Medium | Low |
| No change detection in CI | High | Medium |
| No dependency caching | High | Low |
| No cross-project Makefile | Medium | Low |
| No shared dependency management | Medium | Medium |
| Inconsistent CI workflows | Medium | Medium |

### Recommended Priority

1. **Quick Wins (P0):** Root CODEOWNERS, go.work.example, dependency caching, **mise adoption**
2. **High Impact (P1):** Change detection, mise task migration from Makefiles
3. **Long Term (P2):** Shared dependencies, CI standardization, remote caching

> **Note:** mise is the recommended tool management and task runner for this workspace.
> See [mise-configuration-guide.md](./mise-configuration-guide.md) for implementation details.

---

## Current State Analysis

### Project Structure

```text
AI/                           # Multi-repo workspace root
├── .claude/                  # Claude Code configuration
├── .github/                  # Root-level workflows (claude-review, claude-triage)
├── .serena/                  # Serena MCP memories
├── AGENTS.md                 # Cross-agent guidelines
├── CLAUDE.md                 # Claude-specific integration
├── .gitignore                # Comprehensive (includes go.work)
│
├── obot-entraid/             # MCP platform (Go + SvelteKit)
│   ├── go.mod
│   ├── Makefile
│   ├── CLAUDE.md
│   ├── .github/workflows/    # 10+ workflows
│   └── .github/CODEOWNERS    # ✓ Exists
│
├── nah/                      # K8s controller framework
│   ├── go.mod
│   ├── Makefile
│   ├── CLAUDE.md
│   ├── .github/workflows/    # 3 workflows
│   └── .github/CODEOWNERS    # ✓ Exists
│
├── kinm/                     # K8s-like API server
│   ├── go.mod
│   ├── Makefile
│   ├── CLAUDE.md
│   ├── .github/workflows/    # 5 workflows
│   └── .github/CODEOWNERS    # ✓ Exists
│
├── mcp-oauth-proxy/          # OAuth 2.1 proxy
│   ├── go.mod
│   ├── Makefile
│   ├── CLAUDE.md
│   └── .github/workflows/    # 4 workflows (no CODEOWNERS)
│
├── obot-tools/               # Tools & providers collection
│   ├── Makefile
│   ├── CLAUDE.md
│   └── (no .github/)         # Uses parent workflows?
│
├── mcp-catalog/              # MCP server catalog (YAML)
│   └── .github/workflows/    # 7 workflows (no CODEOWNERS)
│
└── namegenerator/            # Name generator library
    ├── go.mod
    ├── CLAUDE.md
    └── (no Makefile, no .github/)
```

### Go Module Distribution

| Project | Module Path | Has go.mod |
| --------- | ------------- | ------------ |
| obot-entraid | github.com/obot-platform/obot | ✓ |
| obot-entraid/apiclient | github.com/obot-platform/obot/apiclient | ✓ |
| obot-entraid/logger | github.com/obot-platform/obot/logger | ✓ |
| nah | github.com/obot-platform/nah | ✓ |
| kinm | github.com/obot-platform/kinm | ✓ |
| mcp-oauth-proxy | (unknown) | ✓ |
| namegenerator | (unknown) | ✓ |
| obot-tools/* | Multiple sub-modules | ✓ (25+) |

**Total: 30+ Go modules** across the workspace.

### Current CI/CD Patterns

**Root Level:**

- `claude-review.yml` - Claude Code PR review
- `claude-triage.yml` - Claude Code issue triage

**Per-Project Patterns:**

- Most projects have independent workflows
- No path-based filtering (all changes trigger all workflows)
- No dependency caching visible in sampled workflows
- No affected-project detection

### Current Makefile Patterns

| Target | nah | kinm | obot-entraid | mcp-oauth-proxy | Consistent |
| -------- | ----- | ------ | ------------ | --------------- | ---------- |
| `build` | - | ✓ | ✓ | ✓ | Partial |
| `test` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `validate` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `validate-ci` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lint` | - | - | ✓ | - | Partial |
| `setup-ci-env` | ✓ | - | - | - | Partial |

---

## Industry Best Practices (2026)

### 1. Go Workspaces (`go.work`)

[Go 1.18+ workspaces](https://go.dev/doc/tutorial/workspaces) simplify multi-module development by eliminating the need for `replace` directives.

**Best Practice:** Create a `go.work.example` file that developers can copy to `go.work` for local development. Keep `go.work` in `.gitignore`.

```go
// go.work.example
go 1.25

use (
    ./obot-entraid
    ./obot-entraid/apiclient
    ./obot-entraid/logger
    ./nah
    ./kinm
    ./mcp-oauth-proxy
    ./namegenerator
    // Add obot-tools modules as needed
)
```

**Source:** [Earthly Blog - Building a Monorepo in Golang](https://earthly.dev/blog/golang-monorepo/)

### 2. Change Detection / Affected Project Detection

[Monorepo CI/CD best practices](https://dev.to/pockit_tools/github-actions-in-2026-the-complete-guide-to-monorepo-cicd-and-self-hosted-runners-1jop) recommend building/testing only what changed.

**Approaches:**

- **Path filters:** Use `paths:` in workflow triggers
- **Dependency graph:** Tools like Nx/Bazel analyze imports
- **Manual matrix:** Define project → path mappings

**Example (Path Filter):**

```yaml
on:
  push:
    paths:
      - 'nah/**'
      - '.github/workflows/nah-*.yml'
```

### 3. Dependency Caching

[GitHub Actions caching](https://dev.to/abhilashlr/supercharging-github-actions-ci-from-slow-to-lightning-fast-with-turbo-caching-1bed) can reduce CI times by 70%+.

**Go Caching:**

```yaml
- uses: actions/setup-go@v5
  with:
    go-version: '1.25'
    cache: true
    cache-dependency-path: '**/go.sum'
```

**Node.js/pnpm Caching:**

```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 9
- uses: actions/setup-node@v4
  with:
    node-version: '24'
    cache: 'pnpm'
    cache-dependency-path: 'obot-entraid/ui/user/pnpm-lock.yaml'
```

### 4. CODEOWNERS at Workspace Root

[CODEOWNERS best practices](https://www.satellytes.com/blog/post/monorepo-codeowner-github-enterprise/) recommend a root-level file that covers all projects.

**Pattern:**

```text
# Default owner
* @jrmatherly

# Project-specific (more specific rules override)
/obot-entraid/ @jrmatherly
/nah/ @jrmatherly
/kinm/ @jrmatherly
/mcp-oauth-proxy/ @jrmatherly
/obot-tools/ @jrmatherly
/mcp-catalog/ @jrmatherly
/namegenerator/ @jrmatherly

# Shared configuration (high impact)
/AGENTS.md @jrmatherly
/CLAUDE.md @jrmatherly
/.github/ @jrmatherly
```

### 5. Cross-Project Build Tooling

[Monorepo tools comparison](https://monorepo.tools/) shows benefits of unified task running (applies equally to multi-repo workspaces).

**For Go-heavy workspaces without Nx/Turborepo:**

- Root-level Makefile with project detection
- Task targets that operate on all projects or specific ones

### 6. Shared Dependency Management

[Centralizing dependencies](https://engineering.grab.com/go-module-a-guide-for-monorepos-part-1) prevents version drift.

**Strategies:**

- Renovate/Dependabot with grouped updates
- Shared `go.work` for consistent resolution
- CI that validates dependency alignment

### 7. Tooling Options for Go Workspaces

| Tool | Go Support | Best For | Complexity |
| ------ | ------------ | ---------- | ------------ |
| **mise** | Excellent | Polyglot workspaces, tool versioning | Low |
| **Make** | Native | Simple multi-project | Low |
| **Bazel + Gazelle** | Excellent | Large scale, hermetic | High |
| **Earthly** | Excellent | Container-based builds | Medium |
| **Task** | Native | Modern Make alternative | Low |
| **Just** | Native | Simpler task runner | Low |

**Recommendation:** Use **mise** (mise-en-place) for this workspace. It provides:

- Polyglot tool versioning (Go, Node, Python, golangci-lint)
- Native cross-project task support with inheritance (mise uses "monorepo" terminology for this feature)
- Cross-project task execution (`mise '//...:test'`)
- Source/output tracking to skip unchanged tasks
- Environment variable management per-project

See **[mise-configuration-guide.md](./mise-configuration-guide.md)** for complete implementation details.

---

## Gap Analysis

### Gap 1: No Root-Level CODEOWNERS

**Current:** CODEOWNERS only in obot-entraid, nah, kinm
**Impact:** PRs to other projects (mcp-oauth-proxy, obot-tools, mcp-catalog, namegenerator) don't get automatic reviewer assignment
**Effort:** Low (one file)

### Gap 2: No Go Workspace for Local Development

**Current:** `go.work` is gitignored but no example provided
**Impact:** Developers manually manage cross-project dependencies with replace directives
**Effort:** Low (one file + docs)

### Gap 3: No Change Detection in CI

**Current:** All workflows trigger on all changes
**Impact:** Unnecessary CI runs, wasted compute, slower feedback
**Effort:** Medium (modify each workflow)

### Gap 4: No Dependency Caching

**Current:** No visible caching in sampled workflows
**Impact:** Slower CI (downloading dependencies every run)
**Effort:** Low (add caching steps)

### Gap 5: No Cross-Project Makefile

**Current:** Must cd into each project to run commands
**Impact:** Tedious for cross-project operations (e.g., lint all, test all)
**Effort:** Low (one file)

### Gap 6: Inconsistent Makefile Targets

**Current:** Different targets across projects (some have `lint`, some don't)
**Impact:** Inconsistent developer experience, harder automation
**Effort:** Medium (standardize Makefiles)

### Gap 7: No Shared Dependency Version Management

**Current:** Each project manages dependencies independently
**Impact:** Potential version drift, inconsistent behavior
**Effort:** Medium (requires coordination)

### Gap 8: Missing CODEOWNERS in 4 Projects

**Current:** mcp-oauth-proxy, obot-tools, mcp-catalog, namegenerator lack CODEOWNERS
**Impact:** No automatic reviewer assignment for those projects
**Effort:** Low (if root CODEOWNERS covers them)

### Gap 9: No CI Status Dashboard

**Current:** Must check each project's workflows separately
**Impact:** Hard to see overall workspace health at a glance
**Effort:** Medium (GitHub Actions summaries or external tool)

### Gap 10: No Pre-Commit Hooks

**Current:** Developers must remember to run `make validate-ci`
**Impact:** CI failures that could be caught locally
**Effort:** Low (add pre-commit config)

---

## Enhancement Recommendations

### Priority 0: Quick Wins (Implement Immediately)

#### 1. Root-Level CODEOWNERS

Create `.github/CODEOWNERS`:

```text
# AI/MCP Multi-Repo Workspace CODEOWNERS
# https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

# Default owner for everything in the workspace
* @jrmatherly

# =============================================================================
# PROJECT-SPECIFIC OWNERSHIP
# =============================================================================

# obot-entraid: MCP platform (Go + SvelteKit + PostgreSQL)
/obot-entraid/ @jrmatherly

# nah: Kubernetes controller framework
/nah/ @jrmatherly

# kinm: K8s-like API server with PostgreSQL
/kinm/ @jrmatherly

# mcp-oauth-proxy: OAuth 2.1 proxy
/mcp-oauth-proxy/ @jrmatherly

# obot-tools: Tools, model providers, auth providers
/obot-tools/ @jrmatherly

# mcp-catalog: MCP server configuration catalog
/mcp-catalog/ @jrmatherly

# namegenerator: Random name generator library
/namegenerator/ @jrmatherly

# =============================================================================
# CROSS-PROJECT CONFIGURATION (SECURITY-SENSITIVE)
# =============================================================================

# Workspace documentation and AI configuration
/AGENTS.md @jrmatherly
/CLAUDE.md @jrmatherly
/.claude/ @jrmatherly
/.serena/ @jrmatherly

# Root-level CI/CD
/.github/ @jrmatherly

# Root configuration files
/.gitignore @jrmatherly
/Makefile @jrmatherly
/go.work* @jrmatherly

# =============================================================================
# SECURITY-SENSITIVE FILES (Require explicit approval)
# =============================================================================

# Any security-related files
**/SECURITY.md @jrmatherly
**/.env* @jrmatherly
**/secrets/ @jrmatherly

# CI/CD workflows (can run arbitrary code)
**/.github/workflows/ @jrmatherly

# Dependency files (supply chain risk)
**/go.mod @jrmatherly
**/go.sum @jrmatherly
**/package.json @jrmatherly
**/pnpm-lock.yaml @jrmatherly
```

#### 2. Go Workspace Example

Create `go.work.example`:

```text
// go.work.example
//
// Go Workspace for local AI/MCP multi-repo workspace development.
//
// Usage:
//   cp go.work.example go.work
//   # Edit to include only the modules you're working with
//   go work sync
//
// Benefits:
//   - Cross-module changes work without 'replace' directives
//   - IDE understands all modules in the workspace
//   - 'go build' and 'go test' work across modules
//
// Note: go.work is gitignored - this file is a template only.

go 1.25

use (
    // Core projects
    ./obot-entraid
    ./obot-entraid/apiclient
    ./obot-entraid/logger
    ./nah
    ./kinm
    ./mcp-oauth-proxy
    ./namegenerator

    // Uncomment obot-tools modules as needed:
    // ./obot-tools/openai-model-provider
    // ./obot-tools/anthropic-model-provider-go
    // ./obot-tools/ollama-model-provider
    // ./obot-tools/groq-model-provider
    // ./obot-tools/deepseek-model-provider
    // ./obot-tools/xai-model-provider
    // ./obot-tools/vllm-model-provider
    // ./obot-tools/generic-openai-model-provider
    // ./obot-tools/obot-model-provider
    // ./obot-tools/google-auth-provider
    // ./obot-tools/github-auth-provider
    // ./obot-tools/entra-auth-provider
    // ./obot-tools/keycloak-auth-provider
    // ./obot-tools/credential-stores
    // ./obot-tools/generic-credential
    // ./obot-tools/oauth2
    // ./obot-tools/auth-providers-common
    // ./obot-tools/knowledge
    // ./obot-tools/memory
    // ./obot-tools/tasks
    // ./obot-tools/workflow
    // ./obot-tools/loop-data
    // ./obot-tools/workspace-files
    // ./obot-tools/result-formatter
    // ./obot-tools/task-invoke
    // ./obot-tools/tests
)
```

Update `DEVELOPER_ONBOARDING.md` to reference this file.

#### 3. Dependency Caching Template

Create `.github/actions/setup-go/action.yml`:

```yaml
name: Setup Go with Caching
description: Sets up Go with module and build caching

inputs:
  go-version:
    description: Go version to install
    required: false
    default: '1.25'
  working-directory:
    description: Directory containing go.mod
    required: false
    default: '.'

runs:
  using: composite
  steps:
    - name: Setup Go
      uses: actions/setup-go@v5
      with:
        go-version: ${{ inputs.go-version }}
        cache: true
        cache-dependency-path: |
          ${{ inputs.working-directory }}/go.sum
          **/go.sum

    - name: Cache Go build
      uses: actions/cache@v4
      with:
        path: |
          ~/.cache/go-build
          ~/go/pkg/mod
        key: ${{ runner.os }}-go-${{ inputs.go-version }}-${{ hashFiles('**/go.sum') }}
        restore-keys: |
          ${{ runner.os }}-go-${{ inputs.go-version }}-
          ${{ runner.os }}-go-
```

#### 4. Adopt mise for Tool and Task Management

mise (mise-en-place) provides unified tool versioning and task running for the entire workspace.

**Quick Setup:**

```bash
# Install mise
curl https://mise.run | sh

# Trust the repository
mise trust

# Install all tools (Go, Node, Python, golangci-lint)
mise install

# Run all validations across workspace
mise all
```

**Key Benefits:**

- Single source of truth for tool versions (Go 1.25, Node 24, Python 3.14)
- Cross-project task execution (`mise //nah:test`, `mise '//...:validate'`)
- Automatic environment setup per-project
- Source/output tracking to skip unchanged tasks

See **[mise-configuration-guide.md](./mise-configuration-guide.md)** for complete configuration templates.

### Priority 1: High Impact

#### 5. Root-Level Makefile (Optional with mise)

Create `Makefile` at workspace root:

```makefile
# AI/MCP Multi-Repo Workspace Root Makefile
#
# Cross-project operations for the workspace.
# For project-specific commands, cd into the project directory.

.PHONY: help all test validate lint tidy generate status deps-check

# Project directories (excluding archives and node_modules)
GO_PROJECTS := obot-entraid nah kinm mcp-oauth-proxy namegenerator
OBOT_TOOLS_DIR := obot-tools

# Default target
help:
 @echo "AI/MCP Multi-Repo Workspace Commands"
 @echo ""
 @echo "Cross-Project Operations:"
 @echo "  make all         - Run validate-ci on all Go projects"
 @echo "  make test        - Run tests on all Go projects"
 @echo "  make validate    - Run linting on all Go projects"
 @echo "  make lint        - Alias for validate"
 @echo "  make tidy        - Run 'go mod tidy' on all projects"
 @echo "  make generate    - Run 'go generate' on all projects"
 @echo "  make status      - Show git status for all projects"
 @echo "  make deps-check  - Check for dependency updates"
 @echo ""
 @echo "Single Project (examples):"
 @echo "  make test-nah          - Test nah only"
 @echo "  make validate-kinm     - Validate kinm only"
 @echo ""
 @echo "For project-specific commands, cd into the project:"
 @echo "  cd nah && make validate-ci"

# Run validate-ci on all Go projects
all:
 @for dir in $(GO_PROJECTS); do \
  echo "=== $$dir ==="; \
  if [ -f "$$dir/Makefile" ]; then \
   $(MAKE) -C $$dir validate-ci || exit 1; \
  else \
   echo "  (no Makefile, running go test)"; \
   cd $$dir && go test ./... && cd ..; \
  fi; \
 done
 @echo ""
 @echo "All projects validated successfully!"

# Run tests on all Go projects
test:
 @for dir in $(GO_PROJECTS); do \
  echo "=== Testing $$dir ==="; \
  if [ -f "$$dir/Makefile" ] && grep -q "^test:" "$$dir/Makefile"; then \
   $(MAKE) -C $$dir test || exit 1; \
  else \
   cd $$dir && go test ./... || exit 1; cd ..; \
  fi; \
 done

# Run validation/linting on all projects
validate lint:
 @for dir in $(GO_PROJECTS); do \
  echo "=== Validating $$dir ==="; \
  if [ -f "$$dir/Makefile" ] && grep -q "^validate:" "$$dir/Makefile"; then \
   $(MAKE) -C $$dir validate || exit 1; \
  else \
   echo "  (no validate target, running go vet)"; \
   cd $$dir && go vet ./... || exit 1; cd ..; \
  fi; \
 done

# Tidy all Go modules
tidy:
 @for dir in $(GO_PROJECTS); do \
  echo "=== Tidying $$dir ==="; \
  cd $$dir && go mod tidy && cd ..; \
 done
 @echo ""
 @echo "Tidying obot-tools modules..."
 @find $(OBOT_TOOLS_DIR) -name "go.mod" -not -path "*/.archive/*" -execdir go mod tidy \;

# Generate code for all projects
generate:
 @for dir in $(GO_PROJECTS); do \
  echo "=== Generating $$dir ==="; \
  cd $$dir && go generate ./... 2>/dev/null || true; cd ..; \
 done

# Show git status across all projects
status:
 @echo "=== Multi-Repo Workspace Git Status ==="
 @git status --short
 @echo ""
 @for dir in $(GO_PROJECTS); do \
  changes=$$(cd $$dir && git status --short . 2>/dev/null | wc -l | tr -d ' '); \
  if [ "$$changes" -gt 0 ]; then \
   echo "$$dir: $$changes change(s)"; \
  fi; \
 done

# Check for dependency updates (requires go-mod-outdated or similar)
deps-check:
 @echo "Checking for outdated dependencies..."
 @for dir in $(GO_PROJECTS); do \
  echo "=== $$dir ==="; \
  cd $$dir && go list -u -m all 2>/dev/null | grep '\[' || echo "  All up to date"; \
  cd ..; \
 done

# Per-project targets
test-%:
 $(MAKE) -C $* test

validate-%:
 $(MAKE) -C $* validate

# CI validation (for use in GitHub Actions)
ci: all test
 @echo "CI validation complete!"
```

#### 6. Change Detection Workflow Template

Create `.github/workflows/templates/go-project-ci.yml`:

```yaml
# Template for Go project CI with change detection
# Copy and customize for each project

name: Go Project CI

on:
  push:
    branches: [main]
    paths:
      - 'PROJECT_DIR/**'
      - '.github/workflows/PROJECT_NAME-*.yml'
  pull_request:
    branches: [main]
    paths:
      - 'PROJECT_DIR/**'
      - '.github/workflows/PROJECT_NAME-*.yml'

defaults:
  run:
    working-directory: PROJECT_DIR

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Go with caching
        uses: actions/setup-go@v5
        with:
          go-version: '1.25'
          cache: true
          cache-dependency-path: PROJECT_DIR/go.sum

      - name: Install golangci-lint
        run: |
          curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin latest

      - name: Validate CI
        run: make validate-ci

      - name: Lint
        run: make validate

      - name: Test
        run: make test
```

### Priority 2: Long-Term Improvements

#### 7. Project Registry/Manifest

Create `projects.yaml` at workspace root:

```yaml
# AI/MCP Multi-Repo Workspace Project Registry
#
# Central registry of all projects in the workspace.
# Used for tooling, documentation, and automation.

version: "1.0"

projects:
  obot-entraid:
    path: ./obot-entraid
    type: application
    language: go
    description: MCP platform with Microsoft Entra ID & Keycloak auth
    tech_stack:
      - Go
      - SvelteKit
      - PostgreSQL
      - Kubernetes
    has_makefile: true
    has_codeowners: true
    ci_workflows:
      - ci.yml
      - docker-build-and-push.yml
      - release.yml
    documentation:
      - CLAUDE.md
      - README.md
      - docs/

  nah:
    path: ./nah
    type: library
    language: go
    description: '"Not Another Handler" Kubernetes controller framework'
    tech_stack:
      - Go
      - Kubernetes
      - controller-runtime
    has_makefile: true
    has_codeowners: true
    ci_workflows:
      - codeql.yml
      - claude-code-review.yml
    documentation:
      - CLAUDE.md
      - README.md
      - CONTRIBUTING.md

  kinm:
    path: ./kinm
    type: library
    language: go
    description: '"Kinm is not Mink" K8s-like API server with PostgreSQL'
    tech_stack:
      - Go
      - PostgreSQL
      - Kubernetes
    has_makefile: true
    has_codeowners: true
    ci_workflows:
      - ci.yml
      - codeql.yml
    documentation:
      - CLAUDE.md
      - README.md

  mcp-oauth-proxy:
    path: ./mcp-oauth-proxy
    type: application
    language: go
    description: OAuth 2.1 proxy for MCP servers
    tech_stack:
      - Go
      - PostgreSQL
      - SQLite
      - OAuth 2.1
    has_makefile: true
    has_codeowners: false  # NEEDS FIXING
    ci_workflows:
      - build.yml
      - test.yml
      - release.yml
    documentation:
      - CLAUDE.md
      - README.md

  obot-tools:
    path: ./obot-tools
    type: collection
    language: mixed
    description: Official Obot tools, model providers, auth providers
    tech_stack:
      - Go
      - Python
      - TypeScript
      - GPTScript
    has_makefile: true
    has_codeowners: false  # NEEDS FIXING
    ci_workflows: []  # Uses parent workflows?
    documentation:
      - CLAUDE.md
      - README.md

  mcp-catalog:
    path: ./mcp-catalog
    type: configuration
    language: yaml
    description: MCP server configuration catalog
    tech_stack:
      - YAML
    has_makefile: false
    has_codeowners: false  # NEEDS FIXING
    ci_workflows:
      - mcpwn.yml
      - sync-mcp-registry.yml
    documentation:
      - README.md

  namegenerator:
    path: ./namegenerator
    type: library
    language: go
    description: Random name generator library (zero dependencies)
    tech_stack:
      - Go
    has_makefile: false
    has_codeowners: false  # NEEDS FIXING
    ci_workflows: []
    documentation:
      - CLAUDE.md
      - README.md

# Shared configuration
shared:
  go_version: "1.25"
  node_version: "24"
  pnpm_version: "9"
  golangci_lint_version: "2.8.0"

# CI/CD settings
ci:
  cache_enabled: true
  parallel_jobs: true
  change_detection: true
```

#### 8. Pre-Commit Hook Configuration

Create `.pre-commit-config.yaml`:

```yaml
# Pre-commit hooks for AI/MCP multi-repo workspace
# Install: pip install pre-commit && pre-commit install

repos:
  # General formatting
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
        args: [--allow-multiple-documents]
      - id: check-json
      - id: check-added-large-files
        args: [--maxkb=500]
      - id: detect-private-key
      - id: check-merge-conflict

  # Go formatting and linting
  - repo: https://github.com/dnephin/pre-commit-golang
    rev: v0.5.1
    hooks:
      - id: go-fmt
      - id: go-vet
      - id: go-mod-tidy

  # Markdown linting
  - repo: https://github.com/igorshubovych/markdownlint-cli
    rev: v0.38.0
    hooks:
      - id: markdownlint
        args: [--fix]
        exclude: node_modules|\.archive

  # YAML linting
  - repo: https://github.com/adrienverge/yamllint
    rev: v1.33.0
    hooks:
      - id: yamllint
        args: [-c, .yamllint.yml]

# Exclude archived content
exclude: |
  (?x)^(
    .*/\.archive/.*|
    .*/node_modules/.*|
    .*/vendor/.*
  )$
```

Create `.yamllint.yml`:

```yaml
extends: default

rules:
  line-length:
    max: 120
  truthy:
    check-keys: false
  document-start: disable
  comments:
    min-spaces-from-content: 1
```

---

## Implementation Guide

### Phase 1: Quick Wins (Week 1)

| Task | File | Effort |
| ------ | ------ | -------- |
| Create root CODEOWNERS | `.github/CODEOWNERS` | 30 min |
| Create go.work.example | `go.work.example` | 15 min |
| Create setup-go action | `.github/actions/setup-go/action.yml` | 30 min |
| **Adopt mise** | `mise.toml` + per-project configs | 1 hour |
| Update DEVELOPER_ONBOARDING.md | Add go.work + mise instructions | 15 min |

> **mise adoption** - See [mise-configuration-guide.md](./mise-configuration-guide.md) for complete templates.

### Phase 2: CI Improvements (Week 2-3)

| Task | Scope | Effort |
| ------ | ------- | -------- |
| Add path filters to workflows | Each project's workflows | 2 hours |
| Add caching to workflows | Each project's workflows | 2 hours |
| Migrate Makefile targets to mise tasks | Per-project mise.toml | 2 hours |
| Add mise to CI workflows | GitHub Actions with mise | 1 hour |
| Test and validate changes | All projects | 2 hours |

### Phase 3: Standardization (Week 4+)

| Task | Scope | Effort |
| ------ | ------- | -------- |
| Standardize Makefile targets | All projects | 4 hours |
| Create project registry | `projects.yaml` | 1 hour |
| Add pre-commit hooks | `.pre-commit-config.yaml` | 2 hours |
| Document all changes | Update AGENTS.md, README.md | 2 hours |

---

## References

### Official Documentation

- [mise Documentation](https://mise.jdx.dev/) - Polyglot development tool manager
- [mise Monorepo Tasks](https://mise.jdx.dev/tasks/monorepo.html) - Monorepo-specific features
- [mise Task Configuration](https://mise.jdx.dev/tasks/task-configuration.html) - TOML task syntax
- [Go Workspaces Tutorial](https://go.dev/doc/tutorial/workspaces)
- [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitHub Actions Caching](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)

### Industry Best Practices

- [Earthly Blog - Building a Monorepo in Golang](https://earthly.dev/blog/golang-monorepo/)
- [GitHub Actions 2026 Guide - Monorepo CI/CD](https://dev.to/pockit_tools/github-actions-in-2026-the-complete-guide-to-monorepo-cicd-and-self-hosted-runners-1jop)
- [Monorepo Tools Comparison](https://monorepo.tools/)
- [CODEOWNERS for Monorepos](https://www.satellytes.com/blog/post/monorepo-codeowner-github-enterprise/)
- [Go Module Guide for Monorepos](https://engineering.grab.com/go-module-a-guide-for-monorepos-part-1)
- [Grab Engineering - Go Workspaces](https://blog.logrocket.com/go-workspaces-multi-module-local-development/)
- [Monorepo CI/CD with GitHub Actions](https://graphite.com/guides/monorepo-with-github-actions)

### Tooling

- [Nx vs Turborepo vs Bazel Comparison](https://medium.com/@piyalidas.it/monorepo-nx-vs-turborepo-vs-bazel-200504067d4b)
- [Top Monorepo Tools 2025](https://www.aviator.co/blog/monorepo-tools/)
- [Pre-commit Framework](https://pre-commit.com/)

### Related Project Documentation

- [mise Configuration Guide](./mise-configuration-guide.md) - Complete mise implementation for this workspace
- [Claude Code Enhancements Guide](./claude-code-enhancements-guide.md) - Claude Code integration recommendations

---

*Document Version: 1.1.0*
*Last Updated: January 2026*
*Based on industry research and current project analysis*
*Updated to recommend mise as the primary tool management solution*
