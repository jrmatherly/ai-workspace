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

## Credential Pattern

For OAuth-based tools:

```gpt
Credential: github.com/obot-platform/tools/oauth-credential as oauth with PROVIDER as env and "scope1 scope2" as scope
```

## Common Mistakes

- Missing `Name:` field (tool won't register)
- Wrong credential format (OAuth will fail)
- Missing `Tools:` for HTTP operations
- Inconsistent credential alias usage

## Provider-Specific Patterns

### Google Provider

```gpt
Credential: github.com/obot-platform/tools/oauth-credential as google with GOOGLE as env and "https://www.googleapis.com/auth/calendar.readonly" as scope
```

### Microsoft Provider

```gpt
Credential: github.com/obot-platform/tools/oauth-credential as microsoft with MICROSOFT365 as env and "User.Read Mail.Read" as scope
```

## Validation

Before committing:

1. Ensure all required fields present
2. Verify credential format matches provider
3. Test with `gptscript tool.gpt --help`
