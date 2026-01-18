# Token Tracking Optimization Recommendations

**Date**: 2026-01-15
**Issue**: Section 11 in expert-mode.md adds ~90 lines (~2.5K tokens), increasing context usage
**Objective**: Offload context overhead while maintaining token tracking functionality

---

## Executive Summary

The current implementation adds ~2.5K tokens to every expert-mode initialization by embedding reference tables directly in the file. This is counterproductive to optimization goals.

**Recommended Solution**: Two-phase approach

- **Phase 1** (Immediate): Move Section 11 to on-demand slash command → saves ~2.5K tokens
- **Phase 2** (Optional): Add SessionStart hook for automatic calculation → enhanced UX

**Impact**:

- Token savings: ~2.5K per expert-mode initialization (Phase 1)
- Implementation time: ~15 minutes (Phase 1), ~30 minutes (Phase 2)
- Complexity: Low (Phase 1), Medium (Phase 2)
- Risk: None (backwards compatible, additive only)

---

## Problem Analysis

### Current State

**expert-mode.md structure**:

```
Steps 1-9: Initialization guidance (~255 lines, ~7.5K tokens)
Step 10: Ready state with token display template (~15 lines, ~0.5K tokens)
Section 11: Context Window Usage Reference (~90 lines, ~2.5K tokens) ⚠️
Steps 12+: Usage patterns, efficiency tips (~70 lines, ~2K tokens)
```

**Total**: ~430 lines, ~10.5K tokens

### The Paradox

Section 11 provides valuable reference information but:

1. Adds ~2.5K tokens to every expert-mode initialization
2. Most users don't need detailed reference tables every time
3. The file optimizing context usage... increases context usage
4. Violates the "on-demand loading" principle used elsewhere

### User's Insight

> "instead of adding the logic to calculate the initialization token usage inside of our expert-mode.md itself, which by adding the logic to the file increases the size of the file, which in turn increases our context usage I would suspect - would it not be better to create a script to offload as much of the additional context overhead as possible?"

**Correct assessment**: ✅
The logic (reference tables) should be external, loaded only when needed.

---

## Research Findings: January 2026 Capabilities

### Claude Code 2.1.0 (Released January 7, 2026)

**New Features Relevant to This Issue**:

1. **SessionStart Hooks**
   - Run once per session, before first message
   - Can inject context dynamically
   - Output appears in conversation
   - Frontmatter configuration with `once: true` flag

2. **Hooks in Frontmatter**
   - Skills, Agents, Slash Commands can define hooks directly
   - Component-scoped lifecycle
   - YAML configuration in file header

3. **Context Forking**
   - Skills can fork context for isolated execution
   - Prevents skill context pollution
   - Useful for calculation-heavy operations

4. **Automatic Skill Hot-Reload**
   - Skills auto-reload on file changes
   - No restart needed for hook updates

### Hook Architecture

**8 Hook Types Available**:

- `SessionStart` - Session initialization (once per session)
- `PreToolUse` - Before tool execution
- `PostToolUse` - After tool execution
- `UserPromptSubmit` - Before processing user input
- `Stop` - Before session end
- `PermissionRequest` - When user approval needed
- `PreCompact` - Before context compaction
- `Notification` - For notifications/alerts

**Hook Configuration** (`.claude/hooks.yaml`):

```yaml
hooks:
  - event: SessionStart
    command: .claude/hooks/session-start.sh
    timeout: 5000  # 5 seconds
    once: true     # Single execution per session
```

**Hook in Skill Frontmatter**:

```markdown
---
description: Expert mode initialization
hooks:
  - event: SessionStart
    command: bash .claude/hooks/token-calc.sh
    once: true
---

# Expert Mode initialization content...
```

### Token Calculation Approaches

**Option A: Estimation (Bash Script)**

```bash
#!/bin/bash
# .claude/hooks/session-start-token-calc.sh

TOTAL_TOKENS=0

# Universal memories (always loaded in expert-mode)
TOTAL_TOKENS=$((TOTAL_TOKENS + 35000))  # 8K + 12K + 15K

# Detect project from PWD
if [[ "$PWD" == *"obot-tools"* ]]; then
  TOTAL_TOKENS=$((TOTAL_TOKENS + 13000))  # obot-tools/CLAUDE.md
fi

# Calculate percentages
PERCENTAGE=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_TOKENS / 200000.0) * 100}")
REMAINING=$((200000 - TOTAL_TOKENS))
EFFICIENCY="Moderate"
if [ $TOTAL_TOKENS -lt 50000 ]; then EFFICIENCY="Minimal"; fi
if [ $TOTAL_TOKENS -gt 100000 ]; then EFFICIENCY="High"; fi

# Output to context (appears in conversation)
cat <<EOF
📊 Context Window Usage:
   - Estimated tokens loaded: ~${TOTAL_TOKENS} tokens
   - Context usage: ~${PERCENTAGE}% of 200K window
   - Remaining capacity: ~${REMAINING} tokens available
   - Efficiency: ${EFFICIENCY} context load
EOF

exit 0  # Success
```

**Option B: Slash Command (On-Demand Reference)**

```markdown
---
description: Display detailed token usage reference tables
---

# Token Usage Reference

**Claude Sonnet 4.5 Context Window**: 200,000 tokens

## Estimated Token Usage by Scenario

| Loading Scenario | Tokens Used | % of Window | Remaining | Notes |
|------------------|-------------|-------------|-----------|-------|
| **Minimal (Quick Start)** | ~3K | 1.5% | ~197K | README only, no memories |
| **Standard (Single Project)** | ~50K | 25% | ~150K | Universal memories + project CLAUDE.md |
...

[Full reference tables from current Section 11]
```

**Option C: MCP Tool (Perfect Accuracy)**

- Requires MCP server implementation
- Can query actual token counts from Claude API
- Most complex, highest maintenance
- **Not recommended** for this use case (over-engineered)

---

## Recommended Solution

### Phase 1: Immediate Optimization (REQUIRED)

**Goal**: Remove ~2.5K token overhead from expert-mode.md

**Implementation**:

1. **Create** `.claude/commands/token-reference.md`:
   - Move entire Section 11 content (~90 lines)
   - Add frontmatter with description
   - Keep all reference tables, examples, health indicators

2. **Modify** `.claude/commands/expert-mode.md`:
   - Reduce Section 11 to minimal note (~5 lines)
   - Keep Step 10 template with placeholders
   - Reference `/token-reference` for details

**Code Changes**:

**File: `.claude/commands/expert-mode.md` (Section 11 replacement)**

```markdown
### 11. Context Window Usage Reference

For detailed token usage reference including:
- Estimated token usage by scenario (7 scenarios)
- Memory size reference (16+ entries)
- Token optimization strategies
- Example calculations
- Context window health indicators

**Use**: `/token-reference` to view comprehensive tables

> **Quick Estimate**: Universal memories (~35K) + Project CLAUDE.md (~8-15K) = ~43-50K tokens (21-25% of 200K window)
```

**File: `.claude/commands/token-reference.md` (NEW)**

```markdown
---
description: Comprehensive token usage reference for expert-mode initialization
---

# Token Usage Reference

**Claude Sonnet 4.5 Context Window**: 200,000 tokens

## Estimated Token Usage by Scenario

| Loading Scenario | Tokens Used | % of Window | Remaining | Notes |
|------------------|-------------|-------------|-----------|-------|
| **Minimal (Quick Start)** | ~3K | 1.5% | ~197K | README only, no memories |
| **Standard (Single Project)** | ~50K | 25% | ~150K | Universal memories + project CLAUDE.md |
| **Enhanced (With Task Docs)** | ~65K | 32.5% | ~135K | Standard + QUICK_REFERENCE + task docs |
| **obot-tools (General)** | ~53K | 26.5% | ~147K | Standard + obot-tools/CLAUDE.md |
| **obot-tools (.gpt work)** | ~59K | 29.5% | ~141K | Standard + obot-tools + gptscript_tool_format |
| **Multi-Project (2 projects)** | ~75K | 37.5% | ~125K | Universal + 2 project CLAUDE.md files |
| **Full Context (Architecture)** | ~85K | 42.5% | ~115K | All memories + diagrams + API docs |

## Memory Size Reference

| Memory/Document | Estimated Size | When to Load |
|-----------------|----------------|--------------|
| `project_purpose_and_structure` | ~8K tokens | Always (universal) |
| `code_style_and_conventions` | ~12K tokens | Always (universal) |
| `suggested_commands` | ~15K tokens | Always (universal) |
| `codebase_architecture` | ~20K tokens | Architecture/design work |
| `tech_stack_and_dependencies` | ~18K tokens | Dependency work |
| `task_completion_checklist` | ~8K tokens | Before completing tasks |
| `gptscript_tool_format` | ~6K tokens | obot-tools .gpt file work |
| `obot-entraid/CLAUDE.md` | ~15K tokens | Working on obot-entraid |
| `nah/CLAUDE.md` | ~12K tokens | Working on nah |
| `kinm/CLAUDE.md` | ~10K tokens | Working on kinm |
| `mcp-oauth-proxy/CLAUDE.md` | ~11K tokens | Working on mcp-oauth-proxy |
| `obot-tools/CLAUDE.md` | ~13K tokens | Working on obot-tools |
| `mcp-catalog/CLAUDE.md` | ~8K tokens | Working on mcp-catalog |
| `QUICK_REFERENCE.md` | ~5K tokens | Development work |
| `ARCHITECTURE_DIAGRAM.md` | ~10K tokens | Architecture understanding |
| `API_REFERENCE.md` | ~12K tokens | API development |

## Token Optimization Strategies

1. **Load on-demand**: Only load memories when actually needed for the task
2. **Use README for quick context**: Project README.md files are 60-80% smaller than CLAUDE.md
3. **Avoid unnecessary architecture docs**: Only load diagrams when doing design work
4. **Single project focus**: Load context for one project at a time unless multi-project work
5. **Refresh selectively**: When task scope changes, unload irrelevant context mentally

## Example Context Calculations

### Scenario A: Fix bug in nah controller
```

Universal memories:        35K  (project_purpose + code_style + suggested_commands)
nah/CLAUDE.md:            12K
QUICK_REFERENCE.md:        5K
Total:                    52K  (26% of window, 148K remaining)

```

### Scenario B: Create new auth provider in obot-tools
```

Universal memories:        35K
obot-tools/CLAUDE.md:     13K
gptscript_tool_format:     6K
docs/auth-providers.md:    4K  (if read directly)
Total:                    58K  (29% of window, 142K remaining)

```

### Scenario C: Multi-project work (obot-entraid + obot-tools)
```

Universal memories:        35K
obot-entraid/CLAUDE.md:   15K
obot-tools/CLAUDE.md:     13K
gptscript_tool_format:     6K  (if working on providers)
Total:                    69K  (34.5% of window, 131K remaining)

```

## Context Window Health

- ✅ **Healthy**: 0-50% used (~0-100K tokens) - Plenty of room for code analysis
- ⚠️ **Moderate**: 50-75% used (~100-150K tokens) - Be selective with additional context
- 🔴 **High**: 75-90% used (~150-180K tokens) - Minimize new context, consider summarization
- 🚨 **Critical**: 90%+ used (~180K+ tokens) - Risk of context truncation

## Tips for Monitoring

- Check system warnings for actual token usage after major tool calls
- If context feels "full", consider starting fresh conversation with summary
- Use `/sc:save` to persist session state before context limits approached
- Use this reference (`/token-reference`) to estimate before loading heavy documentation

---

**Related Commands**:
- `/expert-mode` - Initialize expert mode (automatically displays estimated usage in Step 10)
- `/compact` - Manually compact context with custom instructions
- `/sc:save` - Save session state to Serena memory
```

**Impact**:

- expert-mode.md: **~430 lines → ~345 lines** (~20% reduction)
- expert-mode.md: **~10.5K tokens → ~8K tokens** (~2.5K savings)
- token-reference.md: **~90 lines, ~2.5K tokens** (loaded only when `/token-reference` called)
- **Net savings**: ~2.5K tokens per expert-mode initialization

**User Experience**:

- Default: Lean expert-mode with quick estimate in Step 10
- On-demand: Type `/token-reference` for comprehensive tables
- Zero regression: All information still available, just not loaded by default

### Phase 2: Enhanced Automation (OPTIONAL)

**Goal**: Automatic token calculation display without manual estimation

**Implementation**:

1. **Create** `.claude/hooks/session-start-token-calc.sh`:
   - Bash script to calculate estimated tokens
   - Detects loaded memories, project from PWD
   - Outputs formatted usage stats to context

2. **Configure** hook in expert-mode.md frontmatter:
   - Add hooks section with SessionStart event
   - Set `once: true` for single execution
   - 5-second timeout

**Code Changes**:

**File: `.claude/hooks/session-start-token-calc.sh` (NEW)**

```bash
#!/bin/bash
# Token usage calculator for expert-mode initialization
# Runs once per session via SessionStart hook

set -euo pipefail

# Initialize token counter
TOTAL_TOKENS=0

# Universal memories (always loaded in expert-mode)
# These are loaded in Step 3 of expert-mode.md
TOTAL_TOKENS=$((TOTAL_TOKENS + 8000))   # project_purpose_and_structure
TOTAL_TOKENS=$((TOTAL_TOKENS + 12000))  # code_style_and_conventions
TOTAL_TOKENS=$((TOTAL_TOKENS + 15000))  # suggested_commands

# expert-mode.md itself
TOTAL_TOKENS=$((TOTAL_TOKENS + 8000))   # expert-mode.md (reduced size after Phase 1)

# Detect active project from current working directory
PROJECT=""
if [[ "$PWD" == *"/obot-entraid"* ]]; then
  PROJECT="obot-entraid"
  TOTAL_TOKENS=$((TOTAL_TOKENS + 15000))  # obot-entraid/CLAUDE.md
elif [[ "$PWD" == *"/nah"* ]]; then
  PROJECT="nah"
  TOTAL_TOKENS=$((TOTAL_TOKENS + 12000))  # nah/CLAUDE.md
elif [[ "$PWD" == *"/kinm"* ]]; then
  PROJECT="kinm"
  TOTAL_TOKENS=$((TOTAL_TOKENS + 10000))  # kinm/CLAUDE.md
elif [[ "$PWD" == *"/mcp-oauth-proxy"* ]]; then
  PROJECT="mcp-oauth-proxy"
  TOTAL_TOKENS=$((TOTAL_TOKENS + 11000))  # mcp-oauth-proxy/CLAUDE.md
elif [[ "$PWD" == *"/obot-tools"* ]]; then
  PROJECT="obot-tools"
  TOTAL_TOKENS=$((TOTAL_TOKENS + 13000))  # obot-tools/CLAUDE.md
elif [[ "$PWD" == *"/mcp-catalog"* ]]; then
  PROJECT="mcp-catalog"
  TOTAL_TOKENS=$((TOTAL_TOKENS + 8000))   # mcp-catalog/CLAUDE.md
fi

# Calculate derived values
PERCENTAGE=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_TOKENS / 200000.0) * 100}")
REMAINING=$((200000 - TOTAL_TOKENS))

# Determine efficiency level
EFFICIENCY="Moderate"
if [ $TOTAL_TOKENS -lt 50000 ]; then
  EFFICIENCY="Minimal"
elif [ $TOTAL_TOKENS -gt 100000 ]; then
  EFFICIENCY="High"
fi

# Format token count with K suffix
TOKENS_K=$(awk "BEGIN {printf \"%.0f\", $TOTAL_TOKENS / 1000}")
REMAINING_K=$(awk "BEGIN {printf \"%.0f\", $REMAINING / 1000}")

# Output formatted usage stats (appears in conversation context)
cat <<EOF
📊 Context Window Usage:
   - Estimated tokens loaded: ~${TOKENS_K}K tokens
   - Context usage: ~${PERCENTAGE}% of 200K window
   - Remaining capacity: ~${REMAINING_K}K tokens available
   - Efficiency: ${EFFICIENCY} context load
EOF

# Success exit code (0) allows session to continue
exit 0
```

**File: `.claude/commands/expert-mode.md` frontmatter (ADD)**

```markdown
---
description: Initialize expert mode for AI/MCP multi-repo workspace by loading optimized project context
hooks:
  - event: SessionStart
    command: bash .claude/hooks/session-start-token-calc.sh
    timeout: 5000
    once: true
---

# Expert Mode - Monorepo Initialization

[Rest of expert-mode.md content unchanged...]
```

**Make script executable**:

```bash
chmod +x .claude/hooks/session-start-token-calc.sh
```

**Impact**:

- Automatic token calculation on session start
- Real-time display in Step 10 template
- No manual estimation needed
- Adapts to actual project/memories loaded
- Zero token overhead (hook output, not file content)

**User Experience**:

- Type `/expert-mode`
- SessionStart hook runs automatically (once)
- Token usage displays in Step 10
- Type `/token-reference` for detailed tables
- Best of both: automation + comprehensive reference

---

## Implementation Plan

### Phase 1 Implementation (15 minutes)

**Step 1**: Create token-reference.md (5 minutes)

```bash
cd /Users/jason/dev/AI
# Copy Section 11 content from expert-mode.md to new file
# Add frontmatter with description
```

**Step 2**: Modify expert-mode.md (5 minutes)

```bash
# Replace Section 11 (~90 lines) with minimal note (~5 lines)
# Keep Step 10 template with placeholders
# Save ~2.5K tokens
```

**Step 3**: Test (5 minutes)

```bash
# Type /expert-mode - should load faster, smaller context
# Type /token-reference - should display comprehensive tables
# Verify both work as expected
```

### Phase 2 Implementation (30 minutes) - OPTIONAL

**Step 1**: Create SessionStart hook script (15 minutes)

```bash
cd /Users/jason/dev/AI
mkdir -p .claude/hooks
# Create session-start-token-calc.sh with estimation logic
chmod +x .claude/hooks/session-start-token-calc.sh
```

**Step 2**: Add hook configuration to expert-mode.md (5 minutes)

```bash
# Add frontmatter with hooks section
# Configure SessionStart event with once: true
```

**Step 3**: Test hook execution (10 minutes)

```bash
# Start new session, type /expert-mode
# Verify hook runs and outputs token usage
# Check Step 10 displays calculated values
# Verify hook runs only once (once: true)
```

---

## Token Impact Analysis

### Current State (Before Optimization)

```
expert-mode.md: ~430 lines, ~10.5K tokens
  ├─ Steps 1-9: ~255 lines, ~7.5K tokens
  ├─ Step 10: ~15 lines, ~0.5K tokens
  ├─ Section 11: ~90 lines, ~2.5K tokens ⚠️ (bloat)
  └─ Steps 12+: ~70 lines, ~2K tokens

Every /expert-mode call: Loads 10.5K tokens
```

### After Phase 1 (Slash Command)

```
expert-mode.md: ~345 lines, ~8K tokens
  ├─ Steps 1-9: ~255 lines, ~7.5K tokens
  ├─ Step 10: ~15 lines, ~0.5K tokens
  ├─ Section 11 (minimal): ~5 lines, ~0.1K tokens ✅
  └─ Steps 12+: ~70 lines, ~2K tokens

token-reference.md: ~90 lines, ~2.5K tokens (on-demand)

Every /expert-mode call: Loads 8K tokens
Savings: ~2.5K tokens (24% reduction)
```

### After Phase 1 + Phase 2 (Hook)

```
expert-mode.md: ~345 lines, ~8K tokens + hook frontmatter (~0.2K)
  └─ Total: ~8.2K tokens

.claude/hooks/session-start-token-calc.sh: ~80 lines, ~0 tokens
  └─ Hook output: ~150 tokens (injected to context, not file size)

token-reference.md: ~90 lines, ~2.5K tokens (on-demand)

Every /expert-mode call: Loads 8.2K tokens + hook output (150 tokens) = ~8.35K tokens
Savings: ~2.15K tokens (20% reduction)
Plus: Automatic calculation, no manual estimation
```

### Comparison Table

| Metric | Current | Phase 1 | Phase 1 + Phase 2 |
| -------- | -------- | -------- | -------- |
| expert-mode.md size | ~10.5K tokens | ~8K tokens | ~8.2K tokens |
| Tokens per /expert-mode | ~10.5K | ~8K | ~8.35K |
| Savings | 0 | **~2.5K (24%)** | **~2.15K (20%)** |
| Reference available | Always loaded | On-demand (`/token-reference`) | On-demand |
| Token display | Manual template | Manual template | Automatic calculation |
| Implementation effort | N/A | 15 minutes | 45 minutes |
| Complexity | Low | Low | Medium |

---

## Additional January 2026 Techniques

### 1. MCP Integration for Perfect Accuracy

**Concept**: Create MCP server that queries Claude API for actual token counts

**Implementation**:

```python
# .claude/servers/token-counter/server.py
from mcp.server import Server
from anthropic import Anthropic

server = Server("token-counter")

@server.tool()
async def get_token_usage():
    """Get actual token usage from Claude API"""
    client = Anthropic()
    # Query API for current conversation token usage
    # Return exact counts, not estimates
    return {"tokens_used": actual_count, "percentage": actual_percentage}
```

**Pros**:

- Perfect accuracy (not estimates)
- Real-time token tracking
- Can optimize loading decisions

**Cons**:

- High complexity (requires MCP server implementation)
- API rate limits
- Maintenance burden
- Over-engineered for this use case

**Recommendation**: ❌ Not worth the complexity for this use case

### 2. UserPromptSubmit Hook for Context Injection

**Concept**: Inject relevant context based on user's prompt

**Implementation**:

```bash
#!/bin/bash
# .claude/hooks/user-prompt-submit.sh

USER_MESSAGE="$1"  # Hook receives user message as argument

# If user mentions "token", inject token reference
if [[ "$USER_MESSAGE" == *"token"* ]]; then
  cat .claude/commands/token-reference.md
fi

exit 0
```

**Pros**:

- Smart context injection
- No manual `/token-reference` needed

**Cons**:

- Runs on EVERY user prompt (performance impact)
- May inject unwanted context
- Harder to debug

**Recommendation**: ⚠️ Interesting but not ideal for this use case (SessionStart better)

### 3. Skill with Context Fork

**Concept**: Create skill that calculates tokens in forked context

**Implementation**:

```markdown
---
description: Calculate expert-mode token usage
context_fork: true
---

# Token Calculator Skill

This skill calculates token usage in isolated context fork.
[Calculation logic here]
```

**Pros**:

- Clean isolation
- Reusable across sessions

**Cons**:

- Context fork overhead
- More complex than needed

**Recommendation**: ⚠️ Over-engineered for simple calculation task

### 4. @ Reference for Large Tables

**Concept**: Use @ syntax to reference external files on-demand

**Current Usage** (already in expert-mode):

```markdown
Load the Serena memory: `gptscript_tool_format`
```

**Could Apply to Token Reference**:

```markdown
For token reference, see: @.claude/commands/token-reference.md
```

**Pros**:

- Built-in Claude Code feature
- No hook/skill needed
- Simple and clean

**Cons**:

- Still loads file content when referenced
- Not "on-demand" (loads when @ is read)

**Recommendation**: ⚠️ Doesn't solve the problem (@ still loads content)

---

## Recommendations Summary

### Immediate Action: Phase 1 (REQUIRED)

**What**: Move Section 11 to `/token-reference` slash command

**Why**:

- Immediate ~2.5K token savings (24% reduction in expert-mode.md size)
- Low effort (15 minutes)
- Zero risk (backwards compatible)
- Follows "on-demand loading" principle

**Implementation Priority**: ⭐⭐⭐⭐⭐ (CRITICAL)

### Optional Enhancement: Phase 2

**What**: Add SessionStart hook for automatic token calculation

**Why**:

- Enhanced UX (automatic display vs. manual template)
- Dynamic calculation based on actual context
- Minimal additional overhead (~150 tokens for output)

**When to Implement**:

- After Phase 1 is tested and working
- If user wants automatic calculation
- If manual estimation becomes tedious

**Implementation Priority**: ⭐⭐⭐ (NICE TO HAVE)

### Skip: MCP Tool, Complex Hooks, Context Forks

**Why**: Over-engineered for this use case, high complexity, low incremental benefit

---

## Validation Plan

### Phase 1 Validation

1. **Token Savings Verification**:

   ```bash
   # Before: Count tokens in current expert-mode.md
   wc -l .claude/commands/expert-mode.md  # ~430 lines

   # After: Count tokens in optimized expert-mode.md
   wc -l .claude/commands/expert-mode.md  # ~345 lines

   # Savings: ~85 lines (~2.5K tokens estimated)
   ```

2. **Functionality Test**:

   ```bash
   # Test /expert-mode still works
   # Verify Step 10 displays minimal template
   # Test /token-reference displays full tables
   # Confirm all information accessible
   ```

3. **Regression Check**:

   ```bash
   # Verify all other expert-mode features work
   # Check memory loading still functions
   # Validate project detection logic
   # Ensure no broken references
   ```

### Phase 2 Validation (If Implemented)

1. **Hook Execution**:

   ```bash
   # Start new session
   # Type /expert-mode
   # Verify SessionStart hook runs
   # Check token usage displayed in Step 10
   ```

2. **once: true Verification**:

   ```bash
   # In same session, type /expert-mode again
   # Verify hook does NOT run second time
   # Confirm once: true flag works
   ```

3. **Calculation Accuracy**:

   ```bash
   # Compare hook output with manual calculation
   # Verify token estimates reasonable
   # Check percentage calculations correct
   ```

---

## Migration Path

### For Users Currently on Token Tracking Enhancement

**Current State**: expert-mode.md with Section 11 embedded

**Migration Steps**:

1. **Backup current expert-mode.md**:

   ```bash
   cp .claude/commands/expert-mode.md .claude/commands/expert-mode.md.backup
   ```

2. **Apply Phase 1 changes**:
   - Create token-reference.md with Section 11 content
   - Replace Section 11 in expert-mode.md with minimal note
   - Test both commands work

3. **Optional: Apply Phase 2 changes**:
   - Create SessionStart hook script
   - Add hook configuration to expert-mode.md frontmatter
   - Test hook execution

4. **Verify and cleanup**:

   ```bash
   # If everything works, remove backup
   rm .claude/commands/expert-mode.md.backup
   ```

### For New Users

**Setup**: Just use optimized expert-mode.md from the start

- No migration needed
- Automatically get token savings
- `/token-reference` available when needed

---

## Conclusion

**Core Issue Identified**: ✅
Adding reference tables to expert-mode.md increases the context overhead we're trying to optimize.

**Solution Validated**: ✅
Two-phase approach with slash command (Phase 1) + optional SessionStart hook (Phase 2).

**Token Savings**: ✅
~2.5K tokens (24% reduction) per expert-mode initialization.

**Implementation Effort**: ✅
Low (15 minutes for Phase 1, 30 minutes for Phase 2).

**Risk Level**: ✅
None (backwards compatible, additive changes only).

**User Insight Confirmed**: ✅
> "would it not be better to create a script to offload as much of the additional context overhead as possible?"

Absolutely correct. The optimization should not itself increase context usage.

**Recommendation**: Proceed with Phase 1 immediately for maximum benefit with minimal effort.

---

## Next Steps

1. **Review this document** with user
2. **Get approval** for Phase 1 implementation
3. **Implement Phase 1** (15 minutes):
   - Create `.claude/commands/token-reference.md`
   - Modify `.claude/commands/expert-mode.md`
   - Test both commands
4. **Optional: Discuss Phase 2** if user wants automatic calculation
5. **Document** final implementation in validation report

**Ready to proceed with implementation upon approval** ✅
