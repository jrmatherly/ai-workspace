# Branch Protection Configuration Checklist

**Created**: 2026-01-18
**Implemented**: 2026-01-18
**Status**: ✅ COMPLETE - All repositories protected
**Purpose**: Manual configuration guide for protecting main branches across project repositories

---

## Quick Links

| Repository | Settings URL |
|------------|--------------|
| kinm | https://github.com/jrmatherly/kinm/settings/branches |
| mcp-oauth-proxy | https://github.com/jrmatherly/mcp-oauth-proxy/settings/branches |
| mcp-catalog | https://github.com/jrmatherly/mcp-catalog/settings/branches |
| obot-tools | https://github.com/jrmatherly/obot-tools/settings/branches |
| nah | https://github.com/jrmatherly/nah/settings/branches |

---

## Configuration Steps (Per Repository)

### Step 1: Navigate to Branch Protection Settings

1. Go to the repository on GitHub
2. Click **Settings** (gear icon)
3. In the left sidebar, click **Branches** (under "Code and automation")
4. Under "Branch protection rules", click **Add branch protection rule**

### Step 2: Configure Branch Name Pattern

- **Branch name pattern**: `main`

---

## Standard Protection Settings

Apply these settings to ALL repositories:

### Protect Matching Branches

- [ ] **Require a pull request before merging**
  - [ ] Dismiss stale pull request approvals when new commits are pushed
  - [ ] Required number of approvals: `0` (or `1` if you want mandatory reviews)
  - [ ] ~~Require review from Code Owners~~ (leave unchecked unless CODEOWNERS file exists)
  - [ ] ~~Require approval of the most recent reviewable push~~ (leave unchecked)

- [ ] **Require status checks to pass before merging**
  - [ ] Require branches to be up to date before merging (strict mode)
  - [ ] Status checks: **See repository-specific section below**

- [ ] **Require conversation resolution before merging**

- [ ] ~~Require signed commits~~ (leave unchecked - optional)

- [ ] ~~Require linear history~~ (leave unchecked - allows merge commits)

- [ ] ~~Require deployments to succeed~~ (leave unchecked unless using deployment environments)

- [ ] ~~Lock branch~~ (leave unchecked)

- [ ] **Do not allow bypassing the above settings** (optional - enforces rules for admins too)

### Rules Applied to Everyone Including Administrators

- [ ] ~~Allow force pushes~~ (leave unchecked - **IMPORTANT**)

- [ ] ~~Allow deletions~~ (leave unchecked - **IMPORTANT**)

---

## Repository-Specific Status Checks

### 1. kinm

**Settings URL**: https://github.com/jrmatherly/kinm/settings/branches

**Required Status Checks**:

| Check Name | Source | Required |
|------------|--------|----------|
| `CI` | `.github/workflows/ci.yml` | Yes |

**Additional Available Checks** (optional):

- `CodeQL` - Security scanning
- `dependency-review` - Dependency vulnerability check

**Configuration**:

- [ ] Navigate to settings
- [ ] Add branch protection rule for `main`
- [ ] Enable "Require status checks to pass"
- [ ] Search and add: `CI`
- [ ] Enable strict mode (require branch up to date)
- [ ] Save changes

---

### 2. mcp-oauth-proxy

**Settings URL**: https://github.com/jrmatherly/mcp-oauth-proxy/settings/branches

**Required Status Checks**:

| Check Name | Source | Required |
|------------|--------|----------|
| `Tests` | `.github/workflows/test.yml` | Yes |

**Additional Available Checks** (optional):

- `Build and Push Docker Image` - Build validation

**Configuration**:

- [ ] Navigate to settings
- [ ] Add branch protection rule for `main`
- [ ] Enable "Require status checks to pass"
- [ ] Search and add: `Tests`
- [ ] Enable strict mode (require branch up to date)
- [ ] Save changes

---

### 3. mcp-catalog

**Settings URL**: https://github.com/jrmatherly/mcp-catalog/settings/branches

**Required Status Checks**:

| Check Name | Source | Required |
|------------|--------|----------|
| None | No test workflow | N/A |

**Note**: This repository lacks a dedicated test/CI workflow. Consider adding one before enforcing status checks, or skip the status check requirement for now.

**Configuration**:

- [ ] Navigate to settings
- [ ] Add branch protection rule for `main`
- [ ] Skip "Require status checks" (no suitable workflow)
- [ ] Enable all other standard protections
- [ ] Save changes

**Follow-up Action**:

- [ ] Consider creating a CI workflow (`.github/workflows/ci.yml`) with basic validation
- [ ] Once CI exists, update branch protection to require it

---

### 4. obot-tools

**Settings URL**: https://github.com/jrmatherly/obot-tools/settings/branches

**Required Status Checks**:

| Check Name | Source | Required |
|------------|--------|----------|
| `Test` | `.github/workflows/test.yaml` | Yes |

**Additional Available Checks** (optional):

- `Build release tools` - Docker build validation
- `Build release providers` - Provider build validation

**Configuration**:

- [ ] Navigate to settings
- [ ] Add branch protection rule for `main`
- [ ] Enable "Require status checks to pass"
- [ ] Search and add: `Test`
- [ ] Enable strict mode (require branch up to date)
- [ ] Save changes

---

### 5. nah

**Settings URL**: https://github.com/jrmatherly/nah/settings/branches

**Required Status Checks**:

| Check Name | Source | Required |
|------------|--------|----------|
| `test` | `.github/workflows/test.yaml` | Yes |

**Additional Available Checks** (optional):

- `CodeQL` - Security scanning

**Configuration**:

- [ ] Navigate to settings
- [ ] Add branch protection rule for `main`
- [ ] Enable "Require status checks to pass"
- [ ] Search and add: `test`
- [ ] Enable strict mode (require branch up to date)
- [ ] Save changes

---

## Verification Checklist

After configuring all repositories, verify protection is active:

```bash
# Run these commands to verify (should return JSON, not 404)
gh api repos/jrmatherly/kinm/branches/main/protection
gh api repos/jrmatherly/mcp-oauth-proxy/branches/main/protection
gh api repos/jrmatherly/mcp-catalog/branches/main/protection
gh api repos/jrmatherly/obot-tools/branches/main/protection
gh api repos/jrmatherly/nah/branches/main/protection
```

**Expected Result**: JSON response with protection details (not "Branch not protected" error)

---

## Summary Checklist

| Repository | PR Required | Status Check | Conversation Resolution | Block Force Push | Block Delete |
|------------|-------------|--------------|------------------------|------------------|--------------|
| kinm | [x] | [x] `CI` | [x] | [x] | [x] |
| mcp-oauth-proxy | [x] | [x] `Tests` | [x] | [x] | [x] |
| mcp-catalog | [x] | [x] (none) | [x] | [x] | [x] |
| obot-tools | [x] | [x] `Test` | [x] | [x] | [x] |
| nah | [x] | [x] `test` | [x] | [x] | [x] |

---

## Reference: obot-entraid Configuration

For comparison, here's the existing protection on obot-entraid:

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["changes"]
  },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "enforce_admins": false,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
```

---

## Troubleshooting

### Status Check Not Appearing in Dropdown

If a status check doesn't appear when searching:

1. The workflow must have run at least once on the repository
2. Trigger the workflow manually or via a PR to create the check
3. Return to branch protection settings and search again

### "Branch not protected" After Configuration

1. Verify you clicked "Create" or "Save changes"
2. Check the branch name pattern matches exactly: `main`
3. Refresh the page and verify the rule appears in the list

### CI Failing After Protection Enabled

1. Ensure the branch is up to date with main before merging
2. If strict mode causes issues, temporarily disable "Require branches to be up to date"
3. Rebase or merge main into your PR branch

---

## Optional Enhancements

### Add CODEOWNERS File

Create `.github/CODEOWNERS` to require specific reviewers:

```
# Default owners for everything
* @jrmatherly

# Specific paths
/docs/ @jrmatherly
```

### Enable Signed Commits

For additional security, enable "Require signed commits" if all contributors have GPG keys configured.

### Use Rulesets (GitHub's Newer Feature)

For organization-wide rules, consider using GitHub Rulesets instead of per-repo branch protection. This allows centralized management.

Settings → Rules → Rulesets → New ruleset
