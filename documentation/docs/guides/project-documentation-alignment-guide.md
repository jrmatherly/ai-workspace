# Project Documentation Alignment Guide

> **Version**: 1.0.0 | **Created**: 2026-01-17 | **Status**: Implementation Ready

This guide documents the findings from a systematic review of individual project documentation within the AI monorepo, identifying alignment opportunities with the monorepo-level Claude Code enhancements.

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Gap Analysis](#gap-analysis)
4. [Implementation Recommendations](#implementation-recommendations)
5. [Implementation Checklist](#implementation-checklist)
6. [Reference Materials](#reference-materials)

---

## Executive Summary

### Scope

Reviewed 7 projects in the AI monorepo:

- obot-entraid
- obot-tools
- nah
- mcp-oauth-proxy
- mcp-catalog
- namegenerator
- kinm

### Key Findings

| Category | Status | Action Required |
| ---------- | -------- | ----------------- |
| CLAUDE.md files | 6/7 complete | Create kinm/CLAUDE.md |
| .claude/ directories | 1/7 exists | Consider project-specific agents |
| v2 format compliance | Partial | Update obot-entraid agents |
| GitHub workflows | Inconsistent | Standardize patterns |
| Cross-references | None | Add monorepo integration sections |

---

## Current State Analysis

### 1. CLAUDE.md Documentation Status

| Project | Has CLAUDE.md | Lines | Quality Assessment |
| --------- | -------------- | ------- | ------------------ |
| obot-entraid | ✅ | ~150 | Comprehensive: tech stack, commands, architecture, MCP types |
| obot-tools | ✅ | ~364 | Comprehensive: GPTScript patterns, component org, auth providers |
| nah | ✅ | ~337 | Comprehensive: router patterns, apply semantics, CI pipeline |
| mcp-oauth-proxy | ✅ | ~203 | Comprehensive: OAuth flow, PKCE, database schema |
| mcp-catalog | ✅ | ~206 | Comprehensive: YAML schema, test automation, security scanning |
| namegenerator | ✅ | ~236 | Comprehensive: thread safety, API surface, performance |
| **kinm** | ❌ | 18 (README) | **Gap**: Only basic README, no CLAUDE.md |

### 2. .claude/ Directory Structure

| Project | .claude/ | agents/ | commands/ | settings |
| --------- | ---------- | ---------- | ----------- | ---------- |
| obot-entraid | ✅ | 2 agents | 3 commands | ✅ settings.local.json |
| obot-tools | ❌ | - | - | - |
| nah | ❌ | - | - | - |
| mcp-oauth-proxy | ❌ | - | - | - |
| mcp-catalog | ❌ | - | - | - |
| namegenerator | ❌ | - | - | - |
| kinm | ❌ | - | - | - |

#### obot-entraid Agent Details

**auth-provider-dev.md**

```yaml
---
name: auth-provider-dev
description: Develop and debug Obot authentication providers
tools: Bash, Read, Grep, Glob, Edit, Write
model: sonnet
---
```

- **Gap**: Missing `allowedMcpServers` for Serena integration
- **Content**: Comprehensive auth provider development workflow

**upstream-merge.md**

```yaml
---
name: upstream-merge
description: Merge upstream obot-platform/obot changes
tools: Bash, Read, Grep, Glob, Edit, Write
model: sonnet
---
```

- **Gap**: Missing `allowedMcpServers` for Serena integration
- **Content**: Detailed merge conflict resolution workflow

### 3. GitHub Workflows Comparison

#### Pattern A: Monorepo Custom Prompt Approach

**Location**: `AI/.github/workflows/`

| Workflow | Model | Auth | Features |
| --------- | ---------- | ---------- | ---------- |
| claude-review.yml | claude-sonnet-4-20250514 | anthropic_api_key | Custom prompt, severity-based, @claude mentions |
| claude-triage.yml | claude-haiku-3-20250514 | anthropic_api_key | Project identification, label suggestions |

**Key characteristics**:

- Uses `anthropic_api_key` secret
- Specifies model explicitly (`model: claude-sonnet-4-20250514`)
- Custom prompts tailored to monorepo context
- Supports @claude mentions in comments
- Allowed tools restricted for safety

#### Pattern B: Project Plugin-Based Approach

**Location**: `{project}/.github/workflows/claude-code-review.yml`

| Project | Has Workflow | Pattern |
| --------- | ------------- | --------- |
| obot-entraid | ✅ | Plugin-based |
| nah | ✅ | Plugin-based |
| kinm | ✅ | Plugin-based |
| obot-tools | ❌ | - |
| mcp-catalog | ❌ | - |
| mcp-oauth-proxy | ❌ | - |
| namegenerator | ❌ | - |

**Configuration**:

```yaml
uses: anthropics/claude-code-action@1b8ee3b94104046d71fde52ec3557651ad8c0d71
with:
  claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
  plugin_marketplaces: "https://github.com/anthropics/claude-code.git"
  plugins: "code-review@claude-code-plugins"
  prompt: "/code-review:code-review ${{ github.repository }}/pull/${{ github.event.pull_request.number }}"
```

**Key characteristics**:

- Uses `claude_code_oauth_token` secret
- Delegates to code-review plugin
- No explicit model selection (uses plugin default)
- Pinned action version for stability

### 4. Serena Memories Distribution

| Project | Count | Key Memories |
| --------- | ------- | -------------- |
| obot-entraid | 15 | suggested_commands, authentication_flow, mcp_types, storage_layer |
| obot-tools | 6 | gptscript_tool_format, suggested_commands, auth_providers |
| nah | 9 | project_purpose, router_patterns, apply_semantics |
| kinm | 6 | project_purpose, api_server_patterns, storage_backend |
| mcp-catalog | 8 | mcp_catalog_schema, cicd_workflows, security_scanning |
| mcp-oauth-proxy | 6 | oauth_flow, token_management, database_schema |
| namegenerator | 5 | project_purpose, api_surface, thread_safety |

---

## Gap Analysis

### Critical Gaps

#### 1. Missing kinm/CLAUDE.md

**Current state**: Only 18-line README.md exists

```markdown
# Kinm is not Mink

Kinm (pronounced "kim", like the name)
...
```

**Required**: Comprehensive CLAUDE.md following established patterns:

- Project overview and purpose
- Essential commands (build, test, lint)
- Architecture overview
- Code style conventions
- Common patterns

#### 2. obot-entraid Agents Not v2 Compliant

**Current format**:

```yaml
---
name: agent-name
description: Description
tools: Bash, Read, Grep, Glob, Edit, Write
model: sonnet
---
```

**Required v2 format**:

```yaml
---
name: agent-name
description: Description
tools: Bash, Read, Grep, Glob, Edit, Write
model: sonnet
allowedMcpServers: plugin:serena:serena, plugin:context7:context7
---
```

### Moderate Gaps

#### 3. No Cross-References to Monorepo Enhancements

None of the project CLAUDE.md files reference:

- Monorepo-level `.claude/` commands and agents
- Shared Serena memories at `AI/.serena/memories/`
- SuperClaude skills available via `/sc:*`
- Monorepo-level GitHub Actions

#### 4. Inconsistent GitHub Workflow Patterns

| Aspect | Monorepo | Projects |
| -------- | ---------- | ---------- |
| Auth method | API key | OAuth token |
| Model selection | Explicit | Plugin default |
| Prompt style | Custom | Plugin-delegated |
| Features | @claude mentions, triage | Review only |

#### 5. Projects Without Claude Workflows

- obot-tools
- mcp-catalog
- mcp-oauth-proxy
- namegenerator

### Opportunity Gaps

#### 6. Project-Specific Agents

Potential high-value agents not yet created:

| Project | Suggested Agent | Purpose |
| --------- | ----------------- | --------- |
| mcp-catalog | catalog-validator | Validate YAML entries against schema |
| obot-tools | gptscript-developer | GPTScript tool development workflow |
| mcp-oauth-proxy | oauth-debugger | Debug OAuth flows and token issues |
| nah | controller-developer | Kubernetes controller development |

#### 7. Project-Specific Skills

No projects have their own `/skills/` directories. Opportunities:

- `mcp-catalog`: Schema validation skill
- `obot-tools`: Tool testing skill
- `kinm`: API resource debugging skill

---

## Implementation Recommendations

### Priority 1: Critical (Immediate)

#### 1.1 Create kinm/CLAUDE.md

**File**: `kinm/CLAUDE.md`

**Template structure**:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**kinm** (Kubernetes-like API server) provides an efficient, scalable API server
that performs CRUD operations with Watch capabilities, backed by PostgreSQL.

- **Module**: `github.com/obot-platform/kinm`
- **Go Version**: [version from go.mod]
- **Key Dependency**: PostgreSQL with efficient SQL-based state management

## Essential Commands

### Building
[Extract from Makefile or standard Go commands]

### Testing
[Extract from Makefile or standard Go commands]

### Linting
[Extract from Makefile or standard Go commands]

## Architecture

[Document key components, data flow, design decisions]

## Code Conventions

[Document naming, formatting, error handling patterns]
```

**Effort**: ~2 hours
**Dependencies**: None

#### 1.2 Update obot-entraid Agents to v2 Format

**Files to update**:

- `obot-entraid/.claude/agents/auth-provider-dev.md`
- `obot-entraid/.claude/agents/upstream-merge.md`

**Changes required**:

```yaml
# Add after model: line
allowedMcpServers: plugin:serena:serena, plugin:context7:context7
```

**Effort**: 15 minutes
**Dependencies**: None

### Priority 2: High (This Sprint)

#### 2.1 Add Monorepo Integration Section to Project CLAUDE.md Files

**Add to each project CLAUDE.md**:

```markdown
## Monorepo Integration

This project is part of the AI monorepo. Additional resources:

- **Claude Code commands**: `AI/.claude/commands/` (expert-mode, etc.)
- **Shared agents**: `AI/.claude/agents/` (explore, security-audit, etc.)
- **SuperClaude skills**: `/sc:analyze`, `/sc:test`, `/sc:git`, etc.
- **Serena memories**: `AI/.serena/memories/` (task_completion_checklist, etc.)
- **GitHub Actions**: Monorepo-level PR review and issue triage

For session initialization with full context, run `/expert-mode` from the monorepo root.
```

**Effort**: 30 minutes per project (3.5 hours total)
**Dependencies**: None

#### 2.2 Standardize GitHub Workflow Approach

**Decision required**: Choose between:

| Option | Pros | Cons |
| -------- | ------ | ------ |
| A: Custom prompts | Full control, model selection, project-specific rules | More maintenance |
| B: Plugin-based | Standardized, less maintenance | Less customization |
| C: Hybrid | Project reviews use plugin, monorepo adds triage | Complexity |

**Recommendation**: Option C (Hybrid)

- Keep project-level plugin-based reviews
- Add monorepo-level triage and @claude mention support
- Standardize on OAuth token auth for consistency

**Effort**: 2-4 hours
**Dependencies**: GitHub secrets configuration

### Priority 3: Medium (Next Sprint)

#### 3.1 Create Project-Specific Agents

**Recommended agents**:

| Agent | Project | Model | Purpose |
| ------- | --------- | ------- | --------- |
| catalog-validator | mcp-catalog | haiku | Validate YAML against schema |
| gptscript-developer | obot-tools | sonnet | GPTScript development workflow |
| oauth-debugger | mcp-oauth-proxy | sonnet | Debug OAuth flows |

**Template**:

```yaml
---
name: catalog-validator
description: Validate MCP catalog YAML entries against schema and security requirements
tools: Bash, Read, Grep, Glob
model: haiku
allowedMcpServers: plugin:serena:serena
---

# Catalog Validator Agent

## Purpose
Validate MCP server catalog entries for schema compliance and security.

## Workflow
1. Read the YAML file
2. Check required fields (name, shortDescription, description, icon, repoURL, runtime)
3. Validate runtime config matches runtime type
4. Check for security issues (exposed secrets, unsafe operations)
5. Report findings with severity levels
```

**Effort**: 1-2 hours per agent
**Dependencies**: Priority 1 completion

#### 3.2 Add Claude Workflows to Projects Without Them

**Projects needing workflows**:

- obot-tools
- mcp-catalog
- mcp-oauth-proxy
- namegenerator

**Standard workflow template**:

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize, ready_for_review, reopened]

jobs:
  claude-review:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    permissions:
      contents: read
      pull-requests: read
      issues: read
      id-token: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - name: Run Claude Code Review
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          plugin_marketplaces: "https://github.com/anthropics/claude-code.git"
          plugins: "code-review@claude-code-plugins"
          prompt: "/code-review:code-review ${{ github.repository }}/pull/${{ github.event.pull_request.number }}"
```

**Effort**: 30 minutes per project
**Dependencies**: CLAUDE_CODE_OAUTH_TOKEN secret

### Priority 4: Low (Future)

#### 4.1 Create Project-Specific Skills

Consider creating skills for frequently-performed project operations:

- `mcp-catalog`: `/validate-catalog-entry`
- `obot-tools`: `/test-tool`
- `kinm`: `/debug-api-resource`

#### 4.2 Unified Documentation Navigation

Create a cross-project documentation index for discovering related documentation across projects.

---

## Implementation Checklist

### Phase 1: Critical Items (Week 1)

- [ ] **1.1** Create `kinm/CLAUDE.md`
  - [ ] Extract commands from Makefile/go.mod
  - [ ] Document architecture from code analysis
  - [ ] Add code conventions section
  - [ ] Add monorepo integration section

- [ ] **1.2** Update obot-entraid agents
  - [ ] Add `allowedMcpServers` to `auth-provider-dev.md`
  - [ ] Add `allowedMcpServers` to `upstream-merge.md`
  - [ ] Test agents work with Serena MCP

### Phase 2: High Priority Items (Week 2)

- [ ] **2.1** Add monorepo integration sections
  - [ ] obot-entraid/CLAUDE.md
  - [ ] obot-tools/CLAUDE.md
  - [ ] nah/CLAUDE.md
  - [ ] mcp-oauth-proxy/CLAUDE.md
  - [ ] mcp-catalog/CLAUDE.md
  - [ ] namegenerator/CLAUDE.md
  - [ ] kinm/CLAUDE.md (included in 1.1)

- [ ] **2.2** Standardize GitHub workflows
  - [ ] Document chosen approach
  - [ ] Update existing workflows if needed
  - [ ] Ensure secrets are configured

### Phase 3: Medium Priority Items (Week 3-4)

- [ ] **3.1** Create project-specific agents
  - [ ] mcp-catalog/catalog-validator
  - [ ] obot-tools/gptscript-developer
  - [ ] mcp-oauth-proxy/oauth-debugger

- [ ] **3.2** Add Claude workflows to remaining projects
  - [ ] obot-tools/.github/workflows/claude-code-review.yml
  - [ ] mcp-catalog/.github/workflows/claude-code-review.yml
  - [ ] mcp-oauth-proxy/.github/workflows/claude-code-review.yml
  - [ ] namegenerator/.github/workflows/claude-code-review.yml

### Phase 4: Future Items (Backlog)

- [ ] **4.1** Create project-specific skills
- [ ] **4.2** Create unified documentation index
- [ ] **4.3** Add project-specific rules

---

## Reference Materials

### Related Documentation

| Document | Location | Purpose |
| ---------- | ---------- | --------- |
| Claude Code v2 Guide | `.claude/instructions/claude-code-enhancements-guide-v2.md` | Comprehensive enhancement guide |
| AGENTS.md | `AI/AGENTS.md` | Universal project guidelines |
| Monorepo CLAUDE.md | `AI/CLAUDE.md` | Monorepo-level Claude guidance |
| Task Completion Checklist | `AI/.serena/memories/task_completion_checklist.md` | Pre-commit validation |

### Project CLAUDE.md Locations

| Project | Path |
| --------- | ------ |
| obot-entraid | `obot-entraid/CLAUDE.md` |
| obot-tools | `obot-tools/CLAUDE.md` |
| nah | `nah/CLAUDE.md` |
| mcp-oauth-proxy | `mcp-oauth-proxy/CLAUDE.md` |
| mcp-catalog | `mcp-catalog/CLAUDE.md` |
| namegenerator | `namegenerator/CLAUDE.md` |
| kinm | `kinm/CLAUDE.md` (TO BE CREATED) |

### GitHub Workflow Locations

| Location | Files |
| --------- | ------- |
| Monorepo | `AI/.github/workflows/claude-review.yml`, `claude-triage.yml` |
| obot-entraid | `obot-entraid/.github/workflows/claude-code-review.yml` |
| nah | `nah/.github/workflows/claude-code-review.yml` |
| kinm | `kinm/.github/workflows/claude-code-review.yml` |

---

## Appendix: Model Selection Reference

### Recommended Models by Use Case

| Use Case | Model | Rationale |
| --------- | ---------- | ----------- |
| PR Review | claude-sonnet-4-20250514 | Balance of quality and cost |
| Issue Triage | claude-haiku-3-20250514 | Fast, cost-effective |
| Complex Agents | sonnet | Quality for development tasks |
| Validation Agents | haiku | Speed for repetitive checks |
| Architecture Review | opus | Maximum quality for critical decisions |

### Model Configuration in Workflows

```yaml
# Explicit model selection (monorepo pattern)
with:
  model: claude-sonnet-4-20250514

# Plugin default (project pattern)
with:
  plugins: "code-review@claude-code-plugins"
  # Model determined by plugin
```

### Model Configuration in Agents

```yaml
---
name: agent-name
model: sonnet  # Options: opus, sonnet, haiku
---
```

---

*Document generated from systematic review of AI monorepo project documentation.*
