# Expert Mode Update Proposal

**Date**: 2026-01-15
**Purpose**: Integrate GPTScript tool format knowledge for obot-tools development
**Approach**: Lean initialization with on-demand loading

---

## Summary

Add GPTScript tool format reference to expert-mode, but load **ON-DEMAND** only when working on obot-tools. This keeps initialization token count low while providing critical context when needed.

**Token Impact**:

- Current expert-mode init: ~140K tokens
- With updates (obot-tools work): ~143-144K tokens (+3-4K on-demand)
- With updates (other projects): ~140K tokens (no change)

---

## Changes to .claude/commands/expert-mode.md

### Change 1: Update Step 3 - Universal Context Loading

**Location**: Line 30-42

**Current**:

```markdown
### 3. Load Universal Context (Always Read)

Read these Serena memories - essential for any work in the monorepo:

**Critical Foundation (Always):**
- `project_purpose_and_structure` - Overview of all 6 projects, purposes, tech stacks
- `code_style_and_conventions` - Coding standards across Go/Python/TypeScript
- `suggested_commands` - Universal and project-specific commands

**Load on Demand (Task-Specific):**
- `codebase_architecture` - Deep architectural patterns (when doing design/architecture work)
- `tech_stack_and_dependencies` - Detailed technology info (when working with dependencies)
- `task_completion_checklist` - Pre-commit validation (before completing any task)
```

**Updated**:

```markdown
### 3. Load Universal Context (Always Read)

Read these Serena memories - essential for any work in the monorepo:

**Critical Foundation (Always):**
- `project_purpose_and_structure` - Overview of all 6 projects, purposes, tech stacks
- `code_style_and_conventions` - Coding standards across Go/Python/TypeScript
- `suggested_commands` - Universal and project-specific commands

**Load on Demand (Task-Specific):**
- `codebase_architecture` - Deep architectural patterns (when doing design/architecture work)
- `tech_stack_and_dependencies` - Detailed technology info (when working with dependencies)
- `task_completion_checklist` - Pre-commit validation (before completing any task)
- `gptscript_tool_format` - GPTScript .gpt file format reference (when working on obot-tools) ⭐ NEW
```

### Change 2: Update Step 5 - Project-Specific Context

**Location**: Line 75-88

**Current**:

```markdown
### 5. Load Project-Specific Context

For each active project, load its comprehensive architecture guide:

**Project CLAUDE.md Files:**
- `obot-entraid/CLAUDE.md` - Full-stack MCP platform, auth providers, SvelteKit
- `nah/CLAUDE.md` - K8s controller framework, Router/Backend/Apply architecture
- `kinm/CLAUDE.md` - K8s-like API server with PostgreSQL
- `mcp-oauth-proxy/CLAUDE.md` - OAuth 2.1 proxy, JWT handling, token flow
- `obot-tools/CLAUDE.md` - GPTScript tools, model/auth provider patterns
- `mcp-catalog/CLAUDE.md` - MCP server catalog structure

**Quick Overview (if time-constrained):**
- Load project `README.md` instead for basic overview
```

**Updated**:

```markdown
### 5. Load Project-Specific Context

For each active project, load its comprehensive architecture guide:

**Project CLAUDE.md Files:**
- `obot-entraid/CLAUDE.md` - Full-stack MCP platform, auth providers, SvelteKit
- `nah/CLAUDE.md` - K8s controller framework, Router/Backend/Apply architecture
- `kinm/CLAUDE.md` - K8s-like API server with PostgreSQL
- `mcp-oauth-proxy/CLAUDE.md` - OAuth 2.1 proxy, JWT handling, token flow
- **`obot-tools/CLAUDE.md`** - GPTScript tools, model/auth provider patterns ⭐
- `mcp-catalog/CLAUDE.md` - MCP server catalog structure

**Additional Context for obot-tools:** ⭐ NEW
If working on obot-tools, ALSO load:
- `gptscript_tool_format` memory - Enhanced GPTScript .gpt file format reference
- Provides: Model Provider patterns, Auth Provider patterns, Context tools, providerMeta structure
- Critical for: Creating/modifying .gpt files, understanding tool directives, debugging tool definitions

**Quick Overview (if time-constrained):**
- Load project `README.md` instead for basic overview
```

### Change 3: Update Step 6 - Task-Specific Context Table

**Location**: Line 115-127

**Current**:

```markdown
**Project-Specific Tasks:**

| Project | Task Type | Additional Context |
| --------- | ----------- | ------------------- |
| **obot-entraid** | Auth Provider | Project-specific Serena memories (auth_provider_implementation, etc.) |
| **obot-entraid** | UI/Frontend | SvelteKit patterns, Tailwind conventions |
| **obot-entraid** | Releases | Release procedures, version tagging |
| **nah** | Controller Dev | Generated code patterns, Apply semantics |
| **nah** | Code Generation | `go generate` requirements, validation-ci |
| **mcp-oauth-proxy** | OAuth Flow | Token management, PKCE, security patterns |
| **obot-tools** | Model Provider | GPTScript format, OpenAI-compatible API patterns |
| **obot-tools** | Auth Provider | OAuth2 provider pattern, cookie encryption |
```

**Updated**:

```markdown
**Project-Specific Tasks:**

| Project | Task Type | Additional Context |
| --------- | ----------- | ------------------- |
| **obot-entraid** | Auth Provider | Project-specific Serena memories (auth_provider_implementation, etc.) |
| **obot-entraid** | UI/Frontend | SvelteKit patterns, Tailwind conventions |
| **obot-entraid** | Releases | Release procedures, version tagging |
| **nah** | Controller Dev | Generated code patterns, Apply semantics |
| **nah** | Code Generation | `go generate` requirements, validation-ci |
| **mcp-oauth-proxy** | OAuth Flow | Token management, PKCE, security patterns |
| **obot-tools** | Tool Development | `gptscript_tool_format` memory ⭐ |
| **obot-tools** | Model Provider | `gptscript_tool_format` memory, OpenAI-compatible API patterns ⭐ |
| **obot-tools** | Auth Provider | `gptscript_tool_format` memory, OAuth2 provider pattern, cookie encryption ⭐ |
| **obot-tools** | .gpt File Work | `gptscript_tool_format` memory (CRITICAL) ⭐ |
```

### Change 4: Update Step 9 - Available Resources

**Location**: Line 189-226

Add new section after "Quick Reference" section:

```markdown
**Quick Reference:**
- `QUICK_REFERENCE.md` - One-page developer guide (keep open during work)
- `TROUBLESHOOTING.md` - Common issues and solutions
- Project `CLAUDE.md` - Detailed architecture for each project

**GPTScript Development (obot-tools):** ⭐ NEW SECTION
When working on `.gpt` files in obot-tools:
- `gptscript_tool_format` memory - Complete format reference
- Canonical examples:
  - `memory/tool.gpt` - Context tools, Share Tools/Context
  - `openai-model-provider/tool.gpt` - Model provider pattern
  - `github-auth-provider/tool.gpt` - Auth provider pattern
  - `knowledge/tool.gpt` - Complex tool with multiple features
- Key patterns:
  - Model providers: `Model Provider: true`, `#!sys.daemon`, `providerMeta`
  - Auth providers: `envVars`/`optionalEnvVars`, OAuth2 endpoints
  - Context tools: `Type: context`, `Share Context`
  - Parameters: Become UPPERCASE env vars

**SuperClaude Commands:**
```

### Change 5: Update Smart Loading Section

**Location**: Line 289-293

**Current**:

```markdown
**Smart Loading:**
- If user mentions "OAuth" → load mcp-oauth-proxy context
- If user mentions "controller" → load nah context
- If user mentions "frontend" → load obot-entraid UI context
```

**Updated**:

```markdown
**Smart Loading:**
- If user mentions "OAuth" → load mcp-oauth-proxy context
- If user mentions "controller" → load nah context
- If user mentions "frontend" → load obot-entraid UI context
- If user mentions ".gpt files", "tool.gpt", "GPTScript" → load obot-tools + gptscript_tool_format ⭐
- If user mentions "model provider", "auth provider" → load obot-tools + gptscript_tool_format ⭐
```

---

## New Serena Memory: gptscript_tool_format

**Status**: ✅ CREATED (see `.serena/memories/gptscript_tool_format.md`)

**Size**: ~4,800 tokens

**Contents**:

- Complete GPTScript .gpt file format reference
- Validated against 33 actual tool files in obot-tools
- Includes missing patterns from .cursor/rules/gpt.mdc:
  - `Model Provider: true` directive
  - `#!sys.daemon` for long-running services
  - `providerMeta` JSON structure with envVars/optionalEnvVars
  - `Output Filter:` directive
  - Advanced credential syntax
- Canonical examples with specific files to study
- Common patterns for each component type
- Environment variable conventions
- Validation and testing procedures

**When to Load**:

- User working on obot-tools project
- Task involves .gpt files, tool development, or provider creation
- User mentions "GPTScript", "tool.gpt", or related keywords

---

## Additional Enhancement: Update obot-tools/CLAUDE.md

**Location**: `obot-tools/CLAUDE.md`, after "GPTScript Tool Definition (.gpt files)" section

**Add**:

```markdown
## GPTScript Tool Format - Complete Reference

For comprehensive GPTScript .gpt file format documentation, including:
- Complete directive reference (standard + obot-tools-specific)
- Model Provider and Auth Provider patterns
- Context tool patterns
- Provider metadata structure (providerMeta)
- Credential syntax and mapping
- Command types (#!sys.daemon, #!sys.echo, shell scripts)
- Parameter handling (become UPPERCASE env vars)
- Tool bundles and sharing
- Registration in index.yaml

**Load the Serena memory**: `gptscript_tool_format`

**Study canonical examples in this repo**:
- `memory/tool.gpt` - Context tools, Share Tools/Context, multiple sub-tools
- `openai-model-provider/tool.gpt` - Model provider, #!sys.daemon, providerMeta
- `github-auth-provider/tool.gpt` - Auth provider, envVars/optionalEnvVars
- `knowledge/tool.gpt` - Complex tool with multiple features, output filter

**Official Documentation**: https://docs.gptscript.ai
```

---

## Implementation Checklist

- [x] Create `gptscript_tool_format` Serena memory (DONE)
- [ ] Update `.claude/commands/expert-mode.md` with 5 changes listed above
- [ ] Update `obot-tools/CLAUDE.md` with GPTScript reference section
- [ ] Test expert-mode initialization with obot-tools task
- [ ] Verify token counts are within expected ranges

---

## Testing Plan

### Test 1: Non-obot-tools Project

```
User: "Work on nah controller framework"
Expected: Standard initialization, NO gptscript_tool_format loaded
Token count: ~140K
```

### Test 2: obot-tools - General Task

```
User: "Work on obot-tools"
Expected: obot-tools/CLAUDE.md loaded, gptscript_tool_format mentioned but not auto-loaded
Token count: ~140K (until user asks about .gpt files)
```

### Test 3: obot-tools - .gpt File Work

```
User: "Create a new model provider in obot-tools"
Expected: obot-tools/CLAUDE.md + gptscript_tool_format memory loaded
Token count: ~143-144K
```

### Test 4: Smart Loading

```
User: "How do I define a GPTScript tool?"
Expected: Auto-detect keyword, load obot-tools context + gptscript_tool_format
Token count: ~143-144K
```

---

## Benefits Summary

✅ **Token Efficient**: Only 3-4K additional tokens when actually needed
✅ **Context Accurate**: Validated against 33 real .gpt files in obot-tools
✅ **Comprehensive**: Covers all patterns missing from .cursor/rules/gpt.mdc
✅ **On-Demand**: Doesn't bloat initialization for non-obot-tools work
✅ **Maintainable**: Single source of truth in Serena memory
✅ **Discoverable**: Clear guidance in expert-mode when to load it

---

## Conclusion

This enhancement brings **high value** for obot-tools development with **zero overhead** for other projects. The lean initialization approach ensures efficient token usage while providing comprehensive GPTScript knowledge exactly when needed.

**Ready to implement**: All components are ready, just need to update expert-mode.md with the 5 changes listed above.
