# Audio Call Flow

As of 2026-10-11.

```text
speakText(inputText, voiceSelector, options?, signal?, chunkedCallbacks?)   ← TTS, speex.client.ts
│    cleans and chunks the text
│
└─ _speakRawText_withHandle(rawText, voiceSelector, rpcOptions?)
     │    resolves the engine, returns { synthesisComplete, playbackComplete, stop }
     │
     ├─ [RPC: elevenlabs/gemini/inworld/openai/localai]
     │    │
     │    ├─ speexSynthesize_RPC()                ← protocols/rpc/rpc.client.ts
     │    │    ├─ tRPC speex.synthesize           ← streaming mutation, /api/trpc (Node)
     │    │    ├─ or speexRpcCoreSynthesize       ← CSF, when _shouldUseCSF(engine)
     │    │    └─ particles: start, audio (chunk or whole buffer), done
     │    │
     │    └─ AudioAutoPlayer                      ← picks strategy per browser
     │         │    streaming when MediaSource.isTypeSupported('audio/mpeg'),
     │         │    evaluated once at module load in AudioLivePlayer.ts;
     │         │    disableLivePlayback forces accumulated
     │         │
     │         ├─ [streaming: Chrome/Safari/Edge]
     │         │    │
     │         │    └─ AudioLivePlayer
     │         │         ├─ new Audio()
     │         │         ├─ new AudioContext()
     │         │         ├─ new MediaSource()
     │         │         ├─ addSourceBuffer('audio/mpeg')
     │         │         ├─ enqueueChunk() → appendBuffer()  ← plays live as chunks arrive
     │         │         ├─ endPlayback() → endOfStream()
     │         │         ├─ waitForPlaybackEnd() → 'ended' event
     │         │         └─ stop() → pause + abort + close
     │         │
     │         └─ [accumulated: Firefox fallback]
     │              │
     │              ├─ enqueueChunk() → buffer.slice() into chunksAccumulator[]
     │              ├─ endPlayback() → combine chunks →
     │              │    └─ AudioPlayer.playFullBuffer(combined)
     │              │
     │              ├─ playFullBuffer(buf) →          ← when server returns whole buffer
     │              │    └─ AudioPlayer.playFullBuffer(buf)
     │              │
     │              ├─ waitForPlaybackEnd() → deferred promise
     │              └─ stop() → resolve deferred, clear chunks
     │
     └─ [webspeech: browser-native]
          │
          └─ speexSynthesize_WebSpeech()          ← protocols/webspeech/webspeech.client.ts
               ├─ speechSynthesis.cancel()        ← before each utterance
               ├─ new SpeechSynthesisUtterance()
               └─ speechSynthesis.speak()         ← no AudioPlayer at all

speakText callers:
├─ src/apps/chat/components/ChatMessageList.tsx
├─ src/apps/chat/editors/persona/PersonaChatMessageSpeak.ts
├─ src/apps/call/Telephone.tsx
└─ Speex test and preview components


AudioPlayer.playUrl(url, signal?)                 ← one-shot URL playback
│    ├─ new Audio(url)
│    ├─ audio.play()
│    ├─ onended → resolve
│    └─ signal?.abort → pause + clear src + resolve
│
├─ src/apps/call/Telephone.tsx                     pickup/hangup MP3s (no signal)
├─ src/apps/call/state/usePlayUrlInterval.ts       ringtone loop (AbortController signal)
├─ src/modules/aix/client/aix.client.ts            AI inline audio from ContentReassembler
│                                                  onInlineAudio (no signal; object URL
│                                                  revoked in finally; never persisted
│                                                  as a fragment)
├─ src/apps/chat/components/composer/Composer.tsx  mic-off sound (no signal)
└─ src/modules/speex/components/SpeexVoiceSelect.tsx  voice preview (useQuery signal)


AudioPlayer.playFullBuffer(buffer, signal?)       ← one-shot buffer playback
│    ├─ new AudioContext()
│    ├─ decodeAudioData()
│    ├─ createBufferSource() → start()
│    ├─ onended → close context + resolve
│    └─ signal?.abort → stop source + close context + resolve
│
└─ AudioAutoPlayer (only caller, see above)


AudioGenerator.*()                                ← procedural Web Audio API
│    ├─ singleContext() → shared AudioContext + masterGain
│    ├─ OscillatorNode / noise buffer → GainNode → destination
│    └─ fire-and-forget, sub-500ms
│
├─ src/apps/chat/components/composer/Composer.tsx  chatAutoSend
└─ src/apps/chat/editors/chat-persona.ts           chatNotifyResponse

chatNotifyError has no caller. basicAstralChimes is commented out in chat-persona.ts.
```

No production `speakText` caller passes an AbortSignal, and there is no queue, so two concurrent calls overlap audio. The webspeech engine alone serializes, by cancelling the previous utterance. The `label`, `personaUid` and `conversationId` speak options are accepted and ignored.
