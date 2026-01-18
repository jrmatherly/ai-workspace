# Context Optimization Guide

Strategies for efficient context window usage in the AI/MCP monorepo.

## Core Principle

**Load on-demand, not upfront.** Only load the context you need for the current task, when you need it.

## Important: Auto-Loaded Context Files

Claude Code **automatically injects** two files into every conversation:

### AGENTS.md (~3,500 tokens) - Universal Guidelines

- Project overview and structure
- Universal build/test commands
- **Dos/Don'ts** - explicit constraints
- **File-scoped commands** - faster validation
- Code patterns and examples
- Pre-commit checklist

### CLAUDE.md (~1,200 tokens) - Claude-Specific

- Serena MCP integration
- Memory references
- Claude Code directory structure
- SuperClaude commands
- Specialized agents

**Do NOT re-read these files** - they're already in your context. Use `AGENTS.md` as primary reference for project work, `CLAUDE.md` for Claude-specific features.

## Context Window Tracking

Real-time context usage is displayed in the statusline:

- **🟢 0-50%:** Healthy usage, plenty of room
- **🟡 50-75%:** Moderate usage, be selective with additional loads
- **🔴 75-100%:** High usage, avoid loading more context

Last API call token count is also shown for monitoring incremental usage.

## Token Optimization Strategies

### 1. Selective Memory Loading

**Don't load memories at initialization** - load only when the task requires them:

```text
Simple task → AGENTS.md + CLAUDE.md (auto-loaded) is sufficient
Project work → Add project-specific CLAUDE.md only
Architecture work → Add codebase_architecture memory
Dependency work → Add tech_stack_and_dependencies memory
GPTScript work → Add gptscript_tool_format memory
Pre-commit → Add task_completion_checklist memory
```

**Note:** `AGENTS.md` contains commands, patterns, and dos/don'ts. Serena memories `project_purpose_and_structure` and `suggested_commands` have significant overlap - prefer `AGENTS.md` first.

### 2. Use Lighter Alternatives

When possible, use lighter documentation:

- Project `README.md` (quick overview) instead of full `CLAUDE.md`
- `QUICK_REFERENCE.md` (command reference) instead of `suggested_commands` memory
- Task-specific sections instead of entire documentation files

### 3. Avoid Redundant Loads

- Don't reload memories if the task scope hasn't changed
- Reference already-loaded information instead of re-reading
- Use Serena symbolic tools to read specific symbols instead of entire files

### 4. Progressive Loading

Start minimal, expand as needed:

1. Load project basics
2. Start working
3. Load additional context only when you encounter unknowns
4. Don't preemptively load "just in case" documentation

## Smart Loading Rules

**Context triggers** - Load specific context based on keywords in the user's request:

| User Mentions | Load Context |
| ------------- | ------------ |
| "OAuth", "authentication", "proxy" | `mcp-oauth-proxy/CLAUDE.md` |
| "controller", "reconcile", "apply" | `nah/CLAUDE.md` |
| "frontend", "UI", "SvelteKit" | `obot-entraid/CLAUDE.md` (UI sections) |
| ".gpt files", "GPTScript", "tool.gpt" | `obot-tools/CLAUDE.md` + `gptscript_tool_format` |
| "model provider", "auth provider" | `obot-tools/CLAUDE.md` + `gptscript_tool_format` |
| "name generation", "random names" | `namegenerator/CLAUDE.md` |
| "document", "analyze", "validate", "assess" | `.claude/instructions/documentation-standards.md` + `documentation_best_practices` |

**Multi-project work:**

- Load universal context once (shared across all projects)
- Load each project's CLAUDE.md only when working on that project
- Use `documentation/docs/reference/architecture.md` for understanding relationships without loading all details

## Context Refresh Patterns

### When to Reload

- Task scope changes significantly
- Switching between projects
- User provides new requirements that change direction

### When NOT to Reload

- Making iterative changes on same component
- Following up on same task/issue
- Debugging the same code you just worked on

## Pre-Task Checklist

Before loading context, ask:

1. **What do I need to know?** (Load only this)
2. **Where can I find it?** (Use the lightest source)
3. **Do I already have it?** (Don't reload)
4. **Can I defer it?** (Load when needed, not preemptively)

## Pre-Completion Checklist

Before finishing work, verify:

- Load `task_completion_checklist` memory
- Verify understanding with user before deep dives
- Check validation requirements for the specific task

## Documentation Creation Optimization

When creating documentation:

1. Load `.claude/instructions/documentation-standards.md` (9 core standards)
2. Load `documentation_best_practices` memory only if you need templates/examples
3. Don't load both unless creating comprehensive documentation from scratch

## Efficiency Tips by Task Type

### Quick Fixes/Simple Tasks

- Load: Project CLAUDE.md or README.md
- Skip: Architecture docs, universal memories (unless working across projects)

### Feature Development

- Use: Auto-loaded CLAUDE.md for commands and patterns
- Load: Project-specific CLAUDE.md if working in one project
- Load: `task_completion_checklist` memory before completing
- Skip: Architecture docs unless designing new components

### Architecture/Design Work

- Load: All universal memories, project CLAUDE.md, documentation/docs/reference/architecture.md
- Load: codebase_architecture memory for patterns

### Documentation Work

- Load: documentation-standards.md (always)
- Load: documentation_best_practices (if need templates)
- Skip: Architecture docs unless documenting architecture

### Cross-Project Work

- Use: Auto-loaded CLAUDE.md for cross-project overview
- Load: Each project's CLAUDE.md only when switching to that project
- Load: documentation/docs/reference/architecture.md for visual relationships
- Skip: Deep project-specific details unless actively working in that project

## Monitoring Usage

Watch the statusline for real-time feedback:

- If approaching 🟡 (50%+), be more selective with additional loads
- If reaching 🔴 (75%+), stop loading new context
- Use "Last call" token count to see incremental impact of each load

## Anti-Patterns to Avoid

❌ **Loading all memories "just in case"**
✅ Load based on actual task requirements

❌ **Reading entire files when you need one function**
✅ Use Serena symbolic tools to read specific symbols

❌ **Reloading context you already have**
✅ Reference already-loaded information

❌ **Loading architecture docs for simple bug fixes**
✅ Load only project CLAUDE.md for targeted work

❌ **Preemptively loading documentation**
✅ Load when you encounter unknowns during work

❌ **Re-reading AGENTS.md or CLAUDE.md when already loaded**
✅ Both files are auto-injected - reference them directly

❌ **Loading memories that duplicate AGENTS.md content**
✅ Use AGENTS.md for commands/patterns, memories for deep-dives only

❌ **Ignoring file-scoped commands in AGENTS.md**
✅ Use per-file lint/test for faster feedback loops
