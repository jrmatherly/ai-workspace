// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  mainSidebar: [
    "overview",
    {
      type: "category",
      label: "Reference",
      collapsed: false,
      items: [
        "reference/architecture",
        "reference/api-reference",
        "reference/developer-onboarding",
        "reference/documentation-guide",
        "reference/project-index",
      ],
    },
    {
      type: "category",
      label: "Guides",
      collapsed: false,
      items: [
        "guides/branch-protection-checklist",
        "guides/project-documentation-alignment-guide",
        "guides/workspace-context-optimization-review",
      ],
    },
    {
      type: "category",
      label: "Projects",
      collapsed: true,
      items: [
        {
          type: "category",
          label: "Fork References Migration",
          items: [
            "projects/fork-references/readme",
            "projects/fork-references/analysis",
            "projects/fork-references/02a-phase1-initial-implementation",
            "projects/fork-references/02b-phase1-critical-fixes",
            "projects/fork-references/02c-phase1-gaps-fixed",
            "projects/fork-references/phase2-3-enhancements-guide",
          ],
        },
        {
          type: "category",
          label: "Auth Providers",
          items: [
            "projects/auth-providers/readme",
            "projects/auth-providers/analysis",
            "projects/auth-providers/validation",
          ],
        },
        {
          type: "category",
          label: "AI Context",
          items: [
            "projects/ai-context/readme",
            "projects/ai-context/implementation-report",
          ],
        },
        {
          type: "category",
          label: "Documentation Organization",
          items: [
            "projects/documentation-org/readme",
            "projects/documentation-org/cleanup-report",
            "projects/documentation-org/organization-phase2",
          ],
        },
        {
          type: "category",
          label: "Docusaurus Configuration",
          items: [
            "projects/docusaurus-config/readme",
            "projects/docusaurus-config/version-config-update",
          ],
        },
        {
          type: "category",
          label: "Documentation Standards",
          items: ["projects/documentation-standards/validation-report"],
        },
        {
          type: "category",
          label: "Expert Mode",
          items: [
            "projects/expert-mode/readme",
            "projects/expert-mode/analysis",
            "projects/expert-mode/enhancement-report",
          ],
        },
        {
          type: "category",
          label: "GPTScript Integration",
          items: [
            "projects/gptscript-integration/GPTSCRIPT_VALIDATION_ANALYSIS",
            "projects/gptscript-integration/AUTH_PROVIDERS_VALIDATION_ANALYSIS",
            "projects/gptscript-integration/EXPERT_MODE_UPDATE_PROPOSAL",
            "projects/gptscript-integration/INTEGRATION_RECOMMENDATIONS_SUMMARY",
            "projects/gptscript-integration/IMPLEMENTATION_VALIDATION_REPORT",
            "projects/gptscript-integration/TASK_REFLECTION_AND_VALIDATION_REPORT",
          ],
        },
        {
          type: "category",
          label: "obot-entraid",
          items: ["projects/obot-entraid/fork-dependency-management"],
        },
        {
          type: "category",
          label: "obot-tools",
          items: ["projects/obot-tools/migration-guide-auth-providers"],
        },
        {
          type: "category",
          label: "Token Tracking Optimization",
          items: [
            "projects/token-tracking-optimization/TOKEN_TRACKING_OPTIMIZATION_RECOMMENDATIONS",
            "projects/token-tracking-optimization/TOKEN_TRACKING_VALIDATION_REPORT",
            "projects/token-tracking-optimization/TOKEN_OPTIMIZATION_RESEARCH_VALIDATION_REPORT",
            {
              type: "category",
              label: "Phase 1: Slash Command",
              items: [
                "projects/token-tracking-optimization/phase1-slash-command/phase1-reflection-validation-report",
                "projects/token-tracking-optimization/phase1-slash-command/PHASE1_IMPLEMENTATION_VALIDATION_REPORT",
              ],
            },
            {
              type: "category",
              label: "Phase 2: SessionStart Hook",
              items: [
                "projects/token-tracking-optimization/phase2-sessionstart-hook/PHASE2_REFLECTION_VALIDATION_REPORT",
                "projects/token-tracking-optimization/phase2-sessionstart-hook/PHASE2_IMPLEMENTATION_VALIDATION_REPORT",
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default sidebars;
