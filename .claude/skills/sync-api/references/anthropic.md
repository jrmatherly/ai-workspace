# Anthropic

IMPORTANT: we only support the Messages API (message create). We do NOT support other APIs such as the older Completions API.
We support Anthropic caching natively, and want to make sure tools and state (crafting the history) are also done well.

**Primary Sources:**
- Docs API: https://platform.claude.com/docs/en/api/messages
- Release notes: https://platform.claude.com/docs/en/release-notes/overview
- Tools use: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
- Handling stop reasons: https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons

**Alternative Sources if primary blocked:**
- Anthropic TypeScript SDK: https://github.com/anthropics/anthropic-sdk-typescript
- Anthropic Python SDK: https://github.com/anthropics/anthropic-sdk-python
- Recent news and announcements: Web Search for "anthropic api changelog" or "new claude api" or "new claude api pricing"

**Live endpoint (extra signal):** If `.env.api-keys` has `ANTHROPIC_API_KEY`, fire a real streaming Messages request and inspect the raw SSE - ground-truth for new fields, event types, response shapes, and error formats that docs lag: `POST https://api.anthropic.com/v1/messages` (`"stream":true`, headers `x-api-key: $ANTHROPIC_API_KEY` + `anthropic-version`).
