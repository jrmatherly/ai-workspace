# Task Completion Checklist

When a development task is completed, follow this checklist to ensure code quality and consistency.

## Code Quality Checks

### 1. Code Generation (Go Projects)

```bash
go generate                  # Run code generators
go generate ./...            # Generate for all packages
```

**Why**: Ensures generated code (deep copy methods, mocks, etc.) is up-to-date.

### 2. Code Formatting

**Go:**

```bash
go fmt ./...                 # Format all Go files
gofmt -w .                   # Alternative: format and write
goimports -w .               # Fix imports and format
```

**TypeScript/JavaScript (obot-entraid):**

```bash
cd ui/user
pnpm run format              # Run Prettier
```

**Python (obot-tools):**

```bash
black .                      # Format Python code
isort .                      # Sort imports
```

**Why**: Consistent code formatting improves readability and reduces merge conflicts.

### 3. Linting

**Go:**

```bash
make validate                # Run project linting
golangci-lint run            # Run linter directly
golangci-lint run --fix      # Auto-fix issues
go vet ./...                 # Additional static analysis
```

**TypeScript (obot-entraid):**

```bash
cd ui/user
pnpm run lint                # Run ESLint
pnpm run check               # TypeScript type checking
```

**Python (obot-tools):**

```bash
flake8 .                     # Style guide enforcement
pylint .                     # Code analysis
```

**Why**: Catches potential bugs, style issues, and enforces best practices.

### 4. Testing

**Go:**

```bash
make test                    # Run all tests
go test ./...                # Run all Go tests
go test -v ./pkg/router      # Verbose output for specific package
go test -race ./...          # Run with race detector
go test -cover ./...         # Check test coverage
```

**TypeScript (obot-entraid):**

```bash
cd ui/user
pnpm run test                # Run tests
pnpm run ci                  # Run all checks (check + lint + test)
```

**Python (obot-tools):**

```bash
pytest                       # Run Python tests
pytest --cov                 # Run with coverage
```

**Why**: Ensures changes don't break existing functionality and new code works as expected.

### 5. Build Verification

**Go:**

```bash
make build                   # Build project
go build ./...               # Build all packages
go build -o bin/app .        # Build specific binary
```

**TypeScript (obot-entraid):**

```bash
cd ui/user
pnpm run build               # Build for production
```

**Docker:**

```bash
docker build -t project-name:test .  # Build Docker image
```

**Why**: Confirms code compiles without errors.

## Dependency Management

### 6. Tidy Dependencies

**Go:**

```bash
go mod tidy                  # Clean up go.mod and go.sum
go mod verify                # Verify dependency integrity
```

**TypeScript:**

```bash
cd ui/user
pnpm install                 # Ensure lockfile is up-to-date
```

**Python:**

```bash
pip freeze > requirements.txt  # Update requirements (if needed)
```

**Why**: Keeps dependencies clean and prevents version conflicts.

## CI Validation

### 7. Pre-commit CI Check

**Critical for Go projects:**

```bash
make validate-ci             # Simulates CI pipeline
```

This command:

- Runs `go generate`
- Runs `go mod tidy`
- Checks for uncommitted changes (dirty repo)
- **Fails if generated code or dependencies are out of sync**

**Why**: Prevents CI failures due to uncommitted generated code.

### 8. Complete Validation Pipeline

**All projects:**

```bash
make build && make test && make validate
```

**Specific projects (nah, kinm):**

```bash
make ci                      # Run full CI pipeline locally
```

**Why**: Catches issues before pushing to remote.

## Claude Code Automation

Claude Code provides automated assistance for several checklist items:

### Automatic Formatting (Hooks)

Claude Code hooks (configured in `.claude/settings.json`) automatically run `gofmt` before Edit/Write operations on Go files. This handles step #2 (Code Formatting) automatically.

### Pre-Commit Reminder (Stop Hook)

When Claude Code completes a task, a Stop hook reminds you to run `make validate-ci` before committing. This ensures step #7 is not forgotten.

### GitHub Actions Integration

Pull requests automatically trigger Claude-based code review:

- **claude-review.yml**: Reviews PR changes with code analysis agent
- **claude-triage.yml**: Triages new issues with project identification

### Agent-Based Validation

Use the pre-commit agent for fast validation:

```bash
claude "validate before commit" --agent pre-commit
```

This runs linting, test checks, and provides feedback using the fast haiku model.

### Skill-Based Workflows

Use SuperClaude skills for structured validation:

```bash
/sc:test                     # Execute tests with coverage analysis
/sc:analyze                  # Code analysis and quality assessment
/sc:git                      # Git operations with smart commit messages
```

## Documentation

### 9. Update Documentation

Check if any of these need updates:

- **README.md**: Project overview, setup instructions
- **CONTRIBUTING.md**: Contribution guidelines
- **API documentation**: If public API changed
- **Code comments**: Document exported functions and types
- **CHANGELOG**: For significant changes (if project maintains one)

**Why**: Keeps documentation in sync with code changes.

## Git Best Practices

### 10. Commit Message

Follow Conventional Commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance
- `refactor`: Code restructuring
- `perf`: Performance improvement

**Examples:**

```bash
git commit -m "feat(router): add middleware support"
git commit -m "fix(auth): resolve token refresh issue"
git commit -m "docs: update setup guide with examples"
```

**Why**: Clear commit history and automated changelog generation.

### 11. Security Check

- [ ] No sensitive data committed (API keys, passwords, tokens)
- [ ] No credentials in code or config files
- [ ] Environment variables used for secrets
- [ ] .gitignore properly configured

**Check staged files:**

```bash
git diff --cached            # Review staged changes
git status                   # Check for untracked sensitive files
```

**Why**: Prevents accidental exposure of secrets.

## Task-Specific Checklists

### For New Features

- [ ] Feature implemented and working
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] Code formatted and linted
- [ ] All tests passing
- [ ] No breaking changes (or documented if necessary)
- [ ] Examples or usage guide added (if applicable)

### For Bug Fixes

- [ ] Bug reproduced and root cause identified
- [ ] Fix implemented
- [ ] Test added to prevent regression
- [ ] All existing tests still passing
- [ ] Documentation updated (if behavior changed)

### For Refactoring

- [ ] Code refactored with same functionality
- [ ] All tests still passing
- [ ] No behavior changes (unless intended)
- [ ] Performance impact assessed (if relevant)
- [ ] Code complexity reduced

### For Authentication Providers (obot-entraid, obot-tools)

- [ ] OAuth endpoints implemented correctly
- [ ] Token handling secure
- [ ] Profile picture support (if applicable)
- [ ] Error handling comprehensive
- [ ] Integration test with actual provider
- [ ] Environment variables documented
- [ ] Registered in `tools/index.yaml`

### For Docker Changes

- [ ] Dockerfile builds successfully
- [ ] Multi-stage builds optimized
- [ ] Image size reasonable
- [ ] All required files included
- [ ] Environment variables documented
- [ ] Container runs correctly
- [ ] Security scan passed (if available)

```bash
docker build -t project:test .
docker run --rm project:test ls -la /app  # Verify contents
```

## Final Checklist

Before pushing code:

- [ ] Code generated: `go generate`
- [ ] Dependencies tidied: `go mod tidy`
- [ ] Code formatted: `go fmt ./...` or `pnpm run format`
- [ ] Linting passed: `make validate`
- [ ] All tests passed: `make test`
- [ ] Build successful: `make build`
- [ ] CI validation passed: `make validate-ci`
- [ ] Documentation updated
- [ ] Commit message follows conventions
- [ ] No sensitive data in commits
- [ ] Changes reviewed personally

## Common Issues and Solutions

### Issue: `make validate-ci` fails with "dirty repo"

**Solution**: Run `go generate && go mod tidy` and commit the changes

### Issue: Linter errors

**Solution**: Run `golangci-lint run --fix` to auto-fix, then manually fix remaining issues

### Issue: Test failures

**Solution**: Review test output, fix issues, ensure test environment is correct

### Issue: Import conflicts

**Solution**: Run `goimports -w .` to reorganize imports

### Issue: Docker build fails

**Solution**: Check Dockerfile, verify all dependencies available, review build logs

## Post-Commit

After committing and pushing:

1. **Create Pull Request** (if using PR workflow)
2. **Wait for CI checks** to pass
3. **Request code review** (if required)
4. **Address feedback** and iterate
5. **Merge when approved**

## Continuous Improvement

Periodically review:

- [ ] Dependency updates: `go list -u -m all`
- [ ] Security vulnerabilities: `go list -m -json all | nancy sleuth`
- [ ] Test coverage: `go test -cover ./...`
- [ ] Code complexity: Look for refactoring opportunities
- [ ] Documentation accuracy: Ensure docs match current code
