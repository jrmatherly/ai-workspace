# Fork Repository References Analysis

## Comprehensive Analysis of obot-platform → jrmatherly Fork References

**Date:** 2026-01-16
**Scope:** obot-platform/mcp-catalog and obot-platform/tools references across monorepo
**Objective:** Identify all references requiring updates to use forked repositories

---

## Executive Summary

### Findings Overview

**Total References Found:**

- **mcp-catalog:** 23 references across 14 files
- **tools:** 517+ references across 10+ files (documentation, code, configuration)

**Critical Categories:**

1. **Runtime Configuration** (HIGH PRIORITY) - 4 files requiring immediate updates
2. **Documentation** (MEDIUM PRIORITY) - 20+ files with reference links
3. **Archived Documentation** (LOW PRIORITY) - Historical references, informational only

**Recommendation:** Focus on runtime configuration files first (`.envrc.dev`, `Dockerfile`, etc.), then update user-facing documentation. Archive files can remain unchanged as they're historical references.

---

## Part 1: mcp-catalog References

### 1.1 Runtime Configuration Files (HIGH PRIORITY)

#### File: `obot-entraid/.envrc.dev` (Line 9)

**Current:**

```bash
export OBOT_SERVER_DEFAULT_MCPCATALOG_PATH=https://github.com/obot-platform/mcp-catalog
```

**Required Change:**

```bash
export OBOT_SERVER_DEFAULT_MCPCATALOG_PATH=https://github.com/jrmatherly/mcp-catalog
```

**Impact:** HIGH - Affects local development environment
**Testing Required:** Verify catalog loading in dev mode after change

---

#### File: `obot-entraid/Dockerfile` (Line 147)

**Current:**

```dockerfile
ENV OBOT_SERVER_DEFAULT_MCPCATALOG_PATH=https://github.com/obot-platform/mcp-catalog
```

**Required Change:**

```dockerfile
ENV OBOT_SERVER_DEFAULT_MCPCATALOG_PATH=https://github.com/jrmatherly/mcp-catalog
```

**Impact:** HIGH - Affects container builds and production deployments
**Testing Required:**

- Build Docker image and verify catalog loading
- Test in Kubernetes deployment
- Verify MCP server registry functionality

---

### 1.2 Documentation Files (MEDIUM PRIORITY)

These files contain reference links to the mcp-catalog repository for user documentation purposes. Update to maintain consistency with the fork strategy.

#### Files Requiring Updates

1. **docs/versioned_docs/version-v0.15.0/functionality/mcp-registries.md**
   - Line 74: PR submission instructions
   - Line 113: Repository examples reference

2. **docs/versioned_docs/version-v0.15.0/concepts/mcp-registry.md**
   - Line 15: Official repository link

3. **docs/versioned_docs/version-v0.13.0/concepts/mcp-gateway/obot-registry.md**
   - Lines 2, 14, 20, 84, 302: Multiple registry references

4. **docs/versioned_docs/version-v0.13.0/concepts/admin/mcp-server-catalogs.md**
   - Lines 18, 34: Catalog creation/fork instructions

5. **docs/versioned_docs/version-v0.14.0/concepts/mcp-gateway/obot-registry.md**
   - Lines 2, 14, 20, 84, 302: Multiple registry references

6. **docs/versioned_docs/version-v0.15.0/configuration/mcp-server-gitops.md**
   - Lines 18, 34: Repository fork instructions

7. **docs/versioned_docs/version-v0.14.0/concepts/admin/mcp-server-catalogs.md**
   - Lines 18, 34: Catalog reference implementations

8. **docs/docs/configuration/mcp-server-gitops.md**
   - Lines 18, 34: Official repository references

9. **docs/docs/concepts/mcp-registry.md**
   - Line 15: Default server set reference

10. **docs/docs/functionality/mcp-registries.md**
    - Lines 74, 113: PR submission and examples

**Batch Update Strategy:**

```bash
# Find and replace in all documentation
find docs -name "*.md" -type f -exec sed -i.bak \
  's|github.com/obot-platform/mcp-catalog|github.com/jrmatherly/mcp-catalog|g' {} \;

# Remove backup files
find docs -name "*.md.bak" -delete
```

**Impact:** MEDIUM - Affects user-facing documentation
**Testing Required:** Review documentation links to ensure they point to correct repository

---

### 1.3 Archive Files (LOW PRIORITY - INFORMATIONAL ONLY)

#### File: `documentation/archive/AUTH_PROVIDERS_COMP_ANALYSIS.md` (Line 320)

**Content:**

```markdown
| `github.com/obot-platform/mcp-catalog` | `github.com/jrmatherly/mcp-catalog` | N/A (YAML only) | Not a Go dependency |
```

**Status:** Already correctly documents the fork mapping
**Action Required:** None - informational reference is accurate

---

## Part 2: obot-platform/tools References

### 2.1 Runtime Configuration Files (HIGH PRIORITY)

#### File: `obot-entraid/.envrc.dev` (Line 6)

**Current:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES=github.com/obot-platform/tools,./tools
```

**Required Change:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES=github.com/jrmatherly/obot-tools,./tools
```

**Impact:** HIGH - Affects local development tool registry loading
**Testing Required:**

- Verify auth providers load correctly
- Test Entra ID and Keycloak auth provider functionality
- Verify tool registry resolution

---

#### File: `.envrc.dev.example` (Line 6)

**Current:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES=github.com/obot-platform/tools,./tools
```

**Required Change:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES=github.com/jrmatherly/obot-tools,./tools
```

**Impact:** MEDIUM - Template file for new developers
**Testing Required:** None - example file only

---

#### File: `obot-entraid/Dockerfile` (Lines 1-2)

**Current:**

```dockerfile
ARG TOOLS_IMAGE=ghcr.io/obot-platform/tools:latest
ARG PROVIDER_IMAGE=ghcr.io/obot-platform/tools/providers:latest
```

**Required Change:**

```dockerfile
ARG TOOLS_IMAGE=ghcr.io/jrmatherly/obot-tools:latest
ARG PROVIDER_IMAGE=ghcr.io/jrmatherly/obot-tools/providers:latest
```

**Impact:** HIGH - Affects Docker image builds
**Testing Required:**

- Verify Docker images exist at new registry path
- Test full Docker build pipeline
- Verify tools image contents

**Note:** This change also requires publishing Docker images to `ghcr.io/jrmatherly/obot-tools` registry.

---

#### File: `chart/values.yaml` (Lines 158-161)

**Current:**

```yaml
# config.OBOT_SERVER_TOOL_REGISTRIES -- Tool registry path containing all auth providers.
# Override this to use a custom registry path
# Default: "/obot-tools/tools"
OBOT_SERVER_TOOL_REGISTRIES: "/obot-tools/tools"
```

**Status:** No change required - this is a container-internal path, not a GitHub reference
**Action Required:** None

---

### 2.2 Tools Directory Files (MEDIUM PRIORITY)

#### File: `tools/entra-auth-provider/README.md` (Line 305)

**Current:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES="github.com/obot-platform/tools,./tools"
```

**Required Change:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES="github.com/jrmatherly/obot-tools,./tools"
```

**Impact:** MEDIUM - Affects auth provider documentation
**Testing Required:** Verify README instructions are accurate

---

#### File: `obot-tools/entra-auth-provider/README.md` (Line 305)

**Current:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES="github.com/obot-platform/tools,./tools"
```

**Required Change:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES="github.com/jrmatherly/obot-tools,./tools"
```

**Impact:** MEDIUM - Duplicate location (symlink or copy?)
**Testing Required:** Verify this is not a duplicate and requires separate update

---

#### File: `tools/README.md` (Lines 44, 146)

**Current:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES=github.com/obot-platform/tools,./tools
# ...
# Expected: export OBOT_SERVER_TOOL_REGISTRIES="/obot-tools/tools"
```

**Required Change:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES=github.com/jrmatherly/obot-tools,./tools
```

**Impact:** MEDIUM - Tools directory documentation
**Testing Required:** Review context around line 146 to ensure expected value is still accurate

---

#### File: `tools/combine-envrc.sh` (Lines 20-47)

**Current:**

```bash
if [[ -n "$OBOT_SERVER_TOOL_REGISTRIES" ]]; then
  tool_registries+="$OBOT_SERVER_TOOL_REGISTRIES,"
fi
# ...
OBOT_SERVER_TOOL_REGISTRIES="/obot-tools/tools"
# ...
if [[ "$OBOT_SERVER_TOOL_REGISTRIES" == *"github.com/obot-platform/enterprise-tools"* ]]; then
```

**Status:** Script logic handles environment variable, no hardcoded obot-platform reference that needs updating
**Action Required:** None - script is environment variable agnostic

---

### 2.3 Test Files (MEDIUM PRIORITY)

#### File: `tests/integration/setup.sh` (Line 3)

**Current:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES="github.com/obot-platform/tools,test-tools"
```

**Required Change:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES="github.com/jrmatherly/obot-tools,test-tools"
```

**Impact:** MEDIUM - Affects integration test setup
**Testing Required:** Run integration tests after change

---

### 2.4 Documentation Files (LOW PRIORITY)

#### File: `README.md` (Line 349)

**Current:**

```markdown
- **obot-tools:** [github.com/obot-platform/tools](https://github.com/obot-platform/tools)
```

**Required Change:**

```markdown
- **obot-tools:** [github.com/jrmatherly/obot-tools](https://github.com/jrmatherly/obot-tools)
```

**Impact:** LOW - Root README documentation link
**Testing Required:** Verify link points to correct repository

---

#### File: `docs/docs/contributing/local-development.md` (Line 45)

**Current:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES=github.com/obot-platform/tools,./tools
```

**Required Change:**

```bash
export OBOT_SERVER_TOOL_REGISTRIES=github.com/jrmatherly/obot-tools,./tools
```

**Impact:** MEDIUM - Developer setup instructions
**Testing Required:** Follow local development guide to verify accuracy

---

### 2.5 Archive Files (LOW PRIORITY - INFORMATIONAL ONLY)

The following archive files contain historical references and analysis. These do NOT require updates as they document past state:

- `documentation/archive/ENHANCEMENT_PROPOSAL_AUTH_ANALYSIS.md` (Multiple lines)
- `documentation/archive/AUTH_PROVIDERS_COMP_ANALYSIS.md` (Line 50)
- `documentation/implementations/obot-tools/MIGRATION_GUIDE_AUTH_PROVIDERS.md` (Multiple references)
- `documentation/reports/AUTH_PROVIDERS_MIGRATION_ANALYSIS.md` (Multiple references)
- `documentation/reports/REFLECTION_VALIDATION_AUTH_MIGRATION.md` (Multiple references)

**Action Required:** None - preserve as historical documentation

---

### 2.6 API Documentation (INFORMATIONAL)

#### File: `API_REFERENCE.md` (Lines 674, 680, 686)

**Current:**

```yaml
modelName: memory from github.com/obot-platform/tools/memory
modelName: openai-model-provider from github.com/obot-platform/tools/openai-model-provider
modelName: github-auth-provider from github.com/obot-platform/tools/github-auth-provider
```

**Status:** These appear to be example model names from API responses
**Action Required:** Verify if these are runtime-generated or static documentation

- If runtime-generated: No change needed (will update automatically)
- If static documentation: Update to reflect fork

---

### 2.7 Internal Documentation/Memory Files

#### File: `.serena/memories/codebase_architecture.md`

**Content:** References to obot-platform/tools in architecture documentation

**Status:** Internal AI memory/context file
**Recommendation:** Update for consistency, but low impact

---

## Part 3: Implementation Plan

### Phase 1: Critical Runtime Configuration (DO FIRST)

**Priority:** CRITICAL
**Estimated Time:** 15 minutes
**Testing Time:** 30 minutes

1. **Update `.envrc.dev`:**

   ```bash
   sed -i.bak 's|github.com/obot-platform/mcp-catalog|github.com/jrmatherly/mcp-catalog|g' obot-entraid/.envrc.dev
   sed -i.bak 's|github.com/obot-platform/tools|github.com/jrmatherly/obot-tools|g' obot-entraid/.envrc.dev
   ```

2. **Update `Dockerfile`:**

   ```bash
   sed -i.bak 's|github.com/obot-platform/mcp-catalog|github.com/jrmatherly/mcp-catalog|g' obot-entraid/Dockerfile
   sed -i.bak 's|ghcr.io/obot-platform/tools|ghcr.io/jrmatherly/obot-tools|g' obot-entraid/Dockerfile
   ```

3. **Update `.envrc.dev.example`:**

   ```bash
   sed -i.bak 's|github.com/obot-platform/tools|github.com/jrmatherly/obot-tools|g' .envrc.dev.example
   ```

4. **Test changes:**

   ```bash
   cd obot-entraid
   source .envrc.dev
   make dev  # Verify local development works
   make build  # Verify Docker build works
   ```

---

### Phase 2: Tools Directory Documentation (DO SECOND)

**Priority:** HIGH
**Estimated Time:** 10 minutes
**Testing Time:** 15 minutes

1. **Update tools README files:**

   ```bash
   find tools -name "README.md" -type f -exec sed -i.bak \
     's|github.com/obot-platform/tools|github.com/jrmatherly/obot-tools|g' {} \;
   ```

2. **Update obot-tools README files:**

   ```bash
   find obot-tools -name "README.md" -type f -exec sed -i.bak \
     's|github.com/obot-platform/tools|github.com/jrmatherly/obot-tools|g' {} \;
   ```

3. **Verify changes:**

   ```bash
   grep -r "obot-platform/tools" tools/ obot-tools/
   # Should show no results
   ```

---

### Phase 3: Integration Tests (DO THIRD)

**Priority:** HIGH
**Estimated Time:** 5 minutes
**Testing Time:** 20 minutes

1. **Update test configuration:**

   ```bash
   sed -i.bak 's|github.com/obot-platform/tools|github.com/jrmatherly/obot-tools|g' \
     tests/integration/setup.sh
   ```

2. **Run integration tests:**

   ```bash
   cd obot-entraid
   make test-integration
   ```

---

### Phase 4: Documentation Updates (DO FOURTH)

**Priority:** MEDIUM
**Estimated Time:** 10 minutes
**Testing Time:** 10 minutes (link verification)

1. **Update all documentation:**

   ```bash
   # mcp-catalog references
   find docs -name "*.md" -type f -exec sed -i.bak \
     's|github.com/obot-platform/mcp-catalog|github.com/jrmatherly/mcp-catalog|g' {} \;

   # tools references
   find docs -name "*.md" -type f -exec sed -i.bak \
     's|github.com/obot-platform/tools|github.com/jrmatherly/obot-tools|g' {} \;

   # Update root README
   sed -i.bak 's|github.com/obot-platform/tools|github.com/jrmatherly/obot-tools|g' README.md
   ```

2. **Verify documentation links:**

   ```bash
   # Extract all GitHub links
   find docs -name "*.md" -exec grep -h "github.com/jrmatherly" {} \; | sort -u

   # Manually verify each link is accessible
   ```

---

### Phase 5: Cleanup and Validation (DO LAST)

**Priority:** LOW
**Estimated Time:** 10 minutes

1. **Remove backup files:**

   ```bash
   find . -name "*.bak" -delete
   ```

2. **Comprehensive verification:**

   ```bash
   # Search for any remaining obot-platform references (excluding archives)
   grep -r "obot-platform/mcp-catalog" --exclude-dir=documentation/archive .
   grep -r "obot-platform/tools" --exclude-dir=documentation/archive .

   # Both should return no results (or only archive files)
   ```

3. **Git commit:**

   ```bash
   git add -A
   git commit -m "refactor: update all obot-platform references to jrmatherly forks

   - Update runtime configuration (.envrc.dev, Dockerfile)
   - Update tools directory documentation
   - Update integration test setup
   - Update user-facing documentation
   - Preserve archive files as historical references

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

---

## Part 4: Docker Registry Considerations

### GitHub Container Registry Setup Required

**Current Docker Image References:**

```dockerfile
ARG TOOLS_IMAGE=ghcr.io/obot-platform/tools:latest
ARG PROVIDER_IMAGE=ghcr.io/obot-platform/tools/providers:latest
```

**New Docker Image References:**

```dockerfile
ARG TOOLS_IMAGE=ghcr.io/jrmatherly/obot-tools:latest
ARG PROVIDER_IMAGE=ghcr.io/jrmatherly/obot-tools/providers:latest
```

### Action Items

1. **Publish Docker images to jrmatherly registry:**

   ```bash
   cd obot-tools

   # Build and tag tools image
   docker build -t ghcr.io/jrmatherly/obot-tools:latest .
   docker push ghcr.io/jrmatherly/obot-tools:latest

   # Build and tag providers image
   docker build -f Dockerfile.providers -t ghcr.io/jrmatherly/obot-tools/providers:latest .
   docker push ghcr.io/jrmatherly/obot-tools/providers:latest
   ```

2. **Verify GitHub Container Registry permissions:**
   - Ensure `jrmatherly` user has write access to ghcr.io
   - Configure GitHub Actions to push to new registry path

3. **Update CI/CD pipelines:**
   - Modify workflows to push to `ghcr.io/jrmatherly/*`
   - Update image pull secrets if needed

---

## Part 5: Validation Checklist

### Pre-Deployment Validation

- [ ] **Local Development Environment**
  - [ ] `.envrc.dev` updated and sourced
  - [ ] Dev mode starts successfully (`make dev`)
  - [ ] MCP catalog loads from jrmatherly/mcp-catalog
  - [ ] Tools load from jrmatherly/obot-tools
  - [ ] Entra ID auth provider functions correctly
  - [ ] Keycloak auth provider functions correctly

- [ ] **Docker Build**
  - [ ] Dockerfile builds without errors
  - [ ] Tools image pulled from `ghcr.io/jrmatherly/obot-tools`
  - [ ] Providers image pulled from `ghcr.io/jrmatherly/obot-tools/providers`
  - [ ] Container starts and runs successfully
  - [ ] MCP catalog accessible in container
  - [ ] Tools registry accessible in container

- [ ] **Integration Tests**
  - [ ] Integration test setup script updated
  - [ ] All integration tests pass
  - [ ] Auth provider integration tests pass

- [ ] **Documentation**
  - [ ] All documentation links verified
  - [ ] README links point to correct repositories
  - [ ] Developer setup instructions accurate
  - [ ] No broken links to obot-platform repositories

- [ ] **Repository State**
  - [ ] No remaining obot-platform/mcp-catalog references (excluding archives)
  - [ ] No remaining obot-platform/tools references (excluding archives)
  - [ ] All backup files removed
  - [ ] Changes committed to version control

---

## Part 6: Risk Assessment

### High Risk Items

1. **Docker Image Availability**
   - **Risk:** New `ghcr.io/jrmatherly/obot-tools` images may not exist yet
   - **Mitigation:** Build and publish Docker images BEFORE updating Dockerfile
   - **Rollback:** Revert Dockerfile changes if images unavailable

2. **MCP Catalog Availability**
   - **Risk:** Fork may not be publicly accessible
   - **Mitigation:** Verify `https://github.com/jrmatherly/mcp-catalog` is public
   - **Rollback:** Revert .envrc.dev and Dockerfile changes

3. **Auth Provider Functionality**
   - **Risk:** Tool registry changes may break auth providers
   - **Mitigation:** Comprehensive testing of both Entra ID and Keycloak providers
   - **Rollback:** Revert tool registry configuration

### Medium Risk Items

1. **Documentation Links**
   - **Risk:** Broken links if fork repositories have different structure
   - **Mitigation:** Manually verify all documentation links
   - **Rollback:** Update links back to obot-platform if fork unavailable

2. **Integration Tests**
   - **Risk:** Tests may fail with new registry paths
   - **Mitigation:** Run full integration test suite before deployment
   - **Rollback:** Revert test setup configuration

### Low Risk Items

1. **Example Files**
   - **Risk:** Minimal - examples are templates only
   - **Mitigation:** None needed
   - **Rollback:** Simple revert if issues arise

2. **Archive Documentation**
   - **Risk:** None - informational only, no functional impact
   - **Mitigation:** Leave unchanged
   - **Rollback:** Not applicable

---

## Part 7: Summary and Recommendations

### Key Findings

1. **Total Files Requiring Updates:** 18 files (excluding archives)
2. **Critical Path Items:** 3 files (.envrc.dev, Dockerfile, test setup)
3. **Docker Registry Migration Required:** Yes - publish images to ghcr.io/jrmatherly/*
4. **Archive Files:** 6 files - preserve as historical references, no updates needed

### Recommended Execution Order

1. **FIRST:** Publish Docker images to `ghcr.io/jrmatherly/obot-tools`
2. **SECOND:** Update runtime configuration (.envrc.dev, Dockerfile)
3. **THIRD:** Update tools directory documentation
4. **FOURTH:** Update integration test setup
5. **FIFTH:** Update user-facing documentation
6. **LAST:** Validate and commit changes

### Estimated Total Effort

- **Implementation Time:** 50 minutes
- **Testing Time:** 1.5 hours
- **Total:** ~2.5 hours (conservative estimate)

### Success Criteria

- [ ] All runtime configuration updated
- [ ] Local development environment functional
- [ ] Docker builds successful
- [ ] Integration tests passing
- [ ] Documentation links verified
- [ ] No remaining obot-platform references (excluding archives)
- [ ] Changes committed and validated

---

## Appendix A: Complete File List

### Files Requiring Updates (18 total)

**Runtime Configuration (3):**

1. `obot-entraid/.envrc.dev`
2. `obot-entraid/Dockerfile`
3. `.envrc.dev.example`

**Tools Directory (3):**
4. `tools/README.md`
5. `tools/entra-auth-provider/README.md`
6. `obot-tools/entra-auth-provider/README.md`

**Tests (1):**
7. `tests/integration/setup.sh`

**Documentation (11):**
8. `README.md`
9. `docs/docs/contributing/local-development.md`
10. `docs/docs/configuration/mcp-server-gitops.md`
11. `docs/docs/concepts/mcp-registry.md`
12. `docs/docs/functionality/mcp-registries.md`
13. `docs/versioned_docs/version-v0.15.0/functionality/mcp-registries.md`
14. `docs/versioned_docs/version-v0.15.0/concepts/mcp-registry.md`
15. `docs/versioned_docs/version-v0.15.0/configuration/mcp-server-gitops.md`
16. `docs/versioned_docs/version-v0.14.0/concepts/mcp-gateway/obot-registry.md`
17. `docs/versioned_docs/version-v0.14.0/concepts/admin/mcp-server-catalogs.md`
18. `docs/versioned_docs/version-v0.13.0/concepts/mcp-gateway/obot-registry.md`

### Files NOT Requiring Updates (Archives)

1. `documentation/archive/AUTH_PROVIDERS_COMP_ANALYSIS.md`
2. `documentation/archive/ENHANCEMENT_PROPOSAL_AUTH_ANALYSIS.md`
3. `documentation/implementations/obot-tools/MIGRATION_GUIDE_AUTH_PROVIDERS.md`
4. `documentation/reports/AUTH_PROVIDERS_MIGRATION_ANALYSIS.md`
5. `documentation/reports/REFLECTION_VALIDATION_AUTH_MIGRATION.md`
6. `.serena/memories/codebase_architecture.md` (optional update)

---

**END OF ANALYSIS REPORT**
**Date Generated:** 2026-01-16
**Analyst:** Claude Code (Sonnet 4.5)
