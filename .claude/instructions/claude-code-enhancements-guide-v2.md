# Claude Code Enhancements Implementation Guide v2

Comprehensive guide for implementing advanced Claude Code features in the AI/MCP monorepo. This version natively integrates the **Progressive Disclosure Pattern** throughout all components for optimal context efficiency.

---

## Table of Contents

1. [Overview](#overview)
2. [Progressive Disclosure Pattern](#progressive-disclosure-pattern)
3. [Memory Management](#1-memory-management)
   - [CLAUDE.md Imports](#a-claudemd-imports)
   - [Path-Specific Rules](#b-path-specific-rules)
   - [Memory Hierarchy](#c-memory-hierarchy)
4. [Hooks Automation](#2-hooks-automation)
5. [Custom Subagents](#3-custom-subagents)
6. [Custom Output Styles](#4-custom-output-styles)
7. [Skills Development](#5-skills-development)
   - [Progressive Disclosure for Skills](#a-progressive-disclosure-for-skills)
   - [Skill Directory Structure](#b-skill-directory-structure)
   - [SKILL.md Format](#c-skillmd-format)
   - [Recommended Skills](#d-recommended-skills)
   - [Security Considerations](#e-security-considerations)
   - [Common Pitfalls](#f-common-pitfalls)
8. [GitHub Actions Integration](#6-github-actions-integration)
9. [Plugin Development](#7-plugin-development)
10. [Implementation Checklist](#implementation-checklist)
11. [References](#references)

---

## Overview

### Current State

- AGENTS.md: Universal cross-agent guidelines (~2,500 tokens)
- CLAUDE.md: Claude-specific integration (~1,300 tokens)
- Serena MCP: Code intelligence with 8 memories
- Expert Mode: Optimized initialization command

### Core Philosophy: Progressive Disclosure

This guide is built on the **Progressive Disclosure Pattern** - a technique for managing AI context efficiently. Instead of loading all possible instructions upfront, content is loaded in three levels:

```text
Level 1: Metadata (~100 tokens per item)
    └── Name and brief description in system prompt
    └── Agent decides what might be relevant

Level 2: Full Instructions (loaded on-demand)
    └── Complete content with detailed instructions
    └── Only loaded when agent chooses to use it

Level 3: Resources (loaded on-demand)
    └── Reference files, scripts, documentation
    └── Only loaded when instructions reference them
```

This pattern applies to:

- **Skills**: Metadata → Instructions → Resources
- **Rules**: Glob patterns → Full rule content
- **Agents**: Agent list → Agent definition → Agent tools
- **Memories**: Memory list → Memory content

### Enhancement Opportunities

| Category | Current | Enhanced |
| -------- | ------- | -------- |
| Memory | Single CLAUDE.md | Imports + path-specific rules |
| Automation | Manual validation | Hooks for auto-formatting |
| Agents | Built-in only | Custom domain-specific agents |
| CI/CD | No Claude integration | GitHub Actions PR review |
| Skills | Basic structure | Three-level progressive disclosure |

### Priority Matrix

| Priority | Enhancement | Effort | Impact | Tokens |
| -------- | ----------- | ------ | ------ | ------ |
| P0 | Progressive disclosure skills | Medium | Very High | Minimal |
| P0 | Path-specific rules | Low | High | Minimal |
| P0 | Auto-format hooks | Low | High | None |
| P1 | Pre-commit agent | Medium | High | ~200 |
| P1 | Go-reviewer agent | Medium | Medium | ~300 |
| P2 | GitHub Actions | Medium | High | None |
| P2 | Custom skills | Medium | Medium | Variable |
| P3 | Output styles | Low | Low | ~100 |
| P3 | Plugin packaging | High | Medium | None |

---

## Progressive Disclosure Pattern

### The Foundation

Progressive disclosure is the **key innovation** that enables scalable AI assistance without context window constraints. This pattern is inspired by successful implementations in proprietary systems but adapted for open, framework-agnostic use.

### The Three Levels

```text
┌─────────────────────────────────────────────────────────────────┐
│ LEVEL 1: METADATA (Always Loaded)                               │
│ ─────────────────────────────────                               │
│ • ~100 tokens per skill/rule/agent                              │
│ • Name + brief description only                                 │
│ • Agent uses this to decide relevance                           │
│ • Example: "weather: Get weather for locations"                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Agent decides to use)
┌─────────────────────────────────────────────────────────────────┐
│ LEVEL 2: FULL INSTRUCTIONS (Loaded On-Demand)                   │
│ ─────────────────────────────────────────────                   │
│ • ~500-2000 tokens per skill                                    │
│ • Complete SKILL.md / rule content                              │
│ • Detailed instructions, steps, examples                        │
│ • Loaded via tool call when agent chooses skill                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Instructions reference resource)
┌─────────────────────────────────────────────────────────────────┐
│ LEVEL 3: RESOURCES (Loaded On-Demand)                           │
│ ─────────────────────────────────────                           │
│ • Potentially thousands of tokens                               │
│ • Reference files, API docs, scripts                            │
│ • Only loaded when explicitly needed                            │
│ • Example: security_checklist.md (~24KB)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Matters

**Without Progressive Disclosure:**

- 10 skills × 2000 tokens = 20,000 tokens consumed
- Limited skill capacity
- Slow response times
- Context window pressure

**With Progressive Disclosure:**

- 10 skills × 100 tokens = 1,000 tokens (Level 1)
- Only used skills loaded (Level 2)
- Only referenced resources loaded (Level 3)
- Scales to 100+ skills with minimal impact

### Applying the Pattern

| Component | Level 1 | Level 2 | Level 3 |
| --------- | ------- | ------- | ------- |
| Skills | name + description | SKILL.md body | references/, scripts/ |
| Rules | glob pattern + description | Rule content | N/A |
| Agents | agent name + description | Agent definition | Agent-specific tools |
| Memories | memory name | Memory content | N/A |

---

## 1. Memory Management

### A. CLAUDE.md Imports

The `@path/to/file` syntax allows modular instruction loading, implementing **Level 2 progressive disclosure** for instructions.

#### Syntax

```markdown
# CLAUDE.md

Core instructions here...

@.claude/instructions/context-optimization-guide.md
@.claude/instructions/gptscript-development-guide.md
```

#### Import Rules

- Paths are relative to repository root
- Imports are processed recursively (imports can import)
- Circular imports are detected and prevented
- Missing files generate warnings, not errors

#### Recommended Import Structure

```text
CLAUDE.md (Level 1: ~50 lines, always loaded)
├── @.claude/instructions/context-optimization-guide.md (Level 2: loaded on reference)
├── @.claude/instructions/documentation-standards.md (Level 2)
└── @.claude/instructions/gptscript-development-guide.md (Level 2: conditional)
```

#### Implementation

**Refactored CLAUDE.md:**

~~~~~markdown
# CLAUDE.md

Claude Code-specific guidance. See `AGENTS.md` for universal guidelines.

## Serena MCP Integration

Activate before working:
```text
mcp__plugin_serena_serena__activate_project with project: "AI"
```

## Context Loading

@.claude/instructions/context-optimization-guide.md

## Project-Specific (Load On-Demand)

When working on GPTScript tools:
@.claude/instructions/gptscript-development-guide.md
~~~~~

#### Token Impact

- Before: ~1,300 tokens (full CLAUDE.md)
- After: ~400 tokens base + imports as needed
- Savings: Up to 70% reduction in base load

---

### B. Path-Specific Rules

Rules in `.claude/rules/*.md` implement **automatic Level 2 loading** based on file glob patterns.

#### Directory Structure

```text
.claude/
└── rules/
    ├── go-tests.md          # *_test.go files
    ├── gptscript.md         # *.gpt files
    ├── svelte-components.md # *.svelte files
    ├── kubernetes.md        # pkg/controller/** files
    └── sql-migrations.md    # **/migrations/*.sql files
```

#### Rule Format

```markdown
---
globs: ["pattern1", "pattern2"]
alwaysApply: false
description: Brief description for discovery (Level 1)
---

# Rule Title

Rule content with specific guidance... (Level 2)
```

#### Frontmatter Options

| Field | Type | Description |
| ----- | ---- | ----------- |
| `globs` | string[] | File patterns to match (required) |
| `alwaysApply` | boolean | If true, applies to all files (default: false) |
| `description` | string | Level 1 metadata for rule discovery |

#### Recommended Rules

**1. Go Tests** (`.claude/rules/go-tests.md`)

~~~~~markdown
---
globs: ["**/*_test.go"]
description: Go test file conventions - table-driven tests, subtests, race detection
---

# Go Test Conventions

## Required Patterns

1. **Table-Driven Tests**: Always use table-driven tests for multiple cases
   ```go
   tests := []struct {
       name    string
       input   Type
       want    Type
       wantErr bool
   }{...}
   ```

1. **Subtests**: Use `t.Run()` for each test case
   ```go
   for _, tt := range tests {
       t.Run(tt.name, func(t *testing.T) {...})
   }
   ```

2. **Test Naming**: `TestFunctionName_Scenario`

3. **Race Detection**: Consider `go test -race` for concurrent code

## Anti-Patterns

- Never use `t.Fatal()` in goroutines (use `t.Error()`)
- Never skip error checks in test setup
- Never hardcode test data paths (use `testdata/` directory)
~~~~~

**2. GPTScript** (`.claude/rules/gptscript.md`)

~~~~~markdown
---
globs: ["**/*.gpt", "**/tool.gpt"]
description: GPTScript tool definition format - required fields, credentials, context sharing
---

# GPTScript Tool Format

## Required Fields

Every .gpt file MUST have:
- `Name:` - Tool identifier (PascalCase)
- `Description:` - What the tool does
- `Tools:` - Dependencies (built-in or external)

## Optional Fields

- `Credential:` - OAuth credential reference
- `Share Context:` - Context sharing with sub-tools
- `Param:` - Input parameters
- `Args:` - Positional arguments

## Template

```gpt
Name: MyTool
Description: Brief description of functionality
Credential: github.com/obot-platform/tools/oauth-credential as oauth
Share Context: github.com/obot-platform/tools/shared-context
Tools: sys.http.html2text, sys.download

#!{LANG}

Implementation code here...
```

## Common Mistakes

- Missing `Name:` field (tool won't register)
- Wrong credential format (OAuth will fail)
- Missing `Tools:` for HTTP operations
~~~~~

**3. Svelte Components** (`.claude/rules/svelte-components.md`)

~~~~~markdown
---
globs: ["**/ui/**/*.svelte", "**/ui/**/*.ts"]
description: SvelteKit component conventions - Svelte 5 runes, component structure
---

# SvelteKit Conventions (obot-entraid)

## Component Structure

```svelte
<script lang="ts">
  // 1. Imports
  import { Component } from '$lib/components';

  // 2. Props (Svelte 5 runes)
  let { prop1, prop2 = 'default' } = $props<{
    prop1: string;
    prop2?: string;
  }>();

  // 3. State
  let state = $state(initialValue);

  // 4. Derived
  let derived = $derived(computation);

  // 5. Effects
  $effect(() => { ... });
</script>

<!-- Template -->
<div class="...">
  ...
</div>

<style>
  /* Scoped styles (prefer Tailwind) */
</style>
```

## File Organization

- `+page.svelte` - Route pages
- `+layout.svelte` - Layout wrappers
- `$lib/components/` - Reusable components
- `$lib/stores/` - Shared state
~~~~~

**4. Kubernetes Controllers** (`.claude/rules/kubernetes.md`)

~~~~~markdown
---
globs: ["**/pkg/controller/**", "**/pkg/reconciler/**"]
description: Kubernetes controller patterns - reconciliation, error handling, status updates
---

# Kubernetes Controller Patterns

## Reconciliation Loop

```go
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
    // 1. Fetch the resource
    obj := &v1.MyResource{}
    if err := r.Get(ctx, req.NamespacedName, obj); err != nil {
        return ctrl.Result{}, client.IgnoreNotFound(err)
    }

    // 2. Check deletion
    if !obj.DeletionTimestamp.IsZero() {
        return r.handleDeletion(ctx, obj)
    }

    // 3. Add finalizer
    if !controllerutil.ContainsFinalizer(obj, finalizerName) {
        controllerutil.AddFinalizer(obj, finalizerName)
        return ctrl.Result{}, r.Update(ctx, obj)
    }

    // 4. Reconcile logic
    return r.reconcile(ctx, obj)
}
```

## Error Handling

- Return `ctrl.Result{}, err` for retryable errors
- Return `ctrl.Result{Requeue: true}` for explicit requeue
- Return `ctrl.Result{RequeueAfter: duration}` for delayed retry
- Return `ctrl.Result{}, nil` for success (no requeue)

## nah Framework

For nah-based controllers, use the Router/Backend/Apply pattern:
- Router: Orchestrates handlers
- Backend: Abstracts Kubernetes API
- Apply: Declarative resource management
~~~~~

**5. SQL Migrations** (`.claude/rules/sql-migrations.md`)

~~~~~markdown
---
globs: ["**/migrations/*.sql", "**/schema/*.sql"]
description: Database migration conventions - naming, structure, PostgreSQL patterns
---

# SQL Migration Conventions

## Naming

Format: `YYYYMMDDHHMMSS_description.sql`
Example: `20260115143000_add_user_tokens_table.sql`

## Structure

```sql
-- Up migration
CREATE TABLE IF NOT EXISTS table_name (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column);

-- Down migration (in separate file or comment block)
-- DROP TABLE IF EXISTS table_name;
```

## Best Practices

1. Always use `IF NOT EXISTS` / `IF EXISTS`
2. Add indexes for foreign keys and frequently queried columns
3. Use `TIMESTAMP WITH TIME ZONE` for timestamps
4. Include both up and down migrations
5. Test migrations on a copy of production data

## PostgreSQL Specifics

- Use `BIGSERIAL` for auto-increment IDs
- Use `JSONB` for JSON data (not `JSON`)
- Use `TEXT` instead of `VARCHAR` (no length limit in PG)
~~~~~

---

### C. Memory Hierarchy

Claude Code follows a strict precedence order implementing cascading progressive disclosure:

```text
1. Enterprise Policy (highest priority)
   └── Managed by organization admins

2. Project Memory (CLAUDE.md)
   └── Repository root, auto-loaded (Level 1)

3. Project Rules (.claude/rules/*.md)
   └── Path-specific, auto-activated (Level 2)

4. User Memory (~/.claude/CLAUDE.md)
   └── Personal preferences

5. Local Project Overrides
   └── .claude/settings.local.json
```

#### Conflict Resolution

When instructions conflict:

1. Higher priority wins
2. More specific globs win over general
3. Later rules in same file win

---

## 2. Hooks Automation

Hooks are shell commands that execute at specific lifecycle events, enabling automation without consuming context.

### Available Hook Events

| Event | Trigger | Use Cases |
| ----- | ------- | --------- |
| `PreToolUse` | Before tool execution | Block dangerous commands, validate inputs |
| `PostToolUse` | After tool execution | Auto-format, log changes, notifications |
| `Notification` | When Claude wants to notify | Desktop alerts, sound, integrations |
| `Stop` | End of response turn | Summarize changes, remind about commits |
| `SubagentStop` | Subagent completes | Aggregate results, chain tasks |
| `PreCompact` | Before context compaction | Save important context |
| `SessionStart` | New session begins | Load context, check prerequisites |
| `SessionEnd` | Session terminates | Cleanup, save state |

### Hooks Configuration

**Location:** `~/.claude/settings.json` (user) or `.claude/settings.json` (project)

**Schema:**

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "regex pattern for tool name",
        "hooks": [
          {
            "type": "command",
            "command": "shell command to execute"
          }
        ]
      }
    ]
  }
}
```

### Environment Variables in Hooks

| Variable | Description | Available In |
| -------- | ----------- | ------------ |
| `$CLAUDE_TOOL_NAME` | Current tool being used | PreToolUse, PostToolUse |
| `$CLAUDE_FILE_PATH` | File being operated on | Write, Edit, Read tools |
| `$CLAUDE_WORKING_DIRECTORY` | Current working directory | All events |
| `$CLAUDE_SESSION_ID` | Current session identifier | All events |

### Recommended Hooks for AI/MCP Monorepo

**Complete Configuration** (`.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"$CLAUDE_TOOL_INPUT\" | grep -qE '(rm -rf /|git push.*--force.*main|git push.*--force.*master|DROP DATABASE|TRUNCATE)' && echo 'BLOCKED: Dangerous command detected' && exit 1 || exit 0"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$CLAUDE_FILE_PATH\" == *.go ]] && command -v gofmt &>/dev/null; then gofmt -w \"$CLAUDE_FILE_PATH\" 2>/dev/null; fi"
          }
        ]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"$(date '+%Y-%m-%d %H:%M:%S') | $CLAUDE_TOOL_NAME | $CLAUDE_FILE_PATH\" >> ~/.claude/file-changes.log"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd \"$CLAUDE_WORKING_DIRECTORY\" && if git rev-parse --git-dir > /dev/null 2>&1; then CHANGES=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' '); if [ \"$CHANGES\" -gt 0 ]; then echo \"\\n📝 $CHANGES uncommitted change(s). Run 'make validate-ci' before committing.\"; fi; fi"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo \"Session started: $(date '+%Y-%m-%d %H:%M:%S') in $CLAUDE_WORKING_DIRECTORY\" >> ~/.claude/sessions.log"
          }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "command -v osascript &>/dev/null && osascript -e 'display notification \"$CLAUDE_NOTIFICATION\" with title \"Claude Code\"' || true"
          }
        ]
      }
    ]
  }
}
```

### Hook Behavior

**Exit Codes:**

- `0`: Success, continue execution
- Non-zero: For `PreToolUse`, blocks the operation
- Non-zero: For other events, logs warning but continues

**Output:**

- stdout: Displayed to user
- stderr: Logged as warning

**Timeout:**

- Default: 60 seconds
- Configurable per hook

---

## 3. Custom Subagents

Subagents are specialized AI assistants implementing **agent-level progressive disclosure** - the agent definition (Level 2) is loaded only when invoked.

### Agent Configuration

**Location:** `.claude/agents/agent-name.md`

**Frontmatter Schema:**

```yaml
---
name: agent-name              # Required: identifier (Level 1)
description: What this agent does  # Required: shown in /agents list (Level 1)
tools:                        # Optional: tool allowlist
  - Read
  - Glob
  - Grep
model: sonnet                 # Optional: sonnet, opus, haiku
allowedMcpServers:           # Optional: MCP server restrictions
  - serena
permissionMode: default       # Optional: default, strict, permissive
skills:                       # Optional: skill files to load
  - validate-project
hooks:                        # Optional: agent-specific hooks
  PreToolUse: [...]
---

Agent instructions here... (Level 2)
```

### Recommended Agents

**1. Go Code Reviewer** (`.claude/agents/go-reviewer.md`)

```markdown
---
name: go-reviewer
description: Reviews Go code for patterns, errors, and best practices in AI/MCP monorepo
tools:
  - Read
  - Glob
  - Grep
  - Task
model: sonnet
---

# Go Code Reviewer

You are a specialized Go code reviewer for the AI/MCP monorepo.

## Review Checklist

### Error Handling
- [ ] All errors are wrapped with context: `fmt.Errorf("action failed: %w", err)`
- [ ] No naked `return err` statements
- [ ] Errors at API boundaries have appropriate status codes

### Interface Design
- [ ] Interfaces are small and focused (1-3 methods ideal)
- [ ] Interface defined where used, not where implemented
- [ ] No "god interfaces" with many unrelated methods

### Concurrency
- [ ] Proper use of context.Context for cancellation
- [ ] No goroutine leaks (all goroutines have exit conditions)
- [ ] Mutex usage is minimal and documented
- [ ] Race conditions considered (check with `go test -race`)

### Testing
- [ ] Table-driven tests for multiple cases
- [ ] Edge cases covered (nil, empty, error conditions)
- [ ] No testing.T in goroutines (use testing.T.Run)

### Project-Specific Patterns

**nah controllers:**
- Router/Backend/Apply pattern followed
- Reconciliation is idempotent
- Status updates use `r.Status().Update()`

**mcp-oauth-proxy:**
- Tokens encrypted with AES-256-GCM
- PKCE flow implemented for public clients
- JWT validation includes all required claims

**obot-tools:**
- tool.gpt has required fields (Name, Description, Tools)
- Credentials properly declared
- Error responses are user-friendly

## Output Format

```markdown
## Review Summary

**Files Reviewed:** N
**Issues Found:** N (Critical: N, Warning: N, Info: N)

### Critical Issues
- file.go:123 - Description of issue
  - Suggested fix: ...

### Warnings
- ...

### Suggestions
- ...

### Positive Observations
- ...
```

**2. Pre-Commit Validator** (`.claude/agents/pre-commit.md`)

```markdown
---
name: pre-commit
description: Runs full pre-commit validation for current project, reports issues
tools:
  - Bash
  - Read
  - Glob
model: haiku
---

# Pre-Commit Validator

Validate the current project before committing changes.

## Detection

First, identify the project type:
1. Check for `go.mod` → Go project
2. Check for `package.json` in ui/ → Also has frontend
3. Check current directory name for project identification

## Validation Steps

### Go Projects

Execute in order, stop on first failure:

```bash
# 1. Generate code (if applicable)
if grep -q "go:generate" **/*.go 2>/dev/null; then
    go generate ./...
fi

# 2. Tidy dependencies
go mod tidy

# 3. Format code
go fmt ./...

# 4. Lint
if [ -f .golangci.yml ] || [ -f .golangci.yaml ]; then
    golangci-lint run
fi

# 5. Vet
go vet ./...

# 6. Test
go test -short ./...

# 7. Check for dirty repo (generated files)
if [ -n "$(git status --porcelain)" ]; then
    echo "ERROR: Uncommitted changes after generate/tidy"
    git status --short
    exit 1
fi
```

### Frontend (obot-entraid/ui/user)

```bash
cd ui/user
pnpm run ci  # Runs lint, format check, type check, test
```

## Output Format

```text
✅ Pre-commit validation PASSED

Steps completed:
1. ✓ go generate
2. ✓ go mod tidy
3. ✓ go fmt
4. ✓ golangci-lint
5. ✓ go vet
6. ✓ go test -short
7. ✓ Clean working directory

Ready to commit!
```

Or on failure:

```text
❌ Pre-commit validation FAILED

Step 4 (golangci-lint) failed:
  pkg/router/handler.go:45:12: error message here

Fix the issues and run validation again.
```

**3. GPTScript Validator** (`.claude/agents/gptscript-validator.md`)

```markdown
---
name: gptscript-validator
description: Validates GPTScript tool definitions for obot-tools
tools:
  - Read
  - Glob
  - Grep
model: haiku
---

# GPTScript Validator

Validate .gpt files in obot-tools for correctness.

## Required Fields Check

Every tool.gpt MUST have:
- `Name:` - Present and non-empty
- `Description:` - Present and descriptive (not just the name)
- `Tools:` - Present if tool makes HTTP calls or uses system features

## Credential Validation

If tool uses OAuth:
```gpt
Credential: github.com/obot-platform/tools/oauth-credential as oauth with PROVIDER as env and "scope1 scope2" as scope
```

Check:

- Provider matches directory name (google, microsoft, etc.)
- Scopes are appropriate for the tool's function
- Credential alias is used consistently in code

## Common Issues

1. **Missing Name field** - Tool won't register
2. **Missing Tools field** - HTTP calls will fail
3. **Wrong credential format** - OAuth will fail silently
4. **Inconsistent credential alias** - Runtime errors

## Output

```markdown
## GPTScript Validation Report

**Files Checked:** N
**Valid:** N
**Invalid:** N

### Issues Found

#### tool-name/tool.gpt
- Line 1: Missing `Name:` field
- Line 3: `Description:` is too short (< 10 chars)

### Warnings

#### other-tool/tool.gpt
- Uses `sys.http.html2text` but no error handling visible

### All Valid Tools
- provider-a/tool.gpt ✓
- provider-b/tool.gpt ✓
```

**4. Architecture Analyzer** (`.claude/agents/arch-analyzer.md`)

```markdown
---
name: arch-analyzer
description: Analyzes code architecture and suggests improvements
tools:
  - Read
  - Glob
  - Grep
  - Task
allowedMcpServers:
  - serena
model: sonnet
---

# Architecture Analyzer

Analyze codebase architecture using Serena MCP for deep code understanding.

## Analysis Areas

### 1. Dependency Graph
- Map package dependencies
- Identify circular dependencies
- Find unused dependencies

### 2. Interface Compliance
- Find interface implementations
- Check for interface segregation violations
- Identify missing interface abstractions

### 3. Pattern Conformance

**nah project:**
- Router correctly delegates to handlers
- Backend abstracts all K8s operations
- Apply manages declarative state

**mcp-oauth-proxy:**
- Clean separation: handlers → services → storage
- All storage behind interfaces
- Token operations are transactional

### 4. Code Metrics
- Function length (flag >50 lines)
- Parameter count (flag >5)
- Cyclomatic complexity (flag >10)

## Output

The agent produces a markdown report with the following structure:

    ## Architecture Analysis: {project}

    ### Summary
    - **Health Score:** 85/100
    - **Critical Issues:** 2
    - **Warnings:** 5

    ### Dependency Analysis
    (mermaid diagram showing package dependencies)

    ### Issues
    #### Critical
    1. **Circular Dependency:** pkg/a <-> pkg/b
       - Recommendation: Extract shared types to pkg/types

    #### Warnings
    1. **Large Function:** pkg/handler/auth.go:HandleLogin (87 lines)
       - Recommendation: Extract validation and token generation

    ### Positive Patterns
    - Clean interface boundaries in storage layer
    - Consistent error wrapping throughout

### Using Agents

**Invoke from CLI:**

```bash
# List available agents
claude /agents

# Run specific agent
claude "Review the changes in pkg/router" --agent go-reviewer

# Run in background
claude "Validate all .gpt files" --agent gptscript-validator --background
```

**Invoke from conversation:**

```text
Use the @go-reviewer agent to review my changes
```

---

## 4. Custom Output Styles

Output styles modify Claude's response format and communication style.

### Location

- User styles: `~/.claude/output-styles/`
- Project styles: `.claude/output-styles/`

### Style Format

```markdown
---
name: style-name
description: When to use this style
keep-coding-instructions: true
---

Instructions for how Claude should respond...
```

### Recommended Styles

**1. Minimal** (`.claude/output-styles/minimal.md`)

```markdown
---
name: minimal
description: Terse responses for experienced developers
keep-coding-instructions: true
---

# Minimal Output Style

Be extremely concise:
- No greetings or sign-offs
- No explanations unless asked
- Code over prose
- Show only relevant diffs
- One-line confirmations for simple tasks

Example response to "fix the typo":
```text
Fixed typo in pkg/router/handler.go:45
```

Not:

```text
I'll help you fix that typo. I found the issue in the router handler file...
[lengthy explanation]
The typo has been fixed. Let me know if you need anything else!
```

**2. Teaching** (`.claude/output-styles/teaching.md`)

```markdown
---
name: teaching
description: Educational mode explaining concepts and patterns
keep-coding-instructions: true
---

# Teaching Output Style

Optimize for learning:

1. **Explain the "why"** before showing code
2. **Show incorrect patterns** alongside correct ones
3. **Reference documentation** (link to CLAUDE.md, AGENTS.md)
4. **Use analogies** for complex concepts
5. **Summarize key takeaways** at the end

Structure responses as:
1. Concept explanation
2. Example in context
3. Common mistakes
4. Practice suggestions
```

**3. Debugging** (`.claude/output-styles/debugging.md`)

```markdown
---
name: debugging
description: Structured debugging assistance
keep-coding-instructions: true
---

# Debugging Output Style

Follow systematic debugging process:

## 1. Reproduce
- Confirm exact steps to reproduce
- Note environment details

## 2. Isolate
- Narrow down to specific component
- Identify last known good state

## 3. Analyze
- Form hypothesis
- Gather evidence (logs, state, traces)

## 4. Fix
- Make minimal change
- Verify fix doesn't introduce regressions

## 5. Prevent
- Add test case
- Document if non-obvious

Always structure debugging responses with these headers.
```

### Using Styles

```bash
# Set for session
claude --style minimal

# Set in config
claude config set preferredStyle minimal
```

---

## 5. Skills Development

Skills are the **primary implementation of progressive disclosure** in Claude Code. This section provides comprehensive guidance on building scalable, efficient skills.

### A. Progressive Disclosure for Skills

Skills implement all three levels of progressive disclosure:

```text
┌─────────────────────────────────────────────────────────────────┐
│ LEVEL 1: SKILL METADATA (In System Prompt)                      │
│ ─────────────────────────────────────────                       │
│ Extracted from YAML frontmatter, ~100 tokens per skill          │
│                                                                 │
│ Example in system prompt:                                       │
│ "Available Skills:                                              │
│  - weather: Get weather information for locations               │
│  - code_review: Review code for quality and security"           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Agent calls load_skill("weather")
┌─────────────────────────────────────────────────────────────────┐
│ LEVEL 2: FULL INSTRUCTIONS (SKILL.md Body)                      │
│ ─────────────────────────────────────────                       │
│ Complete instructions, ~500-2000 tokens                         │
│                                                                 │
│ Returns: Full SKILL.md content (without frontmatter)            │
│ - Detailed instructions                                         │
│ - Step-by-step procedures                                       │
│ - Resource references                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Instructions say "See references/api_reference.md"
┌─────────────────────────────────────────────────────────────────┐
│ LEVEL 3: RESOURCES (references/, scripts/, assets/)             │
│ ─────────────────────────────────────────                       │
│ Supporting files, potentially thousands of tokens               │
│                                                                 │
│ Agent calls read_skill_file("weather", "references/api.md")     │
│ Returns: Full content of the referenced file                    │
└─────────────────────────────────────────────────────────────────┘
```

#### Token Efficiency Example

**Code Review Skill:**

- Level 1 (always loaded): ~100 tokens
- Level 2 (loaded on use): ~800 tokens
- Level 3 resources:
  - `best_practices.md`: ~18KB
  - `security_checklist.md`: ~24KB
  - `common_antipatterns.md`: ~34KB

Without progressive disclosure: ~80,000 tokens consumed immediately
With progressive disclosure: 100 tokens (Level 1) + resources only when needed

---

### B. Skill Directory Structure

```text
.claude/skills/
└── skill-name/
    ├── SKILL.md              # YAML frontmatter + instructions
    ├── scripts/              # Optional: executable helpers
    │   ├── helper.py
    │   └── validator.sh
    ├── references/           # Optional: documentation (Level 3)
    │   ├── api_reference.md
    │   ├── best_practices.md
    │   └── security_checklist.md
    └── assets/               # Optional: templates, data files
        ├── template.txt
        └── config.yaml
```

#### Directory Purposes

| Directory | Purpose | When Loaded |
| --------- | ------- | ----------- |
| `SKILL.md` | Instructions and metadata | Level 1 (frontmatter) / Level 2 (body) |
| `scripts/` | Executable helpers | Level 3 (when executed) |
| `references/` | Documentation, guides | Level 3 (when referenced) |
| `assets/` | Templates, data files | Level 3 (when used) |

---

### C. SKILL.md Format

Every skill must have a `SKILL.md` with YAML frontmatter:

```markdown
---
# Level 1 metadata (extracted for system prompt)
name: skill-name
description: Brief description for agent discovery (1-2 sentences max)

# Optional metadata
version: 1.0.0
author: Your Name
tags: [category1, category2]
---

# Skill Name

Detailed description of what this skill does and its purpose.

## When to Use

- Scenario 1: Description
- Scenario 2: Description
- Scenario 3: Description

## Available Operations

1. **Operation 1**: Description of what this does
2. **Operation 2**: Description of what this does

## Instructions

Step-by-step instructions for using this skill:

1. First step
2. Second step
3. Third step

## Resources

Reference files available in this skill (Level 3 resources):

- `references/api_reference.md` - Detailed API documentation
- `references/best_practices.md` - Coding standards and patterns
- `scripts/validator.py` - Validation helper script

## Examples

### Example 1: Simple Use Case

**User asks:** "What's the weather in NYC?"

**Response approach:**
1. Load weather skill
2. Call weather API
3. Format response with temperature, conditions

### Example 2: Complex Use Case

**User asks:** "Compare weather in NYC and LA"

**Response approach:**
1. Load weather skill
2. Call weather API for both cities
3. Format comparison table

## Notes

- Limitation 1
- Consideration 2
- Edge case handling
```

#### Frontmatter Fields

| Field | Required | Description |
| ----- | -------- | ----------- |
| `name` | Yes | Unique identifier for the skill |
| `description` | Yes | 1-2 sentence description for Level 1 discovery |
| `version` | No | Semantic version (default: 1.0.0) |
| `author` | No | Skill author/maintainer |
| `tags` | No | Categorization tags |

---

### D. Recommended Skills

**1. Validate Project** (`.claude/skills/validate-project/SKILL.md`)

~~~~~markdown
---
name: validate-project
description: Run full CI validation for the current project directory
version: 1.0.0
author: AI Team
tags: [ci, validation, pre-commit]
---

# Validate Project

Run complete pre-commit validation for the current project.

## When to Use

- Before committing changes
- After major refactoring
- When CI is failing and you need to reproduce locally

## Available Operations

1. **Go Validation**: generate, tidy, fmt, lint, vet, test
2. **Frontend Validation**: lint, format, type-check, test
3. **Clean Check**: Verify no uncommitted changes from generation

## Instructions

### Step 1: Detect Project Type

Check for these indicators:
- `go.mod` → Go project
- `package.json` in `ui/` → Has frontend
- Directory name → Project identification

### Step 2: Go Validation (if applicable)

```bash
# 1. Generate code (if applicable)
if grep -q "go:generate" **/*.go 2>/dev/null; then
    go generate ./...
fi

# 2. Tidy dependencies
go mod tidy

# 3. Format code
go fmt ./...

# 4. Lint (if config exists)
if [ -f .golangci.yml ] || [ -f .golangci.yaml ]; then
    golangci-lint run
fi

# 5. Vet
go vet ./...

# 6. Test
go test -short ./...
```

### Step 3: Frontend Validation (if applicable)

```bash
cd ui/user
pnpm run ci
```

### Step 4: Clean Check

```bash
if [ -n "$(git status --porcelain)" ]; then
    echo "ERROR: Uncommitted changes after generate/tidy"
    git status --short
    exit 1
fi
```

## Resources

- `scripts/validate.sh` - Full validation script
- `references/ci-pipeline.md` - CI pipeline documentation

## Examples

### Example 1: Go Project

**User asks:** "Validate my changes before committing"

**Response:**
1. Detect go.mod → Go project
2. Run go generate, tidy, fmt, lint, vet, test
3. Check for uncommitted changes
4. Report status

## Notes

- Stop on first failure for faster feedback
- Always run clean check last to catch generated file changes
~~~~~

**2. Code Review** (`.claude/skills/code-review/SKILL.md`)

~~~~~markdown
---
name: code-review
description: Review code for quality, security, and best practices
version: 1.0.0
author: AI Team
tags: [review, security, quality]
---

# Code Review

Comprehensive code review covering quality, security, and best practices.

## When to Use

- Reviewing pull requests
- Pre-commit code quality check
- Security audit of new code
- Learning code review practices

## Available Operations

1. **Quality Review**: Code style, patterns, readability
2. **Security Review**: OWASP vulnerabilities, input validation
3. **Performance Review**: Efficiency, resource usage
4. **Full Review**: All of the above

## Instructions

### Step 1: Identify Files to Review

Determine scope:
- Single file: Direct review
- Multiple files: Prioritize by change size
- PR: Focus on changed files

### Step 2: Quality Review

Check against `references/best_practices.md`:
- Code organization
- Naming conventions
- Error handling
- Documentation

### Step 3: Security Review

Check against `references/security_checklist.md`:
- Input validation
- Authentication/Authorization
- Data exposure
- Injection vulnerabilities

### Step 4: Anti-Pattern Detection

Check against `references/common_antipatterns.md`:
- Code smells
- Design anti-patterns
- Language-specific issues

### Step 5: Generate Report

Format findings by severity:
- Critical: Must fix before merge
- Warning: Should fix, not blocking
- Info: Suggestions for improvement

## Resources

- `references/best_practices.md` - Coding standards (~18KB)
- `references/security_checklist.md` - OWASP-based checklist (~24KB)
- `references/common_antipatterns.md` - Anti-pattern catalog (~34KB)

## Examples

### Example 1: Security-Focused Review

**User asks:** "Review this authentication code for security issues"

**Response:**
1. Load skill instructions
2. Load `references/security_checklist.md`
3. Check against OWASP Top 10
4. Report findings with severity

## Notes

- Always load specific reference based on review type
- Don't load all references at once (token efficiency)
- Prioritize critical issues over style nits
~~~~~

**3. New Model Provider** (`.claude/skills/new-provider/SKILL.md`)

~~~~~markdown
---
name: new-provider
description: Scaffold a new model provider for obot-tools
version: 1.0.0
author: AI Team
tags: [scaffold, obot, provider]
---

# New Model Provider

Create a new model provider following established patterns.

## When to Use

- Adding support for a new LLM provider (Anthropic, Mistral, etc.)
- Creating a custom model provider
- Understanding model provider structure

## Available Operations

1. **Scaffold**: Create directory structure from template
2. **Configure**: Set up tool.gpt and credentials
3. **Implement**: Write provider-specific code
4. **Test**: Validate the implementation

## Instructions

### Step 1: Gather Information

Required:
- Provider name (e.g., "anthropic", "mistral")
- API base URL
- Authentication method (API key, OAuth)

### Step 2: Copy Template

```bash
cp -r obot-tools/openai-model-provider obot-tools/{name}-model-provider
```

### Step 3: Update tool.gpt

See `references/tool-gpt-template.md` for format:
- Change `Name:` to `{Name} Model Provider`
- Update `Description:`
- Update credential if different auth method

### Step 4: Update Go Code

- Rename package
- Update API endpoint
- Adjust request/response mapping if API differs

### Step 5: Update index.yaml

Add to `modelProviders:` section:
```yaml
- name: {name}-model-provider
  description: {Name} model provider for Obot
  path: ./{name}-model-provider
```

### Step 6: Test

```bash
cd obot-tools/{name}-model-provider
export OBOT_{NAME}_MODEL_PROVIDER_API_KEY=...
go run . validate
```

## Resources

- `references/tool-gpt-template.md` - GPTScript template
- `references/provider-patterns.md` - Common provider patterns
- `assets/provider-template/` - Copy-ready template files

## Examples

### Example: Anthropic Provider

**User asks:** "Create an Anthropic model provider"

**Response:**
1. Copy openai-model-provider
2. Update Name to "Anthropic Model Provider"
3. Update API endpoint to api.anthropic.com
4. Adjust message format for Claude API
5. Test with validate command

## Notes

- Most providers follow OpenAI-compatible format
- Check if provider has OpenAI-compatible endpoint first
- Environment variables follow pattern: `OBOT_{NAME}_MODEL_PROVIDER_*`
~~~~~

---

### E. Security Considerations

**CRITICAL**: Skills can read files from their directory. Implement proper security:

#### Path Traversal Prevention

```python
# WRONG - Vulnerable to path traversal
target_file = skill_path / file_path  # file_path could be "../../etc/passwd"

# CORRECT - Validate file is within skill directory
target_file = skill_path / file_path
if not target_file.resolve().is_relative_to(skill_path.resolve()):
    raise SecurityError("Access denied - file must be within skill directory")
```

#### File Access Rules

1. **Only allow access within skill directory**
2. **Validate all file paths before reading**
3. **Don't execute untrusted scripts**
4. **Sanitize user-provided paths**

#### Checklist

- [ ] All file paths validated against skill directory bounds
- [ ] No `..` path components allowed without validation
- [ ] Scripts in `scripts/` are reviewed and trusted
- [ ] No sensitive data in skill files (credentials, keys)

---

### F. Common Pitfalls

#### 1. Forgetting to Parse Frontmatter

```python
# ❌ WRONG - Returns frontmatter + body
def load_skill_wrong(skill_path: Path) -> str:
    return skill_path.read_text()

# ✅ CORRECT - Strip frontmatter, return only body
def load_skill_correct(skill_path: Path) -> str:
    content = skill_path.read_text()
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            return parts[2].strip()
    return content
```

#### 2. Loading All Resources Upfront

```python
# ❌ WRONG - Loads all resources immediately (wasteful)
def load_skill_wrong(skill_name: str) -> dict:
    return {
        "instructions": load_skill_md(skill_name),
        "best_practices": load_reference(skill_name, "best_practices.md"),
        "security": load_reference(skill_name, "security_checklist.md"),
        "antipatterns": load_reference(skill_name, "common_antipatterns.md"),
    }

# ✅ CORRECT - Load resources on-demand (Level 3)
def load_skill_correct(skill_name: str) -> str:
    return load_skill_md(skill_name)  # Level 2 only

def load_resource(skill_name: str, resource_path: str) -> str:
    return load_reference(skill_name, resource_path)  # Level 3 when needed
```

#### 3. Vague Skill Descriptions

```yaml
# ❌ WRONG - Too vague for agent to decide relevance
---
name: helper
description: Helps with stuff
---

# ✅ CORRECT - Specific enough for Level 1 discovery
---
name: code-review
description: Review code for quality, security issues, and best practices. Use when asked to review PRs, audit code, or check for vulnerabilities.
---
```

#### 4. Missing Resource Documentation

```markdown
# ❌ WRONG - No guidance on when to load resources
## Resources

- references/guide.md
- references/checklist.md

# ✅ CORRECT - Clear guidance on Level 3 loading
## Resources

Load these resources as needed:

- `references/best_practices.md` - Load for quality reviews
- `references/security_checklist.md` - Load for security audits
- `references/common_antipatterns.md` - Load for anti-pattern detection

**Note:** Only load the resource relevant to the current task to conserve tokens.
```

#### 5. Not Testing Skill Discovery

```bash
# Always verify skills are discovered correctly
claude /skills  # Should list your skill with correct description
```

---

## 6. GitHub Actions Integration

Automate Claude Code for PR reviews and issue triage.

### PR Review Workflow

**`.github/workflows/claude-review.yml`**

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]
  issue_comment:
    types: [created]

# Only run on @claude mentions in comments, or automatically on PRs
jobs:
  review:
    if: |
      github.event_name == 'pull_request' ||
      (github.event_name == 'issue_comment' &&
       github.event.issue.pull_request &&
       contains(github.event.comment.body, '@claude'))

    runs-on: ubuntu-latest

    permissions:
      contents: read
      pull-requests: write
      issues: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for better context

      - name: Claude Code Review
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}

          # Use cost-effective model for reviews
          model: claude-sonnet-4-20250514

          # Restrict to safe, read-only tools
          allowed_tools: |
            Read
            Glob
            Grep
            Task

          # Optional: Custom prompt
          prompt: |
            Review this PR focusing on:
            1. Code correctness and error handling
            2. Adherence to project patterns (see AGENTS.md)
            3. Test coverage for new code
            4. Security considerations

            Be concise. Only comment on significant issues.

          # Optional: Timeout (default 10 min)
          timeout_minutes: 15

      - name: Post Review Status
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const status = '${{ job.status }}' === 'success' ? '✅' : '❌';
            console.log(`Claude review ${status}`);
```

### Issue Triage Workflow

**`.github/workflows/claude-triage.yml`**

```yaml
name: Claude Issue Triage

on:
  issues:
    types: [opened]
  issue_comment:
    types: [created]

jobs:
  triage:
    # Only on new issues or @claude mentions
    if: |
      github.event_name == 'issues' ||
      contains(github.event.comment.body, '@claude')

    runs-on: ubuntu-latest

    permissions:
      contents: read
      issues: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Claude Triage
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          model: claude-haiku-3-20250514  # Fast, cost-effective

          allowed_tools: |
            Read
            Glob
            Grep

          prompt: |
            Analyze this issue and:
            1. Identify which project it relates to (obot-entraid, nah, kinm, etc.)
            2. Suggest relevant labels
            3. If it's a bug, identify likely affected files
            4. If it's a feature request, note any architectural considerations

            Keep response under 200 words.
```

### Configuration Notes

**Secrets Required:**

- `ANTHROPIC_API_KEY` - API key for Claude

**For Enterprise (Bedrock/Vertex):**

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    use_bedrock: true
    aws_region: us-east-1
    # Uses OIDC or AWS credentials from environment
```

**Tool Restrictions:**
For CI safety, restrict to read-only tools:

- `Read` - Read files
- `Glob` - Find files
- `Grep` - Search content
- `Task` - Spawn subagents (inherits restrictions)

Never allow in CI:

- `Write`, `Edit` - File modifications
- `Bash` - Arbitrary commands
- `WebFetch` - External requests

---

## 7. Plugin Development

Package enhancements as a reusable plugin for the organization.

### Plugin Structure

```text
.claude-plugin/
├── plugin.json          # Plugin manifest
├── agents/              # Custom agents
│   ├── go-reviewer.md
│   └── pre-commit.md
├── skills/              # Custom skills (with progressive disclosure)
│   ├── validate-project/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── scripts/
│   └── code-review/
│       ├── SKILL.md
│       └── references/
├── hooks/               # Hook configurations
│   └── hooks.json
├── rules/               # Path-specific rules
│   ├── go-tests.md
│   └── gptscript.md
└── output-styles/       # Custom styles
    └── minimal.md
```

### Plugin Manifest

**`.claude-plugin/plugin.json`**

```json
{
  "name": "ai-mcp-monorepo",
  "version": "2.0.0",
  "description": "Claude Code enhancements for AI/MCP monorepo with progressive disclosure",
  "author": "AI Team",
  "license": "MIT",

  "components": {
    "agents": [
      "agents/go-reviewer.md",
      "agents/pre-commit.md",
      "agents/gptscript-validator.md",
      "agents/arch-analyzer.md"
    ],
    "skills": [
      "skills/validate-project",
      "skills/code-review",
      "skills/new-provider",
      "skills/document-component"
    ],
    "rules": [
      "rules/go-tests.md",
      "rules/gptscript.md",
      "rules/svelte-components.md",
      "rules/kubernetes.md"
    ],
    "outputStyles": [
      "output-styles/minimal.md",
      "output-styles/teaching.md"
    ],
    "hooks": "hooks/hooks.json"
  },

  "mcpServers": {
    "serena": {
      "command": "serena",
      "args": ["--project", "${CLAUDE_PLUGIN_ROOT}/../"]
    }
  },

  "settings": {
    "preferredModel": "sonnet",
    "preferredStyle": "minimal"
  }
}
```

### Plugin Installation

```bash
# Install from directory
claude plugin install ./path/to/.claude-plugin

# Install from git
claude plugin install https://github.com/org/repo.git

# List installed plugins
claude plugin list

# Update plugin
claude plugin update ai-mcp-monorepo
```

### Environment Variables

Plugins can access:

- `${CLAUDE_PLUGIN_ROOT}` - Plugin installation directory
- `${CLAUDE_PROJECT_ROOT}` - Current project root
- `${CLAUDE_CONFIG_DIR}` - Claude config directory

---

## Implementation Checklist

### Phase 1: Foundation (P0)

- [ ] **Create `.claude/rules/` directory**
  - [ ] `go-tests.md` - Go test conventions
  - [ ] `gptscript.md` - GPTScript format rules

- [ ] **Configure hooks** in `.claude/settings.json`
  - [ ] PostToolUse: Auto-format Go files
  - [ ] PreToolUse: Block dangerous commands
  - [ ] Stop: Remind about uncommitted changes

- [ ] **Test configuration**

  ```bash
  # Test rule activation
  claude "review this test file" # while editing *_test.go

  # Test hooks
  claude "create a simple Go file"  # should auto-format
  ```

### Phase 2: Skills with Progressive Disclosure (P1)

- [ ] **Create `.claude/skills/` directory**
  - [ ] `validate-project/` - With references/
  - [ ] `code-review/` - With extensive Level 3 resources

- [ ] **Verify progressive disclosure**

  ```bash
  # Should show Level 1 metadata only
  claude /skills

  # Should load Level 2 + Level 3 as needed
  claude "review this code for security issues"
  ```

### Phase 3: Agents (P1)

- [ ] **Create `.claude/agents/` directory**
  - [ ] `pre-commit.md` - Validation agent
  - [ ] `go-reviewer.md` - Code review agent

- [ ] **Test agents**

  ```bash
  claude /agents  # List available
  claude "validate my changes" --agent pre-commit
  ```

### Phase 4: CI/CD (P2)

- [ ] **Create GitHub Actions workflow**
  - [ ] `.github/workflows/claude-review.yml`
  - [ ] Add `ANTHROPIC_API_KEY` secret

- [ ] **Test workflow**
  - [ ] Create test PR
  - [ ] Verify review comments appear

### Phase 5: Advanced (P3)

- [ ] **CLAUDE.md imports** - Refactor for modularity
- [ ] **Custom output styles** - Create minimal, teaching
- [ ] **Plugin packaging** - Bundle for distribution

---

## References

### Official Documentation

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code Hooks](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Claude Code Memory](https://docs.anthropic.com/en/docs/claude-code/memory)
- [Claude Code Subagents](https://docs.anthropic.com/en/docs/claude-code/sub-agents)
- [Claude Code GitHub Action](https://github.com/anthropics/claude-code-action)

### Project Documentation

- `AGENTS.md` - Universal AI agent guidelines
- `CLAUDE.md` - Claude-specific integration
- `.claude/instructions/context-optimization-guide.md` - Token optimization

### External Resources

- [AGENTS.md Open Standard](https://agents.md)
- [Claude Code Showcase](https://github.com/anthropics/claude-code-showcase)
- [Custom Skill-Based Agent Reference](../.local_docs/custom-skill-agent/) - Progressive disclosure patterns

### Progressive Disclosure References

- custom-skill-agent/README.md - Pattern overview
- custom-skill-agent/CLAUDE.md - Implementation details

---

*Document Version: 2.0.0*
*Last Updated: January 2026*
*Key Enhancement: Native three-level progressive disclosure pattern throughout*
