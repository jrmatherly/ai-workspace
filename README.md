# AI/MCP Multi-Repo Workspace

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.23--1.25-00ADD8?logo=go)](https://go.dev/)
[![Projects](https://img.shields.io/badge/Projects-7-green.svg)](#-whats-inside)

**A comprehensive collection of AI/MCP technologies, Kubernetes tools, and authentication systems.**

> 🚀 **Quick Start:** [Documentation Guide](./documentation/reference/DOCUMENTATION_GUIDE.md) • [Project Index](./documentation/reference/PROJECT_INDEX.md) • [API Reference](./documentation/reference/API_REFERENCE.md)

---

## 📋 What's Inside

This workspace contains **7 independent projects** focused on cloud-native AI infrastructure:

| Project | Description | Tech Stack |
| --------- | ------------- | ------------ |
| **[obot-entraid](./obot-entraid/)** 🔐 | MCP platform with custom auth (Entra ID, Keycloak) | Go, SvelteKit, PostgreSQL |
| **[nah](./nah/)** ⚙️ | Kubernetes controller framework library | Go, controller-runtime |
| **[kinm](./kinm/)** 🗄️ | K8s-like API server backed by PostgreSQL | Go, PostgreSQL |
| **[mcp-oauth-proxy](./mcp-oauth-proxy/)** 🔑 | OAuth 2.1 proxy for MCP servers | Go, PostgreSQL/SQLite |
| **[obot-tools](./obot-tools/)** 🛠️ | Tools, model providers, auth providers | Go, Python, TypeScript |
| **[mcp-catalog](./mcp-catalog/)** 📚 | MCP server configuration catalog | YAML |
| **[namegenerator](./namegenerator/)** 🎲 | Random name generator for containers/pods | Go (zero dependencies) |

---

## 🎯 Key Features

### 🤖 AI/MCP Technologies

- **MCP Server Hosting** - Deploy and manage Model Context Protocol servers
- **Multi-Model Support** - OpenAI, Anthropic, Ollama, Groq, xAI, DeepSeek
- **RAG Integration** - Knowledge base with vector search
- **OAuth 2.1 Proxy** - Add authentication to any MCP server

### ☸️ Kubernetes Tools

- **Controller Framework** - Build custom controllers with declarative patterns
- **API Server** - Create K8s-like CRUD APIs backed by PostgreSQL
- **Leader Election** - High availability support

### 🔐 Authentication

- **Microsoft Entra ID** - Azure AD authentication with profile pictures
- **Keycloak** - OpenID Connect authentication
- **GitHub/Google OAuth** - OAuth2 providers
- **Multi-Provider Proxy** - Unified OAuth 2.1 gateway

---

## 🚀 Quick Start

### Prerequisites

```bash
# Check requirements
go version       # 1.23+ required
git --version
make --version

# Optional (project-specific)
node --version   # 18+ for frontend
python3 --version # 3.13+ for Python tools
docker --version
```

### Recommended: Use mise (Polyglot Tool Manager)

[mise](https://mise.jdx.dev) manages all project tools and provides unified task running:

```bash
# Install mise
curl https://mise.run | sh

# Install all tools (go, node, python, golangci-lint, gita)
cd AI && mise trust && mise install

# View available tasks
mise tasks

# Validate all projects
mise all
```

See [mise Configuration Guide](./.claude/instructions/mise-configuration-guide.md) for details.

### Choose Your Path

#### Path 1: Build a Kubernetes Controller

```bash
cd nah
make build && make test
# See nah/README.md for examples
```

#### Path 2: Deploy MCP Platform

```bash
cd obot-entraid
make build
# See obot-entraid/README.md for setup
```

#### Path 3: Add OAuth to MCP Server

```bash
cd mcp-oauth-proxy
export OAUTH_CLIENT_ID="..." OAUTH_CLIENT_SECRET="..."
export ENCRYPTION_KEY="$(openssl rand -base64 32)"
go run .
# See mcp-oauth-proxy/README.md for configuration
```

#### Path 4: Create Custom Tools

```bash
cd obot-tools
make build
# See obot-tools/docs/DEVELOPER_GUIDE.md
```

---

## 📚 Documentation

### 📖 Essential Guides

| Document | Purpose | Audience |
| ---------- | --------- | ---------- |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | One-page command reference | Active developers |
| **[DEVELOPER_ONBOARDING.md](./documentation/reference/DEVELOPER_ONBOARDING.md)** | Complete onboarding guide | New contributors |
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | Issue resolution guide | Debugging |
| **[ARCHITECTURE.md](./documentation/reference/ARCHITECTURE.md)** | Visual architecture diagrams | Architects, visual learners |
| **[DOCUMENTATION_GUIDE.md](./documentation/reference/DOCUMENTATION_GUIDE.md)** | Navigation and learning paths | Everyone |
| **[PROJECT_INDEX.md](./documentation/reference/PROJECT_INDEX.md)** | Comprehensive project reference | Developers, AI |
| **[API_REFERENCE.md](./documentation/reference/API_REFERENCE.md)** | Cross-project API documentation | API integrators |

### 🎯 By Task

- **Building Controllers?** → [nah/README.md](./nah/README.md)
- **Adding OAuth?** → [mcp-oauth-proxy/README.md](./mcp-oauth-proxy/README.md)
- **Deploying Obot?** → [obot-entraid/README.md](./obot-entraid/README.md)
- **Creating Tools?** → [obot-tools/README.md](./obot-tools/README.md)
- **Building APIs?** → [kinm/README.md](./kinm/README.md)
- **MCP Integration?** → [mcp-catalog/PROJECT_INDEX.md](./mcp-catalog/PROJECT_INDEX.md)

### 🤖 AI Assistant Guides

**Expert Mode Onboarding** - For Claude Code AI assistants:

```bash
/expert-mode
```

This intelligent onboarding command:

- ✅ Auto-detects which project(s) you're working on (via directory, branch, keywords)
- ✅ Loads relevant context efficiently (~20-30K tokens)
- ✅ Provides comprehensive understanding of workspace structure
- ✅ Enables immediate productivity with proper architectural context

See [Expert Mode Analysis](./EXPERT_MODE_ANALYSIS.md) for design details and token efficiency metrics.

**Project-Specific CLAUDE.md Files:**

- [obot-entraid/CLAUDE.md](./obot-entraid/CLAUDE.md) - MCP platform, auth providers, SvelteKit
- [nah/CLAUDE.md](./nah/CLAUDE.md) - K8s controller framework patterns
- [obot-tools/CLAUDE.md](./obot-tools/CLAUDE.md) - GPTScript tools, model/auth providers
- [mcp-oauth-proxy/CLAUDE.md](./mcp-oauth-proxy/CLAUDE.md) - OAuth 2.1 flow, JWT handling
- [mcp-catalog/CLAUDE.md](./mcp-catalog/CLAUDE.md) - MCP server catalog

**Serena AI Memories** (`.serena/memories/`):

- Project structure and purpose
- Technology stack
- Code style and conventions
- Suggested commands
- Task completion checklist
- Architecture details

---

## 🏗️ Architecture

### Workspace Structure

```
AI/
├── obot-entraid/         # MCP platform (Go + SvelteKit)
├── nah/                  # K8s controller framework (Go library)
├── kinm/                 # K8s-like API server (Go + PostgreSQL)
├── mcp-oauth-proxy/      # OAuth 2.1 proxy (Go)
├── obot-tools/           # Tools & providers (Go/Python/TS)
├── mcp-catalog/          # MCP configs (YAML)
├── .claude/              # Claude Code config
├── .serena/              # Serena AI memories
├── documentation/
│   ├── reference/        # Consolidated reference docs
│   │   ├── PROJECT_INDEX.md
│   │   ├── API_REFERENCE.md
│   │   ├── ARCHITECTURE.md
│   │   ├── DOCUMENTATION_GUIDE.md
│   │   └── DEVELOPER_ONBOARDING.md
│   ├── projects/         # Project work docs
│   └── archive/          # Superseded docs
└── QUICK_REFERENCE.md    # Command reference
```

### Technology Stack

- **Languages:** Go 1.23-1.25, Python 3.13+, TypeScript
- **Frontend:** SvelteKit 5, Tailwind CSS 4
- **Backend:** Kubernetes client-go, controller-runtime
- **Databases:** PostgreSQL, SQLite
- **AI/ML:** OpenAI, Anthropic, Ollama, local models
- **Auth:** OAuth 2.0/2.1, OIDC, PKCE
- **Observability:** OpenTelemetry, logrus
- **Build:** mise, Make, Docker, Helm
- **Multi-Repo:** gita (bulk git operations)

See [tech stack documentation](./.serena/memories/tech_stack_and_dependencies.md) for details.

---

## 🛠️ Development

### Universal Commands

Work across all Go projects:

```bash
# Build
make build

# Test
make test
go test -race ./...      # With race detector
go test -cover ./...     # With coverage

# Lint
make validate
golangci-lint run

# Format
go fmt ./...

# Dependencies
go mod tidy
```

### Pre-Commit Checklist

```bash
go generate              # Generate code
go mod tidy              # Tidy dependencies
go fmt ./...             # Format
golangci-lint run        # Lint
go test ./...            # Test
make validate-ci         # CI validation (critical!)
```

See [task completion checklist](./.serena/memories/task_completion_checklist.md) for details.

---

## 🎓 Learning Resources

### Tutorials

- **[nah Examples](./nah/docs/examples/)** - Kubernetes controller examples
- **[obot-tools Guide](./obot-tools/docs/DEVELOPER_GUIDE.md)** - Tool development
- **[Project Index](./documentation/reference/PROJECT_INDEX.md)** - Comprehensive reference

### Architecture Docs

- **[Codebase Architecture](./.serena/memories/codebase_architecture.md)** - Overall design
- **[nah Architecture](./nah/docs/architecture/)** - Controller patterns
- **[obot-tools Architecture](./obot-tools/docs/ARCHITECTURE.md)** - Tools design

### Code Patterns

- **[Code Style](./.serena/memories/code_style_and_conventions.md)** - Coding standards
- **[Suggested Commands](./.serena/memories/suggested_commands.md)** - Common workflows

---

## 🤝 Contributing

We welcome contributions! Each project has specific guidelines:

- **obot-entraid:** [CONTRIBUTING.md](./obot-entraid/CONTRIBUTING.md)
- **nah:** [CONTRIBUTING.md](./nah/CONTRIBUTING.md)

### General Guidelines

1. **Follow Conventional Commits** - `feat(scope): description`
2. **Run validation** - `make validate-ci` before committing
3. **Add tests** - For new features
4. **Update docs** - Keep documentation current
5. **No secrets** - Never commit sensitive data

See [code style guide](./.serena/memories/code_style_and_conventions.md) for details.

---

## 📊 Project Statistics

| Metric | Value |
| -------- | ------- |
| **Total Projects** | 6 independent modules |
| **Languages** | Go, Python, TypeScript |
| **Go Packages** | 140+ across all projects |
| **Lines of Code** | ~50,000+ (estimated) |
| **Documentation** | 40+ markdown files |

---

## 🔍 Common Use Cases

### Use Case 1: Kubernetes Automation

**Project:** nah  
**Pattern:** Declarative controller with apply semantics  
**Guide:** [nah/docs/guides/controllers.md](./nah/docs/guides/controllers.md)

### Use Case 2: MCP Server Authentication

**Project:** mcp-oauth-proxy  
**Pattern:** OAuth 2.1 proxy with header injection  
**Guide:** [mcp-oauth-proxy/README.md](./mcp-oauth-proxy/README.md)

### Use Case 3: AI Model Integration

**Project:** obot-tools  
**Pattern:** OpenAI-compatible model providers  
**Guide:** [obot-tools/docs/ARCHITECTURE.md](./obot-tools/docs/ARCHITECTURE.md)

### Use Case 4: Custom API Servers

**Project:** kinm  
**Pattern:** PostgreSQL-backed K8s-like CRUD API  
**Guide:** [kinm/docs/API.md](./kinm/docs/API.md)

---

## 🌟 Highlights

### nah - Kubernetes Controller Framework

- **94% token savings** with consolidated PROJECT_INDEX.md (15KB vs 300K+ full codebase)
- **Declarative patterns** like `kubectl apply`
- **Leader election** built-in for HA
- **OpenTelemetry** integrated

### obot-entraid - MCP Platform

- **Custom auth providers** for Entra ID and Keycloak
- **MCP hosting** for Node.js, Python, containers
- **Chat client** with RAG and multi-model support
- **Production fork** with active development

### obot-tools - Provider Collection

- **10+ model providers** (OpenAI, Anthropic, Ollama, etc.)
- **Auth providers** for GitHub and Google
- **Core tools** (memory, knowledge, tasks)
- **Unified registry** via index.yaml

### mcp-oauth-proxy - OAuth Gateway

- **OAuth 2.1** with PKCE support
- **Multi-provider** (Google, Microsoft, GitHub)
- **Header injection** for user context
- **Production-ready** with encryption

---

## 📄 License

All projects: **Apache License 2.0**

See individual LICENSE files in each project directory.

---

## 🔗 Links

### Project Repositories

- **obot-entraid:** Fork of [obot-platform/obot](https://github.com/obot-platform/obot)
- **nah:** [github.com/obot-platform/nah](https://github.com/obot-platform/nah)
- **obot-tools:** [github.com/jrmatherly/obot-tools](https://github.com/jrmatherly/obot-tools)

### External Resources

- **Obot Platform:** https://docs.obot.ai/
- **MCP Specification:** https://modelcontextprotocol.io/
- **Kubernetes:** https://kubernetes.io/docs/

---

## 📞 Support

- **Documentation:** See [DOCUMENTATION_GUIDE.md](./documentation/reference/DOCUMENTATION_GUIDE.md)
- **Issues:** Open in respective project directories
- **Questions:** Use GitHub Discussions

---

## 🎯 Next Steps

### New Users

1. Read [DOCUMENTATION_GUIDE.md](./documentation/reference/DOCUMENTATION_GUIDE.md)
2. Choose a project from [PROJECT_INDEX.md](./documentation/reference/PROJECT_INDEX.md)
3. Follow project README for setup
4. Review examples and start coding

### Contributors

1. Review [Contributing Guidelines](#-contributing)
2. Check [code style guide](./.serena/memories/code_style_and_conventions.md)
3. Use [task checklist](./.serena/memories/task_completion_checklist.md)
4. Submit PRs with Conventional Commits

### AI Assistants

1. Run `/expert-mode` command for intelligent onboarding
2. Load project-specific context based on task
3. Reference QUICK_REFERENCE.md for commands
4. Use TROUBLESHOOTING.md when encountering issues

---

**Made with ❤️ for cloud-native AI infrastructure**

*Last Updated: 2026-01-17*
