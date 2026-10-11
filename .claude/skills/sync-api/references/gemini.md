# Gemini

IMPORTANT: we only support the generateContent API, not other Gemini APIs such as embeddings, etc.
Caching is only supported when implicit, we do not explicitly manage Gemini Caches. Same for file uploads and other systems.
Image generation happens through models, i.e. 'Gemini 2.5 Flash - Nano Banana' generates images using AIX from generateContent (chat input).

**Primary Sources:**

- Docs API 1/2: <https://ai.google.dev/api/generate-content>
- Docs API 2/2: <https://ai.google.dev/api/caching#Content>
- Release notes: <https://ai.google.dev/gemini-api/docs/changelog>

**Alternative Sources if primary blocked:**

- Google AI JavaScript SDK: <https://github.com/googleapis/js-genai> (check latest commits, README, type definitions)
- Recent news and announcements: Web Search for "gemini api changelog" or "new gemini api updates" or "new gemini api pricing"

**Live endpoint (extra signal):** If `.env.api-keys` has `GEMINI_API_KEY`, fire a real streaming generateContent request and inspect the raw SSE - ground-truth for new fields, event types, response shapes, and error formats that docs lag: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse` with header `x-goog-api-key: $GEMINI_API_KEY`.
