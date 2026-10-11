# Gemini

Model file: `src/modules/llms/server/gemini/gemini.models.ts`.

**Primary Sources:**
- Models: https://ai.google.dev/gemini-api/docs/models
- Pricing: https://ai.google.dev/gemini-api/docs/pricing
- Changelog: https://ai.google.dev/gemini-api/docs/changelog
- Deprecations: https://ai.google.dev/gemini-api/docs/deprecations - the authoritative table of release + shutdown dates per model id; it overrides dates inferred from the changelog. "No shutdown date announced" means the def must carry NO `deprecated` field (Google does not auto-retire a stable model one year after release)

**Fallbacks if blocked:** Check Google AI JS SDK at https://github.com/googleapis/js-genai, search "gemini models latest pricing", "gemini latest models", or search GitHub for latest model prices and context windows

**Live endpoint (extra signal):** If `.env.api-keys` has `GEMINI_API_KEY`, scan the served model list as ground-truth for what's new/available and cross-check the docs above: `curl "https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000" -H "x-goog-api-key: $GEMINI_API_KEY"`. `pageSize` is required: the default is 50 and the tail (newest models included) is silently dropped behind a `nextPageToken`. When looping ids in zsh, write `${m}:generateContent` - bare `$m:ge...` is eaten as a zsh history modifier and every probe silently 404s.

**Listed != reachable:** the list endpoint keeps returning models that 404 on `generateContent` (`filterNotFoundModelNames`), and returns retired-preview aliases that still serve (sometimes routed to their successor - check `modelVersion` in the response). Re-verify both with a 1-token POST per suspect id before adding or removing a def.

**Vendor-specific rules:**
- Ignore context windows (auto-determined at runtime) and training cutoffs (not supported)
- Do NOT remove comments
