# Frequently Asked Questions

Quick answers to common questions about AI Workspace. For detailed documentation, see the [documentation index](README.md).

## Connectivity

<details open>
<summary><b>What is "Direct Connection" and should I enable it?</b></summary>

Direct Connection lets the browser call the AI provider's API directly, skipping the AI Workspace edge server. It appears as a toggle in each AI service's Advanced settings when your API key is set client-side.

**When available, it is a net win**: faster, fewer restrictions, more privacy.

- **No 4.5 MB upload limit** (Vercel body-size cap does not apply).
- **No 300-second timeout** (Vercel function timeout does not apply; call length is bound only by the AI service).
- **More privacy** - connection metadata (IP, timestamp, edge region, Vercel telemetry) is not observable by the AI Workspace edge server.
- **Slightly more downlink bandwidth** - when passing through the edge, AI Workspace sheds repetitive streaming frames; direct streams arrive verbatim.

**When it is unavailable**:

1. **Server-side keys** - if the deployment stores API keys in server environment variables, the browser has no credential to send directly.
2. **Provider does not allow CORS** - browsers cannot call APIs that block cross-origin requests. Most major providers permit it; AI Workspace sets any required headers.

</details>

## Versions

<details open>
<summary><b>How do I check my AI Workspace version?</b></summary>

You can see the version in the *News* section of the app, as per the image below.

![Version location in AI Workspace](https://github.com/user-attachments/assets/cd295094-0114-420f-a5b9-0d762e59b506)
</details>

<details open>
<summary><b>How do I verify my Vercel deployment version?</b></summary>

You can go in the **deployments** section of your Vercel project, and at a quick glance see
what is the latest deployment status, time, and link to the source code.

![Vercel deployments view](https://github.com/user-attachments/assets/664b8c3d-496e-4595-ad5e-898bdb82507c)

Each deployment links directly to its source code commit.
</details>

---

Missing something? [Open an issue](https://github.com/jrmatherly/ai-workspace/issues/new).
