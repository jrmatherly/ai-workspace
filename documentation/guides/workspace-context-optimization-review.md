# Workspace Context Optimization Review

> **Version**: 1.0.0 | **Created**: 2026-01-18 | **Status**: IN PROGRESS (Living Document)

Systematic review of documentation, Serena memories, and Claude Code configuration across all projects in the AI/MCP multi-repo workspace to optimize context window utilization and eliminate redundancy.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Strategic Documentation Architecture](#strategic-documentation-architecture)
3. [Standard Project Template](#standard-project-template)
4. [Project Analysis Matrix](#project-analysis-matrix)
5. [Per-Project Findings](#per-project-findings)
   - [kinm](#1-kinm) ✅ REVIEWED
   - [mcp-catalog](#2-mcp-catalog) ✅ REVIEWED
   - [mcp-oauth-proxy](#3-mcp-oauth-proxy) ✅ REVIEWED
   - [nah](#4-nah) ✅ REVIEWED
   - [namegenerator](#5-namegenerator) ✅ REVIEWED
   - [obot-entraid](#6-obot-entraid) ✅ REVIEWED
   - [obot-tools](#7-obot-tools) ⏳ PENDING
6. [Cross-Project Patterns](#cross-project-patterns)
7. [Action Items](#action-items)
8. [Implementation Log](#implementation-log)

---

## Executive Summary

### Purpose

This document tracks a systematic review of all 7 projects in the AI/MCP multi-repo workspace to:

1. **Identify documentation bloat** - AI-generated docs that duplicate simpler maintained files
2. **Identify redundant memories** - Project-level Serena memories that duplicate root workspace memories
3. **Ensure proper inheritance** - Projects inherit from root workspace, not duplicate
4. **Optimize context window** - Reduce token overhead for AI agent initialization

### Methodology

1. **Review each project systematically** - Analyze docs, memories, .claude/ config
2. **Document findings immediately** - Update this living document after each project review
3. **Identify files to archive** - Files are ARCHIVED (not deleted) to preserve history
4. **Execute after all reviews** - Archival happens only after all 7 projects are reviewed
5. **Archive location** - Each project gets a `project/.archive/optimization-2026-01-18/` directory

### Workspace Philosophy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WORKSPACE ROOT (Shared Foundation)                │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ AGENTS.md - Universal guidelines for ALL AI tools               ││
│  │ CLAUDE.md - Claude Code specific integration                    ││
│  │ .claude/  - Shared agents, commands, rules, skills, instructions││
│  │ .serena/memories/ - Workspace-wide context                      ││
│  │ README.md, QUICK_REFERENCE.md, TROUBLESHOOTING.md               ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              ▼                                       │
│              Projects INHERIT from root, not DUPLICATE               │
└─────────────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PROJECT A     │  │   PROJECT B     │  │   PROJECT C     │
│ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │
│ │ CLAUDE.md   │ │  │ │ CLAUDE.md   │ │  │ │ CLAUDE.md   │ │
│ │ (project-   │ │  │ │ (project-   │ │  │ │ (project-   │ │
│ │ specific)   │ │  │ │ specific)   │ │  │ │ specific)   │ │
│ ├─────────────┤ │  │ ├─────────────┤ │  │ ├─────────────┤ │
│ │ docs/       │ │  │ │ docs/       │ │  │ │ docs/       │ │
│ │ (detailed)  │ │  │ │ (detailed)  │ │  │ │ (detailed)  │ │
│ ├─────────────┤ │  │ ├─────────────┤ │  │ ├─────────────┤ │
│ │ .claude/    │ │  │ │ .claude/    │ │  │ │ .claude/    │ │
│ │ settings    │ │  │ │ settings    │ │  │ │ settings    │ │
│ │ .local.json │ │  │ │ .local.json │ │  │ │ .local.json │ │
│ │ ONLY        │ │  │ │ ONLY        │ │  │ │ ONLY        │ │
│ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Projects

All projects are forks from `github.com/obot-platform/*` to `github.com/jrmatherly/*`:

| Project | Purpose | Primary Language |
|---------|---------|------------------|
| kinm | K8s-like API server with PostgreSQL | Go |
| mcp-catalog | MCP server catalog | YAML/Markdown |
| mcp-oauth-proxy | OAuth 2.1 proxy for MCP | Go |
| nah | K8s controller framework | Go |
| namegenerator | Random name generator library | Go |
| obot-entraid | Full-stack MCP platform | Go + SvelteKit |
| obot-tools | Tools, model/auth providers | Go/Python/TS |

### Review Progress

| Project | Status | Est. Current Tokens | Est. Optimized | Savings |
|---------|--------|---------------------|----------------|---------|
| kinm | ✅ Reviewed | ~23,060 | ~5,870 | 75% |
| mcp-catalog | ✅ Reviewed | ~18,155 | ~7,255 | 60% |
| mcp-oauth-proxy | ✅ Reviewed | ~31,255 | ~11,955 | 62% |
| nah | ✅ Reviewed | ~51,115 | ~20,820 | 59% |
| namegenerator | ✅ Reviewed | ~37,120 | ~4,735 | 87% |
| obot-entraid | ✅ Reviewed | ~23,625 | ~16,795 | 29% |
| obot-tools | ✅ Reviewed | ~32,085 | ~13,535 | 58% |

---

## Strategic Documentation Architecture

### What Belongs at Root Level (Shared)

| Component | Purpose | Load Strategy |
|-----------|---------|---------------|
| `AGENTS.md` | Universal guidelines for all AI tools | Auto-injected |
| `CLAUDE.md` | Claude Code integration, Serena, memories | Auto-injected |
| `.claude/agents/` | Shared agents (go-reviewer, pre-commit, etc.) | Inherited |
| `.claude/rules/` | Path-specific rules (go-tests, kubernetes, etc.) | Auto-activated |
| `.claude/skills/` | Shared skills (validate-project, code-review) | On-demand |
| `.claude/instructions/` | Enhancement guides | On-demand |
| `.serena/memories/` | Workspace-wide context | On-demand |

### What Belongs at Project Level (Unique)

| Component | Purpose | Notes |
|-----------|---------|-------|
| `CLAUDE.md` | Project-specific commands, patterns, architecture | Required |
| `README.md` | Project overview | Minimal |
| `docs/` | Detailed technical docs (ARCHITECTURE.md, API.md) | If needed |
| `.claude/settings.local.json` | Project-specific permissions | Permissions only |
| `.serena/memories/` | ONLY truly unique project context | Minimal or none |

### Anti-Patterns to Eliminate

| Anti-Pattern | Description | Action |
|--------------|-------------|--------|
| `claudedocs/` directories | AI-generated comprehensive docs that duplicate simpler files | ARCHIVE |
| `PROJECT_INDEX.md` | Duplicate of content in CLAUDE.md | ARCHIVE or consolidate |
| Project-level memories that duplicate root | suggested_commands, task_completion, code_style | ARCHIVE |
| Bloated generated documentation | Large files with redundant content | ARCHIVE |
| Project-level .claude/ config | Agents, commands, rules (should inherit from root) | Inherit instead |

> **Note**: ARCHIVE means moving to `project/.archive/optimization-2026-01-18/` to preserve history while removing from active context.

---

## Standard Project Template

### Required Files

```
project/
├── CLAUDE.md              # Primary AI reference (REQUIRED)
│   ├── Project Overview   # Purpose, module path, Go version
│   ├── Essential Commands # build, test, lint, validate
│   ├── Architecture       # Key components, patterns
│   ├── Code Conventions   # Project-specific conventions
│   └── Workspace Integration # Reference to root resources
├── README.md              # User-facing overview (minimal)
├── docs/                  # Detailed technical docs (optional)
│   ├── ARCHITECTURE.md    # Deep architecture dive
│   └── API.md             # API reference
└── .claude/
    └── settings.local.json # Permissions ONLY (no agents/rules/commands)
```

### NOT Required (Inherit from Root)

```
# These should NOT exist at project level:
.claude/agents/           # Inherit from root
.claude/rules/            # Inherit from root
.claude/commands/         # Inherit from root
.claude/skills/           # Inherit from root
.serena/memories/         # Use root memories (exceptions rare)
claudedocs/               # ARCHIVE - bloated generated docs
PROJECT_INDEX.md          # ARCHIVE - consolidate into CLAUDE.md
PROJECT_INDEX.json        # ARCHIVE - machine-generated artifact
```

---

## Project Analysis Matrix

| Project | CLAUDE.md | claudedocs/ | PROJECT_INDEX.md | .serena/memories | .claude/ config | Bloat Level |
|---------|-----------|-------------|------------------|------------------|-----------------|-------------|
| kinm | ✅ 280 lines | ❌ 2990 lines (BLOAT) | ❌ 194 lines (redundant) | ⚠️ 6 files (4 redundant) | ✅ settings.local only | HIGH |
| mcp-catalog | ✅ 246 lines | ✅ None | ❌ 482 lines (redundant) | ⚠️ 8 files (7 redundant) | ✅ settings.local only | MODERATE |
| mcp-oauth-proxy | ✅ 237 lines | ✅ None | ❌ 813 lines (redundant) | ⚠️ 6 files (6 redundant) | ✅ settings.local only | MODERATE-HIGH |
| nah | ✅ 388 lines | ❌ 3057 lines (local_docs/claudedocs) | ❌ 405 lines (redundant) | ⚠️ 9 files (8 redundant) | ✅ settings.local only | HIGH |
| namegenerator | ✅ 266 lines | ❌ 5819 lines (docs/ bloat) | ❌ 601 lines (redundant) | ⚠️ 5 files (5 redundant) | ✅ settings.local only | EXTREME |
| obot-entraid | ✅ 161 lines | ⚠️ 8231 lines (self-archived) | ❌ 565 lines (redundant) | ⚠️ 6 files (3 redundant) | ✅ project-specific | LOW |
| obot-tools | ✅ 402 lines (excellent) | ⚠️ docs/ai-context/ (328 lines) | ❌ 616 lines (redundant) | ⚠️ 6 files (all redundant) | ✅ settings.local only | MODERATE |

---

## Per-Project Findings

### 1. kinm

> **Status**: ✅ REVIEWED | **Date**: 2026-01-18 | **Bloat Level**: HIGH

#### Current State Inventory

| Component | Lines | Est. Tokens | Status |
|-----------|-------|-------------|--------|
| `CLAUDE.md` | 280 | ~1,400 | ✅ Keep - Primary reference |
| `PROJECT_INDEX.md` | 194 | ~970 | ❌ Redundant - ARCHIVE |
| `PROJECT_INDEX.json` | - | ~500 | ❌ Generated artifact - ARCHIVE |
| `README.md` | 18 | ~90 | ✅ Keep - Minimal |
| `docs/ARCHITECTURE.md` | 328 | ~1,640 | ✅ Keep - Clean architecture |
| `docs/API.md` | 353 | ~1,765 | ✅ Keep - Clean API ref |
| `claudedocs/kinm-codebase-index.md` | 1,118 | ~5,600 | ❌ BLOAT - ARCHIVE |
| `claudedocs/kinm-api-reference.md` | 999 | ~5,000 | ❌ BLOAT - ARCHIVE |
| `claudedocs/kinm-architecture-flows.md` | 875 | ~4,400 | ❌ BLOAT - ARCHIVE |
| `.serena/memories/suggested_commands.md` | 82 | ~410 | ❌ Redundant - ARCHIVE |
| `.serena/memories/task_completion.md` | 46 | ~230 | ❌ Redundant - ARCHIVE |
| `.serena/memories/code_style.md` | 44 | ~220 | ❌ Redundant - ARCHIVE |
| `.serena/memories/cleanup_history.md` | 72 | ~360 | ❌ Ephemeral log - ARCHIVE |
| `.serena/memories/codebase_structure.md` | 48 | ~240 | ✅ Keep - Compact |
| `.serena/memories/project_overview.md` | 38 | ~190 | ✅ Keep - Compact |
| `.claude/settings.local.json` | 109 | ~545 | ✅ Keep - Permissions |
| **TOTAL** | **~4,604** | **~23,060** | |

#### Recommendations

##### ARCHIVE (High Priority)

> Archive destination: `kinm/.archive/optimization-2026-01-18/`

1. **`kinm/claudedocs/`** (entire directory - 3 files, ~2,990 lines, ~15,000 tokens)
   - AI-generated comprehensive docs that duplicate simpler maintained files
   - `docs/ARCHITECTURE.md` and `docs/API.md` are cleaner and maintainable

2. **`kinm/PROJECT_INDEX.md`** (~194 lines, ~970 tokens)
   - Duplicates content in `CLAUDE.md`: module path, structure, packages, schema

3. **`kinm/PROJECT_INDEX.json`** (~500 tokens)
   - Machine-generated artifact, not needed

4. **`kinm/.serena/memories/`** (4 files to archive, ~1,220 tokens)
   - `suggested_commands.md` - Root memory covers kinm commands
   - `task_completion.md` - Root `task_completion_checklist.md` is comprehensive
   - `code_style.md` - Covered by root + CLAUDE.md
   - `cleanup_history.md` - Ephemeral log from Jan 15, not useful

##### KEEP

1. **`CLAUDE.md`** (280 lines) - Primary project reference
2. **`README.md`** (18 lines) - Minimal project overview
3. **`docs/ARCHITECTURE.md`** (328 lines) - Clean, maintained architecture doc
4. **`docs/API.md`** (353 lines) - Clean, maintained API reference
5. **`.claude/settings.local.json`** (109 lines) - Project permissions
6. **`.serena/memories/codebase_structure.md`** (48 lines) - Compact directory layout
7. **`.serena/memories/project_overview.md`** (38 lines) - Compact project summary

#### Token Impact

| State | Files | Lines | Est. Tokens |
|-------|-------|-------|-------------|
| Before | 16 | ~4,604 | ~23,060 |
| After | 8 | ~1,174 | ~5,870 |
| **Savings** | -8 | -3,430 | **-17,190 (75%)** |

#### Alignment with Root Patterns

| Pattern | Root | kinm Current | kinm Recommended |
|---------|------|--------------|------------------|
| Primary reference | `CLAUDE.md` | ✅ Has it | ✅ Keep |
| Detailed docs | `docs/` | ✅ Has it | ✅ Keep |
| AI-generated bloat | None | ❌ `claudedocs/` | ❌ Archive |
| Project index | None | ❌ `PROJECT_INDEX.*` | ❌ Archive |
| Serena memories | Workspace-level | ⚠️ 6 files (4 redundant) | Keep 2, archive 4 |
| .claude/ config | Inherit | ✅ Only permissions | ✅ Correct |

---

### 2. mcp-catalog

> **Status**: ✅ REVIEWED | **Date**: 2026-01-18 | **Bloat Level**: MODERATE

#### Current State Inventory

| Component | Lines | Est. Tokens | Status |
|-----------|-------|-------------|--------|
| `CLAUDE.md` | 246 | ~1,230 | ✅ Keep - Primary reference, well-structured |
| `PROJECT_INDEX.md` | 482 | ~2,410 | ❌ Redundant - ARCHIVE |
| `docs/API_REFERENCE.md` | 787 | ~3,935 | ✅ Keep - Unique API content |
| `docs/PROJECT_OVERVIEW.md` | 471 | ~2,355 | ⚠️ Evaluate - May overlap with CLAUDE.md |
| `docs/INDEX.md` | 291 | ~1,455 | ❌ Navigation overhead - ARCHIVE |
| `.claude/settings.local.json` | 112 | ~560 | ✅ Keep - Permissions only |
| `.serena/memories/suggested_commands.md` | 158 | ~790 | ❌ Redundant with root - ARCHIVE |
| `.serena/memories/task_completion_checklist.md` | 163 | ~815 | ❌ Redundant with root - ARCHIVE |
| `.serena/memories/code_style_and_conventions.md` | 162 | ~810 | ❌ Redundant with root - ARCHIVE |
| `.serena/memories/project_overview.md` | 63 | ~315 | ❌ Overlaps with CLAUDE.md - ARCHIVE |
| `.serena/memories/mcp_catalog_schema.md` | 306 | ~1,530 | ✅ Keep - UNIQUE YAML schema reference |
| `.serena/memories/cicd_workflows.md` | 193 | ~965 | ❌ Redundant with root - ARCHIVE |
| `.serena/memories/documentation_index.md` | 142 | ~710 | ❌ Navigation overhead - ARCHIVE |
| `.serena/memories/project_index_location.md` | 55 | ~275 | ❌ Just pointer to PROJECT_INDEX - ARCHIVE |
| **TOTAL** | **~3,631** | **~18,155** | |

#### Observations

**Positive Patterns:**

- **No `claudedocs/` directory** - This project doesn't have the AI-generated bloat pattern seen in kinm
- **Well-structured CLAUDE.md** - Includes workspace integration section referencing root resources
- **Correct `.claude/` usage** - Only `settings.local.json` present (permissions only)

**Areas for Optimization:**

- **Heavy Serena memory usage** - 8 memories totaling ~6,210 tokens, but 7 are redundant with root
- **PROJECT_INDEX.md bloat** - 482 lines duplicating CLAUDE.md content
- **Navigation overhead** - `docs/INDEX.md` and `documentation_index.md` memory are just navigation

**Unique Content to Preserve:**

- `mcp_catalog_schema.md` (306 lines) - YAML schema reference specific to MCP catalog format
- `docs/API_REFERENCE.md` (787 lines) - Detailed API documentation

#### Recommendations

##### ARCHIVE (High Priority)

> Archive destination: `mcp-catalog/.archive/optimization-2026-01-18/`

1. **`mcp-catalog/PROJECT_INDEX.md`** (~482 lines, ~2,410 tokens)
   - Content duplicates CLAUDE.md: project structure, tech stack, commands

2. **`mcp-catalog/docs/INDEX.md`** (~291 lines, ~1,455 tokens)
   - Navigation file, value is low with optimized documentation structure

3. **`mcp-catalog/.serena/memories/`** (7 files to archive, ~4,680 tokens)
   - `suggested_commands.md` - Root memory (~542 lines) covers this
   - `task_completion_checklist.md` - Root memory (~398 lines) is comprehensive
   - `code_style_and_conventions.md` - Root memory covers TypeScript/Python/YAML
   - `project_overview.md` - Compact but CLAUDE.md covers this
   - `cicd_workflows.md` - Root has CI/CD patterns
   - `documentation_index.md` - Navigation overhead
   - `project_index_location.md` - Just a pointer file

##### EVALUATE

1. **`docs/PROJECT_OVERVIEW.md`** (~471 lines, ~2,355 tokens)
   - May have significant overlap with CLAUDE.md
   - Consider archiving if content is adequately covered in CLAUDE.md

##### KEEP

1. **`CLAUDE.md`** (246 lines) - Primary project reference
2. **`docs/API_REFERENCE.md`** (787 lines) - Unique API documentation
3. **`.claude/settings.local.json`** (112 lines) - Project permissions
4. **`.serena/memories/mcp_catalog_schema.md`** (306 lines) - UNIQUE MCP catalog YAML schema

#### Token Impact

| State | Files | Lines | Est. Tokens |
|-------|-------|-------|-------------|
| Before | 14 | ~3,631 | ~18,155 |
| After (conservative) | 5 | ~1,451 | ~7,255 |
| **Savings** | -9 | -2,180 | **-10,900 (60%)** |

*Note: Conservative estimate keeps `docs/PROJECT_OVERVIEW.md`. Additional savings possible if archived.*

#### Alignment with Root Patterns

| Pattern | Root | mcp-catalog Current | mcp-catalog Recommended |
|---------|------|---------------------|-------------------------|
| Primary reference | `CLAUDE.md` | ✅ Has it | ✅ Keep |
| AI-generated bloat | None | ✅ None | ✅ Correct |
| Project index | None | ❌ `PROJECT_INDEX.md` | ❌ Archive |
| Detailed docs | `docs/` | ✅ Has it | ✅ Keep API_REFERENCE |
| Serena memories | Workspace-level | ⚠️ 8 files (7 redundant) | Keep 1, archive 7 |
| .claude/ config | Inherit | ✅ Only permissions | ✅ Correct |

---

### 3. mcp-oauth-proxy

> **Status**: ✅ REVIEWED | **Date**: 2026-01-18 | **Bloat Level**: MODERATE-HIGH

#### Current State Inventory

| Component | Lines | Est. Tokens | Status |
|-----------|-------|-------------|--------|
| `CLAUDE.md` | 237 | ~1,185 | ✅ Keep - Primary reference, well-structured |
| `PROJECT_INDEX.md` | 813 | ~4,065 | ❌ Redundant with CLAUDE.md - ARCHIVE |
| `PROJECT_INDEX.json` | ~100 | ~500 | ❌ Machine artifact - ARCHIVE |
| `DOCUMENTATION_SUMMARY.md` | 482 | ~2,410 | ❌ Meta-document describing docs/ - ARCHIVE |
| `TESTING.md` | 477 | ~2,385 | ⚠️ Evaluate - May have unique testing patterns |
| `README.md` | 171 | ~855 | ✅ Keep - User-facing overview |
| `docs/ARCHITECTURE.md` | 625 | ~3,125 | ✅ Keep - Unique OAuth security architecture |
| `docs/API_REFERENCE.md` | 498 | ~2,490 | ✅ Keep - Unique OAuth 2.1 endpoint docs |
| `docs/DATABASE_SCHEMA.md` | 638 | ~3,190 | ✅ Keep - UNIQUE database schema documentation |
| `docs/DEVELOPMENT.md` | 838 | ~4,190 | ⚠️ Evaluate - May overlap with CLAUDE.md |
| `docs/INDEX.md` | 440 | ~2,200 | ❌ Navigation overhead - ARCHIVE |
| `docs/README.md` | 41 | ~205 | ❌ Minimal, covered by INDEX - ARCHIVE |
| `.serena/memories/code_style_conventions.md` | 91 | ~455 | ❌ Redundant with root - ARCHIVE |
| `.serena/memories/codebase_structure.md` | 206 | ~1,030 | ❌ Covered by CLAUDE.md - ARCHIVE |
| `.serena/memories/project_overview.md` | 40 | ~200 | ❌ Covered by CLAUDE.md - ARCHIVE |
| `.serena/memories/suggested_commands.md` | 222 | ~1,110 | ❌ Redundant with root + CLAUDE.md - ARCHIVE |
| `.serena/memories/task_completion_checklist.md` | 169 | ~845 | ❌ Redundant with root - ARCHIVE |
| `.serena/memories/tech_stack.md` | 41 | ~205 | ❌ Covered by CLAUDE.md - ARCHIVE |
| `.claude/settings.local.json` | 111 | ~1,110 | ✅ Keep - Permissions only |
| **TOTAL** | **~6,240** | **~31,255** | |

#### Observations

**Positive Patterns:**

- **No `claudedocs/` directory** - No AI-generated bloat
- **Well-structured CLAUDE.md** - Comprehensive with OAuth flow details
- **Correct `.claude/` usage** - Only `settings.local.json` present
- **Security-focused docs/ directory** - ARCHITECTURE.md, API_REFERENCE.md, DATABASE_SCHEMA.md are valuable

**Areas for Optimization:**

- **DOCUMENTATION_SUMMARY.md** - Meta-document that just describes the docs/ content (pure overhead)
- **PROJECT_INDEX.md** - 813 lines duplicating CLAUDE.md structure
- **All 6 Serena memories redundant** - Every memory duplicates root or CLAUDE.md content
- **docs/INDEX.md** - Navigation file, low value

**Unique Content to Preserve (Security-Critical Project):**

- `docs/ARCHITECTURE.md` (625 lines) - OAuth 2.1 security architecture
- `docs/API_REFERENCE.md` (498 lines) - OAuth endpoint specifications
- `docs/DATABASE_SCHEMA.md` (638 lines) - Token storage, grants, encrypted fields

#### Recommendations

##### ARCHIVE (High Priority)

> Archive destination: `mcp-oauth-proxy/.archive/optimization-2026-01-18/`

1. **`mcp-oauth-proxy/PROJECT_INDEX.md`** (~813 lines, ~4,065 tokens)
   - Duplicates CLAUDE.md content: project structure, tech stack, commands

2. **`mcp-oauth-proxy/PROJECT_INDEX.json`** (~500 tokens)
   - Machine-generated artifact, not needed

3. **`mcp-oauth-proxy/DOCUMENTATION_SUMMARY.md`** (~482 lines, ~2,410 tokens)
   - Meta-document that just lists what's in docs/ (pure overhead)

4. **`mcp-oauth-proxy/docs/INDEX.md`** (~440 lines, ~2,200 tokens)
   - Navigation file, value is minimal with optimized structure

5. **`mcp-oauth-proxy/docs/README.md`** (~41 lines, ~205 tokens)
   - Minimal content covered by INDEX

6. **`mcp-oauth-proxy/.serena/memories/`** (all 6 files, ~3,845 tokens)
   - `code_style_conventions.md` - Root memory covers Go conventions
   - `codebase_structure.md` - CLAUDE.md has architecture section
   - `project_overview.md` - CLAUDE.md covers this
   - `suggested_commands.md` - CLAUDE.md has complete command reference
   - `task_completion_checklist.md` - Root memory is comprehensive
   - `tech_stack.md` - CLAUDE.md lists tech stack

##### EVALUATE

1. **`TESTING.md`** (~477 lines, ~2,385 tokens)
   - May contain unique testing patterns for OAuth flows
   - Consider archiving if adequately covered in CLAUDE.md

2. **`docs/DEVELOPMENT.md`** (~838 lines, ~4,190 tokens)
   - Development guide may overlap with CLAUDE.md
   - Consider archiving if content is redundant

##### KEEP

1. **`CLAUDE.md`** (237 lines) - Primary project reference
2. **`README.md`** (171 lines) - User-facing overview
3. **`docs/ARCHITECTURE.md`** (625 lines) - OAuth 2.1 security architecture
4. **`docs/API_REFERENCE.md`** (498 lines) - OAuth endpoint documentation
5. **`docs/DATABASE_SCHEMA.md`** (638 lines) - Token/grant schema (security-critical)
6. **`.claude/settings.local.json`** (111 lines) - Project permissions

#### Token Impact

| State | Files | Lines | Est. Tokens |
|-------|-------|-------|-------------|
| Before | 19 | ~6,240 | ~31,255 |
| After (conservative) | 7 | ~2,391 | ~11,955 |
| **Savings** | -12 | -3,849 | **-19,300 (62%)** |

*Note: Conservative estimate keeps TESTING.md and DEVELOPMENT.md in evaluation. Additional 6,575 tokens possible if archived.*

#### Alignment with Root Patterns

| Pattern | Root | mcp-oauth-proxy Current | mcp-oauth-proxy Recommended |
|---------|------|-------------------------|------------------------------|
| Primary reference | `CLAUDE.md` | ✅ Has it | ✅ Keep |
| AI-generated bloat | None | ✅ None | ✅ Correct |
| Project index | None | ❌ `PROJECT_INDEX.*` | ❌ Archive |
| Meta-documentation | None | ❌ `DOCUMENTATION_SUMMARY.md` | ❌ Archive |
| Detailed docs | `docs/` | ✅ Has it (valuable) | ✅ Keep key docs |
| Serena memories | Workspace-level | ⚠️ 6 files (all redundant) | Archive all 6 |
| .claude/ config | Inherit | ✅ Only permissions | ✅ Correct |

---

### 4. nah

> **Status**: ✅ REVIEWED | **Date**: 2026-01-18 | **Bloat Level**: HIGH

#### Current State Inventory

| Component | Lines | Est. Tokens | Status |
|-----------|-------|-------------|--------|
| `CLAUDE.md` | 388 | ~1,940 | ✅ Keep - Comprehensive framework reference |
| `PROJECT_INDEX.md` | 405 | ~2,025 | ❌ Redundant with CLAUDE.md - ARCHIVE |
| `PROJECT_INDEX.json` | ~100 | ~500 | ❌ Machine artifact - ARCHIVE |
| `README.md` | 370 | ~1,850 | ✅ Keep - User-facing overview |
| `docs/README.md` | 279 | ~1,395 | ✅ Keep - Documentation index |
| `docs/architecture/overview.md` | 522 | ~2,610 | ✅ Keep - Framework architecture |
| `docs/packages/backend.md` | 548 | ~2,740 | ✅ Keep - Package documentation |
| `docs/packages/router.md` | 714 | ~3,570 | ✅ Keep - Core router docs |
| `docs/packages/apply.md` | 762 | ~3,810 | ✅ Keep - Apply pattern docs |
| `local_docs/claudedocs/` (4 files) | 3,057 | ~15,285 | ❌ BLOAT - AI-generated plans/reports - ARCHIVE |
| `.serena/memories/code_style_and_conventions.md` | 134 | ~670 | ❌ Redundant with root - ARCHIVE |
| `.serena/memories/codebase_architecture.md` | 235 | ~1,175 | ❌ Covered by docs/ - ARCHIVE |
| `.serena/memories/debugging_workflows.md` | 768 | ~3,840 | ⚠️ Evaluate - May have unique K8s debugging value |
| `.serena/memories/design_patterns_and_guidelines.md` | 310 | ~1,550 | ❌ Covered by CLAUDE.md/docs - ARCHIVE |
| `.serena/memories/downstream_consumers.md` | 369 | ~1,845 | ✅ Keep - UNIQUE dependency documentation |
| `.serena/memories/project_overview.md` | 48 | ~240 | ❌ Covered by CLAUDE.md - ARCHIVE |
| `.serena/memories/suggested_commands.md` | 140 | ~700 | ❌ Redundant with root + CLAUDE.md - ARCHIVE |
| `.serena/memories/task_completion_workflow.md` | 137 | ~685 | ❌ Redundant with root - ARCHIVE |
| `.serena/memories/testing_strategy.md` | 725 | ~3,625 | ⚠️ Evaluate - May have unique K8s testing value |
| `.claude/settings.local.json` | 106 | ~1,060 | ✅ Keep - Permissions only |
| **TOTAL** | **~10,227** | **~51,115** | |

#### Observations

**Positive Patterns:**

- **Excellent CLAUDE.md** (388 lines) - Comprehensive framework documentation with architecture, patterns, code examples
- **Well-organized docs/ directory** - Package-level documentation for router, apply, backend
- **Correct `.claude/` usage** - Only `settings.local.json` present
- **Unique downstream_consumers.md** - Documents kinm/obot-entraid dependencies on nah

**Areas for Optimization:**

- **`local_docs/claudedocs/`** (3,057 lines) - AI-generated implementation plans and validation reports (pure bloat)
- **PROJECT_INDEX.md** - 405 lines duplicating CLAUDE.md
- **8 of 9 Serena memories redundant** - Heavy duplication with root and docs/
- **Two large memories may have value** - `debugging_workflows.md` and `testing_strategy.md` are substantial

**Unique Content to Preserve:**

- `downstream_consumers.md` (369 lines) - Documents how kinm and obot-entraid depend on nah framework (breaking change implications)
- `docs/packages/` (2,024 lines) - Detailed API documentation for core packages

#### Recommendations

##### ARCHIVE (High Priority)

> Archive destination: `nah/.archive/optimization-2026-01-18/`

1. **`nah/PROJECT_INDEX.md`** (~405 lines, ~2,025 tokens)
   - Duplicates CLAUDE.md content

2. **`nah/PROJECT_INDEX.json`** (~500 tokens)
   - Machine-generated artifact

3. **`nah/local_docs/claudedocs/`** (entire directory - 4 files, ~3,057 lines, ~15,285 tokens)
   - `nah-fork-k8s-upgrade-implementation-plan.md` (1,587 lines) - AI implementation plan
   - `nah-implementation-validation-report.md` (803 lines) - AI validation report
   - `validation-report.md` (540 lines) - Another validation report
   - `README.md` (127 lines) - Index to above
   - Note: `local_docs/archive/` already exists and can remain

4. **`nah/.serena/memories/`** (7 files to archive, ~8,860 tokens)
   - `code_style_and_conventions.md` - Root memory covers Go conventions
   - `codebase_architecture.md` - Covered by docs/architecture/
   - `design_patterns_and_guidelines.md` - Covered by CLAUDE.md patterns section
   - `project_overview.md` - CLAUDE.md covers this
   - `suggested_commands.md` - CLAUDE.md has complete command reference
   - `task_completion_workflow.md` - Root memory covers this
   - Note: `debugging_workflows.md` and `testing_strategy.md` in EVALUATE

##### EVALUATE

1. **`debugging_workflows.md`** (~768 lines, ~3,840 tokens)
   - May have unique K8s controller debugging patterns
   - Consider keeping if content not in CLAUDE.md or docs/

2. **`testing_strategy.md`** (~725 lines, ~3,625 tokens)
   - May have unique K8s controller testing patterns
   - Consider keeping if content not in CLAUDE.md or docs/

##### KEEP

1. **`CLAUDE.md`** (388 lines) - Comprehensive framework reference
2. **`README.md`** (370 lines) - User-facing overview
3. **`docs/`** directory (2,825 lines) - Valuable package documentation
4. **`.serena/memories/downstream_consumers.md`** (369 lines) - UNIQUE dependency docs
5. **`.claude/settings.local.json`** (106 lines) - Project permissions

#### Token Impact

| State | Files | Lines | Est. Tokens |
|-------|-------|-------|-------------|
| Before | 22 | ~10,227 | ~51,115 |
| After (conservative) | 10 | ~4,164 | ~20,820 |
| **Savings** | -12 | -6,063 | **-30,295 (59%)** |

*Note: Conservative estimate keeps debugging/testing memories in evaluation. Additional 7,465 tokens possible if archived.*

#### Alignment with Root Patterns

| Pattern | Root | nah Current | nah Recommended |
|---------|------|-------------|-----------------|
| Primary reference | `CLAUDE.md` | ✅ Has it (excellent) | ✅ Keep |
| AI-generated bloat | None | ❌ `local_docs/claudedocs/` | ❌ Archive |
| Project index | None | ❌ `PROJECT_INDEX.*` | ❌ Archive |
| Package docs | `docs/` | ✅ Has it (valuable) | ✅ Keep |
| Serena memories | Workspace-level | ⚠️ 9 files (8 redundant) | Keep 1-3, archive rest |
| .claude/ config | Inherit | ✅ Only permissions | ✅ Correct |

---

### 5. namegenerator

> **Status**: ✅ REVIEWED | **Date**: 2026-01-18 | **Bloat Level**: EXTREME

#### Current State Inventory

| Component | Lines | Est. Tokens | Status |
|-----------|-------|-------------|--------|
| `CLAUDE.md` | 266 | ~1,330 | ✅ Keep - Appropriate for library size |
| `PROJECT_INDEX.md` | 601 | ~3,005 | ❌ Massive redundancy - ARCHIVE |
| `PROJECT_INDEX.json` | ~100 | ~500 | ❌ Machine artifact - ARCHIVE |
| `README.md` | 46 | ~230 | ✅ Keep - Appropriately minimal |
| `docs/API.md` | 409 | ~2,045 | ✅ Keep - Basic API reference |
| `docs/ARCHITECTURE.md` | 753 | ~3,765 | ❌ Overkill for 135-line lib - ARCHIVE |
| `docs/CODE_EXAMPLES.md` | 869 | ~4,345 | ❌ Overkill - ARCHIVE |
| `docs/COVERAGE_REPORT.md` | 516 | ~2,580 | ❌ Generated report - ARCHIVE |
| `docs/DIAGRAMS.md` | 589 | ~2,945 | ❌ Overkill - ARCHIVE |
| `docs/DOCUMENTATION_SITE.md` | 570 | ~2,850 | ❌ Site config, not docs - ARCHIVE |
| `docs/INDEX.md` | 314 | ~1,570 | ❌ Navigation - ARCHIVE |
| `docs/USAGE_PATTERNS.md` | 1,009 | ~5,045 | ❌ 7x the actual code - ARCHIVE |
| `docs/USER_GUIDE.md` | 790 | ~3,950 | ❌ 6x the actual code - ARCHIVE |
| `.serena/memories/code_style_and_conventions.md` | 56 | ~280 | ❌ Redundant with root - ARCHIVE |
| `.serena/memories/project_purpose_and_structure.md` | 53 | ~265 | ❌ Covered by CLAUDE.md - ARCHIVE |
| `.serena/memories/suggested_commands.md` | 117 | ~585 | ❌ Redundant with root - ARCHIVE |
| `.serena/memories/task_completion_checklist.md` | 102 | ~510 | ❌ Redundant with root - ARCHIVE |
| `.serena/memories/tech_stack_and_dependencies.md` | 38 | ~190 | ❌ Covered by CLAUDE.md - ARCHIVE |
| `.claude/settings.local.json` | 113 | ~1,130 | ✅ Keep - Permissions only |
| **TOTAL** | **~7,311** | **~37,120** | |

#### Observations

**Critical Issue: Extreme Over-Documentation**

This is a **135-line Go library** with **zero external dependencies** that generates random names in `adjective-noun` format. Yet it has:

- 5,819 lines of docs/ content (43:1 documentation-to-code ratio!)
- 601 lines of PROJECT_INDEX.md
- 366 lines of Serena memories

**Context:**

- The library is 3 files: `generator.go`, `data.go`, `generator_test.go`
- Zero complexity - just reads from word lists and combines them
- The CLAUDE.md (266 lines) is already comprehensive for this scope

**Positive Patterns:**

- **CLAUDE.md is well-scoped** - Appropriate detail for library complexity
- **README.md is minimal** - Correct for a simple library
- **No separate claudedocs/** - But docs/ IS the bloat here
- **Correct `.claude/` usage** - Only settings.local.json

**Root Cause:**
AI-generated documentation that was scaled for complex projects but applied to a trivial library.

#### Recommendations

##### ARCHIVE (High Priority)

> Archive destination: `namegenerator/.archive/optimization-2026-01-18/`

1. **`namegenerator/PROJECT_INDEX.md`** (~601 lines, ~3,005 tokens)
   - Redundant with CLAUDE.md

2. **`namegenerator/PROJECT_INDEX.json`** (~500 tokens)
   - Machine-generated artifact

3. **`namegenerator/docs/`** (8 of 9 files, ~5,410 lines, ~27,050 tokens)
   - `ARCHITECTURE.md` - A 135-line library doesn't need architecture docs
   - `CODE_EXAMPLES.md` - CLAUDE.md has usage examples
   - `COVERAGE_REPORT.md` - Generated, ephemeral
   - `DIAGRAMS.md` - Overkill for simple library
   - `DOCUMENTATION_SITE.md` - Site config, not documentation
   - `INDEX.md` - Navigation overhead
   - `USAGE_PATTERNS.md` - 1,009 lines for 135 lines of code
   - `USER_GUIDE.md` - CLAUDE.md serves this purpose

4. **`namegenerator/.serena/memories/`** (all 5 files, ~1,830 tokens)
   - All redundant with root or CLAUDE.md

##### KEEP

1. **`CLAUDE.md`** (266 lines) - Primary reference, appropriately scoped
2. **`README.md`** (46 lines) - Minimal user-facing overview
3. **`docs/API.md`** (409 lines) - Basic API reference (optional - could also archive)
4. **`.claude/settings.local.json`** (113 lines) - Project permissions

#### Token Impact

| State | Files | Lines | Est. Tokens |
|-------|-------|-------|-------------|
| Before | 18 | ~7,311 | ~37,120 |
| After | 4 | ~834 | ~4,735 |
| **Savings** | -14 | -6,477 | **-32,385 (87%)** |

*Highest savings ratio of all projects - extreme over-documentation for library scope.*

#### Alignment with Root Patterns

| Pattern | Root | namegenerator Current | namegenerator Recommended |
|---------|------|----------------------|---------------------------|
| Primary reference | `CLAUDE.md` | ✅ Has it (well-scoped) | ✅ Keep |
| AI-generated bloat | None | ❌ docs/ is bloat here | ❌ Archive most of docs/ |
| Project index | None | ❌ `PROJECT_INDEX.*` | ❌ Archive |
| Proportional docs | Scale to complexity | ❌ 43:1 ratio | ❌ Archive excess |
| Serena memories | Workspace-level | ⚠️ 5 files (all redundant) | Archive all 5 |
| .claude/ config | Inherit | ✅ Only permissions | ✅ Correct |

---

### 6. obot-entraid

> **Status**: ✅ REVIEWED | **Date**: 2026-01-18 | **Bloat Level**: LOW

#### Current State Inventory

| Component | Lines | Est. Tokens | Status |
|-----------|-------|-------------|--------|
| `CLAUDE.md` | 161 | ~805 | ✅ Keep - Compact, references root resources |
| `PROJECT_INDEX.md` | 565 | ~2,825 | ❌ Redundant with CLAUDE.md - ARCHIVE |
| `PROJECT_INDEX.json` | ~100 | ~500 | ❌ Machine artifact - ARCHIVE |
| `DEVELOPMENT.md` | 94 | ~470 | ✅ Keep - User-facing dev guide |
| `claudedocs/` | 8,231 | N/A | ⚠️ Already self-archived in `claudedocs/archive/` |
| `claudedocs/README.md` | 66 | ~330 | ❌ Points to archived content - ARCHIVE |
| `C4-Documentation/` | 3,320 | ~16,600 | ⚠️ Evaluate - C4 architecture diagrams |
| `.serena/memories/app_preferences_branding.md` | 100 | ~500 | ✅ Keep - UNIQUE branding config |
| `.serena/memories/auth_fix_jan2026.md` | 139 | ~695 | ❌ Ephemeral bug fix log - ARCHIVE |
| `.serena/memories/development_guide.md` | 261 | ~1,305 | ⚠️ Evaluate - May overlap CLAUDE.md |
| `.serena/memories/gptscript_credential_store.md` | 133 | ~665 | ✅ Keep - UNIQUE credential config |
| `.serena/memories/project_architecture.md` | 152 | ~760 | ❌ Covered by CLAUDE.md - ARCHIVE |
| `.serena/memories/task_completion_checklist.md` | 102 | ~510 | ❌ Redundant with root - ARCHIVE |
| `.claude/` (project-specific) | 2,298 | ~11,490 | ✅ Keep - LEGITIMATE project customization |
| `.claude/settings.json` | 65 | ~650 | ✅ Keep - Project hooks config |
| `.claude/settings.local.json` | 110 | ~1,100 | ✅ Keep - Permissions |
| **TOTAL (AI context)** | **~16,897** | **~23,625** | |

*Note: docs/ (323K lines) excluded - Docusaurus user documentation site, not AI context*

#### Observations

**Unique Characteristics:**

This is the largest and most complex project (full-stack MCP platform with 40+ controllers). It has LEGITIMATE project-specific customization:

1. **Project-specific `.claude/` content** (~2,298 lines):
   - `agents/auth-provider-dev` - Auth provider development specialist
   - `agents/upstream-merge` - Upstream merge from obot-platform/obot
   - `rules/auth-provider-go` - Entra ID auth provider patterns
   - `rules/nah-controllers` - Extends root kubernetes.md
   - `rules/obot-testing` - Extends root go-tests.md
   - `rules/svelte-ui` - Extends root svelte-components.md
   - `rules/kubernetes-upgrade` - K8s v0.35.0 upgrade patterns
   - `commands/` and `skills/` - Project-specific workflows

2. **Self-managed claudedocs/**: Content already archived in `claudedocs/archive/k8s-v035-upgrade-2026-01/`

3. **User documentation site**: `docs/` is a Docusaurus site (323K lines) for end-user documentation, not AI context

**Positive Patterns:**

- **Compact CLAUDE.md** (161 lines) - References root resources, doesn't duplicate
- **Project-specific customization is appropriate** for this complex platform
- **Self-managed archive** - Already organizing historical docs
- **Correct inheritance** - Project rules extend root rules

**Areas for Optimization:**

- **PROJECT_INDEX.md** (565 lines) - Still duplicates CLAUDE.md
- **3 redundant Serena memories** - auth_fix, project_architecture, task_completion
- **C4-Documentation/** - 3,320 lines that may or may not be actively used

#### Recommendations

##### ARCHIVE (Low Priority - Less Bloat)

> Archive destination: `obot-entraid/.archive/optimization-2026-01-18/`

1. **`obot-entraid/PROJECT_INDEX.md`** (~565 lines, ~2,825 tokens)
   - Duplicates CLAUDE.md content

2. **`obot-entraid/PROJECT_INDEX.json`** (~500 tokens)
   - Machine-generated artifact

3. **`obot-entraid/claudedocs/README.md`** (~66 lines, ~330 tokens)
   - Points to already-archived content

4. **`obot-entraid/.serena/memories/`** (3 files to archive, ~1,965 tokens)
   - `auth_fix_jan2026.md` - Ephemeral bug fix documentation (historical)
   - `project_architecture.md` - Covered by CLAUDE.md
   - `task_completion_checklist.md` - Redundant with root memory

##### EVALUATE

1. **`C4-Documentation/`** (~3,320 lines, ~16,600 tokens)
   - Contains C4 architecture diagrams (context, container, component, code levels)
   - May have value for architecture understanding
   - Consider archiving if not actively maintained

2. **`development_guide.md` memory** (~261 lines, ~1,305 tokens)
   - May overlap with CLAUDE.md and DEVELOPMENT.md
   - Consider archiving if redundant

##### KEEP (Project-Specific Value)

1. **`CLAUDE.md`** (161 lines) - Compact project reference
2. **`DEVELOPMENT.md`** (94 lines) - User-facing development guide
3. **`.claude/` directory** (2,298 lines) - LEGITIMATE project-specific agents, rules, commands, skills
4. **`.serena/memories/app_preferences_branding.md`** (100 lines) - UNIQUE branding config
5. **`.serena/memories/gptscript_credential_store.md`** (133 lines) - UNIQUE credential config
6. **`docs/`** (323K lines) - User documentation (not AI context, keep as-is)

#### Token Impact

| State | Files | Lines | Est. Tokens |
|-------|-------|-------|-------------|
| Before (AI context) | 17 | ~16,897 | ~23,625 |
| After | 13 | ~15,352 | ~16,795 |
| **Savings** | -4 | -1,545 | **-6,830 (29%)** |

*Lower savings because this project has legitimate project-specific customization that should be kept.*

#### Alignment with Root Patterns

| Pattern | Root | obot-entraid Current | obot-entraid Recommended |
|---------|------|---------------------|--------------------------|
| Primary reference | `CLAUDE.md` | ✅ Has it (compact) | ✅ Keep |
| AI-generated bloat | None | ⚠️ Self-archived in claudedocs/archive/ | ⚠️ Already managed |
| Project index | None | ❌ `PROJECT_INDEX.*` | ❌ Archive |
| Project-specific .claude/ | Allowed for complex projects | ✅ Has agents, rules, skills | ✅ Keep (appropriate) |
| Serena memories | Workspace-level | ⚠️ 6 files (3 redundant, 2 unique) | Keep 2-3, archive 3 |
| User documentation | Project-level | ✅ Docusaurus site | ✅ Keep (not AI context) |

---

### 7. obot-tools

> **Status**: ✅ REVIEWED | **Date**: 2026-01-18 | **Bloat Level**: MODERATE

#### Current State Inventory

| Component | Lines | Est. Tokens | Status |
|-----------|-------|-------------|--------|
| `CLAUDE.md` | 402 | ~2,010 | ✅ Keep - Excellent comprehensive reference |
| `PROJECT_INDEX.md` | 616 | ~3,080 | ❌ Redundant with CLAUDE.md - ARCHIVE |
| `PROJECT_INDEX.json` | ~100 | ~500 | ❌ Machine artifact - ARCHIVE |
| `README.md` | ~50 | ~250 | ✅ Keep - Minimal user overview |
| `docs/ARCHITECTURE.md` | 696 | ~3,480 | ✅ Keep - UNIQUE component architecture |
| `docs/API_REFERENCE.md` | 1,072 | ~5,360 | ✅ Keep - UNIQUE comprehensive API docs |
| `docs/DEVELOPER_GUIDE.md` | 897 | ~4,485 | ⚠️ Evaluate - May overlap CLAUDE.md |
| `docs/auth-providers.md` | 150 | ~750 | ✅ Keep - UNIQUE auth provider specification |
| `docs/INDEX.md` | 365 | ~1,825 | ❌ Navigation overhead - ARCHIVE |
| `docs/AUTH_PROVIDER_MIGRATION_GUIDE.md` | 878 | ~4,390 | ❌ Historical/complete migration - ARCHIVE |
| `docs/ai-context/` | 328 | ~1,640 | ❌ AI-generated patterns - ARCHIVE |
| `.serena/memories/suggested_commands.md` | 188 | ~940 | ❌ Redundant with CLAUDE.md - ARCHIVE |
| `.serena/memories/project_overview.md` | 56 | ~280 | ❌ Redundant with CLAUDE.md - ARCHIVE |
| `.serena/memories/project_structure.md` | 149 | ~745 | ❌ Redundant with CLAUDE.md - ARCHIVE |
| `.serena/memories/code_style_and_conventions.md` | 121 | ~605 | ❌ Redundant with root + CLAUDE.md - ARCHIVE |
| `.serena/memories/task_completion_checklist.md` | 100 | ~500 | ❌ Redundant with root - ARCHIVE |
| `.serena/memories/tech_stack.md` | 49 | ~245 | ❌ Redundant with CLAUDE.md - ARCHIVE |
| `.claude/settings.local.json` | ~100 | ~1,000 | ✅ Keep - Permissions only |
| **TOTAL** | **~5,317** | **~32,085** | |

#### Observations

**Positive Patterns:**

- **Excellent CLAUDE.md** (402 lines) - Most comprehensive project reference in the workspace, covers architecture, patterns, commands, creating new components
- **No `claudedocs/` directory** - Clean project without AI-generated bloat
- **Correct `.claude/` inheritance** - Only `settings.local.json` present
- **Valuable `docs/` content** - ARCHITECTURE.md, API_REFERENCE.md, auth-providers.md have unique value
- **Well-organized complex repo** - 29+ components (tools, model providers, auth providers, credential stores)

**Areas for Optimization:**

- **PROJECT_INDEX.md** (616 lines) - Duplicates CLAUDE.md content
- **All 6 Serena memories redundant** - CLAUDE.md is so comprehensive that all memories duplicate it
- **docs/INDEX.md** (365 lines) - Navigation overhead
- **docs/AUTH_PROVIDER_MIGRATION_GUIDE.md** (878 lines) - Historical migration doc (Status: COMPLETE)
- **docs/ai-context/** (328 lines) - AI-generated pattern documentation

**Unique Content to Preserve:**

- `docs/ARCHITECTURE.md` (696 lines) - Detailed component architecture beyond CLAUDE.md
- `docs/API_REFERENCE.md` (1,072 lines) - Comprehensive API documentation
- `docs/auth-providers.md` (150 lines) - Auth provider specification (referenced by CLAUDE.md)

#### Recommendations

##### ARCHIVE (High Priority)

> Archive destination: `obot-tools/.archive/optimization-2026-01-18/`

1. **`obot-tools/PROJECT_INDEX.md`** (~616 lines, ~3,080 tokens)
   - Duplicates CLAUDE.md content which is more comprehensive

2. **`obot-tools/PROJECT_INDEX.json`** (~500 tokens)
   - Machine-generated artifact

3. **`obot-tools/docs/INDEX.md`** (~365 lines, ~1,825 tokens)
   - Navigation file, low value with direct links in CLAUDE.md

4. **`obot-tools/docs/AUTH_PROVIDER_MIGRATION_GUIDE.md`** (~878 lines, ~4,390 tokens)
   - Status: "Phase 0, 1, & 2 COMPLETE - Migration Finished"
   - Historical document, migration already done

5. **`obot-tools/docs/ai-context/`** (entire directory, ~328 lines, ~1,640 tokens)
   - AI-generated pattern documentation

6. **`obot-tools/.serena/memories/`** (all 6 files, ~3,315 tokens)
   - `suggested_commands.md` - CLAUDE.md has complete commands section
   - `project_overview.md` - CLAUDE.md covers this
   - `project_structure.md` - CLAUDE.md has comprehensive architecture
   - `code_style_and_conventions.md` - Root + CLAUDE.md cover this
   - `task_completion_checklist.md` - Root memory is comprehensive
   - `tech_stack.md` - CLAUDE.md lists tech stack

##### EVALUATE

1. **`docs/DEVELOPER_GUIDE.md`** (~897 lines, ~4,485 tokens)
   - May have overlap with CLAUDE.md's comprehensive "Creating New Components" section
   - Consider keeping if it has unique content not in CLAUDE.md

##### KEEP

1. **`CLAUDE.md`** (402 lines) - Excellent, comprehensive project reference
2. **`README.md`** (~50 lines) - Minimal user-facing overview
3. **`docs/ARCHITECTURE.md`** (696 lines) - Detailed component architecture
4. **`docs/API_REFERENCE.md`** (1,072 lines) - Comprehensive API documentation
5. **`docs/auth-providers.md`** (150 lines) - Auth provider specification
6. **`.claude/settings.local.json`** - Project permissions

#### Token Impact

| State | Files | Lines | Est. Tokens |
|-------|-------|-------|-------------|
| Before | 17 | ~5,317 | ~32,085 |
| After (conservative) | 7 | ~2,622 | ~13,535 |
| **Savings** | -10 | -2,695 | **-18,550 (58%)** |

*Note: Conservative estimate keeps DEVELOPER_GUIDE.md in evaluation. Additional 4,485 tokens possible if archived.*

#### Alignment with Root Patterns

| Pattern | Root | obot-tools Current | obot-tools Recommended |
|---------|------|-------------------|------------------------|
| Primary reference | `CLAUDE.md` | ✅ Has it (excellent) | ✅ Keep |
| AI-generated bloat | None | ⚠️ docs/ai-context/ | ❌ Archive |
| Project index | None | ❌ `PROJECT_INDEX.*` | ❌ Archive |
| Detailed docs | `docs/` | ✅ Has it (valuable) | ✅ Keep key docs |
| Historical docs | None | ⚠️ Migration guide (complete) | ❌ Archive |
| Serena memories | Workspace-level | ⚠️ 6 files (all redundant) | Archive all 6 |
| .claude/ config | Inherit | ✅ Only permissions | ✅ Correct |

---

## Cross-Project Patterns

> This section is updated after each project review to identify commonalities.

### Identified Patterns (Updated per project review)

| Pattern | Projects Affected | Description | Action |
|---------|-------------------|-------------|--------|
| `claudedocs/` bloat | kinm | AI-generated comprehensive docs duplicating simpler files | ARCHIVE directories |
| `PROJECT_INDEX.md` redundancy | kinm, mcp-catalog | Duplicates CLAUDE.md content | ARCHIVE files |
| Redundant Serena memories | kinm, mcp-catalog | suggested_commands, task_completion, code_style duplicate root | ARCHIVE duplicates |
| Correct .claude/ inheritance | kinm, mcp-catalog | Only settings.local.json, inherits agents/rules from root | Keep pattern |
| Unique project-specific memories | mcp-catalog | `mcp_catalog_schema.md` - domain-specific content worth keeping | KEEP |
| Navigation file overhead | mcp-catalog, mcp-oauth-proxy | INDEX.md files that just point to other docs | ARCHIVE |
| Meta-documentation bloat | mcp-oauth-proxy | DOCUMENTATION_SUMMARY.md describing docs/ content | ARCHIVE |
| Security-critical docs worth keeping | mcp-oauth-proxy | ARCHITECTURE, API_REFERENCE, DATABASE_SCHEMA for OAuth | KEEP |
| `local_docs/claudedocs/` bloat | nah | AI-generated implementation plans and validation reports | ARCHIVE |
| Downstream consumer documentation | nah | downstream_consumers.md documents dependency relationships | KEEP |
| Framework package documentation | nah | docs/packages/ for router, apply, backend | KEEP |
| Extreme over-documentation | namegenerator | 43:1 docs-to-code ratio for trivial library | ARCHIVE most docs |
| docs/ as bloat source | namegenerator | Unlike others where docs/ is clean, here docs/ IS the bloat | ARCHIVE 8 of 9 files |
| Legitimate project-specific .claude/ | obot-entraid | Complex full-stack project with custom agents, rules, skills | KEEP - appropriate |
| Self-managed archive pattern | obot-entraid | `claudedocs/archive/` for historical implementation plans | KEEP pattern |
| User docs as separate concern | obot-entraid | Docusaurus site (323K lines) is user docs, not AI context | Exclude from AI context |
| Ephemeral bug fix logs | obot-entraid | `auth_fix_jan2026.md` - historical bug fix, not reference | ARCHIVE |
| Excellent CLAUDE.md pattern | obot-tools | Most comprehensive reference in workspace (402 lines) - exemplar | KEEP as template |
| Completed migration docs | obot-tools | `AUTH_PROVIDER_MIGRATION_GUIDE.md` - status COMPLETE | ARCHIVE |
| AI-generated patterns | obot-tools | `docs/ai-context/patterns/` - generated pattern docs | ARCHIVE |
| Historical docs overhead | obot-tools | 878 lines of completed migration documentation | ARCHIVE |

### Standardization Opportunities

| Opportunity | Description | Impact |
|-------------|-------------|--------|
| Eliminate PROJECT_INDEX.md pattern | ALL 7 projects have redundant PROJECT_INDEX files | ~16,410 tokens saved |
| Archive all claudedocs/ directories | kinm, nah, namegenerator have AI-generated bloat | ~23,285 tokens saved |
| Consolidate Serena memories | Most project memories duplicate root workspace | ~24,975 tokens saved |
| Use obot-tools CLAUDE.md as template | Best exemplar for comprehensive project reference | Quality improvement |
| Define legitimate project-specific .claude/ | obot-entraid pattern is appropriate for complex projects | Clear guidelines |
| Archive completed migration/implementation docs | Historical docs with status COMPLETE should be archived | ~5,000+ tokens saved |

### Unique Requirements (per project)

| Project | Unique Requirement | Rationale |
|---------|-------------------|-----------|
| kinm | Keep 2 Serena memories | codebase_structure and project_overview are compact and unique |
| mcp-catalog | Keep mcp_catalog_schema.md memory | YAML schema reference is domain-specific and unique |
| mcp-catalog | Keep docs/API_REFERENCE.md | Detailed API documentation not covered elsewhere |
| mcp-oauth-proxy | Keep docs/ARCHITECTURE.md | OAuth 2.1 security architecture (security-critical) |
| mcp-oauth-proxy | Keep docs/API_REFERENCE.md | OAuth endpoint specifications |
| mcp-oauth-proxy | Keep docs/DATABASE_SCHEMA.md | Token/grant encrypted storage schema |
| mcp-oauth-proxy | Archive all 6 Serena memories | Every memory duplicates root or CLAUDE.md |
| nah | Keep downstream_consumers.md memory | Documents kinm/obot dependency relationships |
| nah | Keep docs/packages/ directory | Essential framework API documentation |
| nah | Archive local_docs/claudedocs/ | AI-generated plans/reports (15K tokens bloat) |
| namegenerator | Archive 8 of 9 docs/ files | Extreme over-documentation (43:1 ratio) |
| namegenerator | Archive all 5 Serena memories | All redundant for trivial library |
| namegenerator | Keep only CLAUDE.md, README.md, docs/API.md | Sufficient for 135-line library |
| obot-entraid | Keep project-specific .claude/ directory | LEGITIMATE customization for complex full-stack platform |
| obot-entraid | Keep app_preferences_branding.md memory | UNIQUE branding/UI configuration not in root |
| obot-entraid | Keep gptscript_credential_store.md memory | UNIQUE credential store patterns not in root |
| obot-entraid | Archive only 3 Serena memories | Lower savings (29%) due to legitimate customization |
| obot-entraid | Exclude docs/ from AI context | 323K line Docusaurus site is user documentation |
| obot-tools | Keep docs/ARCHITECTURE.md | UNIQUE detailed component architecture |
| obot-tools | Keep docs/API_REFERENCE.md | UNIQUE comprehensive API documentation (1,072 lines) |
| obot-tools | Keep docs/auth-providers.md | UNIQUE auth provider specification |
| obot-tools | Archive all 6 Serena memories | CLAUDE.md is so comprehensive all memories are redundant |
| obot-tools | Archive completed migration guide | Historical doc with status "COMPLETE" (878 lines) |
| obot-tools | Use CLAUDE.md as template | Best exemplar for comprehensive project reference |

---

## Action Items

### Phase 1: Review All Projects ✅ COMPLETE

- [x] Review kinm ✅
- [x] Review mcp-catalog ✅
- [x] Review mcp-oauth-proxy ✅
- [x] Review nah ✅
- [x] Review namegenerator ✅
- [x] Review obot-entraid ✅
- [x] Review obot-tools ✅

### Phase 2: Execute Archival ✅ COMPLETE

#### kinm ✅

> Archived to: `kinm/.archive/optimization-2026-01-18/`

- [x] Archive `kinm/claudedocs/` directory (3 files) ✅
- [x] Archive `kinm/PROJECT_INDEX.md` ✅
- [x] Archive `kinm/PROJECT_INDEX.json` ✅
- [x] Archive `kinm/.serena/memories/suggested_commands.md` ✅
- [x] Archive `kinm/.serena/memories/task_completion.md` ✅
- [x] Archive `kinm/.serena/memories/code_style.md` ✅
- [x] Archive `kinm/.serena/memories/cleanup_history.md` ✅

#### mcp-catalog ✅

> Archived to: `mcp-catalog/.archive/optimization-2026-01-18/`

- [x] Archive `mcp-catalog/PROJECT_INDEX.md` ✅
- [x] Archive `mcp-catalog/docs/INDEX.md` ✅
- [x] Archive `mcp-catalog/.serena/memories/suggested_commands.md` ✅
- [x] Archive `mcp-catalog/.serena/memories/task_completion_checklist.md` ✅
- [x] Archive `mcp-catalog/.serena/memories/code_style_and_conventions.md` ✅
- [x] Archive `mcp-catalog/.serena/memories/project_overview.md` ✅
- [x] Archive `mcp-catalog/.serena/memories/cicd_workflows.md` ✅
- [x] Archive `mcp-catalog/.serena/memories/documentation_index.md` ✅
- [x] Archive `mcp-catalog/.serena/memories/project_index_location.md` ✅

#### mcp-oauth-proxy ✅

> Archived to: `mcp-oauth-proxy/.archive/optimization-2026-01-18/`

- [x] Archive `mcp-oauth-proxy/PROJECT_INDEX.md` ✅
- [x] Archive `mcp-oauth-proxy/PROJECT_INDEX.json` ✅
- [x] Archive `mcp-oauth-proxy/DOCUMENTATION_SUMMARY.md` ✅
- [x] Archive `mcp-oauth-proxy/docs/INDEX.md` ✅
- [x] Archive `mcp-oauth-proxy/docs/README.md` ✅
- [x] Archive `mcp-oauth-proxy/.serena/memories/code_style_conventions.md` ✅
- [x] Archive `mcp-oauth-proxy/.serena/memories/codebase_structure.md` ✅
- [x] Archive `mcp-oauth-proxy/.serena/memories/project_overview.md` ✅
- [x] Archive `mcp-oauth-proxy/.serena/memories/suggested_commands.md` ✅
- [x] Archive `mcp-oauth-proxy/.serena/memories/task_completion_checklist.md` ✅
- [x] Archive `mcp-oauth-proxy/.serena/memories/tech_stack.md` ✅

#### nah ✅

> Archived to: `nah/.archive/optimization-2026-01-18/`

- [x] Archive `nah/PROJECT_INDEX.md` ✅
- [x] Archive `nah/PROJECT_INDEX.json` ✅
- [x] Archive `nah/local_docs/claudedocs/` (entire directory - 4 files) ✅
- [x] Archive `nah/.serena/memories/code_style_and_conventions.md` ✅
- [x] Archive `nah/.serena/memories/codebase_architecture.md` ✅
- [x] Archive `nah/.serena/memories/design_patterns_and_guidelines.md` ✅
- [x] Archive `nah/.serena/memories/project_overview.md` ✅
- [x] Archive `nah/.serena/memories/suggested_commands.md` ✅
- [x] Archive `nah/.serena/memories/task_completion_workflow.md` ✅

#### namegenerator ✅

> Archived to: `namegenerator/.archive/optimization-2026-01-18/`

- [x] Archive `namegenerator/PROJECT_INDEX.md` ✅
- [x] Archive `namegenerator/PROJECT_INDEX.json` ✅
- [x] Archive `namegenerator/docs/ARCHITECTURE.md` ✅
- [x] Archive `namegenerator/docs/CODE_EXAMPLES.md` ✅
- [x] Archive `namegenerator/docs/COVERAGE_REPORT.md` ✅
- [x] Archive `namegenerator/docs/DIAGRAMS.md` ✅
- [x] Archive `namegenerator/docs/DOCUMENTATION_SITE.md` ✅
- [x] Archive `namegenerator/docs/INDEX.md` ✅
- [x] Archive `namegenerator/docs/USAGE_PATTERNS.md` ✅
- [x] Archive `namegenerator/docs/USER_GUIDE.md` ✅
- [x] Archive `namegenerator/.serena/memories/code_style_and_conventions.md` ✅
- [x] Archive `namegenerator/.serena/memories/project_purpose_and_structure.md` ✅
- [x] Archive `namegenerator/.serena/memories/suggested_commands.md` ✅
- [x] Archive `namegenerator/.serena/memories/task_completion_checklist.md` ✅
- [x] Archive `namegenerator/.serena/memories/tech_stack_and_dependencies.md` ✅

#### obot-entraid ✅

> Archived to: `obot-entraid/.archive/optimization-2026-01-18/`

- [x] Archive `obot-entraid/PROJECT_INDEX.md` ✅
- [x] Archive `obot-entraid/PROJECT_INDEX.json` ✅
- [x] Archive `obot-entraid/claudedocs/README.md` ✅
- [x] Archive `obot-entraid/.serena/memories/auth_fix_jan2026.md` ✅
- [x] Archive `obot-entraid/.serena/memories/project_architecture.md` ✅
- [x] Archive `obot-entraid/.serena/memories/task_completion_checklist.md` ✅

#### obot-tools ✅

> Archived to: `obot-tools/.archive/optimization-2026-01-18/`

- [x] Archive `obot-tools/PROJECT_INDEX.md` ✅
- [x] Archive `obot-tools/PROJECT_INDEX.json` ✅
- [x] Archive `obot-tools/docs/INDEX.md` ✅
- [x] Archive `obot-tools/docs/AUTH_PROVIDER_MIGRATION_GUIDE.md` ✅
- [x] Archive `obot-tools/docs/ai-context/` (entire directory) ✅
- [x] Archive `obot-tools/.serena/memories/suggested_commands.md` ✅
- [x] Archive `obot-tools/.serena/memories/project_overview.md` ✅
- [x] Archive `obot-tools/.serena/memories/project_structure.md` ✅
- [x] Archive `obot-tools/.serena/memories/code_style_and_conventions.md` ✅
- [x] Archive `obot-tools/.serena/memories/task_completion_checklist.md` ✅
- [x] Archive `obot-tools/.serena/memories/tech_stack.md` ✅

---

**Phase 2 COMPLETE: All 69 files archived across 7 projects.**

### Phase 3: Cross-Project Standardization

- [ ] Define standard CLAUDE.md template based on findings
- [ ] Document inheritance patterns
- [ ] Create validation checklist

---

## Implementation Log

| Date | Project | Action | Files Changed | Tokens Saved |
|------|---------|--------|---------------|--------------|
| 2026-01-18 | kinm | Initial analysis | 0 (analysis only) | 0 |
| 2026-01-18 | mcp-catalog | Initial analysis | 0 (analysis only) | 0 |
| 2026-01-18 | mcp-oauth-proxy | Initial analysis | 0 (analysis only) | 0 |
| 2026-01-18 | nah | Initial analysis | 0 (analysis only) | 0 |
| 2026-01-18 | namegenerator | Initial analysis | 0 (analysis only) | 0 |
| 2026-01-18 | obot-entraid | Initial analysis | 0 (analysis only) | 0 |
| 2026-01-18 | obot-tools | Initial analysis | 0 (analysis only) | 0 |
| 2026-01-18 | **ALL PROJECTS** | **Phase 1 Complete** | **0 (analysis only)** | **~135,655 identified** |
| 2026-01-18 | kinm | Phase 2 archival | 8 files archived | ~17,190 |
| 2026-01-18 | mcp-catalog | Phase 2 archival | 9 files archived | ~10,900 |
| 2026-01-18 | mcp-oauth-proxy | Phase 2 archival | 11 files archived | ~19,300 |
| 2026-01-18 | nah | Phase 2 archival | 9 files archived | ~30,295 |
| 2026-01-18 | namegenerator | Phase 2 archival | 15 files archived | ~32,385 |
| 2026-01-18 | obot-entraid | Phase 2 archival | 6 files archived | ~6,830 |
| 2026-01-18 | obot-tools | Phase 2 archival | 11 files archived | ~18,550 |
| 2026-01-18 | **ALL PROJECTS** | **Phase 2 Complete** | **69 files archived** | **~135,450 tokens saved** |

---

## Appendix: Token Estimation Method

Token estimates are calculated as:

- ~5 tokens per line for markdown/code
- ~10 tokens per line for dense JSON
- These are rough estimates for planning purposes

## Appendix: Related Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Project Documentation Alignment Guide | `documentation/guides/project-documentation-alignment-guide.md` | Adding features (agents, workflows) |
| This Document | `documentation/guides/workspace-context-optimization-review.md` | Optimization and cleanup |
| Root CLAUDE.md | `CLAUDE.md` | Workspace-level Claude integration |
| Root AGENTS.md | `AGENTS.md` | Universal AI guidelines |

---

*Living document - updated after each project review*
