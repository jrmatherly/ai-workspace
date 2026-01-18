# GPTScript Tool Format Reference

## Overview

GPTScript tool files (`.gpt`) define tools that can be provided to large language models for execution. This reference is validated against 33 actual tool files in the obot-tools repository.

## File Structure

Each tool definition follows this structure:

```gptscript
Name: Tool Name
Description: Tool description
Param: param1: description of parameter
Share Tools: Tool1, Tool2
Credential: ./credential
Metadata: key: value

#!/usr/bin/env command

---
Name: Another Tool
Description: Another tool description

# Prompt or command here
```

**Key Points**:

1. **Preamble**: Tool directives (Name, Description, etc.)
2. **Blank Line**: Separates preamble from command
3. **Command/Prompt**: Shell command or LLM prompt
4. **Tool Separator**: `---` between multiple tools

## Standard Tool Directives

| Directive | Description | Example |
| ----------- | ----------- | --------- |
| `Name` | Tool name (required) | `Name: Memory` |
| `Description` | Tool purpose - critical for LLM decision making | `Description: Store information in memory` |
| `Param` / `Params` | Parameters (format: `name: description`) | `Param: content: The content to remember` |
| `Tools` | Tools available to this tool | `Tools: Tool1, Tool2` |
| `Share Tools` | Tools shared by this tool | `Share Tools: Create Memory, Update Memory` |
| `Context` | Context tools available | `Context: list_memories` |
| `Share Context` | Context shared with tools including this tool | `Share Context: list_memories` |
| `Credential` | Credential tool to set env vars | `Credential: ../placeholder-credential` |
| `Metadata` | Additional metadata | `Metadata: icon: https://...` |
| `Type` | Tool type (e.g., `context`) | `Type: context` |
| `JSON Response` | LLM responds in JSON (requires instructions) | `JSON Response: true` |

## obot-tools-Specific Directives

### Model Provider Directive

**Usage**: Marks tool as model provider (essential for registration)

```gptscript
Name: OpenAI
Description: Model Provider for OpenAI
Model Provider: true
Credential: ../placeholder-credential as openai-model-provider with OBOT_OPENAI_MODEL_PROVIDER_API_KEY as env_vars
Metadata: noUserAuth: openai-model-provider

#!sys.daemon ${GPTSCRIPT_TOOL_DIR}/bin/gptscript-go-tool
```

**Key Features**:

- `Model Provider: true` - Required for all model providers
- `#!sys.daemon` - Runs as persistent HTTP server (port 8000)
- Credential with `as` and `with` clauses for env var mapping

### Output Filter Directive

**Usage**: Processes tool output through another tool

```gptscript
Name: Knowledge
Description: Obtain search result from knowledge set
Output Filter: ../result-formatter
```

### Metadata Fields

**Common Metadata**:

- `icon` - Icon URL (usually phosphor-icons or simple-icons)
- `category` - Category for UI grouping (e.g., "Capability")
- `noUserAuth` - Disables user authentication requirement

## Advanced Credential Syntax

**Format**: `Credential: <path> as <alias> with <var> as env_vars`

**Examples**:

```gptscript
# Simple credential reference
Credential: ../placeholder-credential as openai-model-provider

# With environment variable mapping
Credential: ../placeholder-credential as openai-model-provider with OBOT_OPENAI_MODEL_PROVIDER_API_KEY as env_vars

# Multiple credentials
Credential: github.com/gptscript-ai/credentials/model-provider
Credential: ../existing-credential as knowledge
```

## Provider Metadata Structure

### Syntax: `!metadata:<Provider>:providerMeta`

**Used by**: All model providers and auth providers

**Structure**:

```gptscript
---
!metadata:OpenAI:providerMeta
{
    "icon": "https://cdn.jsdelivr.net/npm/@phosphor-icons/core@2/...",
    "link": "https://openai.com/",
    "envVars": [
        {
            "name": "OBOT_OPENAI_MODEL_PROVIDER_API_KEY",
            "friendlyName": "API Key",
            "description": "OpenAI API Key. Can be created at...",
            "sensitive": true
        }
    ]
}
```

**For Auth Providers** (additional fields):

```json
{
    "icon": "...",
    "link": "...",
    "postgresTablePrefix": "github_",
    "envVars": [
        {
            "name": "OBOT_GITHUB_AUTH_PROVIDER_CLIENT_ID",
            "friendlyName": "Client ID",
            "description": "...",
            "sensitive": false
        }
    ],
    "optionalEnvVars": [
        {
            "name": "OBOT_GITHUB_AUTH_PROVIDER_ORG",
            "friendlyName": "Allowed GitHub Organization",
            "description": "...",
            "sensitive": false,
            "hidden": true
        }
    ]
}
```

**Field Descriptions**:

- `name` - Environment variable name (SCREAMING_SNAKE_CASE)
- `friendlyName` - User-facing label for UI
- `description` - Help text explaining the variable
- `sensitive` - If true, masked in UI (passwords, secrets)
- `hidden` - If true, not shown in basic UI (advanced settings)

## Command Types

### 1. Shell Command

**Format**: `#!/path/to/executable`

```gptscript
#!${GPTSCRIPT_TOOL_DIR}/bin/gptscript-go-tool create
```

**Special Variables**:

- `${GPTSCRIPT_TOOL_DIR}` - Directory containing the tool

### 2. System Daemon

**Format**: `#!sys.daemon`

**Usage**: Long-running HTTP servers (model/auth providers)

```gptscript
#!sys.daemon ${GPTSCRIPT_TOOL_DIR}/bin/gptscript-go-tool
```

**Behavior**:

- Runs as persistent process
- Typically listens on port 8000
- Used by ALL model providers and auth providers

### 3. System Echo

**Format**: `#!sys.echo`

**Usage**: Echo-only context tools (provide instructions without execution)

```gptscript
Name: memory_context
Type: context

#!sys.echo

<memory_tools_instructions>
You have the ability to remember information...
</memory_tools_instructions>
```

### 4. Shell Script

**Format**: `#!/bin/bash` or `#!/bin/sh`

```gptscript
Name: context
Type: context

#!/bin/bash

if [ -n "${KNOWLEDGE_SUMMARY}" ]; then
  cat <<EOF
START INSTRUCTIONS: KNOWLEDGE SUMMARY
${KNOWLEDGE_SUMMARY}
END INSTRUCTIONS: KNOWLEDGE SUMMARY
EOF
fi
```

## Context Tools

**Definition**: Tools with `Type: context` are automatically called by the LLM to provide helpful context.

**Pattern 1: List-based Context**

```gptscript
Name: list_memories
Description: List all memories
Type: context

#!${GPTSCRIPT_TOOL_DIR}/bin/gptscript-go-tool list
```

**Pattern 2: Instruction Context**

```gptscript
Name: memory_context
Share Tools: Create Memory, Update Memory, Delete Memory
Share Context: list_memories
Type: context

#!sys.echo

<memory_tools_instructions>
[Instructions wrapped in XML for clarity]
</memory_tools_instructions>
```

**Pattern 3: Dynamic Context**

```gptscript
Name: context
Type: context

#!/bin/bash

if [ -n "${SOME_VAR}" ]; then
  echo "START INSTRUCTIONS"
  echo "${SOME_VAR}"
  echo "END INSTRUCTIONS"
fi
```

## Parameter Handling

**Parameters become uppercase environment variables**:

```gptscript
Name: Create Memory
Param: content: The content to remember

#!${GPTSCRIPT_TOOL_DIR}/bin/gptscript-go-tool create
```

In Go code:

```go
content := os.Getenv("CONTENT")  // Parameter "content" → env var "CONTENT"
```

## Tool Bundles

**Pattern**: Tool with `Metadata: bundle: true` must include all tools in its file in `Share Tools`.

```gptscript
Name: MyBundle
Metadata: bundle: true
Share Tools: Tool1, Tool2, Tool3

---
Name: Tool1
...

---
Name: Tool2
...

---
Name: Tool3
...
```

**Purpose**: When other tools include the bundle, they get access to all bundled tools.

## Common Patterns in obot-tools

### Memory Tool Pattern

- Main tool shares context
- Multiple sub-tools for CRUD operations
- Context tool with instructions
- List context tool for current state

### Model Provider Pattern

- `Model Provider: true` directive
- `#!sys.daemon` for HTTP server
- `providerMeta` with `envVars`
- Global API key via env var
- Per-request API key via `X-Obot-*` header
- Validation sub-tool

### Auth Provider Pattern

**Complete Requirements**: See `obot-tools/docs/auth-providers.md` for full specification.

**tool.gpt Structure**:

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
    "link": "https://github.com/",
    "postgresTablePrefix": "github_",
    "envVars": [...],      // Required env vars with UI metadata
    "optionalEnvVars": [...] // Optional env vars
}
```

**Required Endpoints**:

1. `/oauth2/start` - Initiates OAuth2 flow, checks `rd` query param for redirect URL
2. `/oauth2/callback` - Handles OAuth2 callback, exchanges code for token, redirects to `rd`
3. `/oauth2/sign_out` - Clears `obot_access_token` cookie, redirects to `rd`
4. `/obot-get-state` - Returns user info from serialized HTTP request (JSON)
5. `/obot-get-icon-url` - Returns user profile icon URL from bearer token

**Implementation Pattern**:

- Use `github.com/oauth2-proxy/oauth2-proxy/v7` library for OAuth2 flow
- Shared utilities from `auth-providers-common/pkg`:
  - `state.ObotGetState(oauthProxy)` - State endpoint handler
  - `icon.ObotGetIconURL(iconFetcher)` - Icon endpoint handler
  - `env.LoadEnvForStruct(&opts)` - Environment variable loading
- Cookie: `obot_access_token`, encrypted with `OBOT_AUTH_PROVIDER_COOKIE_SECRET`
- Secure flag: `true` if `OBOT_SERVER_PUBLIC_URL` starts with `https://`
- Token refresh: Automatic within `/obot-get-state` if expired

**Key Environment Variables**:

- Required: `OBOT_<PROVIDER>_AUTH_PROVIDER_CLIENT_ID`, `CLIENT_SECRET`, `OBOT_AUTH_PROVIDER_COOKIE_SECRET`, `EMAIL_DOMAINS`
- Optional: `OBOT_AUTH_PROVIDER_POSTGRES_CONNECTION_DSN`, `TOKEN_REFRESH_DURATION`
- Provider-specific: `OBOT_GITHUB_AUTH_PROVIDER_ORG`, `TEAMS`, `REPO`, `ALLOW_USERS`

**API Contract** (`/obot-get-state`):

- Request: Serialized HTTP request with method, url, headers (includes cookie)
- Response: User state JSON with accessToken, preferredUsername, user, email, groups
- Returns 400 if `obot_access_token` cookie missing or invalid
- Automatically refreshes expired tokens

**Reference Implementation**: `google-auth-provider/` (canonical example)

### Knowledge Tool Pattern

- Main tool for retrieval
- Context tool for instructions
- Multiple sub-tools for management (ingest, load, delete)
- Credential for model provider (embeddings)
- Output filter for result formatting

## Canonical Examples

**Study these files for best practices**:

1. **`memory/tool.gpt`**
   - Context tools
   - Share Tools/Share Context
   - Multiple sub-tools with CRUD operations
   - Instruction context with XML wrapping

2. **`openai-model-provider/tool.gpt`**
   - Model provider pattern
   - `#!sys.daemon` usage
   - `providerMeta` structure
   - Credential mapping

3. **`github-auth-provider/tool.gpt`**
   - Auth provider pattern
   - `envVars` and `optionalEnvVars`
   - User validation options
   - PostgreSQL integration

4. **`knowledge/tool.gpt`**
   - Complex tool with multiple features
   - Multiple credentials
   - Output filter
   - Dynamic context with shell script

## Registration in index.yaml

All tools must be registered in `index.yaml` under one of four sections:

```yaml
tools:                      # User-facing tools
  memory:
    reference: ./memory

system:                     # System/internal tools
  workflow:
    reference: ./workflow

modelProviders:             # Model providers
  openai-model-provider:
    reference: ./openai-model-provider

authProviders:              # Auth providers
  github-auth-provider:
    reference: ./github-auth-provider
```

**Reference Formats**:

- Directory path: `./memory` (contains tool.gpt)
- Specific file: `./knowledge/ingest.gpt`

## Best Practices

1. **Descriptions are critical** - LLM uses them to decide when to call tool
2. **Keep names concise** - Short, clear, action-oriented
3. **Document parameters** - Clear description of what each parameter does
4. **Use context tools wisely** - Provide instructions and current state
5. **Follow patterns** - Study canonical examples for your tool type
6. **Test validation** - Model/auth providers should have `validate` sub-tool
7. **Secure credentials** - Use placeholder-credential pattern, never hardcode
8. **Wrap instructions** - Use XML tags for clarity in context tools

## Environment Variable Conventions

**Model Providers**:

- Global API key: `OBOT_<PROVIDER>_MODEL_PROVIDER_API_KEY`
- Per-request key: `X-Obot-OBOT_<PROVIDER>_MODEL_PROVIDER_API_KEY` (header)

**Auth Providers**:

- Client ID: `OBOT_<PROVIDER>_AUTH_PROVIDER_CLIENT_ID`
- Client secret: `OBOT_<PROVIDER>_AUTH_PROVIDER_CLIENT_SECRET`
- Cookie secret: `OBOT_AUTH_PROVIDER_COOKIE_SECRET`
- Email domains: `OBOT_AUTH_PROVIDER_EMAIL_DOMAINS`

**Common**:

- Port: `PORT` (default 8000 for providers)
- Debug: `GPTSCRIPT_DEBUG` (enables debug logging)
- Server URL: `OBOT_SERVER_PUBLIC_URL`

## Validation & Testing

**Model Provider Validation**:

```bash
cd openai-model-provider
export OBOT_OPENAI_MODEL_PROVIDER_API_KEY=sk-...
go run . validate  # Exit 0 on success, 1 on failure
```

**Running Locally**:

```bash
export PORT=8000
export GPTSCRIPT_DEBUG=true
go run .
```

**Testing with curl**:

```bash
# List models
curl http://localhost:8000/v1/models

# Test with per-request key
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "X-Obot-OBOT_OPENAI_MODEL_PROVIDER_API_KEY: sk-..." \
  -d '{"model":"gpt-4","messages":[...]}'
```

## Additional Resources

- **Official Docs**: https://docs.gptscript.ai
- **obot-tools README**: ./obot-tools/README.md
- **obot-tools CLAUDE.md**: ./obot-tools/CLAUDE.md
- **Auth Provider Docs**: ./obot-tools/docs/auth-providers.md
