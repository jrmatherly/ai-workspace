# AGENTS.md

Universal AI coding agent instructions for the AI/MCP multi-repo workspace. This file follows the [AGENTS.md open standard](https://agents.md) supported by 25+ AI coding tools.

## Project Overview

This is a **multi-repo workspace** containing 7 independent Go projects (each with their own git repository) focused on AI/MCP (Model Context Protocol) technologies, Kubernetes controller development, and authentication systems.

| Project | Purpose | Tech Stack |
| --------- | --------- | ------------ |
| **obot-entraid** | MCP platform with Entra ID & Keycloak auth | Go + SvelteKit + PostgreSQL |
| **nah** | "Not Another Handler" K8s controller framework | Go + controller-runtime |
| **kinm** | "Kinm is not Mink" K8s-like API server | Go + PostgreSQL |
| **mcp-oauth-proxy** | OAuth 2.1 proxy for MCP servers | Go + PostgreSQL/SQLite |
| **obot-tools** | Obot tools, model providers, auth providers | Go/Python/TypeScript |
| **mcp-catalog** | MCP server configuration catalog | YAML |
| **namegenerator** | Random name generator library | Go (zero dependencies) |

## Dos and Don'ts

### DO

- **Always `cd` into the project directory** before running any commands
- **Run `make validate-ci`** before every commit (simulates CI pipeline)
- **Use conventional commits**: `feat(scope): description`, `fix(scope): description`
- **Commit generated code** - especially `nah` deep copy methods after `go generate`
- **Use `-short` flag** for fast test iteration: `go test -short ./...`
- **Wrap errors with context**: `fmt.Errorf("failed to X: %w", err)`
- **Use interfaces** for abstraction and testability
- **Check environment variables** for secrets, never hardcode them

### DON'T

- **Never run commands in workspace root** - always `cd` into specific project
- **Never commit secrets**, API keys, credentials, or `.env` files
- **Never modify generated code manually** - regenerate with `go generate` instead
- **Never skip pre-commit validation** - CI will fail if you do
- **Never use `git commit --amend`** without explicit user request
- **Never use `git push --force`** to main/master branches
- **Never modify `.github/workflows/`** without explicit approval
- **Never hardcode** configuration values - use environment variables
- **Never import between projects** - each project is independent

## File-Scoped Commands (Faster Feedback)

Use these for quick validation on individual files instead of full project commands:

```bash
# Single file lint
golangci-lint run path/to/file.go

# Single file format check
gofmt -d path/to/file.go

# Single file type check (shows diff)
gofmt -w path/to/file.go && git diff path/to/file.go

# Single package test
go test -v ./pkg/router

# Single test function
go test -v -run TestSpecificFunction ./pkg/router

# Single file with race detector
go test -race -v -run TestName ./pkg/...
```

## Universal Build Commands

### Using mise (Recommended)

[mise](https://mise.jdx.dev) provides unified tool management and task running:

```bash
# From workspace root
mise install                 # Install all tools (go, node, python, golangci-lint, gita)
mise all                     # Validate ALL projects
mise test-all                # Test ALL projects
mise gita-status             # Git status across all repos

# From any project directory
mise :test                   # Run project tests
mise :build                  # Build project
mise :validate-ci            # CI validation
```

### Using make (Traditional)

These commands work in any Go project directory:

```bash
# Build
make build                   # Build project

# Test
make test                    # Run all tests
go test ./...                # Direct Go test
go test -v ./pkg/router      # Test specific package
go test -race ./...          # Run with race detector
go test -short ./...         # Fast tests only

# Lint & Validate
make validate                # Run linting
golangci-lint run            # Run linter directly
golangci-lint run --fix      # Auto-fix issues
go fmt ./...                 # Format code
go vet ./...                 # Static analysis

# Code Generation
go generate                  # Generate code (run before commit if applicable)

# Dependencies
go mod tidy                  # Clean up dependencies

# CI Simulation (CRITICAL - run before every commit)
make validate-ci             # Full CI pipeline locally
```

## Project-Specific Commands

### obot-entraid

```bash
cd obot-entraid
make dev                     # Full-stack hot reload (Go + SvelteKit)
make build                   # Build Go binary
make ui                      # Build SvelteKit UI
make test                    # Go tests (excludes integration)

# Frontend (in ui/user/)
cd ui/user && pnpm install && pnpm run dev    # Dev server
cd ui/user && pnpm run ci                      # All checks
```

### nah

```bash
cd nah
go generate                  # Generate deep copy methods (MUST commit results)
make validate-ci             # CI validation - CRITICAL before commit
make test                    # Run all tests
```

### kinm

```bash
cd kinm
make test                    # Unit tests
make test-integration        # Integration tests (requires PostgreSQL)
make ci                      # Full CI pipeline
```

### mcp-oauth-proxy

```bash
cd mcp-oauth-proxy
make test-short              # Fast unit tests
make test                    # All tests
./demo_sqlite.sh             # Quick demo with SQLite
```

### obot-tools

```bash
cd obot-tools
make build                   # Build all Go components
make package-tools           # Package user-facing tools
make package-providers       # Package model/auth providers
```

### namegenerator

```bash
cd namegenerator
go test                      # Run tests (no Makefile)
go test -race                # Race detector (NOT thread-safe library!)
go fmt ./... && go vet ./... && go test ./...   # Pre-commit
```

## Code Patterns

### Error Handling (Go)

```go
// CORRECT - Wrap with context
if err != nil {
    return fmt.Errorf("failed to fetch user profile: %w", err)
}

// INCORRECT - Lost context
if err != nil {
    return err
}
```

### Interface Design

```go
// CORRECT - Small, focused interfaces
type TokenStore interface {
    GetToken(ctx context.Context, key string) (*Token, error)
    SetToken(ctx context.Context, key string, token *Token) error
}

// INCORRECT - God interface with too many methods
type Store interface {
    GetToken(...)
    SetToken(...)
    GetUser(...)
    SetUser(...)
    DeleteAll(...)
    // ... many more unrelated methods
}
```

### Test Structure

```go
// CORRECT - Table-driven tests
func TestValidateToken(t *testing.T) {
    tests := []struct {
        name    string
        token   string
        wantErr bool
    }{
        {"valid token", "abc123", false},
        {"empty token", "", true},
        {"expired token", "expired", true},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateToken(tt.token)
            if (err != nil) != tt.wantErr {
                t.Errorf("ValidateToken() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

## Code Style & Conventions

### Go Standards

- **Formatting**: Always use `go fmt ./...` or `gofmt -w .`
- **Imports**: Use `goimports -w .` for automatic import management
- **Documentation**: Document all exported functions, types, packages
- **Naming**: PascalCase for exported, camelCase for unexported
- **Packages**: Short, lowercase, single-word names

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `perf`, `ci`

**Examples**:

```
feat(router): add middleware support for handlers
fix(oauth): resolve token refresh race condition
docs(readme): update setup instructions
refactor(apply): simplify desired set comparison logic
```

### TypeScript/Svelte (obot-entraid)

- Use TypeScript for type safety
- Format with Prettier: `pnpm run format`
- Lint with ESLint: `pnpm run lint`

### Python (obot-tools)

- Follow PEP 8
- Use `black` for formatting
- Use type hints where applicable

## Pre-Commit Checklist

Run these commands IN ORDER before every commit:

```bash
# 1. Generate code (if project has generators)
go generate

# 2. Clean up dependencies
go mod tidy

# 3. Format code
go fmt ./...

# 4. Lint
make validate    # or: golangci-lint run

# 5. Test
make test

# 6. CI validation (CRITICAL for nah, obot-entraid)
make validate-ci
```

## Architecture Patterns

### Interface-Driven Design

All projects use Go interfaces for abstraction:

- **nah**: `Handler`, `Backend`, `Apply` interfaces
- **kinm**: `Storage` interface
- **mcp-oauth-proxy**: `TokenStore`, `AuthorizationStore` interfaces
- **obot-tools**: `Provider` interface for model/auth providers

### Database Patterns

- **PostgreSQL primary**: obot-entraid, kinm, mcp-oauth-proxy
- **SQLite for dev**: mcp-oauth-proxy, obot-tools (auto-detect: empty DSN = SQLite)
- **Encryption**: AES-256-GCM for sensitive data (OAuth tokens, credentials)

### Testing Strategies

- **Short tests**: Use `-short` flag for fast unit tests
- **Integration tests**: Separate targets requiring PostgreSQL or Kubernetes
- **Race detection**: Always available via `go test -race`
- **Table-driven tests**: Preferred pattern across all projects

## Common Pitfalls & Solutions

| Issue | Solution |
| ------- | ---------- |
| `make validate-ci` fails with "dirty repo" | Run `go generate && go mod tidy` and commit the changes |
| Linter errors after changes | Run `golangci-lint run --fix` to auto-fix |
| Tests fail in one project but not others | Ensure you're in correct directory, run `go mod tidy` |
| Import path confusion | Each project has own module path - don't cross-import |
| Frontend build fails (obot-entraid) | Ensure Node.js 18+ and run `pnpm install` in `ui/user/` |

## Technology Stack

### Languages & Runtimes

- **Go**: 1.23-1.25 (primary)
- **Python**: 3.13+ (obot-tools ML/AI components)
- **Node.js**: 18+ (SvelteKit frontend)

### Key Dependencies

- **Backend**: controller-runtime v0.19.0, client-go v0.31.1, GORM, pgx
- **Frontend**: SvelteKit 5, Tailwind CSS 4, TypeScript
- **Auth**: OAuth 2.0/2.1, OIDC, PKCE, JWT (RS256)

### Build & Deploy

- **Build Tool**: Make (universal across all projects)
- **Linter**: golangci-lint
- **Containers**: Docker with multi-stage builds

## Security Considerations

- **Never commit** credentials, API keys, or tokens
- **Use environment variables** for all sensitive configuration
- **Encrypt sensitive data** at rest using AES-256-GCM
- **Validate all inputs** - especially at system boundaries
- **Follow OAuth 2.1** standards with PKCE for public clients
- **Generate secrets securely**: `openssl rand -base64 32`

---

*This file follows the [AGENTS.md open standard](https://agents.md) maintained by the Linux Foundation's Agentic AI Foundation.*
