---
name: Bug Report
about: Report a bug in workspace configuration, tooling, or documentation
title: '[BUG] '
labels: bug
assignees: ''
---

## Describe the Bug

A clear and concise description of what the bug is.

## Affected Component

<!-- Check all that apply -->

- [ ] Claude Code configuration (`.claude/`)
- [ ] Serena MCP memories (`.serena/`)
- [ ] GitHub Actions workflows
- [ ] mise.toml / tool configuration
- [ ] Documentation (AGENTS.md, CLAUDE.md, etc.)
- [ ] go.work configuration
- [ ] Other (describe below)

## To Reproduce

Steps to reproduce the behavior:

1. Run command '...'
2. Open file '...'
3. See error

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

What actually happened? Include error messages or unexpected output.

```
# Paste error messages or logs here
```

## Environment

<!-- Fill in the relevant details -->

**Operating System:** <!-- e.g., macOS 14, Ubuntu 22.04 -->
**Claude Code Version:** <!-- e.g., 1.0.0 -->
**mise Version:** <!-- Run: mise --version -->
**Shell:** <!-- e.g., zsh, bash -->

## Workspace Context

**Affected child projects:** <!-- e.g., nah, obot-entraid, or "none" -->
**gita status:** <!-- Run: gita ll -->

<details>
<summary>Click to expand workspace status</summary>

```
# Paste output of: gita ll
```

</details>

## Additional Context

Add any other context about the problem here:

- Does this happen consistently or intermittently?
- Did this work in a previous version?
- Are there any workarounds you've found?

## Possible Solution

<!-- Optional: If you have ideas on how to fix this, share them here -->
