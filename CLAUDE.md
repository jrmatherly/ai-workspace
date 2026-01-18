# CLAUDE.md

Claude Code-specific guidance for the AI/MCP multi-repo workspace. This file complements `AGENTS.md` with Claude-specific tooling and context.

> **Important**: For universal project guidelines (commands, code style, patterns, dos/don'ts), see `AGENTS.md` at the repository root. This file contains only Claude Code-specific information.

## Quick Start

1. **Universal guidelines**: Read `AGENTS.md` for project structure, commands, and conventions
2. **Claude-specific**: This file for Serena MCP, memories, and Claude Code features
3. **Initialization**: Run `/expert-mode` to activate full context with Serena integration

## Multi-Repo Quick Reference (mise + gita)

**CRITICAL:** This is a multi-repo workspace. Always use mise tasks for git operations.

### Status & Sync

```bash
mise run gita-status   # Check all repos (alias: mise gs)
mise run gita-fetch    # Fetch all repos (alias: mise gf)
mise run gita-pull     # Pull all repos (alias: mise gp)
mise run gita-push     # Push all repos
```

### Commits (Conventional Format)

```bash
mise run commit:PROJECT -m "type(scope): message"

# Aliases: ce (obot-entraid), ct (obot-tools), cn (nah), ck (kinm),
#          cm (mcp-oauth-proxy), cc (mcp-catalog), cng (namegenerator)
```

### Push

```bash
mise run push:PROJECT   # Push single project
mise run push-all       # Push all projects
```

### Cross-Project Tasks

```bash
mise run all            # Validate all projects
mise run test-all       # Test all projects
mise run tidy-all       # go mod tidy on all
```

**See `AGENTS.md` for full command reference.**

## Serena MCP Integration

This project uses [Serena MCP](https://github.com/serena-ai/serena) for enhanced code intelligence. Activate the project before working:

```
mcp__plugin_serena_serena__activate_project with project: "AI"
```

### Available Serena Memories

Load these on-demand based on task requirements:

| Memory | When to Load |
| -------- | -------------- |
| `codebase_architecture` | Deep architectural patterns, design decisions |
| `tech_stack_and_dependencies` | Working with dependencies, version updates |
| `task_completion_checklist` | Before completing any task (pre-commit validation) |
| `gptscript_tool_format` | Working on obot-tools .gpt files (CRITICAL) |
| `documentation_best_practices` | Creating formal documentation |
| `code_style_and_conventions` | Detailed style rules beyond AGENTS.md |
| `suggested_commands` | Extended command reference |
| `project_purpose_and_structure` | Deep project details |

**Note**: `AGENTS.md` contains essential commands and conventions. Serena memories provide deeper context when needed.

## Claude Code Directory Structure

```
.claude/
├── commands/
│   └── expert-mode.md           # Session initialization command
├── instructions/
│   ├── context-optimization-guide.md      # Token efficiency strategies
│   ├── documentation-standards.md         # Documentation requirements
│   ├── gptscript-development-guide.md     # GPTScript patterns
│   ├── mise-configuration-guide.md        # mise tool manager setup
│   ├── multi-repo-workspace-guide.md      # Multi-repo management
│   └── claude-code-enhancements-guide-v2.md  # Full enhancements guide
├── agents/                      # Custom subagents
│   ├── go-reviewer.md           # Go code review (sonnet + MCP)
│   ├── arch-analyzer.md         # Architecture analysis (opus + MCP)
│   ├── pre-commit.md            # Pre-commit validation (haiku)
│   └── gptscript-validator.md   # GPTScript validation (haiku)
├── rules/                       # Path-specific auto-activated rules
│   ├── go-tests.md              # **/*_test.go
│   ├── gptscript.md             # **/*.gpt
│   ├── svelte-components.md     # **/ui/**/*.svelte
│   ├── kubernetes.md            # **/pkg/controller/**
│   └── sql-migrations.md        # **/migrations/*.sql
├── skills/                      # Progressive disclosure skills
│   ├── validate-project/        # Pre-commit validation
│   ├── code-review/             # Code review with Level 3 resources
│   └── new-provider/            # Model provider scaffolding
├── output-styles/               # Response formatting
│   ├── minimal.md               # Terse responses
│   ├── teaching.md              # Educational mode
│   └── debugging.md             # Structured debugging
├── settings.json                # Hooks configuration
└── settings.local.json          # Local overrides
```

### Key Commands

| Command | Purpose |
| --------- | --------- |
| `/expert-mode` | Initialize session with Serena + context loading |

### Custom Agents

| Agent | Model | Purpose |
| --------- | --------- | --------- |
| `go-reviewer` | sonnet | Go code review with serena + claude-context MCP |
| `arch-analyzer` | opus | Architecture analysis with MCP integration |
| `pre-commit` | haiku | Fast pre-commit validation |
| `gptscript-validator` | haiku | GPTScript file validation |

### Path-Specific Rules

Rules auto-activate based on file patterns:

| Rule | Glob Pattern | Purpose |
| --------- | --------- | --------- |
| `go-tests.md` | `**/*_test.go` | Table-driven tests, subtests |
| `gptscript.md` | `**/*.gpt` | Tool format, credentials |
| `svelte-components.md` | `**/ui/**/*.svelte` | Svelte 5 runes, SvelteKit |
| `kubernetes.md` | `**/pkg/controller/**` | Reconciliation patterns, nah |
| `sql-migrations.md` | `**/migrations/*.sql` | PostgreSQL conventions |

### Key Instructions

| File | When to Load |
| ------ | ------ |
| `context-optimization-guide.md` | Understanding token efficiency |
| `documentation-standards.md` | Creating formal documentation |
| `gptscript-development-guide.md` | Working on obot-tools .gpt files |
| `mise-configuration-guide.md` | Tool management and task configuration |
| `multi-repo-workspace-guide.md` | Multi-repository operations with gita |
| `claude-code-enhancements-guide-v2.md` | Full enhancement reference |

## Context Optimization

Claude Code automatically injects this file (~1,200 tokens) into every conversation. To minimize context usage:

1. **Don't re-read CLAUDE.md** - it's already in context
2. **Reference AGENTS.md** - universal content is there
3. **Load memories on-demand** - not upfront
4. **Use file-scoped commands** - faster than full project validation

See `.claude/instructions/context-optimization-guide.md` for detailed strategies.

## Per-Project Claude Guidance

Each project has its own `CLAUDE.md` with project-specific details:

| Project | Claude Guide |
| --------- | --------- |
| obot-entraid | `obot-entraid/CLAUDE.md` - Full-stack MCP platform |
| nah | `nah/CLAUDE.md` - K8s controller framework |
| kinm | `kinm/CLAUDE.md` - K8s-like API server |
| mcp-oauth-proxy | `mcp-oauth-proxy/CLAUDE.md` - OAuth 2.1 proxy |
| obot-tools | `obot-tools/CLAUDE.md` - Tools and providers |
| mcp-catalog | `mcp-catalog/CLAUDE.md` - MCP catalog |
| namegenerator | `namegenerator/CLAUDE.md` - Name generator |

**Load project CLAUDE.md** when doing deep work in that project. For quick tasks, `AGENTS.md` is sufficient.

## SuperClaude Commands

Available `/sc:*` commands for enhanced workflows:

```
/sc:analyze    - Code analysis and quality assessment
/sc:build      - Build and compile projects
/sc:test       - Execute tests with coverage
/sc:implement  - Feature implementation with context
/sc:troubleshoot - Diagnose and resolve issues
/sc:document   - Generate documentation
/sc:design     - Design architecture and APIs
/sc:git        - Git operations with smart commits
```

## Specialized Agents

Available via the Task tool for complex operations:

| Agent Category | Purpose |
| --------- | --------- |
| `code-documentation:*` | Documentation generation |
| `debugging-toolkit:*` | Debugging and troubleshooting |
| `backend-development:*` | Backend architecture |
| `cloud-infrastructure:*` | Infrastructure and deployment |
| `python-development:*` | Python-specific tasks |
| `javascript-typescript:*` | Frontend/TypeScript tasks |

## Hooks Automation

Configured in `.claude/settings.json`:

| Event | Trigger | Action |
| --------- | --------- | --------- |
| `PreToolUse` | Before Bash | Block dangerous commands |
| `PostToolUse` | After Write/Edit | Auto-format Go files, log changes |
| `Stop` | End of response | Remind about uncommitted changes |
| `SessionStart` | New session | Log session start |
| `Notification` | Alerts | macOS desktop notifications |

## GitHub Actions Integration

CI/CD workflows using Claude Code GitHub App (`.github/workflows/`):

| Workflow | Trigger | Purpose |
| --------- | --------- | --------- |
| `claude.yml` | @claude mentions in issues/PRs | General assistant |
| `claude-code-review.yml` | PR opened/updated | Automated code review |
| `claude-triage.yml` | Issue opened | Auto-triage new issues |
| `codeql.yml` | Push/PR to main, weekly | Security scanning for workflows |
| `markdown-lint.yml` | PR with markdown changes | Lint markdown files |

Claude workflows use `CLAUDE_CODE_OAUTH_TOKEN` for authentication via the Claude Code GitHub App.

## When to Read What

| Task | Read |
| --------- | --------- |
| Any task | `AGENTS.md` (universal guidelines) |
| Deep project work | Project-specific `CLAUDE.md` |
| Architecture design | `codebase_architecture` memory |
| Pre-commit | `task_completion_checklist` memory |
| GPTScript work | `gptscript_tool_format` memory |
| Documentation | `documentation-standards.md` instruction |

---

*For universal project guidelines, commands, code patterns, and conventions, see `AGENTS.md`.*
