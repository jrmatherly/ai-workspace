# Documentation Guide

**AI/MCP Multi-Repo Workspace** - Navigation and Reference Guide
**Last Updated:** 2026-01-17

> **Quick Links:** [Getting Started](#getting-started) | [By Task](#documentation-by-task) | [By Project](#documentation-by-project) | [AI Assistants](#ai-assistant-guides) | [Learning Paths](#learning-paths)

---

## Documentation Structure

```
AI/
├── README.md                     <- Entry point: Workspace overview
├── AGENTS.md                     <- Universal AI agent guidelines
├── CLAUDE.md                     <- Claude Code integration
├── QUICK_REFERENCE.md            <- One-page developer cheat sheet
├── TROUBLESHOOTING.md            <- Problem resolution guide
├── SECURITY.md                   <- Security policy
│
├── documentation/
│   ├── reference/                <- Consolidated reference docs
│   │   ├── DOCUMENTATION_GUIDE.md    (this file)
│   │   ├── PROJECT_INDEX.md          <- Master project reference
│   │   ├── ARCHITECTURE.md           <- Visual architecture (ASCII + Mermaid)
│   │   ├── API_REFERENCE.md          <- Cross-project API reference
│   │   └── DEVELOPER_ONBOARDING.md   <- New contributor guide
│   │
│   ├── projects/                 <- Project-specific work documentation
│   ├── guides/                   <- Implementation guides
│   ├── metadata/                 <- Machine-readable indexes
│   └── archive/                  <- Superseded documentation
│
├── .claude/                      <- Claude Code enhancements
│   ├── agents/                   <- Custom subagents
│   ├── rules/                    <- Path-specific rules
│   ├── skills/                   <- Progressive disclosure skills
│   ├── instructions/             <- Enhancement guides
│   └── settings.json             <- Hooks configuration
│
├── .serena/memories/             <- AI context (Serena MCP)
│
└── [projects]/                   <- Individual project repositories
    └── CLAUDE.md                 <- Project-specific AI guides
```

---

## Getting Started

### New to the Workspace?

**Follow this path:**

1. **[README.md](../../README.md)** - Overview of all 7 projects (5 min read)
2. **Choose your project** - Pick the one matching your task
3. **Read project README** - Understand project purpose and setup
4. **Review examples** - See code in action
5. **Check AI guides** - CLAUDE.md files for development tips

### Quick Start by Project

| Project | Start Here | Next Read | Then |
|---------|------------|-----------|------|
| **obot-entraid** | [README](../../obot-entraid/README.md) | [CONTRIBUTING](../../obot-entraid/CONTRIBUTING.md) | [Tools Guide](../../obot-entraid/tools/README.md) |
| **nah** | [README](../../nah/README.md) | [CLAUDE.md](../../nah/CLAUDE.md) | [Examples](../../nah/docs/examples/) |
| **kinm** | [README](../../kinm/README.md) | [PROJECT_INDEX](../../kinm/PROJECT_INDEX.md) | [API Spec](../../kinm/docs/API.md) |
| **mcp-oauth-proxy** | [README](../../mcp-oauth-proxy/README.md) | [API_REFERENCE](../../mcp-oauth-proxy/docs/API_REFERENCE.md) | Test locally |
| **obot-tools** | [README](../../obot-tools/README.md) | [ARCHITECTURE](../../obot-tools/docs/ARCHITECTURE.md) | [DEVELOPER_GUIDE](../../obot-tools/docs/DEVELOPER_GUIDE.md) |
| **mcp-catalog** | [PROJECT_INDEX](../../mcp-catalog/PROJECT_INDEX.md) | YAML examples | Integration |
| **namegenerator** | [README](../../namegenerator/README.md) | [CLAUDE.md](../../namegenerator/CLAUDE.md) | [API](../../namegenerator/docs/API.md) |

---

## Documentation by Task

### I want to...

| Goal | Read This |
|------|-----------|
| **Understand the workspace** | [README.md](../../README.md) |
| **Get started contributing** | [DEVELOPER_ONBOARDING.md](./developer-onboarding.md) |
| **Quick command reference** | [QUICK_REFERENCE.md](../../QUICK_REFERENCE.md) |
| **Understand architecture** | [ARCHITECTURE.md](./architecture.md) |
| **Find a specific project** | [PROJECT_INDEX.md](./project-index.md) |
| **Learn API structure** | [API_REFERENCE.md](./api-reference.md) |
| **Debug an issue** | [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md) |
| **Use Claude Code** | [CLAUDE.md](../../CLAUDE.md) |
| **Deep dive into project** | Project-specific `CLAUDE.md` |

### Build a Kubernetes Controller

> **nah framework**

1. [nah/README.md](../../nah/README.md) - Overview and quick start
2. [nah/CLAUDE.md](../../nah/CLAUDE.md) - Development guide
3. [nah/docs/guides/controllers.md](../../nah/docs/guides/controllers.md) - Controller patterns
4. [nah/docs/examples/](../../nah/docs/examples/) - Code examples
5. [API_REFERENCE.md](./api-reference.md) - API reference

**Key Concepts:** Router API, Apply for declarative reconciliation, Leader election for HA

### Add Authentication to MCP Servers

> **mcp-oauth-proxy**

1. [mcp-oauth-proxy/README.md](../../mcp-oauth-proxy/README.md) - Setup guide
2. [mcp-oauth-proxy/docs/API_REFERENCE.md](../../mcp-oauth-proxy/docs/API_REFERENCE.md) - API details
3. Configure OAuth provider credentials
4. Test OAuth flow

**Key Concepts:** OAuth 2.1 with PKCE, Header injection, Multi-provider support

### Deploy Obot Platform

> **obot-entraid**

1. [obot-entraid/README.md](../../obot-entraid/README.md) - Platform overview
2. [obot-entraid/CONTRIBUTING.md](../../obot-entraid/CONTRIBUTING.md) - Setup guide
3. [obot-entraid/tools/README.md](../../obot-entraid/tools/README.md) - Auth providers
4. Configure auth provider (Entra ID or Keycloak)
5. Deploy with Docker/Kubernetes

**Key Concepts:** MCP hosting and registry, Custom auth providers, Fork-specific features

### Create Model Providers

> **obot-tools**

1. [obot-tools/README.md](../../obot-tools/README.md) - Tools overview
2. [obot-tools/docs/ARCHITECTURE.md](../../obot-tools/docs/ARCHITECTURE.md) - Architecture patterns
3. [obot-tools/docs/DEVELOPER_GUIDE.md](../../obot-tools/docs/DEVELOPER_GUIDE.md) - Development workflow
4. Study existing provider (e.g., `openai-model-provider/`)
5. Implement OpenAI-compatible API

**Key Concepts:** Tool registry (`index.yaml`), GPTScript integration, OpenAI-compatible APIs

### Contribute to a Project

| Project | Guide | Key Info |
|---------|-------|----------|
| obot-entraid | [CONTRIBUTING.md](../../obot-entraid/CONTRIBUTING.md) | Fork workflow, auth providers |
| nah | [CONTRIBUTING.md](../../nah/CONTRIBUTING.md) | Library patterns, code generation |
| Others | Check README | General contribution guidelines |

**Common Requirements:**

- Conventional Commits
- `make validate-ci` before committing
- See [AGENTS.md](../../AGENTS.md) for universal guidelines

---

## Documentation by Project

### obot-entraid

**Overview:** [README.md](../../obot-entraid/README.md) | [CONTRIBUTING.md](../../obot-entraid/CONTRIBUTING.md)

**Technical:**

- [tools/README.md](../../obot-entraid/tools/README.md) - Authentication providers
- [tools/entra-auth-provider/README.md](../../obot-entraid/tools/entra-auth-provider/README.md) - Entra ID setup
- [docs/contributing/](../../obot-entraid/docs/contributing/) - Fork workflow

**AI Guide:** [CLAUDE.md](../../obot-entraid/CLAUDE.md)

### nah

**Overview:** [README.md](../../nah/README.md) | [PROJECT_INDEX.md](../../nah/PROJECT_INDEX.md)

**Technical:**

- [docs/guides/controllers.md](../../nah/docs/guides/controllers.md) - Building controllers
- [docs/guides/apply.md](../../nah/docs/guides/apply.md) - Declarative management
- [docs/architecture/](../../nah/docs/architecture/) - Architecture decisions

**AI Guide:** [CLAUDE.md](../../nah/CLAUDE.md)

### kinm

**Overview:** [README.md](../../kinm/README.md) | [PROJECT_INDEX.md](../../kinm/PROJECT_INDEX.md)

**Technical:** [docs/API.md](../../kinm/docs/API.md) - REST API specification

### mcp-oauth-proxy

**Overview:** [README.md](../../mcp-oauth-proxy/README.md) | [PROJECT_INDEX.md](../../mcp-oauth-proxy/PROJECT_INDEX.md)

**Technical:** [docs/API_REFERENCE.md](../../mcp-oauth-proxy/docs/API_REFERENCE.md) - OAuth API details

### obot-tools

**Overview:** [README.md](../../obot-tools/README.md) | [PROJECT_INDEX.md](../../obot-tools/PROJECT_INDEX.md)

**Technical:**

- [docs/ARCHITECTURE.md](../../obot-tools/docs/ARCHITECTURE.md) - System architecture
- [docs/API_REFERENCE.md](../../obot-tools/docs/API_REFERENCE.md) - API specifications
- [docs/DEVELOPER_GUIDE.md](../../obot-tools/docs/DEVELOPER_GUIDE.md) - Development workflow

**AI Guide:** [CLAUDE.md](../../obot-tools/CLAUDE.md)

### mcp-catalog

**Overview:** [PROJECT_INDEX.md](../../mcp-catalog/PROJECT_INDEX.md)

**Technical:** [docs/API_REFERENCE.md](../../mcp-catalog/docs/API_REFERENCE.md) - Configuration schema

**AI Guide:** [CLAUDE.md](../../mcp-catalog/CLAUDE.md)

---

## AI Assistant Guides

### Claude Code (CLAUDE.md)

Each project with a `CLAUDE.md` provides:

- Development commands reference
- Architecture overview for AI context
- Code patterns and best practices
- Quick reference for common tasks

**Available Guides:**

- [Workspace CLAUDE.md](../../CLAUDE.md) - Serena MCP, memories, Claude Code features
- [obot-entraid/CLAUDE.md](../../obot-entraid/CLAUDE.md)
- [nah/CLAUDE.md](../../nah/CLAUDE.md)
- [obot-tools/CLAUDE.md](../../obot-tools/CLAUDE.md)
- [mcp-catalog/CLAUDE.md](../../mcp-catalog/CLAUDE.md)

### Serena AI (Memories)

**Location:** `.serena/memories/`

| Memory | Purpose |
|--------|---------|
| `project_purpose_and_structure.md` | All projects overview, directory structure |
| `tech_stack_and_dependencies.md` | Languages, frameworks, tools |
| `code_style_and_conventions.md` | Go, TypeScript, Python standards |
| `suggested_commands.md` | Build, test, lint commands |
| `task_completion_checklist.md` | Pre-commit checklist, quality gates |
| `codebase_architecture.md` | Detailed architecture, design patterns |
| `gptscript_tool_format.md` | GPTScript tool patterns (CRITICAL) |
| `documentation_best_practices.md` | Documentation standards |

### Claude Code Enhancements (.claude/)

| Component | Purpose |
|-----------|---------|
| **agents/** | Custom subagents (go-reviewer, arch-analyzer, pre-commit, gptscript-validator) |
| **rules/** | Path-specific auto-activated rules (go-tests, gptscript, kubernetes, svelte, sql) |
| **skills/** | Progressive disclosure skills (validate-project, code-review, new-provider) |
| **instructions/** | Enhancement guides and configuration documentation |
| **output-styles/** | Response formatting (minimal, teaching, debugging) |

---

## Learning Paths

### Path 1: New to the Workspace

```
1. README.md (30 min)
   └─> Understand the projects

2. Choose a project
   └─> Read project README

3. QUICK_REFERENCE.md (15 min)
   └─> Bookmark for daily use

4. Project CLAUDE.md
   └─> Start coding!
```

### Path 2: Contributing Code

```
1. DEVELOPER_ONBOARDING.md (45 min)
   └─> Set up environment

2. Project-specific CLAUDE.md (30 min)
   └─> Understand architecture

3. QUICK_REFERENCE.md
   └─> Reference while coding

4. TROUBLESHOOTING.md
   └─> When stuck

5. Make your first PR!
```

### Path 3: Understanding Architecture

```
1. ARCHITECTURE.md (30 min)
   └─> Visual overview (ASCII + Mermaid)

2. PROJECT_INDEX.md (30 min)
   └─> Detailed component breakdown

3. Project-specific CLAUDE.md (30-60 min)
   └─> Deep dive into chosen project
```

### Path 4: Using AI Assistants

```
1. Load CLAUDE.md (workspace)
   └─> Understand structure

2. Load .serena/memories/
   └─> Get full context

3. Read project-specific CLAUDE.md
   └─> Detailed architecture

4. Use QUICK_REFERENCE.md
   └─> Command reference
```

---

## Finding Information

### Search Strategies

| Topic | Where to Look |
|-------|---------------|
| **What a project does** | Project README.md |
| **How to set up** | README.md -> Getting Started section |
| **API endpoints** | API_REFERENCE.md or project docs/API*.md |
| **Code architecture** | PROJECT_INDEX.md or docs/ARCHITECTURE.md |
| **Code examples** | docs/examples/ or README.md |
| **Contribution guidelines** | CONTRIBUTING.md |
| **Development commands** | CLAUDE.md or .serena/memories/suggested_commands.md |
| **Code conventions** | AGENTS.md or .serena/memories/code_style_and_conventions.md |
| **Design decisions** | docs/architecture/adr/ |

### Quick Lookups

**Command Reference:**

```
# Workspace-wide commands
-> AGENTS.md or QUICK_REFERENCE.md

# Project-specific commands
-> {project}/CLAUDE.md
-> {project}/Makefile (run `make help`)
```

**API Reference:**

```
# Master API reference
-> documentation/docs/reference/api-reference.md

# Project-specific APIs
-> kinm/docs/API.md
-> mcp-oauth-proxy/docs/API_REFERENCE.md
-> obot-tools/docs/API_REFERENCE.md
```

**Architecture:**

```
# Workspace architecture
-> documentation/docs/reference/architecture.md
-> .serena/memories/codebase_architecture.md

# Project architecture
-> {project}/PROJECT_INDEX.md
-> {project}/docs/ARCHITECTURE.md
```

---

## Documentation Coverage

### By Project

| Project | README | INDEX | API Docs | Architecture | Examples | AI Guide |
|---------|--------|-------|----------|--------------|----------|----------|
| obot-entraid | Yes | - | - | Via docs/ | Via docs/ | Yes |
| nah | Yes | Yes | In INDEX | Yes | Yes | Yes |
| kinm | Yes | Yes | Yes | - | - | - |
| mcp-oauth-proxy | Yes | Yes | Yes | - | In README | - |
| obot-tools | Yes | Yes | Yes | Yes | In README | Yes |
| mcp-catalog | - | Yes | Yes | - | YAML files | Yes |

### By Topic

| Topic | Coverage |
|-------|----------|
| Getting Started | 100% (all projects have README) |
| API Reference | 83% (5/6 projects) |
| Architecture | 50% (3/6 projects) |
| Examples | 50% (3/6 projects) |
| AI Guides | 67% (4/6 projects) |
| Contributing | 33% (2/6 projects) |

---

## Documentation Conventions

### File Naming

- `README.md` - Project overview, always at root
- `PROJECT_INDEX.md` - Comprehensive reference
- `API_REFERENCE.md` - API documentation
- `ARCHITECTURE.md` - Architecture documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `CLAUDE.md` - AI assistant guide
- `DEVELOPER_GUIDE.md` - Development workflow

### Content Structure

**README.md:**

1. Project description
2. Features
3. Quick start
4. Configuration
5. Examples
6. Links to detailed docs

**PROJECT_INDEX.md:**

1. Quick summary
2. Project structure
3. Entry points
4. Core modules
5. Dependencies
6. Architecture patterns

**API_REFERENCE.md:**

1. Overview
2. Endpoints/interfaces
3. Request/response formats
4. Examples
5. Error handling

---

## External Resources

### Official Documentation

- **Kubernetes:** https://kubernetes.io/docs/
- **Go:** https://go.dev/doc/
- **SvelteKit:** https://kit.svelte.dev/docs
- **PostgreSQL:** https://www.postgresql.org/docs/
- **OAuth 2.1:** https://oauth.net/2.1/

### Community

- **Obot Platform:** https://docs.obot.ai/
- **MCP Specification:** https://modelcontextprotocol.io/

---

*This guide helps you find the right documentation quickly. Consolidated from DOCUMENTATION_GUIDE.md, DOCUMENTATION_INDEX_MASTER.md, and DOCUMENTATION_SUMMARY.md.*
