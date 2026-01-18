# Project Purpose and Structure

## Overview

This is a monorepo collection of related Go projects focused on AI/MCP (Model Context Protocol) technologies, Kubernetes controller development, and authentication systems.

## Projects

### 1. obot-entraid

**Location**: `obot-entraid/`
**Purpose**: A fork of [obot-platform/obot](https://github.com/obot-platform/obot) with custom authentication providers for Microsoft Entra ID and Keycloak.

Obot is an open-source platform providing everything an organization needs to implement MCP technologies:

- MCP server hosting (Node.js, Python, container-based)
- MCP registry and catalog for discovery
- MCP gateway for access control and logging
- Obot Chat client with RAG and multi-model support

**Fork-Specific Features**:

- Microsoft Entra ID (Azure AD) authentication with profile pictures
- Keycloak OIDC authentication
- Custom authentication provider framework

**Tech Stack**:

- Backend: Go 1.25.5
- Frontend: SvelteKit 5, TypeScript, Tailwind CSS 4
- Database: PostgreSQL
- Deployment: Docker, Kubernetes, Helm

### 2. nah

**Location**: `nah/`
**Purpose**: "Not Another Handler" - A Kubernetes controller framework library providing utilities and abstractions for building custom Kubernetes controllers.

**Features**:

- Event Router with fluent API
- Declarative Apply (`kubectl apply`-like semantics)
- Leader Election (lease and file-based)
- Resource Watching with optimized trigger management
- Backend abstraction over Kubernetes client operations
- OpenTelemetry support
- GVK-specific tuning

**Dependencies**:

- controller-runtime v0.19.0
- client-go v0.31.1
- OpenTelemetry v1.35.0

### 3. kinm

**Location**: `kinm/`
**Purpose**: "Kinm is not Mink" - A Kubernetes-like CRUD API server backed by PostgreSQL.

Continues the learnings of Mink but no longer focused on pure Kubernetes environments. Provides:

- Efficient and scalable API server
- CRUD operations on resources with Watch capability
- Efficient PostgreSQL backend embracing SQL
- All state in database, not in memory

### 4. mcp-oauth-proxy

**Location**: `mcp-oauth-proxy/`
**Purpose**: OAuth 2.1 proxy server that adds authentication and authorization to MCP servers.

**Features**:

- OAuth 2.1 compliance with PKCE support
- MCP integration with user context injection
- Multi-provider support (Google, Microsoft, GitHub)
- PostgreSQL and SQLite database support
- Injects user headers to MCP servers (X-Forwarded-User, X-Forwarded-Email, etc.)

### 5. obot-tools

**Location**: `obot-tools/`
**Purpose**: Official repository for Obot platform tools, model providers, and authentication providers.

**Components**:

- **Core Tools**: Memory, knowledge base (RAG), tasks, file operations
- **Model Providers**: OpenAI, Anthropic, Ollama, Groq, xAI, DeepSeek, Voyage, vLLM
- **Auth Providers**: GitHub OAuth2, Google OAuth2
- **Credential Management**: SQLite and PostgreSQL backends with AES-256 encryption

### 6. mcp-catalog

**Location**: `mcp-catalog/`
**Purpose**: Catalog of MCP server configurations in YAML format.

Contains configuration files for various MCP servers:

- Cloud providers: AWS, Azure, Google Cloud, DigitalOcean, Cloudflare
- Databases: PostgreSQL, MySQL, MongoDB, Redis, BigQuery, Snowflake
- Services: GitHub, GitLab, Slack, Notion, Linear, Stripe, etc.
- Search: Brave Search, DuckDuckGo, Tavily Search, Exa Search

### 7. namegenerator

**Location**: `namegenerator/`
**Purpose**: Lightweight random name generator library for generating human-readable names in "adjective-noun" format.

**Features**:

- Zero external dependencies (Go standard library only)
- Deterministic name generation (same seed produces same sequence)
- 3,596 possible combinations (62 adjectives × 58 nouns)
- **NOT thread-safe** - requires separate instances per goroutine
- Format: "adjective-noun" (e.g., "silent-moon", "ancient-river")

**Use Cases**:

- Docker container naming
- Kubernetes pod/service names
- Test data generation
- Temporary file naming

**Tech Stack**:

- Go 1.23.2
- Zero dependencies (standard library only)
- ~135 lines across 3 source files

## Directory Structure

```
AI/
├── obot-entraid/           # Obot platform fork with custom auth
├── nah/                    # Kubernetes controller framework
├── kinm/                   # K8s-like API server with PostgreSQL
├── mcp-oauth-proxy/        # OAuth 2.1 proxy for MCP servers
├── obot-tools/             # Obot tools and providers
├── mcp-catalog/            # MCP server catalog (YAML configs)
├── namegenerator/          # Random name generator (zero deps)
├── .claude/                # Claude Code configuration
├── .serena/                # Serena configuration
└── .gitignore              # Git ignore rules
```

## Common Characteristics

- **Language**: Primarily Go 1.23-1.25
- **Build System**: Makefiles with consistent targets
- **Module System**: Each subdirectory is an independent Go module with its own go.mod
- **Testing**: Standard Go testing framework with golangci-lint
- **Documentation**: README.md, CLAUDE.md, and comprehensive docs/ directories
