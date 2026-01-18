# Documentation Standards for AI/MCP Monorepo

**Purpose**: Establish consistent, high-quality documentation standards for all AI assistants working in this monorepo.

**Scope**: These standards MUST be applied when creating:

- Comprehensive analysis documents
- Validation reports
- Implementation guides
- Architectural documentation
- Migration guides
- Troubleshooting documentation
- Any documentation intended for reference or production use

**Trigger Conditions**: Apply these standards automatically when:

- User requests "document", "analyze", "report", "validate", "assess"
- Creating .md files in `documentation/` directories
- Producing comprehensive technical documentation
- Generating validation or assessment reports

---

## 📋 CORE STANDARDS (MUST Apply)

### Standard 1: Evidence-Based Analysis ✅

**MUST**: All claims and findings MUST be validated through actual code inspection, command execution, or empirical testing.

**MUST**: Document the methodology used to gather evidence (e.g., "Verified by running `go list -m all`").

**SHOULD**: Provide verification commands so readers can independently reproduce findings.

**Pattern**:

```markdown
## Evidence Trail

| Finding | Evidence Method | Verification Command |
|---------|----------------|---------------------|
| [Claim] | [How verified] | [Command to reproduce] |
```

**Example**:

```markdown
Finding: obot-entraid uses 3 missing replace directives
Evidence Method: Manual inspection of go.mod + go list -m all
Verification Command: cd obot-entraid && go list -m all | grep obot-platform
```

---

### Standard 2: Specific Line References ✅

**MUST**: Reference specific file paths and line numbers for all code references.

**SHOULD**: Provide a Quick Navigation Index for documents > 200 lines.

**Pattern**:

```markdown
## Quick Navigation Index

| Section | Location | Severity | Action Required |
|---------|----------|----------|-----------------|
| [Section Name] | Lines X-Y | 🔴/🟠/🟢 | [What to do] |
```

**Example**:

```markdown
Issue identified in `obot-entraid/go.mod` lines 22-27
See `MIGRATION_GUIDE.md` lines 896-914 for related context
```

---

### Standard 3: Complete Code Examples ✅

**MUST**: All code examples MUST be complete, copy-paste ready, and tested.

**MUST**: Add `💾 COPY-PASTE READY:` header before production-ready code blocks.

**SHOULD**: Include inline comments explaining non-obvious logic.

**SHOULD**: Provide before/after diffs for modifications.

**Pattern**:

```markdown
### 💾 COPY-PASTE READY: [Description]

**Instructions**: [How to use this code]

\```[language]
// Explanation of what this does
[complete, working code]
\```

**Validation**:
\```bash
[command to test this code works]
\```
```

**Example**:

```markdown
### 💾 COPY-PASTE READY: Add Replace Directives

\```go
replace (
    // Use local fork for development
    github.com/obot-platform/tools => ../obot-tools
)
\```

**Validation**:
\```bash
go mod tidy
go list -m github.com/obot-platform/tools
# Expected: github.com/obot-platform/tools v0.0.0-... => /Users/jason/dev/AI/obot-tools
\```
```

---

### Standard 4: Validation Commands ✅

**MUST**: Provide validation commands for all recommendations.

**SHOULD**: Consolidate validation commands into a reference section or appendix.

**SHOULD**: Show expected output and failure indicators for each command.

**Pattern**:

```markdown
## Validation Command Reference

| Command | Purpose | Expected Output | Failure Indicator |
|---------|---------|----------------|-------------------|
| [cmd]   | [why]   | [success]      | [failure pattern] |
```

**Example**:

```markdown
| Command | Purpose | Expected Output | Failure Indicator |
|---------|---------|----------------|-------------------|
| `go list -m all \| grep obot-platform` | Check dependency resolution | Lines with "=>" to forks | Lines WITHOUT "=>" |
| `make build` | Verify build succeeds | "Build succeeded" | Compile/import errors |
```

---

### Standard 5: Visual Elements ✅

**MUST**: Use visual elements (tables, ASCII art, emoji indicators) for quick comprehension.

**SHOULD**: Include flowcharts or decision trees for complex decision logic.

**SHOULD**: Use emoji consistently:

- ✅ Success/Correct
- ❌ Error/Missing/Critical
- ⚠️ Warning/Caution
- 🔴 Critical severity
- 🟠 High severity
- 🟢 Low severity/Info
- 💾 Copy-paste ready
- 🔍 Investigation/Analysis
- 📊 Metrics/Data

**Pattern**:

```markdown
| Status | Item | Details |
|--------|------|---------|
| ✅ | [Item] | [Good] |
| ❌ | [Item] | [Problem] |
```

**ASCII Flowchart Example**:

```text
    Start
      |
      v
  ┌─────────┐
  │ Check X │
  └────┬────┘
       v
  Pass/Fail?
```

---

## 🆕 ENHANCED STANDARDS (SHOULD Apply When Relevant)

### Standard 6: CI/CD Impact Analysis ⚙️

**SHOULD**: Document how recommendations affect CI/CD pipelines when relevant.

**SHOULD**: Provide GitHub Actions workflow examples when applicable.

**SHOULD**: Address Docker build considerations if containers are involved.

**SHOULD**: Include production deployment guidance for production-impacting changes.

**When to Apply**:

- Documenting dependency changes (go.mod modifications)
- Infrastructure modifications
- Build process changes
- Deployment-related documentation

**Pattern**:

```markdown
## CI/CD Impact

### GitHub Actions Considerations
[How this affects CI pipelines]

### Docker Build Considerations
[Container-specific implications]

### Production Deployment
[Deployment guidance]
```

---

### Standard 7: Go Workspace Alternatives 🏗️

**SHOULD**: Document `go.work` as an alternative to replace directives when relevant.

**SHOULD**: Provide comparison table: replace directives vs go.work.

**SHOULD**: Include setup instructions and migration path if applicable.

**When to Apply**:

- Documenting Go module configuration
- Dependency management guides
- Monorepo development patterns

**Pattern**:

```markdown
## Go Workspace Alternative

| Aspect | Replace Directives | Go Workspace |
|--------|-------------------|--------------|
| [Aspect] | [Pros/Cons] | [Pros/Cons] |

### Setup Instructions
[How to configure go.work]

### Migration Path
[How to switch between approaches]
```

---

### Standard 8: Failure Mode Documentation 🚨

**SHOULD**: Document known failure modes with actual error messages.

**SHOULD**: Provide step-by-step debugging procedures.

**SHOULD**: Include failure mode catalog with quick reference table.

**When to Apply**:

- Troubleshooting guides
- Implementation documentation where failures are common
- Configuration guides with error-prone steps

**Pattern**:

```markdown
## Failure Mode Catalog

### FM-001: [Failure Name]

**Scenario**: [When this happens]

**Error Message**:
\```
[Actual error output]
\```

**Root Cause**: [Why it fails]

**Debug Steps**:
1. [Step 1]
2. [Step 2]

**Fix**:
\```bash
[Commands to fix]
\```
```

---

### Standard 9: Automated Testing 🤖

**SHOULD**: Provide automated testing scripts when possible.

**SHOULD**: Include pre-commit hooks for validation.

**SHOULD**: Provide CI validation examples.

**SHOULD**: Create Makefile targets for common validation tasks.

**When to Apply**:

- Creating validation procedures
- Documenting configuration that needs ongoing validation
- Implementation guides with testable outcomes

**Pattern**:

```markdown
## Automated Testing

### Validation Script

**💾 COPY-PASTE READY: [Script Name]**

Save as `[filename]`:

\```bash
#!/bin/bash
[complete validation script]
\```

**Usage**:
\```bash
chmod +x [filename]
./[filename]
\```

### Pre-commit Hook
[Hook setup instructions]

### CI Integration
[GitHub Actions workflow example]
```

---

### Standard 10: Markdown Formatting Patterns 📝

**MUST**: Use ATX-style headings (`#`, `##`, `###`) consistently throughout documents.

**MUST**: Avoid setext-style headings (underlines with `===` or `---`).

**MUST NOT**: Use `**Bold:**` followed by a single `-` on the next line - this is interpreted as a setext heading.

**SHOULD**: Use proper ATX headings (`### Label`) when structuring sections, not bold text.

**When to Apply**:

- All markdown documentation
- GitHub issue templates and PR templates
- README files and guides

**Pattern to AVOID**:

```markdown
**Benefits:**

-

<!-- BAD: The `**Benefits:**` + single `-` is interpreted as setext H2 heading -->
```

**Correct Pattern**:

```markdown
### Benefits

-

<!-- GOOD: Explicit ATX heading, clear structure -->
```

**Why This Matters**:

Markdown parsers interpret a line of text followed by a line containing only dashes (`---`) as a setext-style H2 heading. When you write `**Label:**` followed by a bullet point starting with `-`, some parsers see this as an unintended heading, causing:

- MD003 linting errors (heading style inconsistency)
- Broken document structure
- Unexpected rendering in different markdown viewers

**Validation**:

```bash
# Check for setext heading style issues
npx markdownlint-cli2 "**/*.md" --config .markdownlint-cli2.yaml
```

---

## ✅ VALIDATION CHECKLIST

Before finalizing documentation, verify:

### Core Standards (MUST)

- [ ] All claims validated through evidence (Standard 1)
- [ ] Specific line references provided (Standard 2)
- [ ] Code examples are copy-paste ready and tested (Standard 3)
- [ ] Validation commands included with expected outputs (Standard 4)
- [ ] Visual elements used appropriately (Standard 5)

### Enhanced Standards (SHOULD - when relevant)

- [ ] CI/CD impact documented if applicable (Standard 6)
- [ ] Go workspace alternative documented if relevant (Standard 7)
- [ ] Failure modes documented with debugging steps (Standard 8)
- [ ] Automated testing provided when possible (Standard 9)
- [ ] Markdown formatting follows ATX heading patterns (Standard 10)

### Quality Checks

- [ ] Document renders correctly in markdown viewer
- [ ] All code blocks have proper syntax highlighting
- [ ] All commands tested and produce expected output
- [ ] No sensitive information (API keys, passwords) in examples
- [ ] Consistent emoji usage throughout
- [ ] Tables properly formatted with alignment
- [ ] Internal links verified working
- [ ] File paths accurate for monorepo structure

---

## 📊 QUALITY METRICS

Track documentation quality using these metrics:

| Metric | Target | Measurement |
| -------- | -------- | ------------ |
| Evidence Completeness | 100% | All claims have verification method |
| Line Reference Coverage | 95%+ | Most code refs have line numbers |
| Copy-Paste Ready Blocks | 10+ | Count 💾 markers |
| Validation Commands | 1 per recommendation | Count verification commands |
| Visual Elements | 5+ | Count tables + flowcharts |
| CI/CD Coverage (if applicable) | Complete | Section present with examples |
| Failure Modes (if applicable) | 3+ | Count documented failure modes |
| Automated Tests (if applicable) | 1+ | Script provided |
| Markdown Lint Errors | 0 | Run markdownlint-cli2 |

---

## 🎯 APPLICATION WORKFLOW

When creating documentation:

1. **Initial Analysis**
   - Gather evidence through code inspection/testing
   - Document methodology and tools used
   - Record all findings with verification

2. **Document Structure**
   - Create Quick Navigation Index (if >200 lines)
   - Use clear hierarchical sections
   - Add visual elements for quick scanning

3. **Content Development**
   - Write evidence-backed claims
   - Provide specific line references
   - Create copy-paste ready examples
   - Include validation commands

4. **Enhancement (when relevant)**
   - Add CI/CD impact analysis
   - Document go.work alternatives
   - Catalog failure modes
   - Provide automated testing

5. **Validation**
   - Run through checklist
   - Test all commands and code
   - Verify markdown rendering
   - Calculate quality metrics

6. **Finalization**
   - Review for completeness
   - Verify no sensitive data
   - Add metadata (date, author, version)
   - Archive appropriately

---

## 🔗 REFERENCES

- **Detailed Examples**: Load `.serena/memories/documentation_best_practices` for templates
- **Expert Mode**: See `.claude/commands/expert-mode.md` for trigger patterns
- **Document Analysis Skill**: Use `/sc:document-analysis` for automatic application
- **Archive Structure**: See `documentation/README.md` for filing guidelines

---

**Last Updated**: 2026-01-17
**Version**: 1.1
**Applies To**: All comprehensive documentation in AI/MCP monorepo
**Review Cycle**: Quarterly or as standards evolve
