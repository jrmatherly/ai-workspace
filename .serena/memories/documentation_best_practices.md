# Documentation Best Practices - Reference Guide

## Overview

This memory provides detailed reference information, templates, and examples for the 9 documentation standards defined in `.claude/instructions/documentation-standards.md`.

Load this memory when creating comprehensive documentation to access templates and detailed examples.

---

## Standard 1: Evidence-Based Analysis - Detailed Reference

### Methodology Documentation Template

```markdown
## 📊 Evidence Trail

### Investigation Methodology

This analysis was conducted using the following systematic approach:

| Evidence Type | Tool/Method Used | Command/Process | Finding Location |
|--------------|------------------|-----------------|------------------|
| [Type] | [Tool] | [Exact command or process] | [File:Line or output] |

### Verification Commands

All findings can be independently verified:

\```bash
# Verify [Finding 1]
[command 1]
# Expected output: [description]

# Verify [Finding 2]
[command 2]
# Expected output: [description]
\```

### Evidence Quality

- **Primary Evidence**: Direct code inspection, command execution results
- **Secondary Evidence**: Documentation analysis, log file review
- **Confidence Level**: [High/Medium/Low] based on evidence quality
```

### Common Evidence Types

1. **Code Inspection**: Manual review of source files
   - Tool: IDE, grep, Read tool
   - Verification: Line number references

2. **Dependency Analysis**: Module resolution verification
   - Tool: `go list -m all`, `go mod graph`
   - Verification: Exact output comparison

3. **Build Testing**: Compilation and execution
   - Tool: `make build`, `go build`, `go test`
   - Verification: Exit codes and output messages

4. **Configuration Review**: Settings and configuration files
   - Tool: grep, Read tool, file inspection
   - Verification: Configuration snippets

---

## Standard 2: Specific Line References - Detailed Reference

### Quick Navigation Index Template

For documents > 200 lines:

```markdown
## 🗺️ Quick Navigation Index

Jump directly to sections:

| Section | Finding/Issue | Lines | Severity | Action Required | Estimated Time |
|---------|--------------|-------|----------|----------------|----------------|
| [Name] | [Summary] | X-Y | 🔴/🟠/🟢 | [Action] | [Xm/Xh] |

### Severity Key
- 🔴 CRITICAL: Blocking issue, must fix immediately
- 🟠 HIGH: Important issue, fix before completion
- 🟢 INFO: Informational, no action required

### Quick Jump Commands (terminal viewing)
\```bash
sed -n 'X,Yp' FILENAME  # View lines X through Y
grep -n "PATTERN" FILENAME  # Search with line numbers
\```
```

### Line Reference Best Practices

1. **Format**: Always use `filename:line` or `filename:start-end` format
   - ✅ Good: `obot-entraid/go.mod:22-27`
   - ❌ Bad: "in the go.mod file near the top"

2. **Verification**: Ensure line numbers are current (run `wc -l file` to verify)

3. **Context**: Provide surrounding context when line numbers might shift
   - Example: "After the `replace (` block at line 22"

4. **Links**: Use markdown links for GitHub references
   - `[obot-entraid/go.mod:22-27](https://github.com/user/repo/blob/main/obot-entraid/go.mod#L22-L27)`

---

## Standard 3: Complete Code Examples - Detailed Reference

### Copy-Paste Ready Code Template

```markdown
### 💾 COPY-PASTE READY: [Concise Description]

**Purpose**: [What this code does]

**Prerequisites**:
- [Requirement 1]
- [Requirement 2]

**Instructions**:
1. [Step 1 - where to place this code]
2. [Step 2 - how to use it]

\```[language]
# ════════════════════════════════════════════════════════
# CONFIGURATION SECTION - Edit these values
# ════════════════════════════════════════════════════════

VARIABLE_1="value"  # Explanation of what this controls
VARIABLE_2="value"  # Explanation of what this controls

# ════════════════════════════════════════════════════════
# IMPLEMENTATION - Do not modify below this line
# ════════════════════════════════════════════════════════

[complete, working code with inline comments]
\```

**Before/After Comparison**:
\```diff
- old line
+ new line
\```

**Validation**:
\```bash
# Test that the code works
[validation command 1]
# Expected output: [description]

[validation command 2]
# Expected output: [description]

# If you see this, SUCCESS:
[success indicator]

# If you see this, FAILURE - check [troubleshooting]:
[failure indicator]
\```

**Troubleshooting**:
- Issue: [Common problem]
  Fix: [Solution]
```

### Code Example Quality Checklist

- [ ] Code is complete (no placeholders like `...` or `// TODO`)
- [ ] All imports/dependencies listed
- [ ] Inline comments explain non-obvious logic
- [ ] Variables/constants defined before use
- [ ] Code tested and verified working
- [ ] Syntax highlighting language specified
- [ ] File path provided (where this code goes)
- [ ] Instructions clear and actionable

---

## Standard 4: Validation Commands - Detailed Reference

### Validation Command Reference Template

```markdown
## Appendix: Validation Command Reference

Complete reference of all validation commands.

### Category 1: [Category Name]

| Command | Purpose | Expected Output | Failure Indicator | Next Steps if Failed |
|---------|---------|----------------|-------------------|---------------------|
| `[cmd]` | [why] | [success pattern] | [failure pattern] | [what to do] |

**Example - Good Output**:
\```bash
$ [command]
[successful output example]
\```

**Example - Bad Output** (indicates problem):
\```bash
$ [command]
[failed output example]
# ❌ [explanation of what's wrong]
\```

**Troubleshooting**:
If command fails:
1. [Debug step 1]
2. [Debug step 2]
3. [Debug step 3]

### Automated Validation Script

**💾 COPY-PASTE READY: Complete Validation Script**

Save as `validate_[feature].sh`:

\```bash
#!/bin/bash
# Validation script for [feature]
set -e

echo "🔍 Validating [feature]..."

# Color codes
GREEN='\\033[0;32m'
RED='\\033[0;31m'
NC='\\033[0m'

# Test 1: [Description]
if [test condition]; then
  echo -e "${GREEN}✅ Test 1 passed${NC}"
else
  echo -e "${RED}❌ Test 1 failed${NC}"
  exit 1
fi

# Test 2: [Description]
# ...

echo -e "${GREEN}✅ All validations passed!${NC}"
\```

**Usage**:
\```bash
chmod +x validate_[feature].sh
./validate_[feature].sh
\```
```

---

## Standard 5: Visual Elements - Detailed Reference

### ASCII Flowchart Templates

**Decision Tree**:

```
                    Start
                      |
                      v
         ┌────────────────────────┐
         │  Condition Check?      │
         └────────┬───────────┬───┘
                  │ YES       │ NO
                  v           v
         ┌──────────┐    ┌────────┐
         │ Action A │    │ Action │
         └────┬─────┘    │   B    │
              v          └───┬────┘
         ┌─────────┐        │
         │ Success │◄───────┘
         └─────────┘
```

**Process Flow**:

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Step 1  │────>│ Step 2  │────>│ Step 3  │────>│  Done   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
     │               │                │
     v               v                v
 [Output 1]     [Output 2]       [Output 3]
```

**Comparison Matrix**:

```
┌────────────────────┬──────────────┬──────────────┐
│      Feature       │  Option A    │   Option B   │
├────────────────────┼──────────────┼──────────────┤
│ Criterion 1        │ ✅ Good      │ ❌ Poor      │
├────────────────────┼──────────────┼──────────────┤
│ Criterion 2        │ ⚠️  Medium   │ ✅ Good      │
├────────────────────┼──────────────┼──────────────┤
│ Recommendation     │ Use when X   │ Use when Y   │
└────────────────────┴──────────────┴──────────────┘
```

### Table Formatting Best Practices

1. **Use Alignment**:
   - Left-align text columns
   - Right-align numeric columns
   - Center-align headers

2. **Consistent Column Widths**: Keep columns readable

3. **Header Separation**: Use separator row (`|---|---|`)

4. **Wrap Long Text**: Break into multiple rows if needed

5. **Status Columns**: Use emoji consistently

---

## Standards 6-9: Enhanced Standards - Detailed Reference

### Standard 6: CI/CD Impact Template

```markdown
## 🔄 CI/CD IMPACT ANALYSIS

### Summary
[One-sentence summary of CI/CD implications]

### GitHub Actions Impact

#### Current Workflow Behavior
[How current GitHub Actions workflows behave]

#### Changes Required
\```yaml
# .github/workflows/[workflow-name].yml
name: [Workflow Name]

on: [triggers]

jobs:
  [job-name]:
    runs-on: ubuntu-latest
    steps:
      - name: [Step Description]
        run: |
          [commands modified or added]
\```

#### Migration Strategy
- **Step 1**: [Action to take]
- **Step 2**: [Action to take]

### Docker Build Impact

#### Issue
[Description of Docker-specific problem]

#### Solution
\```dockerfile
# Dockerfile changes
[modified Dockerfile sections]
\```

**Build Command**:
\```bash
docker build [updated command]
\```

### Production Deployment Considerations

| Environment | Impact | Action Required | Timeline |
|------------|--------|----------------|----------|
| Development | [Impact] | [Action] | Immediate |
| Staging | [Impact] | [Action] | [When] |
| Production | [Impact] | [Action] | [When] |
```

### Standard 7: Go Workspace Template

```markdown
## 🏗️ GO WORKSPACE ALTERNATIVE

### Overview
[When and why to use go.work instead of replace directives]

### Comparison Table

| Aspect | Replace Directives | Go Workspace (go.work) | Recommended For |
|--------|-------------------|------------------------|-----------------|
| Configuration Location | In go.mod (committed) | In go.work (gitignored) | [Use case] |
| Team Impact | Affects everyone | Developer-specific | [Use case] |
| CI/CD Behavior | Used in CI | Ignored in CI | [Use case] |

### Setup Instructions

**💾 COPY-PASTE READY: go.work File**

Create `/path/to/monorepo/go.work`:

\```go
go 1.25

use ./project1
use ./project2
\```

**Usage**:
\```bash
cd /path/to/monorepo
go work sync
go work use -r .  # Auto-discover all modules
\```

### Migration Path

**From replace directives to workspace**:
\```bash
# Step 1: Create go.work
[commands]

# Step 2: Remove replace directives
[commands]

# Step 3: Validate
[commands]
\```

### When to Use Which

- **Use Replace Directives**: [Scenario 1], [Scenario 2]
- **Use Go Workspace**: [Scenario 3], [Scenario 4]
- **Use Both (Hybrid)**: [Scenario 5]
```

### Standard 8: Failure Mode Template

```markdown
## 🚨 FAILURE MODE CATALOG

### Quick Reference

| FM ID | Pattern | Likely Cause | Quick Fix |
|-------|---------|--------------|-----------|
| FM-001 | [Error pattern] | [Cause] | [Fix] |
| FM-002 | [Error pattern] | [Cause] | [Fix] |

### Detailed Failure Modes

#### FM-001: [Failure Name]

**Scenario**: [Description of when/how this occurs]

**Symptoms**:
- [Symptom 1]
- [Symptom 2]

**Error Message**:
\```
[Exact error message user will see]
\```

**Root Cause**: 
[Detailed explanation of why this happens]

**Affected Components**:
- [Component 1]
- [Component 2]

**Debug Procedure**:

\```bash
# Step 1: Check [something]
[command 1]
# Look for: [what to look for]

# Step 2: Verify [something]
[command 2]
# Expected: [expected result]

# Step 3: Test [something]
[command 3]
\```

**Fix**:

\```bash
# Option 1: [Quick fix - description]
[commands]

# Option 2: [Proper fix - description]
[commands]
\```

**Validation**:
\```bash
# Verify the fix worked
[validation command]
# Should now see: [expected output]
\```

**Prevention**:
- [How to prevent this in future]

### Debug Flowchart

\```
        Error Occurs
             |
             v
    ┌────────────────┐
    │  Check X?      │
    └───┬───────┬────┘
        │ OK    │ FAIL
        v       v
    [Next]   [FM-001]
\```
```

### Standard 9: Automated Testing Template

```markdown
## 🤖 AUTOMATED TESTING

### Test Suite Components

1. **Unit Tests**: Test individual functions/components
2. **Integration Tests**: Test component interactions
3. **Validation Scripts**: Automated verification
4. **Pre-commit Hooks**: Prevent bad commits
5. **CI Validation**: Continuous verification

### Integration Test Template

**File**: `tests/[feature]_test.go`

\```go
//go:build integration
// +build integration

package tests

import (
    "testing"
)

// Test[Feature] validates [what it tests]
func Test[Feature](t *testing.T) {
    // Setup
    // ...
    
    // Execute
    // ...
    
    // Verify
    if got != want {
        t.Errorf("Test failed: got %v, want %v", got, want)
    }
}
\```

**Run**:
\```bash
go test -tags=integration ./tests/ -v
\```

### Pre-commit Hook Template

**File**: `.git/hooks/pre-commit`

\```bash
#!/bin/bash
echo "🔍 Running pre-commit checks..."

# Check 1: [Description]
if ! [test]; then
  echo "❌ Check 1 failed"
  exit 1
fi

# Check 2: [Description]
if ! [test]; then
  echo "❌ Check 2 failed"
  exit 1
fi

echo "✅ All pre-commit checks passed"
exit 0
\```

**Install**:
\```bash
chmod +x .git/hooks/pre-commit
\```

### CI Workflow Template

**File**: `.github/workflows/validate-[feature].yml`

\```yaml
name: Validate [Feature]

on:
  push:
    paths:
      - '[relevant-paths]/**'
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate [Feature]
        run: |
          [validation commands]
\```

### Makefile Integration

Add to `Makefile`:

\```makefile
.PHONY: validate-[feature]
validate-[feature]:
\t@echo "🔍 Validating [feature]..."
\t@./scripts/validate_[feature].sh

.PHONY: pre-commit
pre-commit: validate-[feature]
\t@echo "✅ Pre-commit checks passed"
\```

**Usage**:
\```bash
make validate-[feature]
make pre-commit
\```
```

---

## Quick Reference: When to Apply Each Standard

| Standard | Always Apply | Apply When |
| ---------- | ------------- | ------------ |
| 1. Evidence-Based | ✅ Always | All documentation |
| 2. Line References | ✅ Always | Code references exist |
| 3. Code Examples | ✅ Always | Code shown |
| 4. Validation Commands | ✅ Always | Recommendations given |
| 5. Visual Elements | ✅ Always | All documentation |
| 6. CI/CD Impact | ⚠️ Conditional | Affects build/deploy |
| 7. Go Workspace | ⚠️ Conditional | Go module config |
| 8. Failure Modes | ⚠️ Conditional | Error-prone procedures |
| 9. Automated Testing | ⚠️ Conditional | Repeatable validation |

---

## Common Pitfalls to Avoid

1. **Untested Code Examples**
   - ❌ Don't: Include code you haven't tested
   - ✅ Do: Run and verify all code before including

2. **Vague References**
   - ❌ Don't: "in the config file" or "near the top"
   - ✅ Do: "config/app.yaml:42-45"

3. **Missing Validation**
   - ❌ Don't: Recommend changes without verification commands
   - ✅ Do: Always provide "how to verify this worked"

4. **Inconsistent Formatting**
   - ❌ Don't: Mix emoji styles, table formats
   - ✅ Do: Use consistent patterns throughout

5. **Incomplete Examples**
   - ❌ Don't: Use `...` or `// TODO` in production examples
   - ✅ Do: Provide complete, working code

6. **No Error Handling**
   - ❌ Don't: Show only happy-path examples
   - ✅ Do: Document failure modes and recovery

7. **Assumed Knowledge**
   - ❌ Don't: Assume reader knows background
   - ✅ Do: Provide context and prerequisites

8. **Stale Line Numbers**
   - ❌ Don't: Reference lines that may have changed
   - ✅ Do: Verify line numbers are current, provide context

---

## Tools and Helpers

### Validation Script Generator

When creating validation scripts, use this template generator pattern:

```bash
# Generate validation script
cat > validate_X.sh <<'EOF'
#!/bin/bash
set -e
# Script content from template goes here
EOF
chmod +x validate_X.sh
```

### Table Generator Helper

For complex tables, use online tools:

- https://www.tablesgenerator.com/markdown_tables
- Copy structure, fill with content
- Verify alignment in markdown preview

### ASCII Art Tools

For flowcharts:

- Use plain text with box drawing characters
- `┌ ─ ┐ │ └ ┘ ├ ┤ ┬ ┴ ┼`
- Test rendering in multiple viewers

---

## Quality Assurance

### Pre-Publication Checklist

Before finalizing documentation:

**Content Quality**:

- [ ] All 9 standards applied (or N/A documented)
- [ ] Evidence verified through testing
- [ ] Line references current and accurate
- [ ] Code examples tested and working
- [ ] Validation commands produce expected output

**Formatting**:

- [ ] Markdown renders correctly
- [ ] Code blocks have syntax highlighting
- [ ] Tables properly aligned
- [ ] Emoji used consistently
- [ ] ASCII art displays correctly

**Security**:

- [ ] No API keys or tokens in examples
- [ ] No passwords or credentials
- [ ] No internal URLs or sensitive paths
- [ ] Environment variables used for secrets

**Usability**:

- [ ] Quick Navigation Index (if >200 lines)
- [ ] Clear section hierarchy
- [ ] Copy-paste ready markers present
- [ ] Troubleshooting guidance included

---

**Last Updated**: 2026-01-16
**Load When**: Creating comprehensive documentation
**Reference**: `.claude/instructions/documentation-standards.md` for requirements
