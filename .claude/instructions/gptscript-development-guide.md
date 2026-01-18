# GPTScript Development Guide

This guide covers GPTScript `.gpt` file development patterns for the **obot-tools** project.

## When to Use This Guide

Working on obot-tools and need to:

- Create or modify `.gpt` tool definition files
- Understand tool directives and parameters
- Implement model providers, auth providers, or context tools
- Debug tool definitions

## Prerequisites

Before using this guide, ensure you have:

- Loaded `gptscript_tool_format` memory (CRITICAL)
- Read `obot-tools/CLAUDE.md` for project architecture
- Familiarized yourself with obot-tools structure

## Canonical Examples

Use these as reference implementations:

### Context Tools

**File:** `memory/tool.gpt`

- Pattern: `Type: context`, `Share Tools`, `Share Context`
- Best for: Tools that provide contextual information

### Model Providers

**File:** `openai-model-provider/tool.gpt`

- Pattern: `Model Provider: true`, `#!sys.daemon`, `providerMeta` structure
- HTTP server on port 8000
- OpenAI-compatible API format
- Proxy pattern for API forwarding

### Auth Providers

**File:** `github-auth-provider/tool.gpt`

- Pattern: `envVars`/`optionalEnvVars`, OAuth2 endpoints
- OAuth2 flow with encrypted cookies
- See `obot-tools/docs/auth-providers.md` for requirements

### Complex Tools

**File:** `knowledge/tool.gpt`

- Multiple features and capabilities
- Advanced parameter handling

## Key Patterns

### Model Providers

```gpt
Model Provider: true
#!sys.daemon
```

- Must include `providerMeta` in response
- Run as HTTP daemon on port 8000
- Follow OpenAI-compatible API structure

### Auth Providers

```gpt
envVars: CLIENT_ID, CLIENT_SECRET
optionalEnvVars: SCOPES
```

- OAuth2 authorization/token endpoints
- Encrypted cookie management
- User info retrieval

### Context Tools

```gpt
Type: context
Share Tools: tool1, tool2
Share Context: contextKey
```

- Provide contextual information to other tools
- Can share both tools and context data

### Parameter Handling

- Parameters in `.gpt` files become UPPERCASE environment variables
- Example: `param: apiKey` → `API_KEY` env var
- Use `envVars` for required, `optionalEnvVars` for optional

## Directory Structure

Each component in obot-tools follows this pattern:

```text
component-name/
├── tool.gpt           # Tool definition (GPTScript format)
├── main.go|main.py    # Implementation
├── README.md          # Component documentation
└── Dockerfile         # Container definition (if needed)
```

## Development Workflow

1. **Study canonical example** for your component type (model provider, auth provider, context tool)
2. **Load `gptscript_tool_format` memory** for complete format reference
3. **Create `tool.gpt`** following the pattern
4. **Implement server/logic** in Go/Python/TypeScript
5. **Test locally** with GPTScript CLI
6. **Update `index.yaml`** in obot-tools root
7. **Validate** with `make test`

## Specialized Documentation

For auth provider implementation details:

- `obot-tools/docs/auth-providers.md` - Complete auth provider requirements

For registry/index structure:

- `obot-tools/index.yaml` - Central registry with sections: tools, system, modelProviders, authProviders

## Common Pitfalls

1. **Missing daemon directive** for model providers (`#!sys.daemon`)
2. **Incorrect port** - model providers must use port 8000
3. **Wrong parameter casing** - parameters become UPPERCASE env vars
4. **Missing providerMeta** in model provider responses
5. **Incomplete OAuth2 flow** in auth providers

## Quick Reference

| Component Type | Key Directives | Port | Examples |
| -------------- | -------------- | ---- | -------- |
| Model Provider | `Model Provider: true`, `#!sys.daemon` | 8000 | openai-model-provider, anthropic-model-provider |
| Auth Provider | `envVars`, `optionalEnvVars` | varies | github-auth-provider, google-auth-provider |
| Context Tool | `Type: context`, `Share Tools/Context` | N/A | memory, knowledge |
| Standard Tool | Standard GPTScript directives | N/A | search, calculator |

## Resources

- **Memory:** `gptscript_tool_format` - Complete GPTScript format reference
- **Project Guide:** `obot-tools/CLAUDE.md` - Full project architecture
- **Auth Providers:** `obot-tools/docs/auth-providers.md` - Auth provider requirements
- **Registry:** `obot-tools/index.yaml` - Component registry structure
