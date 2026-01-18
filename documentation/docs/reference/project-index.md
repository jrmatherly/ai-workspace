# AI/MCP Multi-Repo Workspace - Project Index

**Last Updated:** 2026-01-17
**Type:** Multi-repo workspace (independent git repositories)
**Primary Language:** Go 1.23-1.25
**Token Efficiency:** ~15K tokens vs 300K+ full codebase read

> **Quick Nav:** [Projects](#projects) | [Structure](#structure) | [Entry Points](#entry-points) | [APIs](#key-apis) | [Development](#development)

---

## Overview

| Metric | Value |
|--------|-------|
| **Total Projects** | 7 independent modules |
| **Languages** | Go, Python, TypeScript |
| **Lines of Code** | ~50,000+ |
| **Primary Focus** | Cloud-native AI infrastructure and Kubernetes automation |

### Project Summary

| Project | Type | LoC | Files | Main Entry |
|---------|------|-----|-------|------------|
| **obot-entraid** | Platform | 20K+ | 500+ | `main.go` |
| **nah** | Library | 15K+ | 68 | `router.go` (API) |
| **kinm** | Server | 8K+ | 50+ | TBD |
| **mcp-oauth-proxy** | Server | 5K+ | 30+ | TBD |
| **obot-tools** | Collection | 15K+ | 200+ | Multiple `main.go` |
| **mcp-catalog** | Config | 0 | YAML | N/A |
| **namegenerator** | Library | 500 | 4 | Package API |

---

## Projects

### 1. obot-entraid

**Type:** Full-stack MCP platform with custom authentication
**Status:** Production fork
**Tech Stack:** Go 1.25.5, SvelteKit 5, PostgreSQL

Fork of [obot-platform/obot](https://github.com/obot-platform/obot) with Microsoft Entra ID and Keycloak authentication.

**Key Features:**

- MCP server hosting (Node.js, Python, containers)
- MCP registry and gateway
- Chat client with RAG and multi-model support
- Custom auth providers: Entra ID, Keycloak

**Quick Links:** [README](../../obot-entraid/README.md) | [CONTRIBUTING](../../obot-entraid/CONTRIBUTING.md) | [CLAUDE.md](../../obot-entraid/CLAUDE.md)

**Development:**

```bash
cd obot-entraid
make build && make test && make lint
cd ui/user && pnpm run dev  # Frontend
```

**Package Structure:**

```
pkg/
├── server/        → HTTP server and routing
├── mcp/           → MCP protocol implementation
├── invoke/        → Task invocation engine
├── cli/           → CLI commands
├── oauth/         → OAuth handling
├── credstores/    → Credential storage
└── bootstrap/     → Platform initialization
```

---

### 2. nah

**Type:** Kubernetes controller framework library
**Status:** Stable library
**Tech Stack:** Go 1.24.0, controller-runtime, client-go

"Not Another Handler" - Lightweight controller framework with declarative patterns.

**Key Features:**

- Event routing with fluent API
- Declarative apply (`kubectl apply`-like)
- Leader election (lease & file-based)
- OpenTelemetry integration
- GVK-specific tuning

**Quick Links:** [README](../../nah/README.md) | [PROJECT_INDEX](../../nah/PROJECT_INDEX.md) | [CLAUDE.md](../../nah/CLAUDE.md)

**Development:**

```bash
cd nah
make test && make validate
go generate  # Code generation
```

**Core Packages:**

```
pkg/
├── router/        → Event routing (15 files)
├── apply/         → Declarative reconciliation (11 files)
├── runtime/       → Controller runtime (10 files)
├── backend/       → K8s client abstraction
├── leader/        → Leader election
└── watcher/       → Resource watching
```

**Public API:**

- `router.go` - Main entry point exports:
  - `DefaultRouter()` - Create router with defaults
  - `NewRouter()` - Create custom router
  - `DefaultOptions()` - Default configuration

---

### 3. kinm

**Type:** Kubernetes-like API server
**Status:** Active development
**Tech Stack:** Go, PostgreSQL

"Kinm is not Mink" - Efficient CRUD API server backed by PostgreSQL.

**Key Features:**

- K8s-like API (Create, Read, Update, Delete, Watch)
- PostgreSQL-backed (all state in DB)
- No Kubernetes dependency
- SQL-focused design

**Quick Links:** [README](../../kinm/README.md) | [PROJECT_INDEX](../../kinm/PROJECT_INDEX.md) | [API Docs](../../kinm/docs/API.md)

**Development:**

```bash
cd kinm
make build && make test
make test-integration  # Requires PostgreSQL
```

---

### 4. mcp-oauth-proxy

**Type:** OAuth 2.1 proxy server
**Status:** Production-ready
**Tech Stack:** Go, PostgreSQL/SQLite

OAuth 2.1 proxy that adds authentication to MCP servers.

**Key Features:**

- OAuth 2.1 compliance with PKCE
- Multi-provider (Google, Microsoft, GitHub)
- User context injection via headers
- Token encryption (AES-256)

**Quick Links:** [README](../../mcp-oauth-proxy/README.md) | [PROJECT_INDEX](../../mcp-oauth-proxy/PROJECT_INDEX.md) | [API Reference](../../mcp-oauth-proxy/docs/API_REFERENCE.md)

**Development:**

```bash
cd mcp-oauth-proxy
export OAUTH_CLIENT_ID="..." OAUTH_CLIENT_SECRET="..."
export ENCRYPTION_KEY="$(openssl rand -base64 32)"
go run .
```

**Headers Injected:**

- `X-Forwarded-User` - User ID
- `X-Forwarded-Email` - Email
- `X-Forwarded-Name` - Display name
- `X-Forwarded-Access-Token` - OAuth token

---

### 5. obot-tools

**Type:** Tool and provider collection
**Status:** Active development
**Tech Stack:** Go 1.23+, Python 3.13+, TypeScript

Official Obot platform tools, model providers, and auth providers.

**Components:**

- **Core Tools**: memory, knowledge (RAG), tasks, workspace-files
- **Model Providers**: OpenAI, Anthropic, Ollama, Groq, xAI, DeepSeek, Voyage
- **Auth Providers**: GitHub OAuth2, Google OAuth2
- **Credential Stores**: SQLite, PostgreSQL (AES-256)

**Quick Links:** [README](../../obot-tools/README.md) | [PROJECT_INDEX](../../obot-tools/PROJECT_INDEX.md) | [ARCHITECTURE](../../obot-tools/docs/ARCHITECTURE.md) | [CLAUDE.md](../../obot-tools/CLAUDE.md)

**Development:**

```bash
cd obot-tools
make build && make test
make package-tools        # Package user tools
make package-providers    # Package providers
```

**Tool Structure:**

```
tool-name/
├── main.go           → Entry point (HTTP server)
├── tool.gpt          → GPTScript definition
├── go.mod            → Module definition
├── pkg/              → Implementation
└── README.md         → Documentation

Registered in: index.yaml
```

---

### 6. mcp-catalog

**Type:** MCP server configuration catalog
**Status:** Active catalog
**Tech Stack:** YAML configurations

Centralized catalog of MCP server configurations.

**Includes:**

- Cloud providers: AWS, Azure, GCP, DigitalOcean
- Databases: PostgreSQL, MySQL, MongoDB, Redis, BigQuery
- Services: GitHub, Slack, Notion, Linear, Stripe
- Search: Brave, DuckDuckGo, Tavily, Exa

**Quick Links:** [PROJECT_INDEX](../../mcp-catalog/PROJECT_INDEX.md) | [CLAUDE.md](../../mcp-catalog/CLAUDE.md)

---

### 7. namegenerator

**Type:** Random name generator library
**Status:** Stable library
**Tech Stack:** Go 1.23.2 (zero external dependencies)

Lightweight library for generating human-readable random names in "adjective-noun" format.

**Key Features:**

- Zero external dependencies (Go standard library only)
- Deterministic name generation (same seed → same sequence)
- 3,596 possible combinations (62 adjectives × 58 nouns)
- **NOT thread-safe** - use separate instances per goroutine

**Quick Links:** [README](../../namegenerator/README.md) | [CLAUDE.md](../../namegenerator/CLAUDE.md)

**Development:**

```bash
cd namegenerator
go test              # Run tests
go test -race        # Check for race conditions
go test -cover       # Coverage report
```

---

## Structure

```
AI/                                    [Workspace Root]
│
├── .claude/                          [Claude Code Enhancements]
│   ├── agents/                       → Custom subagents (4 agents)
│   ├── rules/                        → Path-specific rules (5 rules)
│   ├── skills/                       → Progressive disclosure skills (3)
│   ├── output-styles/                → Response formatting (3 styles)
│   ├── instructions/                 → Enhancement guides
│   └── settings.json                 ← Hooks configuration
│
├── .github/workflows/                [GitHub Actions]
│   ├── claude-review.yml             ← PR review automation
│   └── claude-triage.yml             ← Issue triage automation
│
├── documentation/                    [Consolidated Documentation]
│   ├── reference/                    ← Reference docs (this file)
│   ├── projects/                     ← Project work documentation
│   ├── guides/                       ← Implementation guides
│   ├── metadata/                     ← Machine-readable indexes
│   └── archive/                      ← Superseded documentation
│
├── .serena/memories/                 [AI Context - Serena MCP]
│
├── obot-entraid/                     [MCP Platform - Go + SvelteKit]
├── nah/                              [K8s Controller Framework - Library]
├── kinm/                             [K8s-like API Server - Go]
├── mcp-oauth-proxy/                  [OAuth 2.1 Proxy - Go]
├── obot-tools/                       [Tools & Providers - Multi-lang]
├── mcp-catalog/                      [MCP Configs - YAML]
└── namegenerator/                    [Name Generator - Go Library]
```

---

## Entry Points

### Main Applications

| Entry Point | Type | Purpose | Start Command |
|-------------|------|---------|---------------|
| `obot-entraid/main.go` | Server | MCP platform | `go run main.go` |
| `obot-entraid/ui/user/` | Frontend | SvelteKit UI | `pnpm run dev` |
| `nah/router.go` | Library | API export | Import in code |
| `kinm/` | Server | API server | TBD |
| `mcp-oauth-proxy/` | Server | OAuth proxy | TBD |

### Tools & Providers (obot-tools)

**Model Providers:**

- `openai-model-provider/main.go` - OpenAI GPT models
- `anthropic-model-provider-go/main.go` - Claude models
- `ollama-model-provider/main.go` - Local models
- `groq-model-provider/main.go` - Groq-hosted models
- `xai-model-provider/main.go` - xAI Grok models
- `deepseek-model-provider/main.go` - DeepSeek models
- `voyage-model-provider/` (Python) - Voyage embeddings

**Auth Providers:**

- `github-auth-provider/main.go` - GitHub OAuth2
- `entra-auth-provider/main.go` - Microsoft Entra ID
- `keycloak-auth-provider/main.go` - Keycloak OIDC

**Core Tools:**

- `memory/main.go` - Long-term memory
- `tasks/main.go` - Task management
- `workspace-files/main.go` - File operations

---

## Key APIs

### nah Framework API

**Creating a Controller:**

```go
import "github.com/obot-platform/nah"

// Create router
router, err := nah.DefaultRouter("my-controller", scheme)

// Register handler
router.Type(&corev1.Pod{}).
    Namespace("default").
    HandlerFunc(func(req router.Request, resp router.Response) error {
        pod := req.Object.(*corev1.Pod)
        // Handle pod...
        return nil
    })

// Start
router.Start(ctx)
```

**Declarative Apply:**

```go
import "github.com/obot-platform/nah/pkg/apply"

desired := []runtime.Object{
    &corev1.ConfigMap{...},
}

apply.New(resp.Backend(), "controller").Apply(owner, desired)
```

### Model Provider API (OpenAI-compatible)

**Endpoints:**

- `POST /v1/chat/completions` - Chat completions
- `POST /v1/embeddings` - Text embeddings

**Example:**

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"model":"gpt-4","messages":[...]}'
```

### OAuth Proxy API

**Endpoints:**

- `GET /oauth2/start` - Start OAuth flow
- `GET /oauth2/callback` - OAuth callback
- `POST /mcp/{path}` - Proxy MCP requests

---

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Languages** | Go 1.23-1.25, Python 3.13+, TypeScript |
| **Frontend** | SvelteKit 5, Tailwind CSS 4 |
| **Backend** | Kubernetes client-go, controller-runtime |
| **Databases** | PostgreSQL, SQLite |
| **AI/ML** | OpenAI, Anthropic, Ollama, local models |
| **Auth** | OAuth 2.0/2.1, OIDC, PKCE |
| **Observability** | OpenTelemetry, logrus |
| **Build** | Make, Docker, Helm |

### Key Dependencies

- `k8s.io/client-go` v0.31.1 - Kubernetes client
- `sigs.k8s.io/controller-runtime` v0.19.0 - Controller framework
- `go.opentelemetry.io/otel` v1.35.0 - Observability
- `github.com/sirupsen/logrus` v1.9.3 - Logging

---

## Development

### Universal Commands

```bash
# Build
make build

# Test
make test
go test ./...
go test -race ./...       # Race detector
go test -cover ./...      # Coverage

# Lint
make validate
golangci-lint run
golangci-lint run --fix

# Format
go fmt ./...
gofmt -w .
goimports -w .

# Dependencies
go mod tidy
go mod download
```

### Pre-Commit Checklist

```bash
# Generate code (if applicable)
go generate

# Tidy dependencies
go mod tidy

# Format
go fmt ./...

# Lint
golangci-lint run

# Test
go test ./...

# CI validation (critical!)
make validate-ci
```

### Cross-Project Features

**Authentication:**

| Project | Auth Type | Details |
|---------|-----------|---------|
| obot-entraid | Entra ID, Keycloak | OAuth2 providers |
| mcp-oauth-proxy | Multi-provider OAuth 2.1 | Google, Microsoft, GitHub |
| obot-tools | GitHub, Google | OAuth2 providers |

**Database Usage:**

| Project | Database | Purpose |
|---------|----------|---------|
| obot-entraid | PostgreSQL | Platform data |
| kinm | PostgreSQL | API state storage |
| mcp-oauth-proxy | PostgreSQL/SQLite | Token storage |
| obot-tools | PostgreSQL/SQLite | Credentials, vectors |

---

## Common Use Cases

| Use Case | Project | Key Docs |
|----------|---------|----------|
| Building a Kubernetes Controller | nah | [README](../../nah/README.md), [CLAUDE.md](../../nah/CLAUDE.md) |
| Adding Authentication to MCP Servers | mcp-oauth-proxy | [README](../../mcp-oauth-proxy/README.md), [API Reference](../../mcp-oauth-proxy/docs/API_REFERENCE.md) |
| Hosting MCP Platform | obot-entraid | [README](../../obot-entraid/README.md), [CONTRIBUTING](../../obot-entraid/CONTRIBUTING.md) |
| Creating Model Providers | obot-tools | [ARCHITECTURE](../../obot-tools/docs/ARCHITECTURE.md), [DEVELOPER_GUIDE](../../obot-tools/docs/DEVELOPER_GUIDE.md) |
| Building K8s-like APIs | kinm | [README](../../kinm/README.md), [API](../../kinm/docs/API.md) |

---

## Documentation Map

| Document | Purpose |
|----------|---------|
| **README.md** | Entry point and overview |
| **CLAUDE.md** | Claude Code integration guide |
| **QUICK_REFERENCE.md** | One-page command reference |
| **TROUBLESHOOTING.md** | Problem resolution |
| **documentation/docs/reference/project-index.md** | This file - Project reference |
| **documentation/docs/reference/documentation-guide.md** | Navigation guide |
| **documentation/docs/reference/architecture.md** | Visual architecture |
| **documentation/docs/reference/api-reference.md** | API documentation |

**Project-Specific:**

- `nah/PROJECT_INDEX.md` - Controller framework details
- `obot-tools/PROJECT_INDEX.md` - Tools and providers
- `kinm/PROJECT_INDEX.md` - API server details
- `mcp-oauth-proxy/PROJECT_INDEX.md` - OAuth proxy details

---

## Token Efficiency

| Read | Tokens | Savings |
|------|--------|---------|
| This Index | ~4,000 | - |
| Full Codebase | ~300,000+ | - |
| **Savings** | - | **99%** |

**Per Session:**

- Read: PROJECT_INDEX.md (~4K tokens)
- Read: Relevant project docs (~3-10K tokens)
- Total: ~10K tokens vs 300K+

---

*Consolidated from PROJECT_INDEX.md and REPOSITORY_INDEX.md. Optimized for fast context loading and minimal token usage.*
