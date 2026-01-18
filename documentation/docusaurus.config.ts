import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "AI Workspace Documentation",
  tagline: "Multi-repo workspace for AI/MCP development",
  favicon: "img/favicon.ico",

  // Production URL - update when deploying
  url: "https://docs.ai-workspace.local",
  baseUrl: "/",
  trailingSlash: true,

  organizationName: "jrmatherly",
  projectName: "ai-workspace",

  onBrokenLinks: "warn",

  // Use CommonMark format instead of MDX to avoid JSX parsing issues
  markdown: {
    format: "md",
    mdx1Compat: {
      comments: true,
      admonitions: true,
      headingIds: true,
    },
    anchors: {
      maintainCase: false,
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  // Exclude directories that shouldn't be processed
  // Archive and metadata are not part of the documentation site
  staticDirectories: ["static"],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/jrmatherly/ai-workspace/tree/main/documentation",
          routeBasePath: "/", // Serve docs at the site's root
          // Exclude archive and metadata from docs
          exclude: [
            "**/archive/**",
            "**/metadata/**",
            "**/.documentation-manifest",
          ],
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
        blog: false, // Disable blog feature
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Social card image
    image: "img/ai-workspace-social-card.png",

    navbar: {
      title: "AI Workspace",
      logo: {
        alt: "AI Workspace Logo",
        src: "img/logo.svg",
        srcDark: "img/logo-dark.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "mainSidebar",
          position: "left",
          label: "Documentation",
        },
        {
          href: "https://github.com/jrmatherly",
          label: "GitHub",
          position: "right",
        },
      ],
    },

    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Getting Started",
              to: "/",
            },
            {
              label: "Architecture",
              to: "/reference/architecture",
            },
            {
              label: "API Reference",
              to: "/reference/api-reference",
            },
          ],
        },
        {
          title: "Projects",
          items: [
            {
              label: "obot-entraid",
              href: "https://github.com/jrmatherly/obot-entraid",
            },
            {
              label: "obot-tools",
              href: "https://github.com/jrmatherly/obot-tools",
            },
            {
              label: "mcp-oauth-proxy",
              href: "https://github.com/jrmatherly/mcp-oauth-proxy",
            },
          ],
        },
        {
          title: "Resources",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/jrmatherly",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} AI Workspace. Built with Docusaurus.`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: [
        "bash",
        "diff",
        "json",
        "yaml",
        "toml",
        "go",
        "typescript",
        "python",
        "sql",
        "markdown",
      ],
    },

    // Enable dark mode by default
    colorMode: {
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    // Table of contents settings
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
