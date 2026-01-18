---
id: overview
title: AI Workspace Documentation
sidebar_label: Overview
slug: /
---

# AI Workspace Documentation

Welcome to the documentation for the AI/MCP multi-repo workspace. This documentation covers project-specific implementations, architectural decisions, guides, and reference materials.

## Quick Navigation

### Reference Documentation

- **[Architecture](/reference/architecture)** - System architecture and design patterns
- **[API Reference](/reference/api-reference)** - API documentation and specifications
- **[Developer Onboarding](/reference/developer-onboarding)** - Getting started guide for developers
- **[Project Index](/reference/project-index)** - Complete index of workspace projects

### Guides

- **[Branch Protection Checklist](/guides/branch-protection-checklist)** - GitHub branch protection configuration
- **[Documentation Alignment Guide](/guides/project-documentation-alignment-guide)** - Standards for project documentation
- **[Context Optimization Review](/guides/workspace-context-optimization-review)** - Token and context efficiency strategies

## Workspace Structure

The AI workspace contains multiple repositories:

| Repository | Description | Status |
|------------|-------------|--------|
| **obot-entraid** | Full-stack MCP platform with Entra ID auth | Active |
| **obot-tools** | Tools, model providers, auth providers | Active |
| **mcp-oauth-proxy** | OAuth 2.1 proxy for MCP servers | Active |
| **mcp-catalog** | MCP server catalog and registry | Active |
| **nah** | Kubernetes controller framework | Active |
| **kinm** | Kubernetes-like API server | Active |
| **namegenerator** | Human-readable name generator | Active |

## Project Documentation

Detailed documentation for specific projects and implementations:

### Active Projects

- **[Fork References Migration](/projects/fork-references/)** - Migration from upstream to fork repositories
- **[Auth Providers](/projects/auth-providers/)** - Authentication provider implementations
- **[Token Tracking Optimization](/projects/token-tracking-optimization/phase1-slash-command/phase1-reflection-validation-report)** - Context and token efficiency

### Completed Projects

- **[Docusaurus Configuration](/projects/docusaurus-config/)** - Documentation site versioning
- **[Documentation Standards](/projects/documentation-standards/validation-report)** - Quality validation

## Development Resources

### Claude Code Integration

The workspace includes comprehensive Claude Code enhancements:

- **Custom Agents** - Specialized subagents for code review, architecture analysis
- **Path-Specific Rules** - Auto-activated rules for Go, Svelte, Kubernetes, SQL
- **Skills** - Progressive disclosure skills for validation, code review
- **Hooks** - Pre/post tool hooks for automation

### MCP Integration

- **Serena MCP** - Semantic code intelligence and analysis
- **Context7 MCP** - Framework documentation retrieval
- **Flux MCP** - Kubernetes/GitOps operations

## Getting Started

1. **Clone the workspace**: Set up the multi-repo environment
2. **Read the architecture**: Understand the system design
3. **Follow onboarding**: Complete the developer onboarding guide
4. **Explore projects**: Dive into specific project documentation

## Contributing

See the [Documentation Guide](/reference/documentation-guide) for standards and conventions when contributing documentation.
