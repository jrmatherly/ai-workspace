# GPTScript Tool Format Validation Analysis

**Date**: 2026-01-15
**Analyzed**: `obot-tools/.cursor/rules/gpt.mdc`
**Validated Against**: 33 actual `.gpt` files in `obot-tools/`

## Executive Summary

The `.cursor/rules/gpt.mdc` documentation is **~85% accurate** but **incomplete** for obot-tools development. It covers GPTScript basics well but misses several critical patterns used extensively in obot-tools.

**Recommendation**: Create enhanced Serena memory with corrected/expanded documentation, load ON-DEMAND when working on obot-tools.

---

## Validation Results

### ✅ CONFIRMED Patterns

| Pattern | gpt.mdc Documented | Found in Codebase | Examples |
| --------- | ------------------- | ------------------- | ---------- |
| File structure (Preamble + Command) | ✅ | ✅ | All 33 files |
| Tool separation with `---` | ✅ | ✅ | All multi-tool files |
| `Name:` directive | ✅ | ✅ | All files |
| `Description:` directive | ✅ | ✅ | All files |
| `Param:` / `Parameter:` | ✅ | ✅ | memory, knowledge, tasks |
| `Share Tools:` | ✅ | ✅ | memory_context |
| `Share Context:` | ✅ | ✅ | memory, knowledge |
| `Type: context` | ✅ | ✅ | list_memories, context tools |
| `Credential:` | ✅ | ✅ | openai, github, knowledge |
| `Metadata:` fields | ✅ | ✅ | icon, category, noUserAuth |
| `!metadata:*:*` syntax | ✅ | ✅ | providerMeta JSON blocks |
| Params become env vars (UPPERCASE) | ✅ | ✅ | Confirmed in code |

### ❌ MISSING from gpt.mdc (Critical Gaps)

| Pattern | Used In | Description |
| --------- | --------- | ------------- |
| `Model Provider: true` | All model providers | Marks tool as model provider (not documented) |
| `Output Filter:` | knowledge | Filters/formats tool output (not documented) |
| `#!sys.daemon` | model/auth providers | Long-running daemon processes (not documented) |
| `!metadata:*:providerMeta` structure | All providers | JSON with envVars, optionalEnvVars, icon, link, postgresTablePrefix |
| Advanced credential syntax | openai, github | `as <name> with <var> as env_vars` pattern |
| `Params:` (plural) | knowledge | Alternative to `Param:` (both work) |
| `JSON Response` directive | Not found | Documented but not used in obot-tools |

### 📊 Component Distribution

**33 tool.gpt files analyzed:**

- **9 Model Providers**: openai, anthropic, ollama, groq, voyage, vllm, xai, deepseek, generic-openai
- **2 Auth Providers**: github, google
- **8 Core Tools**: memory, knowledge, tasks, images, time, workspace-files, threads, file-summarizer
- **8 System Tools**: workflow, result-formatter, obot-model-provider, existing-credential, tasks-workflow, etc.
- **6 Supporting**: oauth2, placeholder-credential, credential-stores (sqlite, postgres)

---

## Detailed Pattern Analysis

### 1. Model Provider Pattern

**Example**: `openai-model-provider/tool.gpt`

```gptscript
Name: OpenAI
Description: Model Provider for OpenAI
Model Provider: true                    # ❌ NOT DOCUMENTED in gpt.mdc
Credential: ../placeholder-credential as openai-model-provider with OBOT_OPENAI_MODEL_PROVIDER_API_KEY as env_vars
Metadata: noUserAuth: openai-model-provider

#!sys.daemon ${GPTSCRIPT_TOOL_DIR}/bin/gptscript-go-tool   # ❌ #!sys.daemon NOT DOCUMENTED

---
!metadata:OpenAI:providerMeta          # ⚠️ Syntax documented but structure not explained
{
    "icon": "...",
    "link": "...",
    "envVars": [                        # ❌ envVars structure NOT DOCUMENTED
        {
            "name": "OBOT_OPENAI_MODEL_PROVIDER_API_KEY",
            "friendlyName": "API Key",
            "description": "...",
            "sensitive": true
        }
    ]
}
```

**Key Insights**:

- `Model Provider: true` is essential but undocumented
- `#!sys.daemon` runs as persistent HTTP server (port 8000)
- `providerMeta` JSON has specific schema with `envVars` array

### 2. Auth Provider Pattern

**Example**: `github-auth-provider/tool.gpt`

```gptscript
Name: GitHub
Description: Auth provider for GitHub
Metadata: noUserAuth: github-auth-provider
Credential: ../placeholder-credential as github-auth-provider

#!sys.daemon ${GPTSCRIPT_TOOL_DIR}/bin/gptscript-go-tool

---
!metadata:GitHub:providerMeta
{
    "icon": "...",
    "link": "...",
    "postgresTablePrefix": "github_",   # ❌ NOT DOCUMENTED
    "envVars": [                        # Required env vars
        ...
    ],
    "optionalEnvVars": [                # ❌ NOT DOCUMENTED
        ...
    ]
}
```

**Key Insights**:

- Auth providers also use `#!sys.daemon`
- `optionalEnvVars` is distinct from `envVars` (both arrays)
- `postgresTablePrefix` is auth-provider-specific metadata

### 3. Context Tool Pattern

**Example**: `memory/tool.gpt`

```gptscript
Name: list_memories
Description: List all memories
Type: context                          # ✅ Documented correctly

#!${GPTSCRIPT_TOOL_DIR}/bin/gptscript-go-tool list

---
Name: memory_context
Share Tools: Create Memory, Update Memory, Delete Memory
Share Context: list_memories
Type: context

#!sys.echo                             # ❌ #!sys.echo NOT DOCUMENTED

<memory_tools_instructions>
...
</memory_tools_instructions>
```

**Key Insights**:

- `Type: context` marks auto-called context tools (✅ documented)
- `#!sys.echo` is used for instruction-only context tools (❌ not documented)
- Context tools can provide XML-wrapped instructions to LLM

### 4. Tool Registry (index.yaml)

```yaml
tools:                                  # User-facing tools
  memory:
    reference: ./memory

system:                                 # System/internal tools
  workflow:
    reference: ./workflow

modelProviders:                         # Model providers
  openai-model-provider:
    reference: ./openai-model-provider

authProviders:                          # Auth providers
  github-auth-provider:
    reference: ./github-auth-provider
```

**Key Insights**:

- 4 sections: tools, system, modelProviders, authProviders
- References point to directory (contains tool.gpt) or specific .gpt file
- Registration is manual (no auto-discovery)

---

## Gap Analysis: What's Missing from gpt.mdc

### Critical Omissions

1. **Daemon Tools (`#!sys.daemon`)**
   - Used by ALL model providers and auth providers
   - Runs as persistent HTTP server
   - Required for long-running services

2. **Model Provider Directive**
   - `Model Provider: true` marks tool as model provider
   - Critical for proper classification in Obot platform

3. **Provider Metadata Structure**
   - `!metadata:<Provider>:providerMeta` has specific JSON schema
   - `envVars` array: Required environment variables with UI metadata
   - `optionalEnvVars` array: Optional environment variables
   - `icon`, `link`, `postgresTablePrefix` fields

4. **Output Filter Directive**
   - `Output Filter: <tool>` processes tool output
   - Used by knowledge tool to format results

5. **Advanced Credential Syntax**
   - `as <alias>` - Creates credential alias
   - `with <var> as env_vars` - Maps credential to environment variable
   - Example: `Credential: ../placeholder-credential as openai-model-provider with OBOT_OPENAI_MODEL_PROVIDER_API_KEY as env_vars`

### Minor Gaps

- `#!sys.echo` for echo-only tools (used in context tools)
- `Params:` (plural) vs `Param:` (singular) - both work
- `Metadata: noUserAuth` pattern (disables user auth requirement)
- Shell script support (bash, sh) in command section

---

## Recommendations for expert-mode.md Enhancement

### Option 1: Lean Initialization (RECOMMENDED)

**Approach**: Load GPTScript context ON-DEMAND, not during initialization.

**Changes to expert-mode.md**:

```markdown
### 5. Load Project-Specific Context

For each active project, load its comprehensive architecture guide:

**Project CLAUDE.md Files:**
- `obot-entraid/CLAUDE.md` - Full-stack MCP platform, auth providers, SvelteKit
- `nah/CLAUDE.md` - K8s controller framework, Router/Backend/Apply architecture
- `kinm/CLAUDE.md` - K8s-like API server with PostgreSQL
- `mcp-oauth-proxy/CLAUDE.md` - OAuth 2.1 proxy, JWT handling, token flow
- **`obot-tools/CLAUDE.md`** - GPTScript tools, model/auth provider patterns
- `mcp-catalog/CLAUDE.md` - MCP server catalog structure

**Additional Context for obot-tools:**
If working on obot-tools, ALSO load:
- `gptscript_tool_format` memory (NEW) - Enhanced GPTScript .gpt file format reference
```

**Benefits**:

- ✅ Keeps initialization token count low (~140K → ~145K)
- ✅ Loads GPTScript knowledge only when needed
- ✅ Scales to future additions without bloating expert-mode

### Option 2: Full Initialization (NOT RECOMMENDED)

Embed full GPTScript documentation in expert-mode.md initialization → adds ~6-8K tokens upfront.

**Drawbacks**:

- ❌ Token bloat for non-obot-tools work
- ❌ Harder to maintain (duplicates information)
- ❌ Most sessions won't need GPTScript knowledge

---

## Action Items

### 1. Create Enhanced Serena Memory

**File**: `.serena/memories/gptscript_tool_format.md`

**Contents**:

- Corrected version of gpt.mdc documentation
- Add missing patterns: `Model Provider:`, `#!sys.daemon`, providerMeta structure
- Add obot-tools-specific examples
- Reference canonical examples: `memory/tool.gpt`, `openai-model-provider/tool.gpt`, `github-auth-provider/tool.gpt`

**Size Estimate**: ~3-4K tokens (comprehensive but focused)

### 2. Update expert-mode.md

Add conditional loading for obot-tools:

```markdown
**Project-Specific Tasks:**

| Project | Task Type | Additional Context |
| --------- | ----------- | ------------------- |
| **obot-tools** | Tool Development | `gptscript_tool_format` memory (NEW) |
| **obot-tools** | Model Provider | Project-specific CLAUDE.md, GPTScript format |
| **obot-tools** | Auth Provider | OAuth2 provider pattern, GPTScript format |
```

### 3. Enhance obot-tools/CLAUDE.md

Add section:

```markdown
## GPTScript Tool Format Reference

All components use `.gpt` files to define tools for the GPTScript runtime.

**Key Resources**:
- Serena memory: `gptscript_tool_format` - Complete format reference
- Canonical examples: `memory/tool.gpt`, `openai-model-provider/tool.gpt`, `github-auth-provider/tool.gpt`
- Official docs: https://docs.gptscript.ai

**Quick Reference**:
[Brief summary of structure, key directives, and patterns]
```

### 4. DO NOT Modify .cursor/rules/gpt.mdc

**Rationale**:

- It's a Cursor IDE rule file (not Claude Code)
- Cursor and Claude Code may diverge in behavior
- Keep it as reference, create our own enhanced version

---

## Token Impact Analysis

| Approach | Expert Mode Init | On-Demand Load | Total (obot-tools) |
| --------- | ------------------ | ---------------- | ------------------- |
| **Current** | ~140K | 0 | ~140K |
| **Option 1 (Recommended)** | ~140K | +3-4K (when needed) | ~143-144K |
| **Option 2 (Full Embed)** | ~147-148K | 0 | ~147-148K |

**Winner**: Option 1 (Lean Initialization)

- Saves 3-4K tokens for 5 out of 6 projects
- Only loads GPTScript context for obot-tools work
- Better UX for mixed-project sessions

---

## Conclusion

**gpt.mdc Verdict**: Good foundation, but incomplete for production use in obot-tools.

**Recommended Actions**:

1. ✅ Create enhanced `gptscript_tool_format` Serena memory
2. ✅ Update expert-mode.md to load conditionally
3. ✅ Enhance obot-tools/CLAUDE.md with format reference
4. ❌ Don't modify .cursor/rules/gpt.mdc (different IDE)

**Value Add**: High for obot-tools development, zero overhead for other projects.

**Implementation Effort**: ~30 minutes to create memory and update expert-mode.md.

---

## Appendix: Enhanced GPTScript Format Outline

```markdown
# GPTScript Tool Format Reference

## File Structure
[Preamble + Command, separated by `---`]

## Standard Directives
- Name, Description, Param/Params
- Tools, Share Tools, Share Context, Context
- Credential (with `as` and `with` syntax)
- Metadata, Type

## obot-tools-Specific Directives
- Model Provider: true
- Output Filter: <tool>
- Metadata: noUserAuth

## Special Commands
- #!sys.daemon - Long-running HTTP server
- #!sys.echo - Echo-only (context tools)
- #!${GPTSCRIPT_TOOL_DIR}/bin/gptscript-go-tool <cmd>

## Provider Metadata (!metadata:*:providerMeta)
- JSON structure with envVars, optionalEnvVars
- icon, link, postgresTablePrefix fields
- envVars schema: name, friendlyName, description, sensitive, hidden

## Context Tools
- Type: context - Auto-called by LLM
- Share Context - Shares context with other tools
- Instructions wrapped in XML tags

## Best Practices
[From actual obot-tools implementations]

## Canonical Examples
- memory/tool.gpt - Context tools, Share Tools/Context
- openai-model-provider/tool.gpt - Model provider, daemon, providerMeta
- github-auth-provider/tool.gpt - Auth provider, envVars/optionalEnvVars
- knowledge/tool.gpt - Complex tool with multiple features
```

**Estimated Length**: 3,500 tokens (detailed but focused)
