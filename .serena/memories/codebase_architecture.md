# Codebase Architecture

## High-Level Organization

This monorepo contains seven independent Go projects, each with its own architecture and purpose.

## Project Architectures

### 1. obot-entraid

**Architecture Style**: Full-stack application with microservices patterns

**Structure:**

```
obot-entraid/
├── pkg/                     # Go backend packages
│   ├── server/             # HTTP server
│   ├── handlers/           # Request handlers
│   ├── api/                # API definitions
│   ├── auth/               # Authentication
│   └── db/                 # Database layer
├── ui/user/                # SvelteKit frontend
│   ├── src/
│   │   ├── lib/            # Shared components and utilities
│   │   ├── routes/         # SvelteKit routes (file-based routing)
│   │   └── app.html        # HTML template
│   └── static/             # Static assets
├── tools/                   # Custom authentication providers (fork-specific)
│   ├── entra-auth-provider/      # Microsoft Entra ID
│   ├── keycloak-auth-provider/   # Keycloak OIDC
│   ├── auth-providers-common/    # Shared auth code
│   └── index.yaml                # Tool registry
├── chart/                   # Helm chart for Kubernetes
├── apiclient/              # API client library
├── logger/                 # Logging utilities
└── docs/                   # Documentation
```

**Key Patterns:**

- **Backend**: Standard HTTP server with handler-based routing
- **Frontend**: SvelteKit 5 with file-based routing
- **Authentication**: OAuth2 provider pattern with multiple implementations
- **Database**: PostgreSQL with schema migrations
- **Deployment**: Docker + Kubernetes + Helm

**Important Files:**

- `tools/index.yaml`: Registry of all tools and providers
- `Dockerfile`: Multi-stage build for Go backend and Node.js frontend
- `chart/values.yaml`: Kubernetes deployment configuration

### 2. nah (Kubernetes Controller Framework)

**Architecture Style**: Library/framework with composable components

**Structure:**

```
nah/
├── pkg/
│   ├── router/             # Event routing (15 files)
│   │   ├── router.go       # Main router implementation
│   │   ├── trie.go         # Route matching
│   │   └── handler.go      # Handler interface
│   ├── runtime/            # Runtime configuration (10 files)
│   ├── apply/              # Declarative reconciliation (11 files)
│   │   ├── apply.go        # Apply interface
│   │   └── desiredset.go   # Desired state management
│   ├── backend/            # Kubernetes client abstraction
│   ├── watcher/            # Resource watching
│   ├── leader/             # Leader election
│   ├── webhook/            # Admission webhooks
│   └── ...                 # Utility packages
├── cmd/deepcopy/           # Code generation tool
├── docs/                   # Comprehensive documentation
├── router.go               # Main package API
└── PROJECT_INDEX.md        # Quick reference
```

**Key Patterns:**

- **Fluent API**: Builder pattern for configuration (`router.Type().HandlerFunc()`)
- **Interface-based**: Backend, Handler, Apply interfaces for abstraction
- **Event-driven**: Watch Kubernetes resources, trigger handlers
- **Declarative reconciliation**: Like `kubectl apply`, three-way merge
- **Code generation**: Deep copy methods via `go generate`

**Core Components:**

1. **Router**: Orchestrates controller lifecycle, routes events
2. **Backend**: Abstracts Kubernetes client operations
3. **Apply**: Manages desired vs current state
4. **Leader Election**: Ensures single active controller
5. **Watcher**: Efficient resource watching

**Design Philosophy:**

- Lightweight and composable
- Declarative over imperative
- Similar to kubectl apply semantics
- Minimal dependencies

### 3. kinm (K8s-like API Server)

**Architecture Style**: API server with database-backed storage

**Structure:**

```
kinm/
├── pkg/
│   ├── db/                 # Database layer
│   │   ├── postgres/       # PostgreSQL implementation
│   │   ├── sqlite/         # SQLite implementation (optional)
│   │   └── migrations/     # Schema migrations
│   ├── api/                # API server
│   │   ├── server.go       # HTTP server
│   │   ├── handlers/       # Request handlers
│   │   └── watch/          # Watch implementation
│   ├── storage/            # Storage abstraction
│   └── types/              # Type definitions
├── cmd/                    # CLI commands
├── docs/                   # Documentation
└── Makefile                # Comprehensive build targets
```

**Key Patterns:**

- **API-first**: Kubernetes-like CRUD API (Create, Read, Update, Delete, Watch)
- **Database-backed**: PostgreSQL for all state (no in-memory caching)
- **SQL-focused**: Embrace SQL for efficient queries
- **Watch support**: Real-time updates via database triggers or polling

**Design Goals:**

- Efficient PostgreSQL backend
- No Kubernetes dependency
- Lightweight and fast
- All state in database

### 4. mcp-oauth-proxy

**Architecture Style**: Proxy server with OAuth 2.1 flow

**Structure:**

```
mcp-oauth-proxy/
├── pkg/
│   ├── server/             # HTTP server
│   ├── oauth/              # OAuth 2.1 implementation
│   │   ├── provider.go     # OAuth provider integration
│   │   ├── pkce.go         # PKCE support
│   │   └── token.go        # Token management
│   ├── proxy/              # MCP proxy logic
│   ├── storage/            # Database storage
│   │   ├── postgres/       # PostgreSQL backend
│   │   └── sqlite/         # SQLite backend
│   └── crypto/             # Encryption utilities
├── docs/                   # Documentation
└── Makefile                # Build targets
```

**Key Patterns:**

- **OAuth 2.1 Proxy**: Full OAuth flow with PKCE
- **MCP Integration**: Proxies to MCP servers with user context
- **Multi-provider**: Auto-discovery for OAuth providers
- **Secure storage**: AES-256 encryption for tokens
- **Header injection**: Adds user context to proxied requests

**Flow:**

1. Client initiates OAuth 2.1 flow
2. Proxy redirects to external provider (Google, Microsoft, GitHub)
3. User authenticates and grants permission
4. Proxy receives authorization code
5. Proxy exchanges code for access token
6. Proxy issues its own access token to client
7. Client makes requests with proxy token
8. Proxy validates token and forwards to MCP server with user headers

**Headers Injected:**

- `X-Forwarded-User`: User ID
- `X-Forwarded-Email`: User email
- `X-Forwarded-Name`: Display name
- `X-Forwarded-Access-Token`: OAuth access token

### 5. obot-tools

**Architecture Style**: Modular tool collection with plugin pattern

**Structure:**

```
obot-tools/
├── Core Tools (Go/Python/TypeScript)
│   ├── memory/              # Long-term memory (Go)
│   ├── knowledge/           # RAG knowledge base (Go)
│   ├── tasks/               # Task management (Go)
│   ├── workspace-files/     # File operations (Go)
│   ├── images/              # Image tools (TypeScript)
│   └── file-summarizer/     # Summarization (Python)
├── Model Providers (Go/Python)
│   ├── openai-model-provider/
│   ├── anthropic-model-provider-go/
│   ├── ollama-model-provider/
│   ├── groq-model-provider/
│   ├── xai-model-provider/
│   ├── deepseek-model-provider/
│   ├── voyage-model-provider/        # Python
│   └── generic-openai-model-provider/
├── Auth Providers (Go)
│   ├── github-auth-provider/
│   ├── google-auth-provider/
│   └── auth-providers-common/  # Shared code
├── Credential Stores
│   └── credential-stores/
│       ├── sqlite/
│       └── postgres/
├── index.yaml               # Tool registry
├── scripts/                 # Build scripts
└── docs/                    # Documentation
```

**Tool Structure (each tool):**

```
tool-name/
├── main.go                  # Entry point
├── tool.gpt                 # GPTScript definition
├── go.mod                   # Go module
├── pkg/                     # Implementation
│   └── provider/           # Core logic
├── README.md               # Documentation
└── Makefile                # Build targets
```

**Key Patterns:**

- **Plugin Architecture**: Each tool is independent
- **GPTScript Integration**: Tools defined via `.gpt` files
- **Registry-based**: Central `index.yaml` for discovery
- **Multi-language**: Go, Python, TypeScript based on needs
- **Standardized APIs**: Model providers follow OpenAI-compatible API

**Tool Categories:**

1. **Core Tools**: User-facing functionality (memory, knowledge, tasks)
2. **Model Providers**: AI model integrations
3. **Auth Providers**: OAuth2 authentication
4. **Credential Stores**: Secure storage backends

**Registry Structure (index.yaml):**

```yaml
tools:
  - name: memory
    description: Long-term memory for agents
    modelName: memory from github.com/obot-platform/tools/memory
    localPath: ./memory

modelProviders:
  - name: openai-model-provider
    description: OpenAI GPT models
    modelName: openai-model-provider from ...
    localPath: ./openai-model-provider

authProviders:
  - name: github-auth-provider
    description: GitHub OAuth2
    modelName: github-auth-provider from ...
    localPath: ./github-auth-provider
```

### 6. mcp-catalog

**Architecture Style**: Configuration catalog (YAML-based)

**Structure:**

```
mcp-catalog/
├── *.yaml                   # MCP server configurations
│   ├── github.yaml
│   ├── slack.yaml
│   ├── notion.yaml
│   ├── aws.yaml
│   └── ...
├── scripts/                 # Automation scripts
├── docs/                    # Documentation
├── mcp-server-validation-automation/  # Validation tools
└── PROJECT_INDEX.md         # Catalog overview
```

**YAML Structure (example):**

```yaml
name: github
description: GitHub MCP server
repository: https://github.com/example/mcp-github
installation:
  type: npm
  package: "@example/mcp-github"
configuration:
  required:
    - GITHUB_TOKEN
  optional:
    - GITHUB_ORG
scopes:
  - repo
  - user
```

**Purpose:**

- Centralized MCP server catalog
- Standardized configuration format
- Discovery and validation
- Integration with Obot platform

### 7. namegenerator

**Architecture Style**: Lightweight library with interface-first design

**Structure:**

```
namegenerator/
├── generator.go             # Core implementation (~55 lines)
│   ├── Generator interface  # Generate() string
│   ├── NameGenerator struct # Concrete implementation
│   └── NewNameGenerator()   # Factory function
├── data.go                  # Word lists (~43 lines)
│   ├── ADJECTIVES          # 62 nature-themed adjectives
│   └── NOUNS               # 58 nature-themed nouns
├── generator_test.go        # Tests (~37 lines)
└── docs/                    # Comprehensive documentation
    ├── API.md
    ├── USER_GUIDE.md
    ├── ARCHITECTURE.md
    ├── CODE_EXAMPLES.md
    └── ...
```

**Key Patterns:**

- **Interface-first**: Returns `Generator` interface, not concrete type
- **Factory function**: `NewNameGenerator(seed int64) Generator`
- **Seeded PRNG**: Each instance has its own `*rand.Rand` for deterministic generation
- **Zero dependencies**: Uses only Go standard library
- **NOT thread-safe**: `rand.Rand` is not thread-safe, requires separate instances per goroutine

**Design Characteristics:**

- **Minimalist**: ~135 lines across 3 source files
- **Deterministic**: Same seed produces same name sequence
- **Lightweight**: ~64 bytes per instance, minimal allocations
- **Simple API**: Single method interface with 3,596 possible combinations

**Usage Pattern:**

```go
gen := namegenerator.NewNameGenerator(seed)
name := gen.Generate()  // Returns "adjective-noun" (e.g., "silent-moon")
```

**Thread Safety:**

```go
// ✅ Safe: One generator per goroutine
gen1 := NewNameGenerator(seed1)
gen2 := NewNameGenerator(seed2)
go useGenerator(gen1)
go useGenerator(gen2)

// ❌ Unsafe: Shared generator across goroutines
gen := NewNameGenerator(seed)
go gen.Generate()  // RACE CONDITION
go gen.Generate()  // RACE CONDITION
```

**Use Cases:**

- Docker container naming
- Kubernetes pod/service names
- Test data generation
- Temporary file naming

## Common Architectural Patterns

### 1. Go Project Structure

All Go projects follow similar conventions:

```
project/
├── cmd/                     # CLI commands (optional)
├── pkg/                     # Internal packages
│   ├── server/             # HTTP server (if applicable)
│   ├── api/                # API definitions
│   ├── db/                 # Database layer (if applicable)
│   └── ...                 # Domain packages
├── go.mod                  # Module definition
├── Makefile                # Build automation
├── Dockerfile              # Container image
└── README.md               # Documentation
```

### 2. Interface-Driven Design

All projects use interfaces for abstraction:

- `Backend` interface in nah
- `Storage` interface in kinm
- `Provider` interface in obot-tools

**Benefits:**

- Testability (mock implementations)
- Flexibility (swap implementations)
- Clean separation of concerns

### 3. Configuration Management

**Environment Variables:**

- All projects use env vars for configuration
- Prefixed by project (e.g., `OBOT_*`, `KINM_*`)
- Sensitive data never hardcoded

**Config Files:**

- YAML for structured configuration
- JSON for API definitions
- TOML for tool manifests (GPTScript)

### 4. Error Handling

**Go Patterns:**

- Explicit error returns
- Error wrapping with context
- Sentinel errors for known conditions
- Custom error types for structured errors

### 5. Logging

**Libraries:**

- logrus (structured logging)
- Standard library log (simple cases)

**Levels:**

- Debug: Detailed diagnostic information
- Info: General informational messages
- Warn: Warning messages
- Error: Error messages

### 6. Testing

**Unit Tests:**

- `*_test.go` files alongside source
- Table-driven tests
- Subtests with `t.Run()`

**Integration Tests:**

- Separate test suites
- May require external services (database, Kubernetes)

**Test Helpers:**

- Mock implementations
- Test fixtures
- Helper functions

## Database Patterns

### Schema Design

**PostgreSQL (kinm, mcp-oauth-proxy, obot-entraid):**

- Normalized schemas
- Migrations for schema changes
- Indexes for performance
- Foreign keys for referential integrity

**SQLite (obot-tools, mcp-oauth-proxy):**

- Embedded database for development
- Simple schema
- File-based storage

### Encryption

**AES-256 Encryption:**

- Credential stores encrypt sensitive data
- Keys managed via environment variables
- Encryption at rest

## API Design

### RESTful Principles

- HTTP verbs: GET, POST, PUT, DELETE, PATCH
- Resource-based URLs
- JSON request/response bodies
- HTTP status codes

### Kubernetes-like API (kinm, nah)

- Resource-oriented
- Watch support for real-time updates
- Label selectors for filtering
- Namespaced resources

## Deployment Architecture

### Docker

**Multi-stage Builds:**

1. Build stage: Compile Go binaries
2. Final stage: Minimal runtime image (Wolfi, Alpine)

**Benefits:**

- Small image size
- Security (minimal attack surface)
- Fast builds (layer caching)

### Kubernetes

**Resources:**

- Deployments for stateless apps
- StatefulSets for stateful apps (databases)
- Services for networking
- ConfigMaps for configuration
- Secrets for sensitive data

**Helm Charts:**

- Parameterized Kubernetes manifests
- Values files for environment-specific config
- Templates for resource generation

## Security Architecture

### Authentication

**OAuth 2.1:**

- PKCE for public clients
- Authorization code flow
- Token refresh

**Session Management:**

- Encrypted cookies
- Short-lived access tokens
- Long-lived refresh tokens

### Authorization

**Access Control:**

- Role-based access control (RBAC) in obot-entraid
- User-based access in mcp-oauth-proxy
- Namespace-based isolation in kinm

### Data Protection

**Encryption:**

- At rest: AES-256 for credentials
- In transit: TLS for all HTTP traffic

**Secrets Management:**

- Environment variables
- Kubernetes Secrets
- Never in source code

## Observability

### Tracing

**OpenTelemetry (nah):**

- Distributed tracing
- Span propagation
- Context correlation

### Logging

- Structured logging (JSON)
- Log levels (debug, info, warn, error)
- Contextual information (request ID, user ID)

### Metrics

- Prometheus-compatible metrics (where applicable)
- Health check endpoints
- Ready/liveness probes

## Design Principles

### General

1. **Simplicity**: Prefer simple solutions over complex ones
2. **Modularity**: Independent, composable components
3. **Testability**: Design for testing
4. **Documentation**: Code should be self-documenting
5. **Performance**: Efficient by default
6. **Security**: Security-first design

### Go-Specific

1. **Interfaces**: Small, focused interfaces
2. **Error Handling**: Explicit error returns
3. **Concurrency**: Use goroutines and channels appropriately
4. **Standard Library**: Prefer standard library over dependencies

### Kubernetes-Specific (nah)

1. **Declarative**: Describe desired state, not steps
2. **Level-triggered**: Reconcile to desired state
3. **Idempotent**: Operations can be repeated safely
4. **Controller Pattern**: Watch, reconcile, repeat
