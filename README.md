<div align="center">

<h1>AI Workspace</h1>

[![License: MIT](https://img.shields.io/badge/License-MIT-A8E6CF?style=for-the-badge&labelColor=000)](https://opensource.org/licenses/MIT)

</div>

## Provenance

Derived from [enricoros/big-AGI](https://github.com/enricoros/big-AGI) at commit `99b3bf9c` (2026-10-07, v2.1.1), MIT licensed. Upstream changes are reviewed with the `upstream-review` skill (`.claude/skills/upstream-review/`). Issues and releases for this repo: [jrmatherly/ai-workspace](https://github.com/jrmatherly/ai-workspace).

<br/>

# AI Workspace 🧠

**AI Workspace** is a self-hosted, local-first, multi-model AI workspace for experts.

Built for experts: Engineers architecting systems. Founders making decisions. Researchers validating hypotheses.
You need to think broader, decide faster, and build with confidence, then you need AI Workspace.

Beam runs several models on the same prompt and fuses the answers.

![LLM Vendors](https://img.shields.io/badge/24_LLM_Services-300+_Models-black?style=for-the-badge&logo=anthropic&logoColor=white&labelColor=purple)&nbsp;
![Feature Beam](https://img.shields.io/badge/AI--Validation-BEAM-000?style=for-the-badge&labelColor=purple)&nbsp;
![Feature Inspector](https://img.shields.io/badge/Expert_Mode-AI_Inspector-000?style=for-the-badge&labelColor=purple)

### What makes AI Workspace different:

**Intelligence**: Beam and Merge run several models on one prompt and fuse the answers; native search; current models from Anthropic, OpenAI, Google, Moonshot, xAI and 19 other vendors.
**Control**: personas, chats stored in your browser, request inspection, your own API keys, no vendor lock-in.
**Speed**: local-first web app, no server round-trip for your data.


## Get Started

Configuration requires your API keys. *AI Workspace does not charge for model usage or limit your access*.

**Self-host and developers** (full control)  
- Develop locally or self-host with Docker on your own infrastructure - [guide](docs/installation.md)  
- Or fork & run on Vercel:  
  [![Deploy on Vercel](https://img.shields.io/badge/Deploy-black?style=for-the-badge&logo=vercel&logoColor=white&labelColor=000)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjrmatherly%2Fai-workspace&env=OPENAI_API_KEY&envDescription=Backend%20API%20keys%2C%20optional%20and%20may%20be%20overridden%20by%20the%20UI.&envLink=https%3A%2F%2Fgithub.com%2Fjrmatherly%2Fai-workspace%2Fblob%2Fmain%2Fdocs%2Fenvironment-variables.md&project-name=ai-workspace)

---

## Design principles

**Local-first** (chats stay in your browser), multi-model by default (Beam runs several models side by side with a human in the loop), no vendor lock-in (one AIX protocol layer in front of every provider), and a UI tuned for speed.


---

## Release Notes

Changelog: [docs/changelog.md](docs/changelog.md). Releases: [GitHub releases](https://github.com/jrmatherly/ai-workspace/releases).

## 👉 Supported Models & Integrations

Delightful UX with latest models exclusive features like Beam for **multi-model AI validation**.
> ![LLM Vendors](https://img.shields.io/badge/24_LLM_Services-300+_Models-black?style=for-the-badge&logo=openai&logoColor=white&labelColor=purple)&nbsp;
> ![Feature Beam](https://img.shields.io/badge/AI--Validation-BEAM-000?style=for-the-badge&logo=anthropic&labelColor=purple)

| ![Advanced AI](https://img.shields.io/badge/Advanced%20AI-32383e?style=for-the-badge&logo=ai&logoColor=white) | ![300+ AI Models](https://img.shields.io/badge/300%2B%20AI%20Models-32383e?style=for-the-badge&logo=ai&logoColor=white) | ![Flow-state UX](https://img.shields.io/badge/Flow--state%20UX-32383e?style=for-the-badge&logo=flow&logoColor=white) | ![Privacy First](https://img.shields.io/badge/Privacy%20First-32383e?style=for-the-badge&logo=privacy&logoColor=white) | ![Advanced Tools](https://img.shields.io/badge/Fun%20To%20Use-f22a85?style=for-the-badge&logo=tools&logoColor=white) |  
|---------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------| 
| **Chat**<br/>**Call**<br/>**Beam**<br/>**Draw**, ...                                                          | Local & Cloud<br/>Open & Closed<br/>Cheap & Heavy<br/>Google, Mistral, ...                                              | Attachments<br/>Diagrams<br/>Multi-Chat<br/>Mobile-first UI                                                          | Stored Locally<br/>Easy self-Host<br/>Local actions<br/>Data = Gold                                                    | AI Personas<br/>Voice Modes<br/>Screen Capture<br/>Camera + OCR                                                      |

![AI Workspace screenshot](docs/pixels/ai-workspace-hero.png)

### AI Models & Vendors

Configure 100s of AI models from 20+ providers:

| **AI models**       | _supported vendors_                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|:--------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Opensource Servers  | [LocalAI](https://localai.io/) · [Ollama](https://ollama.com/)                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Local Servers       | [LM Studio](https://lmstudio.ai/) (non-open)                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Multimodal services | [Anthropic](https://anthropic.com) · [AWS Bedrock](https://aws.amazon.com/bedrock/) · [Azure](https://azure.microsoft.com/en-us/products/ai-services/openai-service) · [Google Gemini](https://ai.google.dev/) · [Meta AI](https://dev.meta.ai/) · [OpenAI](https://platform.openai.com/docs/overview)                                                                                                                                                                                     |
| LLM services        | [Alibaba](https://www.alibabacloud.com/en/product/modelstudio) · [DeepSeek](https://deepseek.com) · [Groq](https://wow.groq.com/) · [Mistral](https://mistral.ai/) · [Moonshot](https://www.moonshot.cn/) · [NVIDIA NIM](https://build.nvidia.com/) · [OpenRouter](https://openrouter.ai/) · [Perplexity](https://www.perplexity.ai/) · [Together AI](https://www.together.ai/) · [xAI](https://x.ai/) · [Z.ai](https://z.ai/) |
| OpenAI-compatible   | Any OpenAI-compatible endpoint - models, pricing, and capabilities are auto-detected                                                                                                                                                                                                                                                                                                                                                                                                         |
| Image services      | OpenAI · Google Gemini (Nano Banana) · LocalAI                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Speech services     | [ElevenLabs](https://elevenlabs.io) · [Inworld](https://inworld.ai) · [OpenAI TTS](https://platform.openai.com/docs/guides/text-to-speech) · LocalAI · Browser (Web Speech API)                                                                                                                                                                                                                                                                                                            |

### Additional Integrations

| **More**      | _integrations_                                                                                                 |
|:--------------|:---------------------------------------------------------------------------------------------------------------| 
| Web Browse    | [Browserless](https://www.browserless.io/) · [Puppeteer](https://pptr.dev/)-based                              |
| Web Search    | [Google CSE](https://programmablesearchengine.google.com/)                                                     |

---

## 🚀 Installation

Self-host with Docker, deploy on Vercel, or develop locally. Full setup guide:

[![Installation Guide](https://img.shields.io/badge/Installation%20Guide-blue?style=for-the-badge&logo=read-the-docs&logoColor=white)](docs/installation.md)

---

## Contributing

[![Open an Issue](https://img.shields.io/badge/Open_Issue-New-ff8c00?style=for-the-badge&logo=github&logoColor=fff&labelColor=8b0000)](https://github.com/jrmatherly/ai-workspace/issues/new?template=ai-triage.yml)
[![Request Feature](https://img.shields.io/badge/Request_Feature-Roadmap_Idea-orange?style=for-the-badge&logo=lightbulb&logoColor=white)](https://github.com/jrmatherly/ai-workspace/issues/new?&template=roadmap-request.md)
[![Customization](https://img.shields.io/badge/Fork_&_Customize-Your_Own-purple?style=for-the-badge&logo=git&logoColor=white)](docs/customizations.md)

---

## License

MIT License · [Third-Party Notices](src/modules/3rdparty/THIRD_PARTY_NOTICES.md)

Copyright (c) 2026 Jason Matherly and (c) 2023-2026 Enrico Ros, see [LICENSE](LICENSE).
