---
description: Initialize expert mode for AI/MCP multi-repo workspace by loading optimized project context
---

# Expert Mode - Workspace Initialization

Quick initialization for the AI/MCP multi-repo workspace with intelligent, on-demand context loading.

**Context Architecture:**

- `AGENTS.md` - Universal guidelines (commands, patterns, dos/don'ts) - cross-agent standard (25+ AI tools)
- `CLAUDE.md` - Claude-specific integration (Serena MCP, memories, Claude Code features)

Both files are automatically injected by Claude Code. Use `AGENTS.md` as primary reference for project work.

## Initialization Steps

### 1. Activate Serena Project

Activate the AI workspace Serena project for access to memories and symbolic tools:

```text
mcp__plugin_serena_serena__activate_project with project: "AI"
```

### 2. Check Current State (Use mise/gita)

**IMPORTANT:** Always use mise tasks and gita for multi-repo operations. Never use raw git commands for cross-repo work.

Check workspace status with gita:

```bash
mise run gita-status   # or: mise gs
```

For single project context:

```bash
pwd && git branch --show-current && git log --oneline -5
```

**Identify:**

- Current directory (which project?)
- Uncommitted changes across all repos (via gita-status)
- Current branch and recent work context

### 3. Identify Active Project

Based on working directory or user's task, determine which project(s) to focus on.

**Project Keyword Hints:**

| Keywords | Project | On-Demand Context |
| ---------- | --------- | ------------------- |
| oauth, proxy, jwt, pkce | `mcp-oauth-proxy` | `mcp-oauth-proxy/CLAUDE.md` |
| controller, k8s, reconcile, apply | `nah` | `nah/CLAUDE.md` |
| api server, postgresql, kinm | `kinm` | `kinm/CLAUDE.md` |
| mcp platform, svelte, frontend, entra | `obot-entraid` | `obot-entraid/CLAUDE.md` |
| tools, providers, gptscript, .gpt | `obot-tools` | `obot-tools/CLAUDE.md` + `gptscript_tool_format` memory |
| catalog, yaml, mcp configs | `mcp-catalog` | `mcp-catalog/CLAUDE.md` |
| random names, name generator | `namegenerator` | `namegenerator/CLAUDE.md` |

**If unclear:** Ask "Which project are you working on today?"

### 4. Ready State

Confirm readiness:

- Serena project activated
- Current directory and git state understood (via `mise gs`)
- Active project identified
- Ready to load project-specific context on-demand

**What would you like to work on?**

---

## Multi-Repo Management (mise + gita)

**CRITICAL:** This is a multi-repo workspace. Always use mise tasks for cross-repo operations.

### Quick Reference Commands

| Task | Command | Alias |
| ---- | ------- | ----- |
| **Check all repos status** | `mise run gita-status` | `mise gs` |
| **Fetch all repos** | `mise run gita-fetch` | `mise gf` |
| **Pull all repos** | `mise run gita-pull` | `mise gp` |
| **Push all repos** | `mise run gita-push` | - |

### Committing Changes (Conventional Commits)

**Always use mise commit tasks** - they enforce conventional commit format and add Co-Authored-By:

| Project | Command | Alias |
| ------- | ------- | ----- |
| obot-entraid | `mise run commit:obot-entraid -m "type(scope): msg"` | `mise ce` |
| obot-tools | `mise run commit:obot-tools -m "type(scope): msg"` | `mise ct` |
| nah | `mise run commit:nah -m "type(scope): msg"` | `mise cn` |
| kinm | `mise run commit:kinm -m "type(scope): msg"` | `mise ck` |
| mcp-oauth-proxy | `mise run commit:mcp-oauth-proxy -m "type(scope): msg"` | `mise cm` |
| mcp-catalog | `mise run commit:mcp-catalog -m "type(scope): msg"` | `mise cc` |
| namegenerator | `mise run commit:namegenerator -m "type(scope): msg"` | `mise cng` |

**Commit Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

### Pushing Changes

| Project | Command | Alias |
| ------- | ------- | ----- |
| obot-entraid | `mise run push:obot-entraid` | `mise pe` |
| obot-tools | `mise run push:obot-tools` | `mise pt` |
| nah | `mise run push:nah` | `mise pn` |
| kinm | `mise run push:kinm` | `mise pk` |
| mcp-oauth-proxy | `mise run push:mcp-oauth-proxy` | `mise pm` |
| mcp-catalog | `mise run push:mcp-catalog` | `mise pc` |
| namegenerator | `mise run push:namegenerator` | `mise png` |
| **All projects** | `mise run push-all` | - |

### Cross-Project Operations

```bash
mise run all           # Validate all projects
mise run test-all      # Test all projects
mise run tidy-all      # go mod tidy on all projects
mise run status        # Git status summary
mise run deps-check    # Check outdated dependencies
```

### Single Project Operations

```bash
mise //nah:test        # Test nah only
mise //kinm:build      # Build kinm only
mise :test             # Test current directory project
```

### Anti-Pattern: Raw Git Commands

**DO NOT use these for cross-repo work:**

```bash
# ❌ DON'T: Manual git across repos
cd nah && git add . && git commit -m "msg" && cd ..
cd kinm && git add . && git commit -m "msg" && cd ..

# ✅ DO: Use mise tasks
mise run commit:nah -m "type(scope): msg"
mise run commit:kinm -m "type(scope): msg"
mise run gita-push
```

---

## On-Demand Context Loading

**Core Principle:** Load context only when the task requires it. Reference `.claude/instructions/context-optimization-guide.md` for detailed strategies.

### Project-Specific Work

Load the project's `CLAUDE.md` when working on that project:

- `obot-entraid/CLAUDE.md` - Full-stack MCP platform, auth providers, SvelteKit
- `nah/CLAUDE.md` - K8s controller framework, Router/Backend/Apply architecture
- `kinm/CLAUDE.md` - K8s-like API server with PostgreSQL
- `mcp-oauth-proxy/CLAUDE.md` - OAuth 2.1 proxy, JWT handling, token flow
- `obot-tools/CLAUDE.md` - GPTScript tools, model/auth provider patterns
- `mcp-catalog/CLAUDE.md` - MCP server catalog structure
- `namegenerator/CLAUDE.md` - Random name generator library

**Quick alternative:** Load project `README.md` for basic overview.

### Serena Memories (Load When Needed)

| Memory | When to Load |
| -------- | -------------- |
| `codebase_architecture` | Deep architectural patterns, design decisions |
| `tech_stack_and_dependencies` | Working with dependencies, version updates |
| `task_completion_checklist` | Before completing any task (pre-commit validation) |
| `gptscript_tool_format` | Working on obot-tools .gpt files (CRITICAL for GPTScript) |
| `documentation_best_practices` | Creating formal documentation |

### Task-Specific Documentation

| Task Type | Load |
| ----------- | ------ |
| Architecture/Design | `documentation/docs/reference/architecture.md`, `codebase_architecture` memory |
| Documentation | `.claude/instructions/documentation-standards.md` |
| GPTScript Development | `.claude/instructions/gptscript-development-guide.md` |
| Troubleshooting | `TROUBLESHOOTING.md` |
| Pre-commit Validation | `task_completion_checklist` memory |

---

## Usage Patterns

### Quick Start (Minimal Context)

- Activate Serena, check git status
- Load only project `CLAUDE.md` or `README.md`
- Start working immediately

### Deep Work (Full Context)

- Activate Serena, check git status
- Load project `CLAUDE.md`
- Load task-specific memories/docs as needed
- Reference `codebase_architecture` for design decisions

### Multi-Project Work

- Activate Serena once
- Load each project's `CLAUDE.md` only when switching to that project
- Use `documentation/docs/reference/architecture.md` for understanding cross-project relationships

---

## Re-initialization

To switch projects or tasks:

1. State new project/task
2. Load new project `CLAUDE.md` if different
3. Load task-specific context as needed
4. Proceed with new work

---

## When Stuck

| Issue | Solution |
| ------- | ---------- |
| Which project? | Ask user directly |
| What context to load? | Start minimal, load more as needed |
| Pre-commit steps? | Load `task_completion_checklist` memory |
| Command reference? | Check `AGENTS.md` (universal commands, dos/don'ts) |
| Claude-specific help? | Check `CLAUDE.md` (Serena, memories, agents) |

---

**Then wait for the user's specific task.**
