# Developer Onboarding Guide

**Welcome to the AI/MCP Multi-Repo Workspace!**
**Last Updated:** 2026-01-17

This guide covers everything you need to get started contributing to any of the 7 projects in this workspace.

> **Quick Nav:** [Prerequisites](#prerequisites) | [Initial Setup](#initial-setup) | [Repository Setup](#repository-setup-github) | [Project Selection](#project-selection) | [Development](#development-environment) | [Contributing](#your-first-contribution) | [Testing](#testing--validation)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Repository Setup (GitHub)](#repository-setup-github)
4. [Multi-Repo Management](#multi-repo-management)
5. [Project Selection](#project-selection)
6. [Development Environment](#development-environment)
7. [Your First Contribution](#your-first-contribution)
8. [Testing & Validation](#testing--validation)
9. [Code Review Process](#code-review-process)
10. [Resources & Support](#resources--support)

---

## Prerequisites

### Recommended: Use mise (Polyglot Tool Manager)

[mise](https://mise.jdx.dev) automatically installs and manages all required tools:

```bash
# Install mise
curl https://mise.run | sh

# From workspace root - install ALL tools
cd AI
mise trust
mise install    # Installs go, node, python, golangci-lint, gita, gh

# Verify installation
mise doctor
mise tasks      # View available tasks
```

**This is the recommended approach** - mise ensures everyone uses the same tool versions.

### Alternative: Manual Installation

If you prefer not to use mise:

```bash
# Go (primary language)
go version  # Must be 1.23+
# Install from: https://go.dev/dl/

# Git
git --version
# Install from: https://git-scm.com/

# Make (build automation)
make --version
# Usually pre-installed on macOS/Linux
# Windows: Install via chocolatey or WSL

# golangci-lint (linting)
golangci-lint --version
# Install: curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin

# GitHub CLI (recommended)
gh auth status
# Install: https://cli.github.com/
```

### Optional Tools (Project-Specific)

```bash
# Node.js 18+ (for obot-entraid frontend)
node --version
# Install from: https://nodejs.org/

# pnpm (package manager for frontend)
pnpm --version
# Install: npm install -g pnpm

# Python 3.13+ (for obot-tools Python components)
python3 --version
# Install from: https://www.python.org/

# Docker (for containerized MCP servers)
docker --version
# Install from: https://docker.com/

# Kubernetes tools (for nah development)
kubectl version
# Install from: https://kubernetes.io/docs/tasks/tools/
```

---

## Initial Setup

### 1. Clone the Repository

```bash
# Navigate to your workspace
cd ~/dev  # or wherever you keep projects

# Clone the repository
git clone https://github.com/<org>/AI.git  # Replace with actual repo
cd AI

# Verify structure
ls -la
# Should see: obot-entraid, nah, kinm, mcp-oauth-proxy, obot-tools, mcp-catalog
```

### 2. Set Up Git Configuration

```bash
# Configure your identity
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Set up commit message template (optional)
git config commit.template .gitmessage  # If exists
```

### 3. Explore the Documentation

```bash
# Read the main README
cat README.md

# Check documentation guide
cat documentation/docs/reference/documentation-guide.md

# View project index
cat documentation/docs/reference/project-index.md

# Quick reference
cat QUICK_REFERENCE.md
```

### 4. Load AI Context (Optional)

If using Serena or Claude Code:

```bash
# AI memories are in .serena/memories/
ls .serena/memories/

# Key files:
# - project_purpose_and_structure.md
# - codebase_architecture.md
# - code_style_and_conventions.md
# - suggested_commands.md
```

---

## Repository Setup (GitHub)

### Workspace Architecture

This workspace uses a **multi-repo architecture**:

- **Root repository**: Shared configuration, documentation, Claude Code customization
- **Child repositories**: 7 independent projects, each with their own GitHub remote

```text
AI/                          <- Root repository
├── .claude/                  <- Claude Code configuration
├── .serena/                  <- Serena MCP memories
├── .github/workflows/        <- Shared CI workflows
├── documentation/            <- Supplementary docs
├── AGENTS.md, CLAUDE.md...   <- Shared documentation
│
├── obot-entraid/             <- Independent repo (excluded from root)
├── nah/                      <- Independent repo (excluded from root)
├── kinm/                     <- Independent repo (excluded from root)
├── mcp-oauth-proxy/          <- Independent repo (excluded from root)
├── obot-tools/               <- Independent repo (excluded from root)
├── mcp-catalog/              <- Independent repo (excluded from root)
└── namegenerator/            <- Independent repo (excluded from root)
```

### Creating the Root Repository (First-Time Setup)

If you're setting up the workspace repository for the first time:

**Option A: GitHub CLI (Recommended)**

```bash
# Create public repository
gh repo create jrmatherly/ai-workspace \
  --public \
  --description "AI/MCP Multi-Repo Workspace - Shared configuration and documentation"

# Or create private repository
gh repo create jrmatherly/ai-workspace \
  --private \
  --description "AI/MCP Multi-Repo Workspace - Shared configuration and documentation"
```

**Option B: GitHub Web Interface**

1. Go to [github.com/new](https://github.com/new)
2. Fill in the form:
   - **Repository name**: `ai-workspace`
   - **Description**: `AI/MCP Multi-Repo Workspace - Shared configuration and documentation`
   - **Visibility**: Public or Private
   - **Initialize**: Do NOT check any initialization options
3. Click **Create repository**

### Initial Commit and Push

```bash
cd /Users/jason/dev/AI

# Stage all workspace files (child repos are gitignored)
git add .

# Verify staged files
git status

# Create initial commit
git commit -m "feat: initialize AI/MCP multi-repo workspace

Shared configuration and documentation for the AI/MCP development workspace.
This is a multi-repo workspace where each project is an independent
git repository with its own GitHub remote.

Contents:
- AGENTS.md: Cross-agent universal guidelines
- CLAUDE.md: Claude Code-specific integration
- SECURITY.md: Workspace security policy
- .claude/: Commands, instructions, rules, skills, agents
- .serena/: Serena MCP memories and project configuration
- .github/: CODEOWNERS, PR template, issue templates, workflows
- documentation/: Supplementary documentation
- go.work.example: Go workspace template for local development
- mise.toml: Shared tool versioning (Go, Node, Python)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Add remote and push
git remote add origin https://github.com/jrmatherly/ai-workspace.git
git push -u origin main
```

### Verify Setup

```bash
# Check local status
git status              # Should show clean working tree
git remote -v           # Should show the remote
git log --oneline -1    # Should show your commit

# Verify via CLI
gh repo view jrmatherly/ai-workspace --json codeowners,securityPolicy
```

---

## Multi-Repo Management

### Initialize gita for Bulk Operations

After initial setup, configure gita for managing all child repositories:

```bash
# Install tools (gita is included in mise.toml)
mise install

# Register all child repositories with gita
mise gita-init

# Verify registration
mise gita-status   # or: gita ll
```

### Common gita Commands

**Via mise:**

| Command | Alias | Description |
|---------|-------|-------------|
| `mise gita-status` | `mise gs` | Show git status across all repos |
| `mise gita-fetch` | `mise gf` | Fetch all repos |
| `mise gita-pull` | `mise gp` | Pull all repos |
| `mise gita-push` | - | Push all repos (use with caution) |
| `mise gita-cmd -- log --oneline -3` | - | Run arbitrary git command on all repos |

**Direct gita commands:**

```bash
gita ll                    # List all registered repos with status
gita fetch                 # Fetch all repos
gita pull                  # Pull all repos
gita super status          # Run 'git status' on all repos
gita shell nah "git log"   # Run command on specific repo
```

### Set Up Go Workspace (Optional)

For cross-module Go development:

```bash
# Copy template (go.work is gitignored)
cp go.work.example go.work

# Sync the workspace
go work sync

# Verify modules are recognized
go work edit -json | jq '.Use'
```

**Benefits:**

- IDE understands all modules in the workspace
- Cross-module changes work without `replace` directives
- `go build` and `go test` work across modules

---

## Project Selection

### Choose Your Focus Area

| Project | Best For | Primary Tech | Difficulty |
|---------|----------|--------------|------------|
| **obot-entraid** | Full-stack, MCP platform | Go + SvelteKit | Medium |
| **nah** | K8s controllers, frameworks | Go | Advanced |
| **kinm** | API servers, databases | Go + PostgreSQL | Medium |
| **mcp-oauth-proxy** | Auth, OAuth, security | Go | Medium |
| **obot-tools** | Tools, AI/ML integration | Go/Python/TS | Easy-Medium |
| **mcp-catalog** | Configuration, YAML | YAML | Easy |
| **namegenerator** | Simple Go library | Go | Easy |

### Project Deep Dive

Once you've chosen a project:

```bash
# Navigate to project
cd <project-name>

# Read project-specific docs
cat README.md
cat CLAUDE.md  # Detailed architecture and patterns

# Check for contributing guide
cat CONTRIBUTING.md  # If exists
```

---

## Development Environment

### Setting Up a Project

**Using mise (Recommended)**

```bash
# From any project directory, mise provides unified commands:
cd nah

# Run project tasks via mise
mise :test           # Run tests
mise :build          # Build
mise :validate       # Lint

# Or use cross-project commands from root
cd AI
mise //nah:test      # Test nah from anywhere
mise all             # Validate ALL projects
```

**Example: Setting up `nah` (Manual)**

```bash
cd nah

# 1. Download dependencies
go mod download

# 2. Verify dependencies
go mod verify

# 3. Generate code (if applicable)
go generate

# 4. Build
make build

# 5. Run tests
make test

# 6. Run linter
make validate
```

**Example: Setting up `obot-entraid`**

```bash
cd obot-entraid

# Backend setup
go mod download
make build

# Frontend setup
cd ui/user
pnpm install
pnpm run build
cd ../..

# Run development environment
make dev  # Starts both backend and frontend with hot reload
```

**Example: Setting up `obot-tools` (Python component)**

```bash
cd obot-tools/voyage-model-provider

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run
python main.py
```

### IDE Setup

**VS Code (Recommended)**

```bash
# Install VS Code
# Download from: https://code.visualstudio.com/

# Install Go extension
code --install-extension golang.go

# Install Markdown extensions
code --install-extension yzhang.markdown-all-in-one

# Install Mermaid preview (for diagrams)
code --install-extension bierner.markdown-mermaid

# Open project
code .
```

**GoLand**

```bash
# Download from: https://www.jetbrains.com/go/
# File -> Open -> Select AI directory
```

### Environment Variables

Create a `.env` file in your project (if needed):

```bash
# Example for mcp-oauth-proxy
cd mcp-oauth-proxy
cat > .env << EOF
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_AUTHORIZE_URL=https://accounts.google.com
SCOPES_SUPPORTED=openid,email,profile
MCP_SERVER_URL=http://localhost:9000/mcp/gmail
ENCRYPTION_KEY=$(openssl rand -base64 32)
DATABASE_DSN=  # Empty for SQLite
EOF

# Load environment
source .env  # or use direnv
```

---

## Your First Contribution

### Step 1: Find an Issue

```bash
# Look for "good first issue" labels on GitHub
# Or check project READMEs for TODO items

# Example areas for first contribution:
# - Documentation improvements
# - Test coverage additions
# - Bug fixes with clear reproduction
# - Small feature enhancements
```

### Step 2: Create a Feature Branch

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/my-contribution

# Naming conventions:
# - feature/add-xyz
# - fix/resolve-abc
# - docs/improve-readme
# - test/add-coverage-xyz
```

### Step 3: Make Your Changes

```bash
# Navigate to relevant files
# Make code changes
# Add tests for new functionality
# Update documentation

# Example: Adding a new function
# 1. Write the function
# 2. Write unit tests
# 3. Add godoc comments
# 4. Update README if it's user-facing
```

### Step 4: Write Tests

```go
// Example test in Go
func TestMyNewFunction(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    string
        wantErr bool
    }{
        {
            name:    "valid input",
            input:   "test",
            want:    "expected",
            wantErr: false,
        },
        {
            name:    "empty input",
            input:   "",
            want:    "",
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := MyNewFunction(tt.input)
            if (err != nil) != tt.wantErr {
                t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            if got != tt.want {
                t.Errorf("got = %v, want %v", got, tt.want)
            }
        })
    }
}
```

### Step 5: Validate Your Changes

```bash
# CRITICAL: Run these in order before committing

# 1. Generate code (if project has generators)
go generate

# 2. Tidy dependencies
go mod tidy

# 3. Format code
go fmt ./...

# 4. Lint
make validate
# or: golangci-lint run

# 5. Run tests
make test

# 6. CI validation (CRITICAL)
make validate-ci
# This fails if generated code isn't committed
```

### Step 6: Commit Your Changes

```bash
# Stage changes
git add .

# Check what's staged
git status

# Commit with conventional commit message
git commit -m "feat(router): add middleware support for handlers

- Implement middleware interface
- Add middleware chain execution
- Add tests for middleware
- Update documentation

Closes #123"

# Commit message format:
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>

# Types: feat, fix, docs, test, chore, refactor, perf, ci
```

### Step 7: Push and Create PR

```bash
# Push to remote
git push origin feature/my-contribution

# Create pull request on GitHub
# - Title: Same as commit subject
# - Description: Explain the change, why it's needed
# - Link to issues: "Closes #123"
# - Checklist: Tests added, docs updated, etc.
```

---

## Testing & Validation

### Running Tests

```bash
# Fast unit tests (preferred during development)
go test -short ./...

# All tests
go test ./...

# Specific package
go test -v ./pkg/router

# With race detector
go test -race ./...

# With coverage
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out  # View in browser
```

### Debugging Tests

```bash
# Verbose output
go test -v ./pkg/mypackage

# Run specific test
go test -v -run TestMyFunction ./...

# With additional output
go test -v -run TestMyFunction ./... 2>&1 | tee test.log

# Using delve debugger
dlv test ./pkg/mypackage -- -test.run TestMyFunction
```

### Linting

```bash
# Run all linters
make validate

# Or directly
golangci-lint run

# Auto-fix issues
golangci-lint run --fix

# Run specific linter
golangci-lint run --disable-all --enable=errcheck
```

### Pre-Commit Checklist

```bash
#!/bin/bash
set -e

echo "Running pre-commit checks..."

echo "1. Generating code..."
go generate

echo "2. Tidying dependencies..."
go mod tidy

echo "3. Formatting code..."
go fmt ./...

echo "4. Linting..."
make validate

echo "5. Running tests..."
make test

echo "6. CI validation..."
make validate-ci

echo "All checks passed! Ready to commit."
```

---

## Code Review Process

### What Reviewers Look For

1. **Code Quality**
   - Follows project conventions
   - Proper error handling
   - Clear variable names
   - No unnecessary complexity

2. **Tests**
   - Adequate test coverage
   - Edge cases covered
   - Tests actually test the functionality

3. **Documentation**
   - Godoc comments for exported functions
   - README updates if user-facing
   - Code comments for complex logic

4. **Performance**
   - No obvious performance issues
   - Proper use of goroutines and channels
   - Resource cleanup (defer, close)

5. **Security**
   - No hardcoded secrets
   - Input validation
   - Proper authentication/authorization

### Responding to Feedback

```bash
# Make requested changes
# Edit files...

# Run validation again
./pre-commit.sh

# Commit changes
git add .
git commit -m "fix: address review feedback

- Improve error handling
- Add missing test cases
- Update documentation"

# Push
git push origin feature/my-contribution

# PR will automatically update
```

### Merging

Once approved:

- Maintainer will merge your PR
- Your branch will be deleted

---

## Resources & Support

### Documentation

| Resource | Purpose |
|----------|---------|
| [README.md](../../README.md) | Workspace overview |
| [QUICK_REFERENCE.md](../../QUICK_REFERENCE.md) | One-page reference |
| [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md) | Common issues |
| [DOCUMENTATION_GUIDE.md](./documentation-guide.md) | Navigation |
| [PROJECT_INDEX.md](./project-index.md) | Comprehensive reference |
| Project `CLAUDE.md` | Detailed architecture |

### Learning Resources

**Go Language**

- [Go Tour](https://go.dev/tour/)
- [Effective Go](https://go.dev/doc/effective_go)
- [Go by Example](https://gobyexample.com/)

**Kubernetes (for nah)**

- [Kubernetes Docs](https://kubernetes.io/docs/)
- [client-go Examples](https://github.com/kubernetes/client-go/tree/master/examples)
- [controller-runtime](https://pkg.go.dev/sigs.k8s.io/controller-runtime)

**MCP Protocol**

- [MCP Specification](https://modelcontextprotocol.io/)
- [Obot Documentation](https://docs.obot.ai/)

**Frontend (obot-entraid)**

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Getting Help

1. **Read Documentation First**
   - Check project README
   - Read CLAUDE.md for architecture
   - Search PROJECT_INDEX.md

2. **Check Existing Issues**
   - GitHub Issues
   - Discussions

3. **Ask Questions**
   - Open a GitHub Discussion
   - Create an issue with "question" label

4. **Debugging Help**
   - Include: error message, steps to reproduce
   - Minimal reproduction case
   - What you've tried

---

## Common Workflows

### Daily Development

```bash
# Start of day
git checkout main
git pull origin main
git checkout -b feature/my-work

# Make changes...

# Before committing
./pre-commit.sh

# Commit and push
git commit -m "feat: ..."
git push origin feature/my-work

# End of day
# Create/update PR if ready
```

### Updating Your Branch

```bash
# If main has moved forward
git checkout main
git pull origin main
git checkout feature/my-work
git rebase main  # or: git merge main

# Resolve conflicts if any
git status
# Edit conflicted files
git add .
git rebase --continue  # if rebasing
# or: git commit  # if merging

git push origin feature/my-work --force-with-lease  # if rebased
```

### Cleaning Up

```bash
# After PR is merged
git checkout main
git pull origin main
git branch -d feature/my-work  # Delete local branch
git remote prune origin  # Clean up remote refs
```

---

## Troubleshooting Setup

### Child Repos Showing in Git Status

If child repositories appear in `git status`, check `.gitignore`:

```bash
# Verify these lines exist
grep -A 10 "NESTED GIT REPOSITORIES" .gitignore
```

Expected:

```gitignore
# NESTED GIT REPOSITORIES (Multi-Repo Workspace)
obot-entraid/
nah/
kinm/
mcp-oauth-proxy/
obot-tools/
mcp-catalog/
namegenerator/
```

### Push Rejected (Non-Fast-Forward)

If you initialized the GitHub repo with a README:

```bash
# Pull and rebase (if you want to keep the remote README)
git pull --rebase origin main

# Or force push (if you want to overwrite)
git push --force-with-lease origin main
```

### Authentication Failed

```bash
# For HTTPS, use GitHub CLI to authenticate
gh auth login

# For SSH, verify your key is added
ssh -T git@github.com
```

---

## File Ownership Reference

| Files | Repository | Notes |
|-------|------------|-------|
| `.claude/`, `.serena/`, `AGENTS.md`, `CLAUDE.md`, `mise.toml` | Root (ai-workspace) | Shared configuration |
| `.github/workflows/claude-*.yml` | Root (ai-workspace) | Workspace-level CI |
| `.github/CODEOWNERS` | Root (ai-workspace) | Code ownership rules |
| `SECURITY.md` | Root (ai-workspace) | Workspace security policy |
| `documentation/` | Root (ai-workspace) | Supplementary docs |
| `obot-entraid/*`, `nah/*`, etc. | Independent repos | Separate GitHub remotes |

---

## Next Steps

### After Your First Contribution

1. **Explore More**
   - Try contributing to other projects in the workspace
   - Dive deeper into project architecture

2. **Increase Complexity**
   - Take on larger features
   - Help with code reviews
   - Improve documentation

3. **Become a Maintainer**
   - Consistent quality contributions
   - Help other contributors
   - Review PRs

---

## Welcome Aboard!

You're now ready to contribute to the AI/MCP multi-repo workspace. Don't hesitate to ask questions and learn as you go.

**Happy coding!**

---

*Consolidated from DEVELOPER_ONBOARDING.md and REPOSITORY_SETUP.md. Last updated: 2026-01-17*
