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

## Share Context Check

If tool needs to share data with sub-tools:

```gpt
Share Context: github.com/obot-platform/tools/shared-context
```

## Common Issues

1. **Missing Name field** - Tool won't register
2. **Missing Tools field** - HTTP calls will fail
3. **Wrong credential format** - OAuth will fail silently
4. **Inconsistent credential alias** - Runtime errors

## Validation Process

1. Find all .gpt files: `obot-tools/**/tool.gpt`
2. Parse each file for required fields
3. Validate credential format if present
4. Check for common mistakes

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
