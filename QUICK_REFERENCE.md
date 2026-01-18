# Quick Reference Guide

**AI/MCP Multi-Repo Workspace** - One-page developer reference
**Last Updated:** 2026-01-17

---

## 📁 Project Structure

```
AI/
├── obot-entraid/      # MCP platform (Go + SvelteKit)
├── nah/               # K8s controller framework
├── kinm/              # K8s-like API server
├── mcp-oauth-proxy/   # OAuth 2.1 proxy
├── obot-tools/        # Tools & providers
├── mcp-catalog/       # MCP configs (YAML)
└── namegenerator/     # Random name generator (zero deps)
```

---

## ⚡ Essential Commands

### Using mise (Recommended)

```bash
# From workspace root
mise install           # Install all tools (go, node, python, golangci-lint, gita)
mise tasks             # List all available tasks
mise all               # Validate ALL projects
mise test-all          # Test ALL projects

# From any project directory
mise :test             # Run project tests
mise :build            # Build project
mise :validate         # Lint project

# Cross-project (from root)
mise //nah:test        # Test specific project
mise gita-status       # Git status across all repos
mise gita-pull         # Pull all repos
```

### Using make (Traditional)

```bash
cd <project>           # Navigate to project

make build             # Build
make test              # Test
make validate          # Lint
make validate-ci       # CI check (CRITICAL before commit)

go fmt ./...           # Format
go mod tidy            # Clean deps
go generate            # Generate code (if applicable)
```

### Project-Specific

| Project | Dev Command | Special Command |
| --------- | ------------- | ----------------- |
| **obot-entraid** | `make dev` | `make ui` (build frontend) |
| **nah** | `make test` | `go generate` (MUST commit) |
| **kinm** | `make ci` | `make test-integration` |
| **mcp-oauth-proxy** | `make test-short` | `./demo_sqlite.sh` |
| **obot-tools** | `make build` | `make package-tools` |
| **namegenerator** | `go test` | `go test -race` (NOT thread-safe) |

---

## 🔥 Pre-Commit Checklist

**Run these IN ORDER before every commit:**

```bash
go generate         # 1. Generate code
go mod tidy         # 2. Clean dependencies
go fmt ./...        # 3. Format
make validate       # 4. Lint
make test           # 5. Test
make validate-ci    # 6. CI check (FAILS if generated code uncommitted)
```

---

## 🎯 Common Tasks

### Starting a Feature

```bash
cd <project>
git checkout -b feature/my-feature
go mod download
go generate  # if needed
# Make changes...
```

### Running Tests

```bash
# Fast
go test -short ./...

# Specific package
go test -v ./pkg/router

# With race detector
go test -race ./...

# With coverage
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Debugging

```bash
# Verbose test output
go test -v ./pkg/mypackage

# Run single test
go test -run TestMyFunction ./...

# With debug logging
export GPTSCRIPT_DEBUG=true  # obot-tools
go run .
```

---

## 📦 Dependencies

### Update Dependency

```bash
go get -u github.com/example/package
go mod tidy
go test ./...  # Verify tests pass
```

### View Dependency Tree

```bash
go mod graph
go list -m all
```

---

## 🔧 Common Issues & Fixes

| Issue | Solution |
| ------- | ---------- |
| `make validate-ci` fails | Run `go generate && go mod tidy`, commit changes |
| Linter errors | `golangci-lint run --fix` then manually fix remaining |
| Import errors | `goimports -w .` |
| Test fails | Check test output, ensure dependencies installed |
| Build fails | `go mod download && go mod tidy` |

---

## 🏗️ Architecture Quick View

### nah (Controller Framework)

- **Router** → Routes K8s events
- **Backend** → K8s client abstraction
- **Apply** → Declarative resource management
- **Pattern:** Watch → Queue → Handler → Apply

### obot-entraid (Platform)

- **Frontend:** SvelteKit 5
- **Backend:** Go API server
- **MCP Types:** single-user, multi-user, remote, composite
- **Auth:** Entra ID, Keycloak

### mcp-oauth-proxy

- **Flow:** OAuth 2.1 with PKCE
- **Tokens:** RS256 JWT (1h), AES-256 refresh (90d)
- **Headers:** X-Forwarded-User, X-Forwarded-Email

### obot-tools

- **Registry:** index.yaml
- **Model Providers:** Port 8000, OpenAI-compatible
- **Tools:** GPTScript .gpt definitions

### namegenerator

- **Pattern:** Interface-first with seeded PRNG
- **Format:** "adjective-noun" (e.g., "silent-moon")
- **Combinations:** 3,596 (62 adjectives × 58 nouns)
- **NOT Thread-Safe:** Use separate instances per goroutine
- **Zero Dependencies:** Go standard library only

---

## 📋 Git Workflow

### Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, test, chore, refactor, perf
```

**Examples:**

```bash
feat(router): add middleware support
fix(oauth): resolve token refresh race
docs: update setup instructions
```

### Push & PR

```bash
git add .
git commit -m "feat(scope): description"
git push origin feature/my-feature
# Create PR via GitHub
```

---

## 🚀 Port Reference

| Project | Default Port | Config |
| --------- | ------------- | --------- |
| obot-entraid | 8080 | `PORT` env |
| mcp-oauth-proxy | 8080 | `PORT` env |
| obot-tools (providers) | 8000 | `PORT` env |
| kinm | 8080 | Config |

---

## 🔐 Environment Variables

### obot-entraid

```bash
DATABASE_URL=postgres://...
OPENAI_API_KEY=sk-...
```

### mcp-oauth-proxy

```bash
OAUTH_CLIENT_ID=...
OAUTH_CLIENT_SECRET=...
OAUTH_AUTHORIZE_URL=https://accounts.google.com
SCOPES_SUPPORTED=openid,email,profile
MCP_SERVER_URL=http://localhost:9000/mcp/gmail
ENCRYPTION_KEY=$(openssl rand -base64 32)
```

### obot-tools (model provider)

```bash
OBOT_<PROVIDER>_MODEL_PROVIDER_API_KEY=...
PORT=8000
GPTSCRIPT_DEBUG=true
```

---

## 🤖 Claude Code

### Custom Agents

```bash
# List available agents
claude /agents

# Use specific agent
claude "review this code" --agent go-reviewer
claude "validate before commit" --agent pre-commit
```

| Agent | Model | Purpose |
| ----- | ----- | ------- |
| `go-reviewer` | sonnet | Go code review with MCP |
| `arch-analyzer` | opus | Architecture analysis |
| `pre-commit` | haiku | Fast pre-commit validation |
| `gptscript-validator` | haiku | GPTScript validation |

### Path-Specific Rules

Auto-activated based on file patterns:

- `**/*_test.go` → Go test conventions
- `**/*.gpt` → GPTScript format
- `**/ui/**/*.svelte` → SvelteKit conventions
- `**/pkg/controller/**` → K8s controller patterns

### Skills

```bash
# List available skills
claude /skills
```

Key skills: `validate-project`, `code-review`, `new-provider`

---

## 📚 Documentation Paths

| Document | Purpose |
| ---------- | --------- |
| `README.md` | Project overview |
| `CLAUDE.md` | AI assistant guide (DETAILED) |
| `.claude/instructions/claude-code-enhancements-guide-v2.md` | Full enhancement reference |
| `documentation/docs/reference/project-index.md` | Comprehensive reference |
| `documentation/docs/reference/documentation-guide.md` | Navigation |
| `documentation/docs/reference/api-reference.md` | API docs |
| `documentation/docs/reference/architecture.md` | Visual architecture |
| `QUICK_REFERENCE.md` | This file |

---

## 🧪 Testing Patterns

### Table-Driven Tests

```go
func TestMyFunction(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    string
        wantErr bool
    }{
        {"valid input", "test", "result", false},
        {"empty input", "", "", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := MyFunction(tt.input)
            if (err != nil) != tt.wantErr {
                t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
            }
            if got != tt.want {
                t.Errorf("got %v, want %v", got, tt.want)
            }
        })
    }
}
```

---

## 🎓 Learning Path

1. **Start:** Read `README.md`
2. **Navigate:** Use `documentation/docs/reference/documentation-guide.md`
3. **Deep Dive:** Read project `CLAUDE.md`
4. **Reference:** Use `documentation/docs/reference/project-index.md`
5. **Build:** Follow project `README.md` setup
6. **Code:** Follow conventions in `.serena/memories/`

---

## 💡 Tips

- **Use `mise install`** to get all tools automatically
- **Use `mise all`** to validate all projects at once
- **Each project is independent** - don't import between them
- **Read project-specific CLAUDE.md** for detailed architecture
- **Use `make validate-ci`** before every commit (critical for nah)
- **Use `mise gita-*`** for bulk git operations across repos
- **Frontend changes** require Node.js 18+ and pnpm
- **Python tools** use Python 3.13+ with venv

---

## 🆘 Getting Help

1. Check project `README.md`
2. Read project `CLAUDE.md` for architecture
3. Search `documentation/docs/reference/project-index.md` for keywords
4. Check `.serena/memories/` for conventions
5. File GitHub issue if stuck

---

**For complete documentation, see:**

- [README.md](README.md) - Workspace overview
- [documentation/docs/reference/documentation-guide.md](documentation/docs/reference/documentation-guide.md) - Full navigation
- [documentation/docs/reference/project-index.md](documentation/docs/reference/project-index.md) - Comprehensive reference
- Individual project `CLAUDE.md` files - Detailed architecture
