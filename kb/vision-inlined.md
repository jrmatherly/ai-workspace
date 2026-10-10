## Strategic Vision

ai-workspace is a self-hosted, local-first multi-model chat workspace, derived from big-AGI and owned by jrmatherly. North stars:

- Self-contained: no runtime dependency on any vendor's hosting beyond the AI APIs the user configures. BYO keys, data in the browser by default.
- Current models, fast: track upstream big-AGI for model definitions and AIX fixes through the `upstream-review` skill; adopt by cherry-pick where files are unchanged, hand-port where they diverged.
- Stable surface for the user: chat, Beam, personas, attachments, and multi-vendor support stay first-class; hosted-product features (billing, sync, admin) are out of scope.
