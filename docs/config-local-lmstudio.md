# Integrating LM Studio with AI Workspace

Quickly set up LM Studio with AI Workspace to run local and open LLMs on your computer for enhanced privacy and control over AI interactions.

## Quick Setup Guide

### Installing AI Workspace

Clone and set up AI Workspace:

```bash
git clone https://github.com/jrmatherly/ai-workspace.git && cd ai-workspace
npm install # Or: yarn install
npm run dev # Or: yarn dev
# If missing dependencies:
npm install @mui/material # Or: yarn add @mui/material
```

### Configuring LM Studio

Ensure LM Studio is running (default: [http://localhost:1234](http://localhost:1234)).
Check the URL and modify if different.

1. Download local models in LM Studio
2. Start the LM Studio server
3. Optionally. Check the logs

### Integration in AI Workspace

1. In AI Workspace, navigate to **Models** > **Add** > **LM Studio**
2. Enter the API URL: `http://localhost:1234` (modify if different)
3. Refresh by clicking on the `Models` button to load models from LM Studio

In addition to using the UI, configuration can also be done using
[environment variables](environment-variables.md).

## Troubleshooting

- **Missing @mui/material**: Execute `npm install @mui/material` or `yarn add @mui/material`
- **Connection Issues**: Check LM Studio's URL and ensure it's operational

## Further Assistance

Advanced configurations and more:

- AI Workspace issues: [GitHub](https://github.com/jrmatherly/ai-workspace/issues)
- LM Studio: [LM Studio home page](https://lmstudio.ai/)
