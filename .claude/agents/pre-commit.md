---
name: pre-commit
description: Runs full pre-commit validation for current project, reports issues
tools:
  - Bash
  - Read
  - Glob
model: haiku
---

# Pre-Commit Validator

Validate the current project before committing changes.

## Detection

First, identify the project type:

1. Check for `go.mod` → Go project
2. Check for `package.json` in ui/ → Also has frontend
3. Check current directory name for project identification

## Validation Steps

### Go Projects

Execute in order, stop on first failure:

```bash
# 1. Generate code (if applicable)
if grep -q "go:generate" **/*.go 2>/dev/null; then
    go generate ./...
fi

# 2. Tidy dependencies
go mod tidy

# 3. Format code
go fmt ./...

# 4. Lint
if [ -f .golangci.yml ] || [ -f .golangci.yaml ]; then
    golangci-lint run
fi

# 5. Vet
go vet ./...

# 6. Test
go test -short ./...

# 7. Check for dirty repo (generated files)
if [ -n "$(git status --porcelain)" ]; then
    echo "ERROR: Uncommitted changes after generate/tidy"
    git status --short
    exit 1
fi
```

### Frontend (obot-entraid/ui/user)

```bash
cd ui/user
pnpm run ci  # Runs lint, format check, type check, test
```

## Output Format

```text
✅ Pre-commit validation PASSED

Steps completed:
1. ✓ go generate
2. ✓ go mod tidy
3. ✓ go fmt
4. ✓ golangci-lint
5. ✓ go vet
6. ✓ go test -short
7. ✓ Clean working directory

Ready to commit!
```

Or on failure:

```text
❌ Pre-commit validation FAILED

Step 4 (golangci-lint) failed:
  pkg/router/handler.go:45:12: error message here

Fix the issues and run validation again.
```
