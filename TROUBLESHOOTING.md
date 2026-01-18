# Troubleshooting Guide

**AI/MCP Multi-Repo Workspace** - Common issues and solutions
**Last Updated:** 2026-01-17

---

## 🔍 Table of Contents

- [Build Issues](#️-build-issues)
- [Test Failures](#-test-failures)
- [Linting Errors](#-linting-errors)
- [Dependency Problems](#-dependency-problems)
- [Git & CI Issues](#-git--ci-issues)
- [Runtime Errors](#-runtime-errors)
- [Project-Specific Issues](#-project-specific-issues)
- [Performance Issues](#-performance-issues)

---

## 🏗️ Build Issues

### Issue: `go build` fails with "cannot find package"

**Symptoms:**

```
cannot find package "github.com/example/pkg" in any of:
```

**Solutions:**

```bash
# 1. Download dependencies
go mod download

# 2. Verify dependencies
go mod verify

# 3. Clean and rebuild
go clean -modcache
go mod download
go build ./...

# 4. Check go.mod file integrity
cat go.mod  # Ensure module paths are correct
```

---

### Issue: `make build` fails with "Makefile not found"

**Symptoms:**

```
make: *** No rule to make target 'build'. Stop.
```

**Solution:**

```bash
# Check current directory
pwd

# Ensure you're in a project directory
cd nah  # or obot-entraid, kinm, etc.

# Verify Makefile exists
ls -la | grep Makefile

# If no Makefile, check project README
cat README.md
```

**Root Cause:** You're likely in the workspace root. Each project has its own Makefile.

---

### Issue: Frontend build fails (obot-entraid)

**Symptoms:**

```
Error: Cannot find module 'vite'
npm ERR! code ENOENT
```

**Solutions:**

```bash
cd obot-entraid/ui/user

# 1. Install dependencies
pnpm install

# 2. Clear cache if needed
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# 3. Check Node.js version
node --version  # Must be 18+

# 4. Build
pnpm run build
```

---

## ✅ Test Failures

### Issue: Tests fail with "panic: test timed out"

**Symptoms:**

```
panic: test timed out after 10m0s
```

**Solutions:**

```bash
# 1. Increase timeout
go test -timeout 30m ./...

# 2. Run specific test
go test -v -run TestMyFunction ./pkg/mypackage

# 3. Check for deadlocks
go test -race ./...
```

---

### Issue: Race detector reports data race

**Symptoms:**

```
WARNING: DATA RACE
Read at 0x00c000... by goroutine 42:
```

**Solutions:**

```bash
# 1. Identify the race
go test -race -v ./pkg/problematic

# 2. Fix with proper synchronization
# Add mutexes, use channels, or sync.Map

# 3. Verify fix
go test -race ./...
```

**Common Patterns:**

- Use `sync.Mutex` for shared state
- Use `sync.Map` for concurrent map access
- Use channels for goroutine communication
- Always defer `mutex.Unlock()`

---

### Issue: Integration tests fail with database connection

**Symptoms:**

```
dial tcp [::1]:5432: connect: connection refused
```

**Solutions:**

```bash
# For kinm
cd kinm
make setup-test-db  # Start PostgreSQL container

# For mcp-oauth-proxy
cd mcp-oauth-proxy
make setup-test-db

# Verify database is running
docker ps | grep postgres

# Check connection
psql -h localhost -U test -d oauth_test
```

---

## 🔨 Linting Errors

### Issue: `make validate-ci` fails with "dirty repo"

**Symptoms:**

```
Encountered dirty repo!
M  pkg/router/generated_deepcopy.go
```

**Solution:**

```bash
# This is CRITICAL - generated code is out of sync

# 1. Generate code
go generate

# 2. Tidy dependencies
go mod tidy

# 3. Add and commit generated files
git add .
git commit -m "chore: update generated code"

# 4. Verify
make validate-ci
```

**Root Cause:** Generated code (especially in `nah`) must be committed. CI will fail if you don't.

---

### Issue: `golangci-lint` reports many errors

**Symptoms:**

```
pkg/mypackage/file.go:42:1: line is 120 characters (lll)
pkg/mypackage/file.go:55:2: should check error (errcheck)
```

**Solutions:**

```bash
# 1. Auto-fix what can be fixed
golangci-lint run --fix

# 2. Run specific linter
golangci-lint run --disable-all --enable=errcheck

# 3. Check configuration
cat .golangci.yml  # or .golangci.yaml

# 4. Format code first
go fmt ./...
goimports -w .
```

---

### Issue: Import organization issues

**Symptoms:**

```
wrong import order (goimports)
```

**Solution:**

```bash
# Install goimports if needed
go install golang.org/x/tools/cmd/goimports@latest

# Fix imports
goimports -w .

# Verify
go fmt ./...
```

**Import Order:**

1. Standard library
2. External packages
3. Internal packages (github.com/obot-platform/...)

---

## 📦 Dependency Problems

### Issue: `go mod tidy` changes many files

**Symptoms:**

```
go: downloading github.com/example/pkg v1.2.3
go.sum: 47 files changed
```

**Solution:**

```bash
# This is normal behavior

# 1. Review changes
git diff go.mod go.sum

# 2. Run tests to ensure nothing broke
go test ./...

# 3. Commit the changes
git add go.mod go.sum
git commit -m "chore: update dependencies"
```

---

### Issue: Dependency version conflict

**Symptoms:**

```
go: module example.com/pkg requires minimum version v2.0.0
```

**Solutions:**

```bash
# 1. Update specific dependency
go get example.com/pkg@v2.0.0
go mod tidy

# 2. Update all dependencies (careful!)
go get -u ./...
go mod tidy
go test ./...  # Verify

# 3. Check for incompatibilities
go mod graph | grep example.com/pkg
```

---

### Issue: Module cache corruption

**Symptoms:**

```
verifying module: checksum mismatch
```

**Solution:**

```bash
# 1. Clear module cache
go clean -modcache

# 2. Re-download
go mod download

# 3. Verify
go mod verify
```

---

## 🔄 Git & CI Issues

### Issue: CI pipeline fails but local tests pass

**Symptoms:**

- All local checks pass
- CI fails with mysterious errors

**Solutions:**

```bash
# 1. Run EXACTLY what CI runs
make validate-ci
make validate
make test

# 2. Check Go version matches CI
go version

# 3. Ensure all files committed
git status
git diff --exit-code

# 4. Check .gitignore
cat .gitignore
```

---

### Issue: Cannot push to remote

**Symptoms:**

```
! [rejected] main -> main (non-fast-forward)
```

**Solutions:**

```bash
# 1. Pull latest changes
git pull origin main

# 2. Resolve conflicts if any
git status
# Edit conflicted files
git add .
git commit

# 3. Push
git push origin main
```

---

### Issue: Commit message format rejected

**Symptoms:**

```
Your commit message doesn't follow Conventional Commits
```

**Solution:**

```bash
# Format: <type>(<scope>): <subject>

# Correct examples:
git commit -m "feat(router): add middleware support"
git commit -m "fix(oauth): resolve token refresh issue"
git commit -m "docs: update README with examples"

# Types: feat, fix, docs, test, chore, refactor, perf, ci

# Amend last commit if needed
git commit --amend
```

---

## 🚀 Runtime Errors

### Issue: Port already in use

**Symptoms:**

```
bind: address already in use
listen tcp :8080: bind: address already in use
```

**Solutions:**

```bash
# 1. Find process using port
lsof -i :8080
# or on Linux:
netstat -tuln | grep 8080

# 2. Kill process
kill -9 <PID>

# 3. Or use different port
export PORT=8081
go run .
```

---

### Issue: Database connection refused

**Symptoms:**

```
dial tcp [::1]:5432: connect: connection refused
error connecting to database
```

**Solutions:**

```bash
# 1. Check if database is running
docker ps | grep postgres

# 2. Start database (project-specific)
# For mcp-oauth-proxy:
make setup-test-db

# For obot-entraid:
# Check docker-compose.yml

# 3. Verify connection string
echo $DATABASE_URL
# or
echo $DATABASE_DSN

# 4. Test connection manually
psql -h localhost -U postgres -d dbname
```

---

### Issue: OAuth flow fails

**Symptoms (mcp-oauth-proxy):**

```
invalid_client: client authentication failed
error exchanging authorization code
```

**Solutions:**

```bash
# 1. Verify environment variables
echo $OAUTH_CLIENT_ID
echo $OAUTH_CLIENT_SECRET
echo $OAUTH_AUTHORIZE_URL

# 2. Check redirect URI matches provider config
# Provider must have http://localhost:8080/oauth/callback

# 3. Verify scopes
echo $SCOPES_SUPPORTED
# Should match what provider allows

# 4. Generate new encryption key if needed
export ENCRYPTION_KEY=$(openssl rand -base64 32)

# 5. Check logs for detailed error
go run . 2>&1 | grep -i error
```

---

### Issue: MCP server fails to start (obot-entraid)

**Symptoms:**

```
failed to start MCP server
container exited with code 1
```

**Solutions:**

```bash
# 1. Check MCP server logs
docker logs <container-id>

# 2. Verify image exists
docker images | grep <mcp-server-name>

# 3. Check environment variables
# See obot-entraid logs for config

# 4. Test server independently
docker run -it <image-name> /bin/sh
```

---

## 🔧 Project-Specific Issues

### nah: Controller not reconciling

**Symptoms:**

- Resources created but no reconciliation
- Handler not being called

**Solutions:**

```bash
# 1. Check leader election
# Only one controller instance should be active

# 2. Verify resource watch
# Check logs for watch errors

# 3. Enable debug logging
export LOG_LEVEL=debug
go run .

# 4. Check RBAC permissions (in cluster)
kubectl get clusterrole <controller-name>

# 5. Verify handler registration
# Check router.Type() calls in code
```

---

### obot-entraid: UI not loading

**Symptoms:**

- Blank page
- 404 errors in browser console

**Solutions:**

```bash
cd obot-entraid/ui/user

# 1. Rebuild UI
pnpm run build

# 2. Check backend serving UI
# Ensure backend points to built UI

# 3. Clear browser cache
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)

# 4. Check for build errors
pnpm run check
pnpm run lint
```

---

### obot-tools: Model provider not responding

**Symptoms:**

```
connection refused
timeout waiting for response
```

**Solutions:**

```bash
cd obot-tools/<provider-name>

# 1. Check server is running
curl http://localhost:8000/

# 2. Verify API key
echo $OBOT_<PROVIDER>_MODEL_PROVIDER_API_KEY

# 3. Test validation
go run . validate

# 4. Check port
echo $PORT  # Default 8000
lsof -i :8000

# 5. Enable debug logging
export GPTSCRIPT_DEBUG=true
go run .
```

---

### kinm: Watch not working

**Symptoms:**

- Changes not propagating
- `?watch=true` returns immediately

**Solutions:**

```bash
# 1. Check PostgreSQL LISTEN/NOTIFY
psql $DATABASE_URL -c "LISTEN test; NOTIFY test, 'hello';"

# 2. Verify database connection
# kinm uses long-lived connections for watch

# 3. Check for database timeouts
# May need to adjust connection pool settings

# 4. Test watch endpoint
curl "http://localhost:8080/api/v1/resources?watch=true"
```

---

## ⚡ Performance Issues

### Issue: Tests taking too long

**Symptoms:**

- Test suite runs for 10+ minutes
- Tests hang or timeout

**Solutions:**

```bash
# 1. Run short tests only
go test -short ./...

# 2. Identify slow tests
go test -v ./... | grep -E "PASS|FAIL" | sort -k3 -r

# 3. Run tests in parallel
go test -parallel 8 ./...

# 4. Profile tests
go test -cpuprofile cpu.prof ./pkg/slow
go tool pprof cpu.prof
```

---

### Issue: High memory usage

**Symptoms:**

- Process using >1GB memory
- Out of memory errors

**Solutions:**

```bash
# 1. Profile memory
go test -memprofile mem.prof ./...
go tool pprof mem.prof

# 2. Check for leaks
go test -race ./...  # Race detector helps find leaks

# 3. Review goroutine usage
# Ensure goroutines are properly terminated

# 4. Use pprof in running service
import _ "net/http/pprof"
# Then access http://localhost:6060/debug/pprof/
```

---

### Issue: Slow build times

**Symptoms:**

- `go build` takes minutes
- `make build` very slow

**Solutions:**

```bash
# 1. Enable build cache
go env GOCACHE  # Check cache location
go clean -cache  # Clear if corrupted

# 2. Use parallel compilation
go build -p 8 ./...

# 3. Check disk I/O
# Slow disk can significantly impact build time

# 4. Build specific packages
go build ./pkg/router
# Instead of ./...
```

---

## 🔍 Debugging Techniques

### Enable Verbose Logging

```bash
# Go tests
go test -v ./...

# Specific test with output
go test -v -run TestMyFunc ./pkg/mypackage

# With debug output
export LOG_LEVEL=debug
go run .
```

---

### Use Delve Debugger

```bash
# Install delve
go install github.com/go-delve/delve/cmd/dlv@latest

# Debug test
dlv test ./pkg/mypackage -- -test.run TestMyFunc

# Debug binary
dlv exec ./bin/myapp

# Common commands:
# b main.main  - Set breakpoint
# c            - Continue
# n            - Next line
# s            - Step into
# p var        - Print variable
```

---

### Analyze Stack Traces

```bash
# Get stack trace
kill -SIGQUIT <pid>
# Or send SIGQUIT to running process

# Analyze goroutines
# Look for:
# - Deadlocks (goroutines waiting on each other)
# - Goroutine leaks (high count)
# - Blocking operations
```

---

## 📞 Getting Help

### Before Asking for Help

1. **Read the error message carefully** - Often contains the solution
2. **Check project CLAUDE.md** - Detailed architecture and patterns
3. **Search documentation/docs/reference/project-index.md** - Comprehensive reference
4. **Review `.serena/memories/`** - Conventions and best practices
5. **Check Git history** - `git log --all --grep="keyword"`

### When Filing an Issue

Include:

- **Project name** (nah, obot-entraid, etc.)
- **Go version:** `go version`
- **OS:** `uname -a` or `ver` (Windows)
- **Error message:** Full error output
- **Steps to reproduce:** Minimal reproduction
- **What you tried:** Solutions attempted

---

## 📚 Additional Resources

- [README.md](README.md) - Workspace overview
- [documentation/docs/reference/documentation-guide.md](documentation/docs/reference/documentation-guide.md) - Navigation
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - One-page reference
- [documentation/docs/reference/project-index.md](documentation/docs/reference/project-index.md) - Comprehensive index
- Project-specific `CLAUDE.md` files - Detailed architecture

---

**Can't find your issue?** Check individual project READMEs or file a GitHub issue.
