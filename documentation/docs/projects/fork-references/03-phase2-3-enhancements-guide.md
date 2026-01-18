# Fork Management Enhancements - Implementation Guide

**Created:** 2026-01-16
**Status:** READY FOR IMPLEMENTATION
**Priority:** HIGH
**Related Documents:**

- `documentation/implementations/FORK_REFERENCES_IMPLEMENTATION_COMPLETE.md`
- `documentation/reports/REFLECTION_IMPLEMENTATION_VALIDATION.md`

---

## Executive Summary

This guide addresses the **critical remaining gaps** and **strategic enhancements** identified during the fork repository references implementation. While the initial migration successfully updated 18+ files to use fork repositories, validation discovered **3 critical files requiring immediate fixes** and identified opportunities for **long-term fork management sustainability**.

### Current State Assessment

**Completed:**

- ✅ Runtime configuration updated (.envrc.dev, Dockerfile, test setup)
- ✅ Documentation updated (README.md, 16+ doc files)
- ✅ Archive files preserved for historical accuracy

**Critical Gaps (URGENT):**

- ⚠️ GitHub Actions workflows still pull upstream images (2 files)
- ⚠️ Service config defaults point to upstream (1 file)
- ⚠️ No version pinning strategy for fork dependencies

**Strategic Opportunities:**

- 📊 Monitoring and alerting for fork health
- 🔄 Automated fork synchronization tracking
- 🔐 Enhanced security scanning for fork images

---

## Part 1: Critical CI/CD Pipeline Updates

### 1.1 Issue Analysis

**Problem Statement:**
GitHub Actions workflows are hardcoded to pull upstream Docker images, which will cause **production failures** when:

1. Fork images diverge from upstream
2. Upstream images are unavailable
3. Fork-specific features are deployed

**Impact Assessment:**

- **Severity:** HIGH (Production Blocker)
- **Affected Workflows:** 2 files
- **Failure Mode:** Build failures, incorrect runtime behavior
- **Risk:** Deploy upstream code instead of fork code

---

### 1.2 Implementation: Workflow Updates

#### 1.2.1 Update CI Workflow

**File:** `.github/workflows/ci.yml`
**Lines:** 221-222
**Priority:** CRITICAL

**Current Code:**

```yaml
- name: Pre-fetch base images in parallel
  run: |
    # Pull base images concurrently to reduce sequential wait time (saves 3-4 min)
    docker pull ghcr.io/obot-platform/tools:latest &
    docker pull ghcr.io/obot-platform/tools/providers:latest &
    docker pull cgr.dev/chainguard/wolfi-base:latest &
    wait
    echo "Base images pre-fetched successfully"
```

**Required Change:**

```yaml
- name: Pre-fetch base images in parallel
  run: |
    # Pull base images concurrently to reduce sequential wait time (saves 3-4 min)
    docker pull ghcr.io/jrmatherly/obot-tools:latest &
    docker pull ghcr.io/jrmatherly/obot-tools/providers:latest &
    docker pull cgr.dev/chainguard/wolfi-base:latest &
    wait
    echo "Base images pre-fetched successfully"
```

**Implementation Steps:**

1. Edit `.github/workflows/ci.yml`
2. Replace lines 221-222
3. Test workflow with `gh workflow run ci.yml --ref feature-branch`
4. Verify Docker pull succeeds

---

#### 1.2.2 Update Docker Build and Push Workflow

**File:** `.github/workflows/docker-build-and-push.yml`
**Lines:** 48-49
**Priority:** CRITICAL

**Current Code:**

```yaml
- name: Pre-fetch base images in parallel
  run: |
    # Pull base images concurrently to reduce sequential wait time (saves 3-4 min)
    docker pull ghcr.io/obot-platform/tools:latest &
    docker pull ghcr.io/obot-platform/tools/providers:latest &
    docker pull cgr.dev/chainguard/wolfi-base:latest &
    wait
    echo "Base images pre-fetched successfully"
```

**Required Change:**

```yaml
- name: Pre-fetch base images in parallel
  run: |
    # Pull base images concurrently to reduce sequential wait time (saves 3-4 min)
    docker pull ghcr.io/jrmatherly/obot-tools:latest &
    docker pull ghcr.io/jrmatherly/obot-tools/providers:latest &
    docker pull cgr.dev/chainguard/wolfi-base:latest &
    wait
    echo "Base images pre-fetched successfully"
```

**Implementation Steps:**

1. Edit `.github/workflows/docker-build-and-push.yml`
2. Replace lines 48-49
3. Ensure `ghcr.io/jrmatherly/obot-tools` images are published first
4. Test workflow with `gh workflow run docker-build-and-push.yml`

---

#### 1.2.3 Update Image Push Target Verification

**Current State Analysis:**

```yaml
# docker-build-and-push.yml line 65
images: ghcr.io/${{ github.repository }}
```

**Verification:** ✅ CORRECT

- Already uses `github.repository` which resolves to `jrmatherly/obot-entraid`
- Push target: `ghcr.io/jrmatherly/obot-entraid:*`
- No change needed

---

### 1.3 Service Config Default Values

**File:** `pkg/services/config.go`
**Lines:** 88, 370
**Priority:** CRITICAL

**Issue:** Default values hardcoded to upstream when environment variable not set.

**Current Code:**

```go
// Line 88
ToolRegistries []string `usage:"The remote tool references to the set of gptscript tool registries to use" default:"github.com/obot-platform/tools"`

// Line 370
if len(config.ToolRegistries) < 1 {
    config.ToolRegistries = []string{"github.com/obot-platform/tools"}
}
```

**Required Change:**

```go
// Line 88
ToolRegistries []string `usage:"The remote tool references to the set of gptscript tool registries to use" default:"github.com/jrmatherly/obot-tools"`

// Line 370
if len(config.ToolRegistries) < 1 {
    config.ToolRegistries = []string{"github.com/jrmatherly/obot-tools"}
}
```

**Impact:**

- Users not setting `OBOT_SERVER_TOOL_REGISTRIES` will use fork by default
- Helm chart default behavior aligned with fork strategy
- Reduces configuration complexity

**Testing:**

```bash
# Test without environment variable
unset OBOT_SERVER_TOOL_REGISTRIES
go run main.go server --dev-mode

# Verify logs show:
# "Tool registries: [github.com/jrmatherly/obot-tools]"
```

---

### 1.4 CI/CD Enhancement: Automated Validation

**Create Validation Workflow**

**File:** `.github/workflows/validate-fork-references.yml` (NEW)

```yaml
name: Validate Fork References

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Check for upstream references in critical files
        run: |
          # Critical files that must NOT have upstream references
          CRITICAL_FILES=(
            ".envrc.dev"
            "Dockerfile"
            "tests/integration/setup.sh"
            ".github/workflows/ci.yml"
            ".github/workflows/docker-build-and-push.yml"
            "pkg/services/config.go"
          )

          echo "🔍 Checking critical files for upstream references..."
          ERRORS=0

          for file in "${CRITICAL_FILES[@]}"; do
            if [ -f "$file" ]; then
              if grep -q "github.com/obot-platform/tools\|github.com/obot-platform/mcp-catalog\|ghcr.io/obot-platform/tools" "$file"; then
                echo "❌ FAIL: Found upstream reference in $file"
                grep -n "obot-platform/tools\|obot-platform/mcp-catalog" "$file" || true
                ERRORS=$((ERRORS + 1))
              else
                echo "✅ PASS: $file"
              fi
            else
              echo "⚠️  WARN: $file not found"
            fi
          done

          if [ $ERRORS -gt 0 ]; then
            echo ""
            echo "❌ ERROR: Found $ERRORS file(s) with upstream references"
            echo "Please update to use fork repositories:"
            echo "  - github.com/jrmatherly/obot-tools"
            echo "  - github.com/jrmatherly/mcp-catalog"
            echo "  - ghcr.io/jrmatherly/obot-tools"
            exit 1
          fi

          echo ""
          echo "✅ All critical files validated successfully"

      - name: Check Dockerfile ARG consistency
        run: |
          echo "🔍 Validating Dockerfile ARG consistency..."

          # Extract ARG values
          TOOLS_IMAGE=$(grep "^ARG TOOLS_IMAGE=" Dockerfile | cut -d= -f2)
          PROVIDER_IMAGE=$(grep "^ARG PROVIDER_IMAGE=" Dockerfile | cut -d= -f2)

          echo "TOOLS_IMAGE: $TOOLS_IMAGE"
          echo "PROVIDER_IMAGE: $PROVIDER_IMAGE"

          # Validate fork registry
          if [[ "$TOOLS_IMAGE" != ghcr.io/jrmatherly/obot-tools:* ]]; then
            echo "❌ FAIL: TOOLS_IMAGE not using fork registry"
            exit 1
          fi

          if [[ "$PROVIDER_IMAGE" != ghcr.io/jrmatherly/obot-tools/providers:* ]]; then
            echo "❌ FAIL: PROVIDER_IMAGE not using fork registry"
            exit 1
          fi

          echo "✅ Dockerfile ARGs are correct"

      - name: Summary
        if: success()
        run: |
          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          echo "✅ Fork Reference Validation: PASSED"
          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

**Benefits:**

- Prevents upstream references from being reintroduced
- Runs on every PR and commit to main
- Fast execution (<5 minutes)
- Clear error messages for developers

---

## Part 2: Version Pinning Strategy

### 2.1 Current State Analysis

**Dockerfile Current State:**

```dockerfile
ARG TOOLS_IMAGE=ghcr.io/jrmatherly/obot-tools:latest
ARG PROVIDER_IMAGE=ghcr.io/jrmatherly/obot-tools/providers:latest
```

**Issues:**

- ✅ Uses fork registry (CORRECT)
- ⚠️ Uses `:latest` tag (UNSTABLE)
- ⚠️ No version tracking or reproducibility
- ⚠️ Breaks on upstream incompatible changes

---

### 2.2 Recommended Version Pinning Approach

#### 2.2.1 Semantic Versioning for Production

**Strategy:** Use semantic version tags with controlled updates

**Implementation:**

**File:** `Dockerfile`

```dockerfile
# Production: Pin to specific semantic version
ARG TOOLS_IMAGE=ghcr.io/jrmatherly/obot-tools:v1.0.0
ARG PROVIDER_IMAGE=ghcr.io/jrmatherly/obot-tools/providers:v1.0.0

# Alternative: Pin to commit SHA for maximum reproducibility
# ARG TOOLS_IMAGE=ghcr.io/jrmatherly/obot-tools:sha-abc1234
# ARG PROVIDER_IMAGE=ghcr.io/jrmatherly/obot-tools/providers:sha-abc1234
```

**Benefits:**

- **Reproducible builds:** Same Dockerfile = same output
- **Controlled updates:** Explicit version bumps via PR
- **Rollback capability:** Easy to revert to previous version
- **Dependency tracking:** Clear audit trail of tool versions

---

#### 2.2.2 MCP Catalog Version Pinning

**Current State:**

```bash
# .envrc.dev
export OBOT_SERVER_DEFAULT_MCPCATALOG_PATH=https://github.com/jrmatherly/mcp-catalog
```

**Recommended Approach:**

**For Development:**

```bash
# Use latest for rapid iteration
export OBOT_SERVER_DEFAULT_MCPCATALOG_PATH=https://github.com/jrmatherly/mcp-catalog
```

**For Production:**

```bash
# Pin to specific commit or tag
export OBOT_SERVER_DEFAULT_MCPCATALOG_PATH=https://github.com/jrmatherly/mcp-catalog/tree/v1.0.0

# Or commit SHA for maximum stability
export OBOT_SERVER_DEFAULT_MCPCATALOG_PATH=https://github.com/jrmatherly/mcp-catalog/tree/abc123def456
```

**Dockerfile Production Pinning:**

```dockerfile
ENV OBOT_SERVER_DEFAULT_MCPCATALOG_PATH=https://github.com/jrmatherly/mcp-catalog/tree/v1.0.0
```

---

#### 2.2.3 Version Management Workflow

**Create Version Tracking File**

**File:** `FORK_VERSIONS.md` (NEW)

```markdown
# Fork Dependency Versions

This file tracks the versions of forked dependencies used in production.

## Current Production Versions

| Dependency | Version | Updated | Notes |
| ------------ | --------- | --------- | ------- |
| obot-tools | v1.0.0 | 2026-01-16 | Initial fork version |
| obot-tools/providers | v1.0.0 | 2026-01-16 | Initial fork version |
| mcp-catalog | v1.0.0 | 2026-01-16 | Initial fork version |

## Update History

### 2026-01-16 - Initial Fork Versions
- **Tools:** v1.0.0 (sha: abc123...)
- **Providers:** v1.0.0 (sha: def456...)
- **Catalog:** v1.0.0 (sha: ghi789...)
- **Reason:** Fork initialization
- **Testing:** CI passing, integration tests passing
- **Approver:** Jason Matherly

## Version Update Checklist

When updating fork dependency versions:

- [ ] Review upstream changelog for breaking changes
- [ ] Test new version locally (`make dev`)
- [ ] Run integration test suite
- [ ] Update Dockerfile ARG values
- [ ] Update FORK_VERSIONS.md
- [ ] Create PR with version bump
- [ ] Deploy to staging environment
- [ ] Monitor for 24 hours
- [ ] Deploy to production
```

---

#### 2.2.4 Automated Version Update Workflow

**File:** `.github/workflows/check-fork-versions.yml` (NEW)

```yaml
name: Check Fork Dependency Versions

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  check-versions:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Check obot-tools latest version
        id: check_tools
        run: |
          # Get current version from Dockerfile
          CURRENT_VERSION=$(grep "ARG TOOLS_IMAGE=" Dockerfile | cut -d: -f2)
          echo "current_version=$CURRENT_VERSION" >> $GITHUB_OUTPUT

          # Get latest release from fork repository
          LATEST_VERSION=$(gh release list -R jrmatherly/obot-tools --limit 1 | cut -f1)
          echo "latest_version=$LATEST_VERSION" >> $GITHUB_OUTPUT

          if [ "$CURRENT_VERSION" != "$LATEST_VERSION" ]; then
            echo "update_available=true" >> $GITHUB_OUTPUT
            echo "📦 Update available: $CURRENT_VERSION → $LATEST_VERSION"
          else
            echo "update_available=false" >> $GITHUB_OUTPUT
            echo "✅ Already on latest version: $CURRENT_VERSION"
          fi
        env:
          GH_TOKEN: ${{ github.token }}

      - name: Create issue for version update
        if: steps.check_tools.outputs.update_available == 'true'
        uses: actions/github-script@v7
        with:
          script: |
            const current = '${{ steps.check_tools.outputs.current_version }}';
            const latest = '${{ steps.check_tools.outputs.latest_version }}';

            const issueTitle = `🔄 Fork Dependency Update Available: obot-tools ${latest}`;
            const issueBody = `
            ## Fork Dependency Update Available

            A new version of \`obot-tools\` is available.

            **Current Version:** \`${current}\`
            **Latest Version:** \`${latest}\`

            ### Update Checklist

            - [ ] Review [obot-tools changelog](https://github.com/jrmatherly/obot-tools/releases/tag/${latest})
            - [ ] Check for breaking changes
            - [ ] Update Dockerfile ARG TOOLS_IMAGE
            - [ ] Update Dockerfile ARG PROVIDER_IMAGE (if separate version)
            - [ ] Test locally (\`make dev\`)
            - [ ] Run integration tests
            - [ ] Update FORK_VERSIONS.md
            - [ ] Create PR
            - [ ] Deploy to staging
            - [ ] Monitor for 24 hours
            - [ ] Deploy to production

            ### Related Files
            - \`Dockerfile\` (lines 1-2)
            - \`FORK_VERSIONS.md\`
            - \`.envrc.dev\`

            ---
            **Auto-generated by fork-version-check workflow**
            `;

            // Check if issue already exists
            const existingIssues = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'open',
              labels: ['fork-dependency-update']
            });

            const issueExists = existingIssues.data.some(issue =>
              issue.title.includes(latest)
            );

            if (!issueExists) {
              await github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title: issueTitle,
                body: issueBody,
                labels: ['fork-dependency-update', 'automation']
              });
              console.log('✅ Created issue for version update');
            } else {
              console.log('ℹ️  Issue already exists for this version');
            }
```

**Benefits:**

- Automatic detection of new fork versions
- Creates GitHub issues for tracking
- Prevents manual monitoring overhead
- Provides structured update checklist

---

### 2.3 Dockerfile Build Args Enhancement

**Current Build Process:**

```bash
docker build -t ghcr.io/jrmatherly/obot-entraid:latest .
```

**Enhanced Build with Version Control:**

```bash
# Build with specific version
docker build \
  --build-arg TOOLS_IMAGE=ghcr.io/jrmatherly/obot-tools:v1.0.0 \
  --build-arg PROVIDER_IMAGE=ghcr.io/jrmatherly/obot-tools/providers:v1.0.0 \
  -t ghcr.io/jrmatherly/obot-entraid:v1.0.0 \
  .

# Build with commit SHAs (maximum reproducibility)
docker build \
  --build-arg TOOLS_IMAGE=ghcr.io/jrmatherly/obot-tools:sha-abc1234 \
  --build-arg PROVIDER_IMAGE=ghcr.io/jrmatherly/obot-tools/providers:sha-abc1234 \
  -t ghcr.io/jrmatherly/obot-entraid:v1.0.0 \
  .
```

**Update GitHub Workflow:**

**File:** `.github/workflows/docker-build-and-push.yml`

Add version build args:

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v6
  with:
    context: .
    push: true
    platforms: linux/amd64
    tags: ${{ steps.meta.outputs.tags }}
    labels: ${{ steps.meta.outputs.labels }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
    build-args: |
      TOOLS_IMAGE=ghcr.io/jrmatherly/obot-tools:${{ env.TOOLS_VERSION }}
      PROVIDER_IMAGE=ghcr.io/jrmatherly/obot-tools/providers:${{ env.TOOLS_VERSION }}

env:
  TOOLS_VERSION: v1.0.0  # Update this when bumping fork versions
```

---

## Part 3: Monitoring and Alerting Strategy

### 3.1 Health Monitoring Requirements

**Objectives:**

- Monitor fork image availability
- Track fork repository accessibility
- Detect upstream divergence
- Alert on build failures

---

### 3.2 Docker Image Health Checks

**Create Monitoring Script**

**File:** `scripts/monitor_fork_health.sh` (NEW)

```bash
#!/bin/bash
set -euo pipefail

# Fork Health Monitoring Script
# Checks accessibility and health of fork dependencies

SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
ERRORS=0

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

check_docker_image() {
  local image="$1"
  log "Checking Docker image: $image"

  if docker pull "$image" &>/dev/null; then
    log "✅ Image accessible: $image"
    return 0
  else
    log "❌ Image NOT accessible: $image"
    ERRORS=$((ERRORS + 1))
    return 1
  fi
}

check_github_repo() {
  local repo="$1"
  log "Checking GitHub repository: $repo"

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://github.com/$repo")

  if [ "$HTTP_CODE" = "200" ]; then
    log "✅ Repository accessible: $repo"
    return 0
  else
    log "❌ Repository NOT accessible: $repo (HTTP $HTTP_CODE)"
    ERRORS=$((ERRORS + 1))
    return 1
  fi
}

send_alert() {
  local message="$1"

  if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST "$SLACK_WEBHOOK" \
      -H 'Content-Type: application/json' \
      -d "{\"text\": \"🚨 Fork Health Alert: $message\"}"
  else
    log "⚠️  SLACK_WEBHOOK not configured, skipping alert"
  fi
}

main() {
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "Starting Fork Health Check"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Check Docker images
  check_docker_image "ghcr.io/jrmatherly/obot-tools:latest"
  check_docker_image "ghcr.io/jrmatherly/obot-tools/providers:latest"
  check_docker_image "ghcr.io/jrmatherly/obot-entraid:latest"

  # Check GitHub repositories
  check_github_repo "jrmatherly/obot-tools"
  check_github_repo "jrmatherly/mcp-catalog"
  check_github_repo "jrmatherly/obot-entraid"

  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if [ $ERRORS -eq 0 ]; then
    log "✅ All fork dependencies healthy"
    exit 0
  else
    log "❌ Found $ERRORS error(s) in fork health check"
    send_alert "$ERRORS fork dependencies are unhealthy"
    exit 1
  fi
}

main "$@"
```

---

### 3.3 Automated Health Monitoring Workflow

**File:** `.github/workflows/fork-health-check.yml` (NEW)

```yaml
name: Fork Health Check

on:
  schedule:
    # Run every 6 hours
    - cron: '0 */6 * * *'
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run fork health check
        id: health
        run: |
          chmod +x scripts/monitor_fork_health.sh
          ./scripts/monitor_fork_health.sh
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}

      - name: Create issue on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            const issueTitle = '🚨 Fork Health Check Failed';
            const issueBody = `
            ## Fork Health Check Failure

            The automated fork health check has failed.

            **Workflow Run:** [${{ github.run_id }}](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})
            **Timestamp:** ${new Date().toISOString()}

            ### Possible Issues
            - Docker images unavailable at \`ghcr.io/jrmatherly/*\`
            - GitHub repositories inaccessible
            - Network connectivity issues

            ### Action Required
            1. Check Docker registry: https://github.com/orgs/jrmatherly/packages
            2. Verify repository accessibility
            3. Review workflow logs
            4. Re-run health check after fixes

            ---
            **Auto-generated by fork-health-check workflow**
            `;

            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: issueTitle,
              body: issueBody,
              labels: ['fork-health', 'critical', 'automation']
            });
```

---

### 3.4 Prometheus Metrics Integration (Future)

**Helm Chart Enhancement**

**File:** `chart/values.yaml`

Add monitoring configuration:

```yaml
monitoring:
  # monitoring.enabled -- Enable Prometheus metrics endpoint
  enabled: false

  # monitoring.serviceMonitor.enabled -- Create ServiceMonitor for Prometheus Operator
  serviceMonitor:
    enabled: false
    interval: 30s
    scrapeTimeout: 10s

  # monitoring.metrics -- Custom metrics configuration
  metrics:
    forkDependencies:
      enabled: true
      # Track fork image pull success/failure
      # Track fork repository API calls
      # Track version staleness
```

**Custom Metrics to Track:**

- `fork_image_pull_total` - Counter of image pulls (success/failure)
- `fork_image_pull_duration_seconds` - Histogram of pull duration
- `fork_repository_api_calls_total` - Counter of API calls
- `fork_version_staleness_days` - Gauge of days since last version update

---

## Part 4: Implementation Plan

### 4.1 Phase 1: Critical Fixes (IMMEDIATE)

**Timeline:** 1-2 hours
**Priority:** CRITICAL

1. **Update GitHub Workflows** (~15 min)
   - [ ] Edit `.github/workflows/ci.yml` (lines 221-222)
   - [ ] Edit `.github/workflows/docker-build-and-push.yml` (lines 48-49)
   - [ ] Test workflows with `gh workflow run`

2. **Update Service Config Defaults** (~10 min)
   - [ ] Edit `pkg/services/config.go` (lines 88, 370)
   - [ ] Test with `unset OBOT_SERVER_TOOL_REGISTRIES && make dev`
   - [ ] Verify default behavior

3. **Create Validation Workflow** (~30 min)
   - [ ] Create `.github/workflows/validate-fork-references.yml`
   - [ ] Test with sample PR
   - [ ] Verify validation catches upstream references

4. **Validation and Testing** (~15 min)
   - [ ] Run full CI pipeline
   - [ ] Verify Docker builds succeed
   - [ ] Check default config behavior

---

### 4.2 Phase 2: Version Pinning (HIGH PRIORITY)

**Timeline:** 2-3 hours
**Priority:** HIGH

1. **Publish Versioned Fork Images** (~1 hour)
   - [ ] Tag obot-tools repository: `v1.0.0`
   - [ ] Build and push versioned images
   - [ ] Verify images available

2. **Update Dockerfile Version Pins** (~15 min)
   - [ ] Update `ARG TOOLS_IMAGE` to use version tag
   - [ ] Update `ARG PROVIDER_IMAGE` to use version tag
   - [ ] Test Docker build

3. **Create Version Tracking** (~30 min)
   - [ ] Create `FORK_VERSIONS.md`
   - [ ] Document current versions
   - [ ] Add version update checklist

4. **Setup Automated Version Checks** (~1 hour)
   - [ ] Create `.github/workflows/check-fork-versions.yml`
   - [ ] Test workflow execution
   - [ ] Verify issue creation

---

### 4.3 Phase 3: Monitoring Setup (MEDIUM PRIORITY)

**Timeline:** 3-4 hours
**Priority:** MEDIUM

1. **Create Health Monitoring Script** (~1 hour)
   - [ ] Create `scripts/monitor_fork_health.sh`
   - [ ] Test locally
   - [ ] Configure Slack webhook (optional)

2. **Setup Automated Health Checks** (~1 hour)
   - [ ] Create `.github/workflows/fork-health-check.yml`
   - [ ] Test workflow
   - [ ] Verify alerting

3. **Prometheus Integration** (~2 hours, FUTURE)
   - [ ] Update Helm chart with metrics config
   - [ ] Implement custom metrics
   - [ ] Create Grafana dashboard

---

## Part 5: Validation and Testing

### 5.1 Pre-Deployment Checklist

**Phase 1 Validation:**

- [ ] GitHub workflows updated and tested
- [ ] Service config defaults verified
- [ ] Validation workflow catching upstream references
- [ ] CI pipeline passing

**Phase 2 Validation:**

- [ ] Versioned images published
- [ ] Dockerfile using version pins
- [ ] Version tracking documented
- [ ] Automated version check working

**Phase 3 Validation:**

- [ ] Health monitoring script functional
- [ ] Automated health checks running
- [ ] Alerting configured and tested

---

### 5.2 Testing Procedures

#### Test 1: Workflow Validation

```bash
# Test CI workflow
gh workflow run ci.yml --ref feature/fork-updates

# Test Docker build
gh workflow run docker-build-and-push.yml --ref feature/fork-updates

# Verify no upstream references
gh workflow run validate-fork-references.yml --ref feature/fork-updates
```

#### Test 2: Default Config Validation

```bash
# Test without env vars
unset OBOT_SERVER_TOOL_REGISTRIES
go run main.go server --dev-mode

# Expected output:
# "Tool registries: [github.com/jrmatherly/obot-tools]"
```

#### Test 3: Version Pinning Validation

```bash
# Build with version pin
docker build \
  --build-arg TOOLS_IMAGE=ghcr.io/jrmatherly/obot-tools:v1.0.0 \
  -t test-image:v1.0.0 \
  .

# Verify image builds successfully
docker inspect test-image:v1.0.0
```

#### Test 4: Health Monitoring Validation

```bash
# Run health check script
./scripts/monitor_fork_health.sh

# Expected output:
# "✅ All fork dependencies healthy"
```

---

## Part 6: Rollback Procedures

### 6.1 Rollback GitHub Workflows

If workflows fail after update:

```bash
# Revert workflow files
git checkout HEAD~1 -- .github/workflows/ci.yml
git checkout HEAD~1 -- .github/workflows/docker-build-and-push.yml

# Commit revert
git commit -m "revert: rollback workflow changes to upstream references"
git push
```

---

### 6.2 Rollback Service Config

If default config causes issues:

```bash
# Revert config.go
git checkout HEAD~1 -- pkg/services/config.go

# Rebuild
go build -o bin/obot .
```

---

### 6.3 Rollback Version Pins

If versioned images cause issues:

```dockerfile
# Revert to :latest tags
ARG TOOLS_IMAGE=ghcr.io/jrmatherly/obot-tools:latest
ARG PROVIDER_IMAGE=ghcr.io/jrmatherly/obot-tools/providers:latest
```

---

## Part 7: Future Considerations

### 7.1 Monitoring and Alerting (Detailed)

**Current Implementation:** Workflow-based health checks
**Future Enhancement:** Production monitoring infrastructure

**Recommended Setup:**

1. **Prometheus + Grafana Dashboard**
   - Fork image pull metrics
   - Repository API call tracking
   - Version staleness monitoring
   - Build success/failure rates

2. **PagerDuty Integration**
   - Critical alerts for image unavailability
   - Version update notifications
   - Build failure escalation

3. **Custom Metrics Implementation**

   ```go
   // pkg/metrics/fork.go
   package metrics

   import "github.com/prometheus/client_golang/prometheus"

   var (
       ForkImagePullTotal = prometheus.NewCounterVec(
           prometheus.CounterOpts{
               Name: "fork_image_pull_total",
               Help: "Total number of fork image pulls",
           },
           []string{"image", "status"},
       )

       ForkVersionStaleness = prometheus.NewGaugeVec(
           prometheus.GaugeOpts{
               Name: "fork_version_staleness_days",
               Help: "Days since last fork version update",
           },
           []string{"dependency"},
       )
   )
   ```

---

### 7.2 Upstream Sync Strategy

**Challenge:** Keeping fork synchronized with upstream while maintaining custom features

**Recommended Approach:**

1. **Automated Upstream Tracking**

   ```yaml
   # .github/workflows/upstream-sync-tracker.yml
   name: Track Upstream Changes

   on:
     schedule:
       - cron: '0 0 * * 0'  # Weekly

   jobs:
     track:
       runs-on: ubuntu-latest
       steps:
         - name: Check upstream commits
           run: |
             git remote add upstream https://github.com/obot-platform/obot.git
             git fetch upstream
             COMMITS_BEHIND=$(git rev-list --count HEAD..upstream/main)
             echo "commits_behind=$COMMITS_BEHIND" >> $GITHUB_OUTPUT

         - name: Create tracking issue
           if: steps.check.outputs.commits_behind > 10
           # Create issue for sync review
   ```

2. **Merge Strategy**
   - Weekly upstream sync reviews
   - Selective cherry-picking of features
   - Automated conflict detection
   - Staging environment testing

---

### 7.3 Multi-Environment Version Management

**Challenge:** Different environments need different version strategies

**Recommended Strategy:**

| Environment | Version Strategy | Update Frequency |
| ------------- | ------------------ | ------------------ |
| Development | `:latest` | Automatic (daily) |
| Staging | `:v1.x.y` | Weekly |
| Production | `:v1.0.0` (pinned) | Monthly (reviewed) |

**Implementation:**

```yaml
# .github/workflows/deploy-staging.yml
env:
  TOOLS_VERSION: v1.x  # Latest minor version

# .github/workflows/deploy-production.yml
env:
  TOOLS_VERSION: v1.0.0  # Pinned major.minor.patch
```

---

## Part 8: Success Metrics

### 8.1 Key Performance Indicators

**Implementation Success:**

- [ ] Zero upstream references in critical files
- [ ] 100% CI pipeline passing rate
- [ ] Version tracking fully automated
- [ ] Health monitoring operational

**Operational Metrics:**

- **Build Success Rate:** Target 99.5%
- **Image Pull Success Rate:** Target 99.9%
- **Version Update Latency:** Target <7 days
- **Fork Health Check Uptime:** Target 99.9%

---

## Part 9: Conclusion

### 9.1 Summary of Changes

**Critical Fixes (Phase 1):**

- 2 GitHub workflow files updated
- 1 service config file updated
- 1 validation workflow created

**Strategic Enhancements (Phase 2-3):**

- Version pinning strategy implemented
- Automated version tracking
- Health monitoring and alerting
- Comprehensive documentation

---

### 9.2 Total Implementation Effort

| Phase | Priority | Time Estimate | Status |
| ------- | ---------- | --------------- | -------- |
| Phase 1: Critical Fixes | CRITICAL | 1-2 hours | READY |
| Phase 2: Version Pinning | HIGH | 2-3 hours | READY |
| Phase 3: Monitoring | MEDIUM | 3-4 hours | READY |
| **TOTAL** | | **6-9 hours** | |

---

### 9.3 Next Steps

**Immediate (This Week):**

1. Execute Phase 1 critical fixes
2. Validate CI pipeline
3. Test default config behavior

**Short-Term (This Month):**

1. Implement Phase 2 version pinning
2. Setup automated version checks
3. Create version tracking documentation

**Long-Term (This Quarter):**

1. Deploy Phase 3 monitoring
2. Implement Prometheus metrics
3. Setup Grafana dashboards

---

**END OF IMPLEMENTATION GUIDE**

**Prepared By:** Claude Code (Sonnet 4.5)
**Date:** 2026-01-16
**Status:** READY FOR IMPLEMENTATION
**Approval Required:** Jason Matherly
