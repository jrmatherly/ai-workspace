# Tech Stack and Dependencies

## Primary Languages and Runtimes

### Go

- **Versions**: Go 1.23 - 1.25.5
- **Primary Language**: Used across all projects
- **Package Management**: Go modules (go.mod)

### Python

- **Version**: Python 3.13+
- **Usage**: Specialized ML/AI tools in obot-tools (embeddings, document processing)
- **Package Management**: pip, requirements.txt, uv (modern package manager)

### TypeScript/JavaScript

- **Runtime**: Node.js 18+
- **Usage**:
  - Frontend (SvelteKit 5 in obot-entraid)
  - Image processing tools in obot-tools
- **Package Management**: pnpm

## Key Frameworks and Libraries

### Kubernetes Ecosystem (nah)

- **controller-runtime**: v0.19.0 - Controller framework
- **client-go**: v0.31.1 - Kubernetes client
- **apimachinery**: Kubernetes API machinery

### Observability

- **OpenTelemetry**: v1.35.0 - Distributed tracing
- **logrus**: v1.9.3 - Structured logging

### Frontend (obot-entraid)

- **SvelteKit**: 5.x - Full-stack framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: 4.x - Utility-first CSS

### Databases

- **PostgreSQL**: Primary production database
  - Used in kinm, mcp-oauth-proxy, obot-entraid
  - Vector storage and metadata indexing in obot-tools
- **SQLite**: Development and lightweight deployments
  - Credential storage
  - Local development

### Authentication

- **OAuth 2.0/2.1**: Standard authentication protocol
- **OpenID Connect (OIDC)**: Identity layer
- **PKCE**: OAuth 2.1 security extension

### AI/ML

- **OpenAI**: GPT-4, GPT-3.5, embeddings, DALL-E
- **Anthropic**: Claude 3.5 Sonnet, Opus, Haiku
- **Local Models**: Ollama (Llama, Mistral, etc.)
- **Other Providers**: Groq, xAI, DeepSeek, Voyage
- **RAG**: Vector embeddings and semantic search

### Build and Deployment

- **mise**: Polyglot tool manager and task runner (recommended)
- **Make**: Build automation (traditional)
- **Docker**: Containerization with multi-stage builds
- **Kubernetes**: Orchestration
- **Helm**: Kubernetes package management

## Development Tools

### Tool Management

- **mise**: Polyglot tool manager (replaces asdf, nvm, pyenv)
  - Manages: Go, Node.js, Python, golangci-lint, gita, gh
  - Configuration: `mise.toml` files in root and each project
  - Tasks: Unified task running across all projects
  - Installation: `curl https://mise.run | sh`

### Multi-Repo Management

- **gita**: Bulk git operations across multiple repositories
  - Installed via mise as `pipx:gita`
  - Tasks: `mise gita-init`, `mise gita-status`, `mise gita-pull`
  - Alternative to git submodules for independent repos

### Code Quality

- **golangci-lint**: Comprehensive Go linter
  - Integrates multiple linters
  - Project-specific configuration
- **gofmt**: Standard Go formatter
- **goimports**: Import management and formatting

### Testing

- **go test**: Native Go testing
- **Race Detector**: Concurrent code testing
- **Coverage Tools**: Test coverage analysis
- **pytest**: Python testing (for Python tools)

### Frontend Tooling (obot-entraid)

- **ESLint**: TypeScript/JavaScript linting
- **Prettier**: Code formatting
- **TypeScript Compiler**: Type checking
- **Vite**: Build tool (via SvelteKit)

### Package Management

- **go mod**: Go dependency management
- **pnpm**: Fast, disk-efficient Node.js package manager
- **pip/uv**: Python package management

### Dependency Updates

- **Renovate**: Automated dependency updates (used by all projects)
  - Configuration: `renovate.json` in each repository
  - Features: Semantic commits, auto-merge for patches, vulnerability alerts
  - Schedule: 10pm-6am America/New_York
  - Grouping: GitHub Actions, Kubernetes packages, language-specific packages
- **Dependabot**: GitHub-native alternative (workspace root only, disabled)
  - Configuration: `.github/dependabot.yml`
  - Status: Disabled in workspace root (superseded by Renovate)

## Infrastructure

### Container Base Images

- **Wolfi**: Minimal, security-focused base images
- **Alpine**: Lightweight Linux distribution (alternative)

### CI/CD

- **GitHub Actions**: Automated workflows
- **GitOps**: Configuration as code

## Security

### Encryption

- **AES-256**: Credential encryption at rest
- **TLS**: Encryption in transit

### Authentication Patterns

- **OAuth 2.1**: Modern authentication standard
- **Session Management**: Encrypted cookies
- **Token Handling**: Secure token storage and refresh

## Platform Compatibility

### Operating Systems

- **Darwin (macOS)**: Primary development environment
- **Linux**: Production environment
- **Container Runtime**: Cross-platform via Docker

### System Requirements

- **Go**: 1.23+ (varies by project)
- **Node.js**: 18+
- **Python**: 3.13+
- **Docker**: Latest stable version
- **Git**: Version control
