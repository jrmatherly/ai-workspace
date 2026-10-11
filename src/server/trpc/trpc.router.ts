import { createTRPCRouter } from './trpc.server';

import { aixRouter } from '~/modules/aix/server/api/aix.router';
import { backendRouter } from '~/modules/backend/backend.router';
import { browseRouter } from '~/modules/browse/browse.router';
import { googleSearchRouter } from '~/modules/google/search.router';
import { llmAnthropicRouter } from '~/modules/llms/server/anthropic/anthropic.router';
import { llmBedrockRouter } from '~/modules/llms/server/bedrock/bedrock.router';
import { llmGeminiRouter } from '~/modules/llms/server/gemini/gemini.router';
import { llmOllamaRouter } from '~/modules/llms/server/ollama/ollama.router';
import { llmOpenAIRouter } from '~/modules/llms/server/openai/openai.router';
import { speexRouter } from '~/modules/speex/protocols/rpc/rpc.router';
import { tradeRouter } from '~/modules/trade/server/trade.router';
import { youtubeRouter } from '~/modules/youtube/youtube.router';

/**
 * The one tRPC router, served from app/api/trpc on the Node.js runtime.
 * Until 2026-10 it was two: an Edge router for AI streaming and a Node router for data ops (browse, trade).
 */
export const appRouter = createTRPCRouter({
  aix: aixRouter,
  backend: backendRouter,
  browse: browseRouter,
  googleSearch: googleSearchRouter,
  llmAnthropic: llmAnthropicRouter,
  llmBedrock: llmBedrockRouter,
  llmGemini: llmGeminiRouter,
  llmOllama: llmOllamaRouter,
  llmOpenAI: llmOpenAIRouter,
  speex: speexRouter, // synthesize, listVoices (multi-provider TTS)
  trade: tradeRouter,
  youtube: youtubeRouter,
});

export type AppRouter = typeof appRouter;
