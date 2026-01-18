# Suggested Commands

This file contains the most important commands for developing code in this project collection.

## System Information

- **Operating System**: Darwin (macOS)
- **Primary Language**: Go 1.23-1.25
- **Build Tool**: Make
- **Version Control**: Git

## Standard Unix Commands (Darwin-specific notes)

### File Operations

```bash
ls -la                       # List files (BSD ls on macOS)
find . -name "*.go"          # Find files (use with care, prefer glob)
grep -r "pattern" .          # Search in files (use with care, prefer grep tool)
cat file.go                  # Display file contents
head -n 20 file.go           # Show first 20 lines
tail -n 20 file.go           # Show last 20 lines
```

### Directory Navigation

```bash
cd /path/to/project          # Change directory
pwd                          # Print working directory
mkdir -p dir/subdir          # Create directory and parents
```

### Git Commands

```bash
git status                   # Check repository status
git add .                    # Stage all changes
git commit -m "message"      # Commit changes
git push origin branch       # Push to remote
git pull origin main         # Pull from remote
git checkout -b feature/name # Create and checkout new branch
git remote -v                # List remotes
git log --oneline            # View commit history
```

## mise Commands (Recommended)

[mise](https://mise.jdx.dev) provides unified tool management and task running across all projects:

### Installation

```bash
# Install mise
curl https://mise.run | sh

# From workspace root - install all tools
cd AI
mise trust
mise install    # Installs go, node, python, golangci-lint, gita, gh
```

### Cross-Project Tasks

```bash
# From workspace root
mise tasks             # List all available tasks
mise all               # Validate ALL projects
mise test-all          # Test ALL projects
mise tidy-all          # Tidy all Go modules
mise status            # Git status across projects
mise deps-check        # Check for outdated dependencies
mise clean             # Clean build artifacts
```

### Single Project Tasks

```bash
# From any project directory
mise :test             # Run project tests
mise :build            # Build project
mise :validate         # Lint project
mise :validate-ci      # CI validation

# Cross-project from root
mise //nah:test        # Test specific project
mise //obot-entraid:dev # Run obot-entraid dev server
```

### Multi-Repo Management (gita)

```bash
mise gita-init         # Register all child repos with gita
mise gita-status       # Git status across all repos (alias: mise gs)
mise gita-fetch        # Fetch all repos (alias: mise gf)
mise gita-pull         # Pull all repos (alias: mise gp)
mise gita-push         # Push all repos
mise gita-cmd -- log --oneline -3  # Run git command on all repos
```

---

## Universal Build Commands

These commands work across all projects in the workspace (traditional make approach):

### Building

```bash
make build                   # Build the project
go build ./...               # Build all packages
go build -o bin/app .        # Build specific binary
```

### Testing

```bash
make test                    # Run all tests
go test ./...                # Run all Go tests
go test -v ./pkg/router      # Run tests for specific package (verbose)
go test -race ./...          # Run tests with race detector
go test -cover ./...         # Run tests with coverage
go test -coverprofile=coverage.out ./...  # Generate coverage report
go tool cover -html=coverage.out          # View coverage in browser
```

### Linting and Validation

```bash
make validate                # Run linting (golangci-lint)
golangci-lint run            # Run linter manually
golangci-lint run --fix      # Auto-fix issues
go fmt ./...                 # Format Go code
gofmt -w .                   # Format all Go files
goimports -w .               # Fix imports and format
go vet ./...                 # Run Go vet
```

### Code Generation

```bash
go generate                  # Run code generators
go generate ./...            # Run generators for all packages
go generate ./pkg/router     # Run generators for specific package
```

### Dependency Management

```bash
go mod download              # Download dependencies
go mod tidy                  # Clean up dependencies
go mod verify                # Verify dependencies
go get -u package            # Update specific package
go mod graph                 # View dependency graph
```

## Project-Specific Commands

### obot-entraid

**Backend:**

```bash
cd obot-entraid
make build                   # Build backend
make test                    # Run Go tests
make lint                    # Run Go linting
docker build -t obot-entraid:latest .  # Build Docker image
docker run -d -p 8080:8080 obot-entraid:latest  # Run container
```

**Frontend:**

```bash
cd obot-entraid/ui/user
pnpm install                 # Install dependencies
pnpm run dev                 # Start development server
pnpm run build               # Build for production
pnpm run check               # TypeScript type checking
pnpm run lint                # Run ESLint
pnpm run format              # Format with Prettier
pnpm run ci                  # Run all checks (check + lint)
```

**Docker:**

```bash
cd obot-entraid
docker run -d --name obot -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e OPENAI_API_KEY=<API_KEY> \
  ghcr.io/jrmatherly/obot-entraid:latest
```

### nah (Kubernetes Controller Framework)

```bash
cd nah
make test                    # Run all tests
make validate                # Run linting
make validate-ci             # CI validation (checks for uncommitted generated code)
make setup-ci-env            # Install golangci-lint
go generate                  # Generate deep copy methods
go test -v ./pkg/router      # Test specific package
go test -race ./...          # Race detector
```

### kinm (K8s-like API Server)

```bash
cd kinm
make build                   # Build kinm
make test                    # Run unit tests
make test-race               # Run with race detector
make test-coverage           # Generate coverage report
make test-integration        # Run integration tests with PostgreSQL
make lint                    # Run golangci-lint
make fmt                     # Format code
make vet                     # Run go vet
make validate                # Run all validation checks
make ci                      # Run full CI pipeline locally
make help                    # Display all available targets
```

**Dependencies:**

```bash
cd kinm
make deps                    # Download dependencies
make deps-verify             # Verify dependencies
make deps-tidy               # Tidy dependencies
make deps-update             # Update all dependencies
```

### mcp-oauth-proxy

**CLI Binary:**

```bash
cd mcp-oauth-proxy
export OAUTH_CLIENT_ID="your-client-id"
export OAUTH_CLIENT_SECRET="your-client-secret"
export OAUTH_AUTHORIZE_URL="https://accounts.google.com"
export SCOPES_SUPPORTED="openid,email,profile"
export MCP_SERVER_URL="http://localhost:9000/mcp/gmail"
export ENCRYPTION_KEY="$(openssl rand -base64 32)"
go run .                     # Run locally
go build -o mcp-oauth-proxy  # Build binary
./mcp-oauth-proxy            # Run binary
```

**Docker:**

```bash
cd mcp-oauth-proxy
docker build -t mcp-oauth-proxy:latest .
docker run -d --name mcp-oauth-proxy -p 8080:8080 \
  -e OAUTH_CLIENT_ID="..." \
  -e OAUTH_CLIENT_SECRET="..." \
  -e OAUTH_AUTHORIZE_URL="https://accounts.google.com" \
  -e SCOPES_SUPPORTED="openid,email,profile" \
  -e MCP_SERVER_URL="http://localhost:9000/mcp/gmail" \
  -e ENCRYPTION_KEY="$(openssl rand -base64 32)" \
  mcp-oauth-proxy:latest
```

### obot-tools

```bash
cd obot-tools
make build                   # Build all tools
make test                    # Run all tests
make package-tools           # Package user-facing tools
make package-providers       # Package model and auth providers
make docker-build            # Build Docker image
```

**Specific Tool:**

```bash
cd obot-tools/openai-model-provider
go build -ldflags="-s -w" -o bin/gptscript-go-tool .
export OBOT_OPENAI_MODEL_PROVIDER_API_KEY=sk-...
export PORT=8000
go run .
```

**Python Tool:**

```bash
cd obot-tools/voyage-model-provider
python3 -m venv venv
source venv/bin/activate      # Activate virtual environment
pip install -r requirements.txt
python main.py
```

### namegenerator (Random Name Generator)

```bash
cd namegenerator

# Testing
go test                      # Run all tests
go test -v                   # Run with verbose output
go test -cover               # Run with coverage report
go test -race                # Run with race detector (IMPORTANT - NOT thread-safe!)

# Code Quality
go fmt ./...                 # Format code
go vet ./...                 # Static analysis
go mod tidy                  # Tidy dependencies

# Pre-commit Workflow (no Makefile - use standard Go commands)
go fmt ./... && go vet ./... && go test ./... && go mod tidy
```

**Note**: namegenerator uses standard Go commands (no Makefile). NameGenerator is NOT thread-safe - use separate instances per goroutine.

## CI/CD Validation

### Pre-commit Checks

```bash
# Run these before committing:
go generate                  # Generate code
go mod tidy                  # Tidy dependencies
go fmt ./...                 # Format code
golangci-lint run            # Lint
go test ./...                # Run tests
make validate-ci             # CI validation (detects uncommitted changes)
```

### Complete Validation

```bash
make build && make test && make lint
```

## Claude Code Commands

### Session Initialization

```bash
/expert-mode                 # Initialize session with Serena + context loading
```

### Custom Agents

```bash
# List available agents
claude /agents

# Use specific agent for task
claude "review this code" --agent go-reviewer      # Go code review (sonnet + MCP)
claude "analyze architecture" --agent arch-analyzer # Architecture analysis (opus + MCP)
claude "validate before commit" --agent pre-commit  # Fast pre-commit (haiku)
claude "check gptscript" --agent gptscript-validator # GPTScript validation (haiku)
```

### SuperClaude Skills (/sc:*)

```bash
/sc:help                     # List all available /sc commands
/sc:analyze                  # Code analysis and quality assessment
/sc:build                    # Build and compile projects
/sc:test                     # Execute tests with coverage
/sc:implement                # Feature implementation with context
/sc:troubleshoot             # Diagnose and resolve issues
/sc:document                 # Generate documentation
/sc:design                   # Design architecture and APIs
/sc:git                      # Git operations with smart commits
/sc:reflect                  # Task reflection and validation
/sc:research                 # Deep web research
```

### Path-Specific Rules (Auto-Activated)

These rules activate automatically based on file patterns:

- `**/*_test.go` → Go test conventions
- `**/*.gpt` → GPTScript format rules
- `**/ui/**/*.svelte` → SvelteKit conventions
- `**/pkg/controller/**` → K8s controller patterns
- `**/migrations/**/*.sql` → SQL migration patterns

### Hooks (Automatic)

Configured in `.claude/settings.json`:

- **PreToolUse (Edit/Write)**: Auto-formats Go code with `gofmt`
- **Stop**: Reminds about `make validate-ci` before commits

## Docker Commands

### Build

```bash
docker build -t project-name:latest .
docker build -t project-name:latest --target tools .  # Multi-stage
```

### Run

```bash
docker run -d --name container-name -p 8080:8080 project-name:latest
docker run -it --rm project-name:latest /bin/sh  # Interactive shell
```

### Inspect

```bash
docker ps                    # List running containers
docker logs container-name   # View logs
docker exec -it container-name /bin/sh  # Shell into container
docker inspect container-name  # Inspect container
```

### Clean up

```bash
docker stop container-name   # Stop container
docker rm container-name     # Remove container
docker rmi project-name:latest  # Remove image
docker system prune -a       # Clean up unused resources
```

## Kubernetes Commands (for nah and kinm)

```bash
kubectl get pods             # List pods
kubectl get deployments      # List deployments
kubectl logs pod-name        # View pod logs
kubectl describe pod pod-name  # Describe pod
kubectl apply -f manifest.yaml  # Apply manifest
kubectl delete -f manifest.yaml  # Delete resources
```

## Testing Utilities

### Generate Test Coverage

```bash
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html
open coverage.html           # macOS: open in browser
```

### Benchmarking

```bash
go test -bench=. ./...       # Run all benchmarks
go test -bench=BenchmarkName ./pkg/router  # Specific benchmark
go test -bench=. -benchmem ./...  # Include memory stats
```

### Profiling

```bash
go test -cpuprofile=cpu.prof ./...  # CPU profile
go test -memprofile=mem.prof ./...  # Memory profile
go tool pprof cpu.prof              # Analyze CPU profile
```

## Environment Setup

### Generate Secrets

```bash
openssl rand -base64 32      # Generate 32-byte random key (for encryption)
openssl rand -hex 16         # Generate 16-byte hex key
```

### Set Environment Variables

```bash
export OAUTH_CLIENT_ID="..."
export OAUTH_CLIENT_SECRET="..."
export DATABASE_DSN="postgres://user:pass@localhost/db"
export ENCRYPTION_KEY="$(openssl rand -base64 32)"
```

## Common Troubleshooting

### Clear Module Cache

```bash
go clean -modcache
```

### Update Dependencies

```bash
go get -u ./...
go mod tidy
```

### Check for Outdated Dependencies

```bash
go list -u -m all
```

### Fix Import Paths

```bash
goimports -w .
```

## Quick Reference

### Most Common Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes, then validate
go generate
go mod tidy
go fmt ./...
golangci-lint run
go test ./...

# 4. Commit and push
git add .
git commit -m "feat(scope): description"
git push origin feature/my-feature

# 5. Create pull request via GitHub UI or gh CLI
```

### Quick Health Check

```bash
# Verify everything is working:
cd /Users/jason/dev/AI
make build && make test && make validate
```
