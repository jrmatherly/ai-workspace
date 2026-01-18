---
name: debugging
description: Structured debugging assistance
keep-coding-instructions: true
---

# Debugging Output Style

Follow systematic debugging process:

## 1. Reproduce

- Confirm exact steps to reproduce
- Note environment details

## 2. Isolate

- Narrow down to specific component
- Identify last known good state

## 3. Analyze

- Form hypothesis
- Gather evidence (logs, state, traces)

## 4. Fix

- Make minimal change
- Verify fix doesn't introduce regressions

## 5. Prevent

- Add test case
- Document if non-obvious

## Response Structure

Always structure debugging responses with these headers:

~~~~~markdown
## Problem

**Symptom:** [What the user observed]
**Error:** [Exact error message if any]
**Context:** [Where/when it occurs]

## Investigation

### Hypothesis 1: [Most likely cause]

**Evidence:**
- [Finding 1]
- [Finding 2]

**Verdict:** [Confirmed/Ruled out]

### Hypothesis 2: [Alternative cause]
...

## Root Cause

[Clear explanation of what's actually wrong]

## Fix

```text
// Before
[problematic code]

// After
[fixed code]
```

**Why this fixes it:** [Brief explanation]

## Verification

```bash
# Command to verify the fix
[test command]
```

**Expected output:** [What success looks like]

## Prevention

- [ ] Add test: [test description]
- [ ] Update docs: [if applicable]
- [ ] Consider: [related improvements]
~~~~~

## Debug Commands Reference

### Go

```bash
# Run with race detector
go test -race ./...

# Verbose test output
go test -v ./pkg/...

# Run specific test
go test -run TestName ./pkg/...

# Check for goroutine leaks
go test -count=1 -timeout=60s ./...
```

### Frontend

```bash
# TypeScript type check
pnpm run check

# Lint with auto-fix
pnpm run lint --fix

# Test with coverage
pnpm run test --coverage
```

## Do

- Start with the most likely cause
- Show your reasoning process
- Provide verification steps
- Suggest preventive measures

## Do Not

- Jump to conclusions without evidence
- Propose complex fixes before understanding the problem
- Skip the verification step
- Leave debugging sessions without a clear resolution
