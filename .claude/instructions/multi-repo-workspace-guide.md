# Multi-Repository Workspace Guide

Comprehensive guide for managing the AI/MCP multi-repository workspace structure. Based on January 2026 research and analysis of industry best practices.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Structure Analysis](#current-structure-analysis)
3. [Industry Best Practices (2026)](#industry-best-practices-2026)
4. [Approach Comparison](#approach-comparison)
5. [Recommended Approach](#recommended-approach)
6. [Implementation Guide](#implementation-guide)
7. [Multi-Repo Management Tools](#multi-repo-management-tools)
8. [Configuration Propagation Strategy](#configuration-propagation-strategy)
9. [References](#references)

---

## Executive Summary

### Current Situation

The AI/MCP development workspace uses a **nested multi-repository** structure:

- Root `AI/` directory is a git repository (for shared configuration/documentation)
- Each project subdirectory is an **independent git repository** with its own GitHub remote
- Projects are **NOT** configured as git submodules
- Each project maintains independent version control and release cycles

### Key Decision

| Approach | Recommendation | Rationale |
| ---------- | --------------- | ----------- |
| Git Submodules | Not recommended | Adds complexity, projects have independent lifecycles |
| Loose Multi-Repo Workspace | **Recommended** | Maintains independence, simple workflow, proper separation |
| Pure Workspace (no root git) | Alternative | Simpler but loses shared config versioning |

### Critical Actions Required

1. **Update root `.gitignore`** to exclude child repositories
2. **Commit configuration files** (mise.toml, etc.) to each child repository individually
3. **Consider multi-repo tooling** (gita, meta) for bulk operations

---

## Current Structure Analysis

### Repository Layout

```text
AI/                              ← Git repository (shared config/docs)
├── .git/                        ← Root git repository
├── .gitignore                   ← Root gitignore (needs update)
├── mise.toml                    ← Root mise config (stays in root repo)
├── CLAUDE.md                    ← Shared documentation
├── AGENTS.md                    ← Cross-agent guidelines
├── .claude/instructions/        ← Shared instruction guides
│
├── obot-entraid/                ← Independent git repo
│   ├── .git/                    ← Own git history
│   ├── mise.toml                ← Project mise config (commit HERE)
│   └── remote: github.com/jrmatherly/obot-entraid
│
├── nah/                         ← Independent git repo
│   ├── .git/
│   ├── mise.toml                ← Project mise config (commit HERE)
│   └── remote: github.com/jrmatherly/nah
│
├── kinm/                        ← Independent git repo
│   ├── .git/
│   ├── mise.toml
│   └── remote: github.com/jrmatherly/kinm
│
├── mcp-oauth-proxy/             ← Independent git repo
│   ├── .git/
│   ├── mise.toml
│   └── remote: github.com/jrmatherly/mcp-oauth-proxy
│
├── obot-tools/                  ← Independent git repo
│   ├── .git/
│   ├── mise.toml
│   └── remote: github.com/jrmatherly/obot-tools
│
├── mcp-catalog/                 ← Independent git repo
│   ├── .git/
│   └── remote: github.com/jrmatherly/mcp-catalog
│
└── namegenerator/               ← Independent git repo
    ├── .git/
    ├── mise.toml
    └── remote: github.com/jrmatherly/namegenerator
```

### Current Issues

| Issue | Impact | Resolution |
| ------- | -------- | ------------ |
| Root `.gitignore` doesn't exclude child repos | Child repos appear as untracked in root | Add exclusions for each project directory |
| mise.toml files not committed | Configuration not version controlled | Commit to respective child repositories |
| No bulk operation tooling | Manual cd into each project | Install gita or similar tool |
| Unclear file ownership | Confusion about which repo owns which file | Document ownership clearly |

### Git Repository Remotes

| Project | Remote URL |
| --------- | ------------ |
| obot-entraid | `github.com/jrmatherly/obot-entraid` |
| nah | `github.com/jrmatherly/nah` |
| kinm | `github.com/jrmatherly/kinm` |
| mcp-oauth-proxy | `github.com/jrmatherly/mcp-oauth-proxy` |
| obot-tools | `github.com/jrmatherly/obot-tools` |
| mcp-catalog | `github.com/jrmatherly/mcp-catalog` |
| namegenerator | `github.com/jrmatherly/namegenerator` |

---

## Industry Best Practices (2026)

### Multi-Repository Architectures

Based on research from industry sources, there are three primary approaches for managing multiple related repositories:

### 1. Git Submodules

**Description:** Submodules create a formal parent-child relationship where the parent repository tracks specific commit hashes from child repositories.

**How it works:**

- Parent repo contains `.gitmodules` file listing submodule configurations
- Each submodule is pinned to a specific commit
- Updates require explicit submodule update commands

**Best for:**

- Vendoring external dependencies
- Pinning to specific versions across projects
- Monorepo-style management with version control

**Challenges:**

- Complex workflow (clone --recursive, submodule update)
- Fragile configuration requiring careful maintenance
- Team members must understand submodule commands

**Source:** [Git Documentation - Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

### 2. Git Subtrees

**Description:** Subtrees merge entire repository contents into a subdirectory, maintaining history inline.

**How it works:**

- Child repo history is merged into parent
- Updates pulled/pushed with subtree commands
- Single repository contains all code

**Best for:**

- Incorporating external projects permanently
- Simplifying deployment (single repo clone)
- Projects that will rarely diverge

**Challenges:**

- Complex merge history
- Difficult to push changes back upstream
- Repository size grows significantly

### 3. Loose Multi-Repo Workspace (Poly-Repo)

**Description:** Multiple independent repositories co-located in a shared workspace directory, each maintaining completely separate git histories.

**How it works:**

- Each project is a standalone git repository
- Parent directory may or may not be a git repo
- No formal git relationship between repos
- Tools like `gita` or `meta` provide bulk operations

**Best for:**

- Independent release cycles per project
- Different teams owning different projects
- Microservices architectures
- Projects with their own CI/CD pipelines

**Challenges:**

- Coordinating changes across repos
- Ensuring consistent tooling/configuration
- Bulk operations require external tools

**Source:** [GitKraken - Multi-Repo Management](https://www.gitkraken.com/blog/multi-repo-management-hurdles-and-solutions)

---

## Approach Comparison

### Decision Matrix

| Criteria | Submodules | Subtrees | Loose Multi-Repo |
| ---------- | ---------- | ---------- | ------------------ |
| Independent releases | ⚠️ Possible | ❌ Difficult | ✅ Native |
| Simple workflow | ❌ Complex | ⚠️ Moderate | ✅ Familiar |
| Version pinning | ✅ Native | ⚠️ Manual | ❌ Not applicable |
| Separate CI/CD | ⚠️ Possible | ❌ Shared | ✅ Native |
| Team familiarity | ❌ Low | ❌ Low | ✅ High |
| Bulk operations | ⚠️ Git commands | ❌ N/A | ⚠️ Requires tools |
| Clone simplicity | ❌ --recursive | ✅ Simple | ⚠️ Multiple clones |

### For AI/MCP Workspace

Given the current structure and requirements:

| Factor | Analysis |
| -------- | ---------- |
| Projects have independent remotes | Supports loose multi-repo |
| Each project has own GitHub repo | Supports independent CI/CD |
| Different technology stacks | Supports independent tooling |
| Shared configuration (mise) | Can be duplicated or inherited |
| Development convenience | Loose workspace with gita |

**Recommendation:** **Loose Multi-Repo Workspace** with proper .gitignore configuration and optional `gita` tooling.

---

## Recommended Approach

### Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    AI/ (Root Repository)                     │
│  Purpose: Shared documentation, configuration, coordination │
│  Contains: CLAUDE.md, AGENTS.md, mise.toml, .gitignore      │
│  .gitignore: Excludes all child project directories         │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    ┌───────────┐       ┌───────────┐       ┌───────────┐
    │   nah/    │       │obot-entra │       │   kinm/   │
    │           │       │   id/     │       │           │
    │ .git/     │       │ .git/     │       │ .git/     │
    │ mise.toml │       │ mise.toml │       │ mise.toml │
    │ go.mod    │       │ go.mod    │       │ go.mod    │
    └───────────┘       └───────────┘       └───────────┘
    Independent         Independent         Independent
    Repository          Repository          Repository
```

### File Ownership Rules

| File/Directory | Owner Repository | Notes |
| ---------------- | ------------------ | ------- |
| `AI/mise.toml` | Root (AI/) | Shared tools, workspace tasks |
| `AI/CLAUDE.md` | Root (AI/) | Cross-project guidance |
| `AI/AGENTS.md` | Root (AI/) | Agent guidelines |
| `AI/.claude/` | Root (AI/) | Instruction guides |
| `nah/mise.toml` | nah/ | Project-specific tasks |
| `nah/CLAUDE.md` | nah/ | Project-specific guidance |
| `obot-entraid/mise.toml` | obot-entraid/ | Project-specific tasks |
| (etc.) | (respective repo) | Each project owns its files |

### .gitignore Strategy

**Root `.gitignore` must exclude child repositories:**

```gitignore
# =============================================================================
# INDEPENDENT PROJECT REPOSITORIES
# =============================================================================
# These directories are independent git repositories with their own remotes.
# They should NOT be tracked by the root repository.
# Each project maintains its own version control.

obot-entraid/
nah/
kinm/
mcp-oauth-proxy/
obot-tools/
mcp-catalog/
namegenerator/
```

**Rationale:**

- Child directories contain `.git/` subdirectories
- Git normally treats these as nested repos or submodules
- Excluding them prevents confusion and accidental commits
- Each project's changes go to its own remote

---

## Implementation Guide

### Phase 1: Update Root .gitignore

Add the following to `/Users/jason/dev/AI/.gitignore`:

```gitignore
# =============================================================================
# INDEPENDENT PROJECT REPOSITORIES
# =============================================================================
# These directories are independent git repositories with their own remotes.
# They should NOT be tracked by the root repository.

obot-entraid/
nah/
kinm/
mcp-oauth-proxy/
obot-tools/
mcp-catalog/
namegenerator/
```

### Phase 2: Commit Configuration to Child Repositories

Each project's mise.toml needs to be committed to that project's repository.

**Using mise tasks (recommended):**

```bash
# From workspace root, use mise commit tasks
mise run commit:nah -m "feat: add mise configuration for task management"
mise run commit:kinm -m "feat: add mise configuration for task management"
mise run commit:obot-entraid -m "feat: add mise configuration for task management"
mise run commit:mcp-oauth-proxy -m "feat: add mise configuration for task management"
mise run commit:namegenerator -m "feat: add mise configuration for task management"
mise run commit:obot-tools -m "feat: add mise configuration for task management"
```

**Or manually (not recommended):**

```bash
# Navigate to each project and commit mise.toml
cd /Users/jason/dev/AI/nah
git add mise.toml
git commit -m "feat: add mise configuration for task management"
# ... repeat for each project
```

### Phase 3: Commit Root Repository Changes

```bash
cd /Users/jason/dev/AI
git add .gitignore mise.toml CLAUDE.md AGENTS.md .claude/
git commit -m "feat: add shared mise configuration and documentation"
```

### Phase 4: Push All Repositories

**Using mise/gita (recommended):**

```bash
# Push all child repos from workspace root
mise run gita-push

# Then push root repository
git push origin main
```

**Or using individual push tasks:**

```bash
mise run push:nah
mise run push:kinm
mise run push:obot-entraid
mise run push:mcp-oauth-proxy
mise run push:namegenerator
mise run push:obot-tools

# Push root repository
git push origin main
```

**Or using push-all:**

```bash
mise run push-all
git push origin main
```

---

## Multi-Repo Management Tools

### Recommended: gita

[gita](https://pypi.org/project/gita/) is a Python tool for managing multiple git repositories with sanity.

#### Installation

**gita is included as a tool in the root `mise.toml`:**

```bash
# From the AI/ workspace root
mise install    # Installs gita along with other tools
```

Or install manually:

```bash
uv tool install gita
# or
pipx install gita
```

#### Setup via mise Tasks

The root mise.toml includes tasks for gita operations:

```bash
# Register all child repositories with gita
mise gita-init

# This runs:
# gita add obot-entraid nah kinm mcp-oauth-proxy obot-tools mcp-catalog namegenerator
```

#### Common Operations via mise

```bash
# Show status of all repos
mise gita-status    # or: mise gs

# Fetch all repos
mise gita-fetch     # or: mise gf

# Pull all repos
mise gita-pull      # or: mise gp

# Push all repos (use with caution)
mise gita-push

# Run arbitrary git command on all repos
mise gita-cmd -- status
mise gita-cmd -- log --oneline -3
```

#### Conventional Commits via mise

The root mise.toml includes tasks for conventional commits per project:

```bash
# Format: mise run commit:PROJECT -m "type(scope): message"
mise run commit:obot-entraid -m "feat(auth): add feature"  # alias: mise ce
mise run commit:obot-tools -m "fix(provider): bug fix"     # alias: mise ct
mise run commit:nah -m "refactor: cleanup"                 # alias: mise cn
mise run commit:kinm -m "test: add tests"                  # alias: mise ck
mise run commit:mcp-oauth-proxy -m "docs: update docs"     # alias: mise cm
mise run commit:mcp-catalog -m "chore: update config"      # alias: mise cc
mise run commit:namegenerator -m "fix: improve algo"       # alias: mise cng
```

**Commit Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

#### Push Operations via mise

```bash
# Push individual projects
mise run push:obot-entraid   # alias: mise pe
mise run push:obot-tools     # alias: mise pt
mise run push:nah            # alias: mise pn
mise run push:kinm           # alias: mise pk
mise run push:mcp-oauth-proxy # alias: mise pm
mise run push:mcp-catalog    # alias: mise pc
mise run push:namegenerator  # alias: mise png

# Push all projects (use with caution)
mise run push-all
```

#### Direct gita Commands

```bash
# Show status of all repos
gita ll

# Fetch all repos
gita fetch

# Pull all repos
gita pull

# Run git command on all repos
gita super status

# Run command on specific repo without cd
gita shell nah "git log --oneline -5"

# Create context for a group of repos
gita group add ai-projects obot-entraid nah kinm
gita context ai-projects
gita ll  # Only shows repos in context
```

#### Configuration Export/Import

```bash
# Export current repo configuration
gita freeze > repos.yaml

# Clone repos from configuration
gita clone -f repos.yaml
```

### Alternative: meta

[meta](https://github.com/mateodelnorte/meta) provides a "meta repo" approach.

```bash
npm install -g meta

# Initialize meta repo
meta init

# Add projects
meta project add nah ./nah
meta project add kinm ./kinm
# ... etc

# Run commands across all
meta exec "git status"
meta exec "git pull"
```

### Alternative: mu-repo

[mu-repo](https://fabioz.github.io/mu-repo/) is another multi-repo management tool.

```bash
pip install mu-repo

# Register repos
mu register --all

# Common operations
mu st      # Status of all
mu fetch   # Fetch all
mu pull    # Pull all
```

---

## Configuration Propagation Strategy

### mise.toml Inheritance Model

```text
AI/mise.toml (Root)
├── [tools]: go, node, python, golangci-lint (shared)
├── [settings]: experimental = true
├── [settings.task]: monorepo_depth, monorepo_exclude_dirs
└── [tasks]: all, test-all, tidy-all (cross-project)
         │
         │ (tools inherited automatically)
         ▼
    nah/mise.toml (Project)
    ├── [env]: PROJECT_NAME = "nah"
    └── [tasks]: test, lint, validate-ci (project-specific)
```

### Keeping Configurations in Sync

#### Option A: Manual Sync (Current)

- Each project has its own mise.toml
- Root mise.toml provides shared tools
- Updates require manual propagation

#### Option B: Symlinks (Alternative)

```bash
# Create symlink to shared config section
# (Not recommended - breaks when cloning individual repos)
```

#### Option C: Template Generation (Advanced)

```bash
# Create a template and generate project configs
# Useful for large numbers of projects
```

**Recommendation:** Use **Option A (Manual Sync)** for this project size. The mise.toml files are stable and rarely change.

### What Goes Where

| Configuration | Root mise.toml | Project mise.toml |
| --------------- | ---------------- | ------------------- |
| Go version | ✅ | (inherited) |
| Node version | ✅ | Override if needed |
| golangci-lint | ✅ | (inherited) |
| Project env vars | ❌ | ✅ |
| Project tasks | ❌ | ✅ |
| Cross-project tasks | ✅ | ❌ |

---

## Verification Checklist

### Pre-Implementation

- [ ] Understand which files belong to which repository
- [ ] Backup any uncommitted work
- [ ] Verify remote access to all repositories

### Post-Implementation

- [ ] Root `.gitignore` excludes all child repos
- [ ] Each project's mise.toml is committed to its repo
- [ ] Root mise.toml is committed to root repo
- [ ] `git status` in root shows clean (no child repos)
- [ ] `git status` in each child shows mise.toml committed
- [ ] `mise doctor` runs without errors
- [ ] `mise tasks` shows expected tasks
- [ ] `mise install` installs all tools (including gita)
- [ ] `mise gita-init` registers all child repos

### Testing Commands

```bash
# Verify root repo doesn't see child repos
cd /Users/jason/dev/AI
git status  # Should NOT show obot-entraid/, nah/, etc.

# Verify each child repo has mise.toml
cd nah && git status  # mise.toml should be committed
cd ../kinm && git status  # mise.toml should be committed
# ... repeat for each project

# Verify mise works
mise doctor
mise tasks
mise //nah:test  # Should find nah's tasks
```

---

## References

### Official Documentation

- [Git Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) - Git's official submodule documentation
- [Git Submodules Documentation](https://git-scm.com/docs/gitsubmodules) - Detailed submodule reference
- [mise Documentation](https://mise.jdx.dev) - mise tool manager documentation

### Multi-Repo Management

- [GitKraken - Multi-Repo Management](https://www.gitkraken.com/blog/multi-repo-management-hurdles-and-solutions) - Hurdles and solutions for multi-repo workflows
- [GitKraken Workspaces](https://www.gitkraken.com/features/workspaces) - GUI-based multi-repo management
- [gita on PyPI](https://pypi.org/project/gita/) - Command-line multi-repo management tool

### Architecture Guidance

- [Build with Matija - Nested Git Repositories](https://www.buildwithmatija.com/blog/git-submodules-nested-repositories-guide) - Guide on handling nested repos
- [GitKraken - Mono vs Multi Repo](https://www.gitkraken.com/blog/git-multi-repo-vs-git-mono-repo) - Comparison of approaches
- [Medium - Managing Multiple Git Repositories](https://medium.com/@himanshu_96818/managing-multiple-git-repositories-within-a-single-repository-best-practices-and-approaches-d39a5f0bbf89) - Best practices overview

### Related Project Documentation

- [mise Configuration Guide](./mise-configuration-guide.md) - Complete mise implementation for this workspace
- [Multi-Repo Workspace Management Guide](./multi-repo-management-guide.md) - General workspace practices and tooling

---

*Document Version: 1.1.0*
*Last Updated: January 2026*
*Based on industry research and current workspace analysis*
*gita integrated into mise.toml as managed tool*
