# Browse Functionality in AI Workspace 🌐

Allows users to load web pages across various components of AI Workspace. This feature is supported by Puppeteer-based
browsing services, which are the most common way to render web pages in a headless environment.

Once configured, the Browsing service provides the following functionality:

- ✅ **Paste a URL**: Simply paste/drag a URL into the chat, or use Attach > Web, and AI Workspace will load and attach the page (very effective)
- ✅ **ReAct**: ReAct will automatically use the `loadURL()` function whenever a URL is encountered

It does not yet support the following functionality:

- ✖️ **Auto-browsing by LLMs**: if an LLM encounters a URL, it will NOT load the page and will likely respond
  that it cannot browse the web - No technical limitation, just haven't gotten to implement this yet outside of `/react` yet

First of all, you need to procure a Puppteer web browsing service endpoint. AI Workspace supports services like:

| Service | Working | Type | Location | Special Features |
| -------------------------------------------------------------------------------------- | --------- | ------------- | ---------------- | --------------------------------------------- |
| [BrightData Scraping Browser](https://brightdata.com/products/scraping-browser) | Yes | Proprietary | Cloud | Advanced scraping tools, global IP pool |
| [Cloudflare Browser Rendering](https://developers.cloudflare.com/browser-rendering/) | ? | Proprietary | Cloud | Integrated CDN, optimized browser rendering |
| ⬇️ [Browserless v2](#-browserless-v2) | Yes (v2.57.0, verified 2026-10-11) | Source-available (SSPL) | Local (Docker) or your cluster | Parallelism, debug viewer, advanced APIs |
| ⬇️ [Your Chrome Browser (ALPHA)](#-your-own-chrome-browser) | Alpha | Proprietary | Local (Chrome) | Personal, experimental use (ALPHA!) |
| other Puppeteer-based WSS Services | ? | Varied | Cloud/Local | Service-specific features |

## Configuration

1. **Procure an Endpoint**
   - Ensure that your browsing service is running (remote or local) and has a WebSocket endpoint available
   - Write down the address: `wss://${auth}@{some host}:{port}`, or ws:// for local services on your machine

2. **Configure AI Workspace**
   - navigate to **Preferences** > **Tools** > **Browsing**
   - Enter the 'wss://...' connection string provided by your browsing service

3. **Enable Features**: Choose which browse-related features you want to enable:
   - **Attach URLs**: Automatically load and attach a page when pasting a URL into the composer
   - **ReAct**: Enable the `loadURL()` function in ReAct for advanced interactions

### 🌐 Browserless v2

[Browserless](https://github.com/browserless/browserless) is a Docker-based headless Chromium service that AI
Workspace connects to over the Chrome DevTools Protocol. Use the v2 image `ghcr.io/browserless/chromium` pinned
to a release tag; `browserless/chrome` on Docker Hub is the abandoned v1 (last built 2024) and `:latest` tracks main.

Launch it with:

```bash
docker run -p 9222:3000 -e TOKEN=change-me -e TIMEOUT=60000 ghcr.io/browserless/chromium:v2.57.0
```

Connection string in AI Workspace: `ws://127.0.0.1:9222/chromium?token=change-me`. Each AI Workspace page load
opens its own browserless session; `CONCURRENT` (default 10) caps the parallel sessions and `TIMEOUT` (default
30000 ms) ends a session, so raise it, as a page load plus screenshot can take about 30 s. Browse to
[http://127.0.0.1:9222](http://127.0.0.1:9222) for the debug viewer. Verified with `puppeteer-core` 25.13 against
v2.57.0 (Chromium 153) on 2026-10-11: navigation, text extraction and the screenshot work.

On Kubernetes, run it as its own Deployment and Service (not inside the app image: Chromium adds about 750 MB and
would render untrusted pages next to the app's secrets), with the token in a Secret, a memory-backed `/dev/shm`,
and an egress policy that allows the internet but not the cluster or LAN ranges. Point the app at
`ws://browserless.<namespace>.svc.cluster.local:3000/chromium?token=<token>` through `PUPPETEER_WSS_ENDPOINT`.

The chat agent won't be able to access the web sites if the browserless container does not have direct Internet access. You can resolve the issue by defining internet proxy for the running container. You can then use the evironment file in the a `docker-compose.yaml

```yaml
 browserless:
    image: ghcr.io/browserless/chromium:v2.57.0
    env_file:
      - .env
    ports:
      - "9222:3000"  # Map host's port 9222 to container's port 3000
    environment:
      - TOKEN=change-me
      - CONCURRENT=4
      - TIMEOUT=60000
```

You can then add the proxy lines to your `.env` file.

```text
https_proxy=http://PROXY-IP:PROXY-PORT
http_proxy=http://PROXY-IP:PROXY-PORT
```

This is how you can define it in a one liner docker
`docker run --env https_proxy=http://PROXY-IP:PROXY-PORT --env http_proxy=http://PROXY-IP:PROXY-PORT -p 9222:3000 -e TOKEN=change-me ghcr.io/browserless/chromium:v2.57.0`

Note: if you are using `docker-compose`, please see the
[docker/docker-compose-browserless.yaml](docker/docker-compose-browserless.yaml) file for an example
on how to run AI Workspace and Browserless simultaneously in a single application.

### 🌐 Your own Chrome browser

***EXPERIMENTAL - UNTESTED*** - You can use your own Chrome browser as a browsing service, by configuring it to expose
a WebSocket endpoint.

- close all the Chrome instances (on Windows, check the Task Manager if still running)
- start Chrome with the following command line options (on Windows, you can edit the shortcut properties):
  - `--remote-debugging-port=9222`
- go to <http://localhost:9222/json/version> and copy the `webSocketDebuggerUrl` value
  - it should be something like: `ws://localhost:9222/...`
- paste the value into the Endpoint configuration (see point 2 in the configuration)

### Server-Side Configuration

You can set the Puppeteer WebSocket endpoint (`PUPPETEER_WSS_ENDPOINT`) in the deployment before running it.
This is useful for self-hosted instances or when you want to pre-configure the endpoint for all users, and will
allow your to skip points 2 and 3 above.

Always deploy your own user authentication, authorization and security solution. For this feature, the tRPC
route that provides browsing service, shall be secured with a user authentication and authorization solution,
to prevent unauthorized access to the browsing service.

## Support

If you encounter any issues or have questions about configuring the browse functionality, open an [issue](https://github.com/jrmatherly/ai-workspace/issues).

---

Enjoy the enhanced browsing experience within AI Workspace and explore the web without ever leaving your chat!

Last updated on Oct 11, 2026 ([edit on GitHub](https://github.com/jrmatherly/ai-workspace/edit/main/docs/config-feature-browse.md))
