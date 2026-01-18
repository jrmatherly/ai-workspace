# Code Style and Conventions

## Go Code Style

### General Guidelines

- **Follow Effective Go**: https://go.dev/doc/effective_go
- **Standard Formatting**: Always use `gofmt` or `go fmt`
- **Import Organization**: Use `goimports` for automatic import management
- **Documentation**: Document all exported functions, types, and packages

### Documentation Standards

```go
// Package provider implements authentication provider functionality
// for Microsoft Entra ID and Keycloak.
package provider

// FetchUserProfile retrieves user profile from Microsoft Graph API.
// Returns user profile data or error if request fails.
func FetchUserProfile(ctx context.Context, token string) (map[string]interface{}, error) {
    // Implementation...
}
```

### Naming Conventions

- **Packages**: Short, lowercase, single-word names (e.g., `router`, `apply`, `backend`)
- **Exported Names**: PascalCase for public API (e.g., `DefaultRouter`, `HandlerFunc`)
- **Unexported Names**: camelCase for internal use (e.g., `defaultHealthzPort`)
- **Interfaces**: Often end with 'er' suffix (e.g., `Handler`, `Watcher`, `Trigger`)

### Error Handling

- Return errors explicitly
- Wrap errors with context when propagating
- Check errors immediately after function calls
- Use sentinel errors for known conditions

### Code Organization

- Group related functionality in packages
- Keep functions focused and concise
- Use interfaces for abstraction
- Minimize dependencies between packages

## TypeScript/Svelte Code Style (obot-entraid)

### TypeScript Standards

```typescript
// Use TypeScript for type safety
// Follow ESLint configuration

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  iconUrl?: string;  // Optional fields with ?
}
```

### Component Structure

- Follow SvelteKit 5 conventions
- Use TypeScript for type safety
- Organize components in `src/lib/components/`
- Keep component logic focused

## Python Code Style (obot-tools)

### Standards

- **PEP 8**: Follow Python style guide
- **Type Hints**: Use type annotations
- **Formatters**: Use `black` for formatting
- **Import Sorting**: Use `isort`
- **Docstrings**: Document modules, classes, and functions

### Example

```python
"""
Module for embedding generation using Voyage AI.
"""

from typing import List, Optional

def generate_embeddings(texts: List[str], model: Optional[str] = None) -> List[List[float]]:
    """
    Generate embeddings for the given texts.
    
    Args:
        texts: List of text strings to embed
        model: Optional model name (defaults to voyage-2)
    
    Returns:
        List of embedding vectors
    """
    # Implementation...
```

## Commit Message Conventions

### Format: Conventional Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **ci**: CI/CD changes

### Examples

```bash
feat(entra): add conditional access policy support
fix(keycloak): resolve token expiration handling
docs: update Entra ID setup guide with MFA configuration
test(auth): add integration tests for profile picture handling
refactor(router): simplify event routing logic
perf(backend): optimize cache lookup performance
```

### Scope Guidelines

- Use component or package name
- Keep scope concise and consistent
- Examples: `entra`, `keycloak`, `router`, `apply`, `oauth`

## File Organization

### Go Project Structure

```
project/
├── pkg/                    # Internal packages
│   ├── router/            # Router package
│   ├── backend/           # Backend package
│   └── apply/             # Apply package
├── cmd/                    # Command-line tools
├── docs/                   # Documentation
├── go.mod                  # Go module file
├── go.sum                  # Dependency checksums
├── Makefile                # Build automation
├── README.md               # Project overview
├── CONTRIBUTING.md         # Contribution guide
└── CLAUDE.md               # AI assistant guide
```

### Tool Structure (obot-tools)

```
tool-name/
├── main.go                 # Entry point
├── tool.gpt                # GPTScript definition
├── go.mod                  # Module file
├── pkg/                    # Internal packages
│   ├── provider/          # Core logic
│   └── config/            # Configuration
├── README.md               # Documentation
└── Makefile                # Build targets
```

## Code Quality Standards

### Before Committing

1. **Format Code**:
   - Go: `gofmt -w .` or `go fmt ./...`
   - TypeScript: `pnpm run format`
   - Python: `black .` and `isort .`

2. **Lint Code**:
   - Go: `golangci-lint run`
   - TypeScript: `pnpm run lint`
   - Python: `flake8` or `pylint`

3. **Run Tests**:
   - Go: `go test ./...`
   - TypeScript: `pnpm run check && pnpm run test`
   - Python: `pytest`

4. **Check Generated Code** (Go):
   - Run: `go generate`
   - Verify: `make validate-ci`

### Pull Request Requirements

- ✅ Code follows project style
- ✅ All tests pass
- ✅ Linting passes with no errors
- ✅ Build succeeds
- ✅ Documentation updated (if needed)
- ✅ Commit messages follow Conventional Commits
- ✅ No sensitive data in commits

## Testing Conventions

### Go Tests

- Test files: `*_test.go`
- Test functions: `func TestXxx(t *testing.T)`
- Benchmarks: `func BenchmarkXxx(b *testing.B)`
- Table-driven tests for multiple cases
- Use subtests with `t.Run()` for organization

### Coverage Expectations

- Aim for meaningful coverage, not just high percentages
- Focus on critical paths and edge cases
- Integration tests for complex interactions
- Unit tests for business logic

## Code Generation

### Go Generate

- Use `//go:generate` directives
- Common generators:
  - Deep copy methods
  - Mock interfaces
  - Code scaffolding
- Always run `go generate` before committing
- CI validates generated code is up-to-date

## Security Best Practices

### Sensitive Data

- **Never** commit credentials, API keys, or tokens
- Use environment variables for configuration
- Encrypt sensitive data at rest (AES-256)
- Use secure random generators for secrets

### Example: Generating Encryption Keys

```bash
openssl rand -base64 32  # Generate 32-byte AES key
```

### Authentication

- Follow OAuth 2.1 standards
- Implement PKCE for public clients
- Use secure session management
- Validate all inputs

## Dependencies

### Go Modules

- Keep dependencies minimal
- Use `go mod tidy` regularly
- Pin versions for stability
- Update dependencies carefully with testing

### Updating Dependencies

```bash
go get -u github.com/example/package  # Update specific package
go mod tidy                             # Clean up dependencies
go test ./...                           # Verify tests still pass
```

## Editor Configuration

### Recommended Settings

- **Tabs vs Spaces**: Follow language conventions (Go uses tabs, TypeScript uses spaces)
- **Line Length**: 120 characters (flexible, prefer readability)
- **Trailing Whitespace**: Remove
- **Final Newline**: Always include

### EditorConfig

Projects may include `.editorconfig` for consistency across editors.
