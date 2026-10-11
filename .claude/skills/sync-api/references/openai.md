# OpenAI

IMPORTANT: we prioritize the new Responses API, while Chat Completions is still supported but legacy.
We do NOT support other APIs such as Realtime (incl. websockets), etc.
We also do not support Agentic APIs (Agent SDK, AgentKit, ChatKit, Assistants API etc), as we perform similar functionality in AIX (server or client side).

**Primary Sources:** (append `.md` to any `developers.openai.com` URL for markdown)

- Responses API (AIX prioritizes it): <https://developers.openai.com/api/reference/resources/responses/methods/create>
- Chat Completions API: <https://developers.openai.com/api/reference/resources/chat> (streaming events: <https://developers.openai.com/api/reference/resources/chat/subresources/completions/streaming-events>)
- Changelog: <https://developers.openai.com/api/docs/changelog>
- Models: <https://developers.openai.com/api/docs/models>
- Pricing: <https://developers.openai.com/api/docs/pricing>
- Endpoint reference index: <https://developers.openai.com/api/reference/llms.txt>

**Alternative Sources if primary blocked:**

- OpenAI Node.js SDK: <https://github.com/openai/openai-node>
- OpenAI Python SDK: <https://github.com/openai/openai-python>
- OpenAI OpenAPI spec: <https://github.com/openai/openai-openapi>
- Recent news and announcements: Web Search for "openai api changelog" or "openai new models" or "openai new prices"

**Live endpoint (extra signal):** If `.env.api-keys` has `OPENAI_API_KEY`, fire a real streaming request and inspect the raw SSE - ground-truth for new fields, event types, response shapes, and error formats that docs lag: `POST https://api.openai.com/v1/responses` (or legacy `/v1/chat/completions`), `"stream":true`.
