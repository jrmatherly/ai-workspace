# Security Policy

## Overview

This is the **AI/MCP Multi-Repo Workspace** root repository containing shared configuration, documentation, and tooling. Each child project (obot-entraid, nah, kinm, mcp-oauth-proxy, obot-tools, mcp-catalog, namegenerator) has its own independent repository and security policy.

## Scope

This security policy covers the **workspace root repository only**:

- Shared documentation (AGENTS.md, CLAUDE.md, etc.)
- Claude Code configuration (`.claude/`)
- Serena MCP memories (`.serena/`)
- GitHub Actions workflows (`.github/workflows/`)
- Tool configuration (mise.toml, go.work.example)

**For project-specific security issues**, please refer to each project's own SECURITY.md:

| Project | Security Policy |
|---------|-----------------|
| obot-entraid | [obot-entraid/SECURITY.md](https://github.com/jrmatherly/obot-entraid/blob/main/SECURITY.md) |
| nah | [nah/SECURITY.md](https://github.com/jrmatherly/nah/blob/main/SECURITY.md) |
| kinm | [kinm/SECURITY.md](https://github.com/jrmatherly/kinm/blob/main/SECURITY.md) |
| mcp-oauth-proxy | [mcp-oauth-proxy repository](https://github.com/jrmatherly/mcp-oauth-proxy) |
| obot-tools | [obot-tools repository](https://github.com/jrmatherly/obot-tools) |
| mcp-catalog | [mcp-catalog repository](https://github.com/jrmatherly/mcp-catalog) |
| namegenerator | [namegenerator repository](https://github.com/jrmatherly/namegenerator) |

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in this workspace configuration, please report it responsibly:

1. **GitHub Security Advisories**: Use the "Report a vulnerability" button in the [Security tab](https://github.com/jrmatherly/ai-workspace/security)
2. **Email**: Contact the repository maintainer directly

### What to Include

When reporting a vulnerability, please provide:

- Type of vulnerability (e.g., CI/CD injection, secret exposure, configuration bypass)
- Full path(s) of affected file(s)
- Location of affected configuration (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit scenario (if possible)
- Impact assessment and potential consequences

### Response Timeline

- **Initial Response**: Within 48 hours (2 business days)
- **Status Update**: Within 7 days
- **Resolution Target**: Within 30 days for critical issues (complex issues may take longer)

## Disclosure Policy

We follow coordinated disclosure practices:

- We will work with you to validate and remediate the vulnerability
- After a fix or mitigation is available, we'll publish release notes
- Security researchers who wish to be acknowledged will be credited in release notes

## In Scope

Security issues in the workspace root repository that could impact:

- **CI/CD Pipeline Security**: Workflow injection, secret leakage, unauthorized execution
- **Configuration Integrity**: Malicious modifications to shared configuration
- **Supply Chain**: Compromised tool versions or dependencies in mise.toml
- **Access Control**: CODEOWNERS bypass, unauthorized repository access
- **Secret Exposure**: Accidental commit of secrets, API keys, or credentials

## Out of Scope

The following are **out of scope** for this repository:

- Vulnerabilities in child project code (report to respective project)
- Vulnerabilities in upstream dependencies (report upstream)
- Theoretical issues without practical exploitation path
- Issues requiring physical access to developer machines
- Social engineering attacks

## Safe Harbor

We will not pursue legal action against security researchers conducting good-faith research aligned with this policy.

Please avoid:

- Privacy violations
- Service degradation or denial of service
- Data destruction or corruption
- Testing against accounts or data you do not own

## Security Best Practices

This workspace follows security best practices including:

### CI/CD Security

- **Least-privilege workflows**: GitHub Actions use minimal required permissions
- **Read-only tools in CI**: Claude Code review/triage workflows use read-only tools
- **No secrets in code**: All sensitive configuration via environment variables
- **Workflow pinning**: Actions pinned to specific versions where possible

### Repository Security

- **CODEOWNERS**: All security-sensitive files require explicit approval
- **Branch protection**: (Recommended) Require reviews before merging to main
- **Signed commits**: (Recommended) Enable commit signing

### Tool Security

- **mise tool pinning**: Explicit versions for reproducibility
- **Trusted sources**: Tools from official registries (aqua, pipx)
- **No arbitrary code execution**: mise tasks reviewed for safety

### Configuration Security

- **Local settings ignored**: `.claude/settings.local.json` excluded from version control
- **No credentials in config**: All authentication via secure environment variables
- **Gitignore enforcement**: Child repositories excluded to prevent accidental exposure

## Workspace-Specific Security Considerations

### Claude Code Configuration

The `.claude/` directory contains AI assistant configuration. Security considerations:

- **Instructions**: Review `.claude/instructions/` for any sensitive information exposure
- **Rules**: Path-specific rules should not leak internal implementation details
- **Settings**: `settings.local.json` is gitignored (may contain local paths)

### Serena MCP Memories

The `.serena/memories/` directory contains project knowledge. Security considerations:

- **No secrets**: Memories should never contain API keys, passwords, or tokens
- **No PII**: Avoid storing personally identifiable information
- **Cache excluded**: `.serena/cache/` is gitignored

### GitHub Actions Workflows

Workflows in `.github/workflows/` can execute code. Security considerations:

- **Claude Code workflows**: Use read-only tools (Read, Glob, Grep, Task)
- **No write permissions**: Review workflows do not have write access to repository
- **Token scope**: `ANTHROPIC_API_KEY` scoped to specific workflows only

## Receiving Security Fixes

Security fixes are applied directly to the main branch. We recommend:

- Pull the latest changes regularly
- Monitor release notes for security advisories
- Enable GitHub notifications for this repository

## Credits

With permission from reporters, we will credit security researchers in release notes and acknowledge their contributions to improving the security of this workspace.

Thank you for helping keep the AI/MCP workspace and its users safe!

---

*Security Policy Version: 1.0.0*
*Last Updated: January 2026*
