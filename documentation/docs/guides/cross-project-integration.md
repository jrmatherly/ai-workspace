# Cross-Project Integration Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-20
**Audience:** Developers integrating multiple projects from the AI/MCP workspace

**Navigation:**
• [Quick Start](#-quick-start)
• [Integration Scenarios](#-integration-scenarios)
• [Component Details](#️-component-integration-details)
• [Deployment Examples](#-deployment-examples)
• [Architecture Patterns](#️-architecture-patterns)

---

## 📋 Overview

The AI/MCP Multi-Repo Workspace contains **7 independent projects** that work together to provide a complete cloud-native AI infrastructure. While each project can run standalone, their real power emerges through integration.

### The 7-Project Ecosystem

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI/MCP Workspace Ecosystem                   │
└─────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │                     MCP Platform Layer                    │
   │                                                           │
   │  ┌─────────────┐    ┌──────────────┐   ┌─────────────┐ │
   │  │obot-entraid │───>│  obot-tools  │   │mcp-catalog  │ │
   │  │  (Platform) │    │ (Providers)  │   │   (Config)  │ │
   │  └──────┬──────┘    └──────────────┘   └─────────────┘ │
   │         │                                                │
   └─────────┼────────────────────────────────────────────────┘
             │
             │  uses                    fronts
             ▼                            ▼
   ┌─────────────────┐         ┌──────────────────┐
   │   nah Library   │         │ mcp-oauth-proxy  │
   │  (Controllers)  │         │  (OAuth Gateway) │
   └─────────────────┘         └──────────────────┘
             │
             │  can use
             ▼
   ┌─────────────────┐         ┌──────────────────┐
   │   kinm Server   │         │  namegenerator   │
   │  (K8s-like API) │         │    (Utility)     │
   └─────────────────┘         └──────────────────┘
```

### Project Relationships Summary

| Integration | Type | Purpose |
| ------------- | ------ | --------- |
| obot-entraid → nah | Library | Controller framework for MCP resource management |
| obot-entraid → obot-tools | Plugin | Model & auth providers, GPTScript tools |
| obot-entraid → mcp-catalog | Config | MCP server configurations |
| mcp-oauth-proxy → obot-entraid | Gateway | OAuth 2.1 authentication for MCP servers |
| mcp-oauth-proxy → obot-tools | Gateway | OAuth for individual MCP tool servers |
| obot-entraid → kinm | Optional | Alternative to direct K8s API usage |
| All projects → namegenerator | Utility | Generate unique names for resources |

---

## 🎯 Quick Start

### Understanding Integration Levels

The workspace supports three integration levels:

| Level | Description | Example |
| ------- | ------------- | --------- |
| **Level 1: Standalone** | Single project usage | Run kinm API server independently |
| **Level 2: Dual Integration** | Two projects working together | obot-entraid + nah for controllers |
| **Level 3: Full Stack** | Multi-project deployment | Platform + OAuth + Tools + Catalog |

### Prerequisites for Integration

```bash
# Required tools
go version       # 1.23+ required
git --version
make --version

# Recommended: mise for unified tool management
curl https://mise.run | sh
cd AI && mise trust && mise install

# Verify all projects are available
ls -d */ | grep -E "(obot-entraid|nah|kinm|mcp-oauth-proxy|obot-tools|mcp-catalog|namegenerator)"
```

---

## 🔗 Integration Scenarios

### Scenario 1: MCP Platform with Custom Controllers

**Use Case:** Deploy obot-entraid with custom Kubernetes controllers for managing MCP resources.

**Components:**
- obot-entraid (MCP platform)
- nah (controller framework)
- obot-tools (optional: additional providers)

**Why:** Leverage Kubernetes-style declarative resource management for MCP servers, agents, workflows.

**Quick Start:**
```bash
# 1. Start obot-entraid platform
cd obot-entraid && make dev

# 2. In your controller code (using nah)
import "github.com/obot-platform/nah"

// Controllers manage Agents, Workflows, etc.
```

**See:** [obot-entraid + nah Integration](#1-obot-entraid--nah-controller-integration)

---

### Scenario 2: MCP Platform with Extended Providers

**Use Case:** Run obot-entraid with additional model/auth providers from obot-tools.

**Components:**
- obot-entraid (MCP platform)
- obot-tools (provider ecosystem)
- mcp-catalog (configuration)

**Why:** Extend platform capabilities with community tools and custom providers.

**Quick Start:**
```bash
# 1. Build obot-tools providers
cd obot-tools
make build

# 2. Configure obot-entraid to use tools
cd ../obot-entraid
# Edit config to point to obot-tools binaries

# 3. Deploy with catalog
# Uses mcp-catalog YAML configs
```

**See:** [obot-entraid + obot-tools Integration](#2-obot-entraid--obot-tools-provider-integration)

---

### Scenario 3: OAuth-Protected MCP Servers

**Use Case:** Add OAuth 2.1 authentication to any MCP server (obot-entraid, obot-tools, or third-party).

**Components:**
- mcp-oauth-proxy (OAuth gateway)
- obot-entraid or obot-tools (MCP servers)

**Why:** Secure MCP servers with standardized OAuth 2.1, supporting Google, GitHub, Microsoft providers.

**Quick Start:**
```bash
# 1. Start OAuth proxy
cd mcp-oauth-proxy
export DATABASE_URL=postgres://localhost/oauthdb
make run

# 2. Start MCP server behind proxy
cd ../obot-entraid
export OAUTH_PROXY_URL=http://localhost:8080
make run

# 3. Clients connect through proxy
# Proxy handles OAuth, injects auth headers
```

**See:** [mcp-oauth-proxy + obot-entraid Integration](#3-mcp-oauth-proxy--obot-entraid-integration)

---

### Scenario 4: Full Production Stack

**Use Case:** Complete production deployment with platform, OAuth, tools, and monitoring.

**Components:**
- All 7 projects
- PostgreSQL (for obot-entraid, kinm, mcp-oauth-proxy)
- Kubernetes cluster (optional)

**Why:** Enterprise-grade MCP infrastructure with security, scalability, and extensibility.

**See:** [Complete Deployment Examples](#-deployment-examples)

---

## 🏗️ Component Integration Details

## 1. obot-entraid + nah Controller Integration

### Overview

obot-entraid uses nah as its Kubernetes controller framework for managing MCP resources (Agents, Workflows, KnowledgeSources, etc.) in a declarative, reconciliation-based manner.

### Architecture

```
┌────────────────────────────────────────────────────────────┐
│                       obot-entraid                         │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Controller Layer (using nah)            │ │
│  │                                                      │ │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │ │
│  │  │   Agent    │  │  Workflow  │  │ Knowledge    │  │ │
│  │  │ Controller │  │ Controller │  │   Source     │  │ │
│  │  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘  │ │
│  │        │                │                │          │ │
│  │        └────────────────┼────────────────┘          │ │
│  │                         │                           │ │
│  │               ┌─────────▼──────────┐                │ │
│  │               │   nah Router       │                │ │
│  │               │  (Event Routing)   │                │ │
│  │               └─────────┬──────────┘                │ │
│  │                         │                           │ │
│  │               ┌─────────▼──────────┐                │ │
│  │               │   nah Backend      │                │ │
│  │               │ (K8s Operations)   │                │ │
│  │               └─────────┬──────────┘                │ │
│  └─────────────────────────┼────────────────────────────┘ │
│                            │                              │
│                  ┌─────────▼──────────┐                   │
│                  │   nah Apply        │                   │
│                  │ (Desired State)    │                   │
│                  └─────────┬──────────┘                   │
└────────────────────────────┼────────────────────────────────┘
                             │
                  ┌──────────▼───────────┐
                  │  Kubernetes API      │
                  │  (or PostgreSQL via  │
                  │   kinm storage)      │
                  └──────────────────────┘
```

### How nah is Used

#### 1. Router Pattern

obot-entraid creates a nah router to watch and reconcile custom resources:

```go
import (
    "github.com/obot-platform/nah"
    "github.com/obot-platform/nah/pkg/router"
)

// Create router with leader election
r, err := nah.DefaultRouter("obot-controller", scheme)

// Register handler for Agent resources
r.Type(&obotv1.Agent{}).HandlerFunc(func(req router.Request, resp router.Response) error {
    agent := req.Object.(*obotv1.Agent)

    // Reconcile agent state
    return reconcileAgent(req.Context, agent, resp.Backend())
})
```

#### 2. Apply Pattern (Declarative State Management)

Controllers use nah's Apply pattern to declare desired state:

```go
import "github.com/obot-platform/nah/pkg/apply"

func reconcileAgent(ctx context.Context, agent *obotv1.Agent, backend router.Backend) error {
    // Define desired child resources
    desired := []runtime.Object{
        &corev1.Service{
            ObjectMeta: metav1.ObjectMeta{
                Name:      agent.Name + "-svc",
                Namespace: agent.Namespace,
            },
            Spec: corev1.ServiceSpec{
                Selector: map[string]string{"agent": agent.Name},
                Ports:    []corev1.ServicePort{{Port: 8080}},
            },
        },
        &corev1.Deployment{
            ObjectMeta: metav1.ObjectMeta{
                Name:      agent.Name + "-deploy",
                Namespace: agent.Namespace,
            },
            Spec: corev1.DeploymentSpec{
                Replicas: agent.Spec.Replicas,
                // ... deployment spec
            },
        },
    }

    // Apply desired state (creates/updates/deletes to match)
    a := apply.New(backend, "agent-controller")
    return a.Apply(agent, desired)
}
```

#### 3. Backend Interface

nah provides unified CRUD operations with caching:

```go
// Get resource
var agent obotv1.Agent
err := backend.Get(ctx, client.ObjectKey{
    Namespace: "default",
    Name:      "my-agent",
}, &agent)

// List with filters
var agents obotv1.AgentList
err := backend.List(ctx, &agents,
    client.InNamespace("default"),
    client.MatchingLabels{"type": "openai"})

// Use cached reads for frequently accessed data
err := backend.GetCached(ctx, key, &agent)
```

### Integration Benefits

| Feature | Benefit |
| --------- | --------- |
| **Reconciliation Loops** | Automatic self-healing, desired state enforcement |
| **Leader Election** | High availability, active-passive controller pods |
| **Apply Semantics** | Declarative child resource management |
| **Caching** | Reduced API server load, faster reads |
| **Event-Driven** | Only process changes, not full scans |

### Key Files in obot-entraid

| File | Purpose |
| ------ | --------- |
| `pkg/controller/agent/controller.go` | Agent reconciliation logic using nah |
| `pkg/controller/workflow/controller.go` | Workflow reconciliation |
| `pkg/controller/routes.go` | Router setup and handler registration |

### Reference

- **nah Documentation:** [API Reference - nah](../reference/api-reference.md#1-nah---kubernetes-controller-framework)
- **Architecture:** [Architecture Reference - nah](../reference/architecture.md#kubernetes-controller-pattern-nah)

---

## 2. obot-entraid + obot-tools Provider Integration

### Overview

obot-tools provides an ecosystem of:
- **Model Providers** (OpenAI, Anthropic, Ollama, Groq, xAI, DeepSeek)
- **Auth Providers** (Entra ID, Keycloak, GitHub, Google)
- **GPTScript Tools** (hundreds of community tools)

obot-entraid loads these dynamically as plugins/providers.

### Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        obot-entraid                            │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   Provider Registry                      │ │
│  │                                                          │ │
│  │  ┌───────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │ Model Provider│  │Auth Provider │  │Tool Provider│  │ │
│  │  │   Interface   │  │  Interface   │  │  Interface  │  │ │
│  │  └───────┬───────┘  └──────┬───────┘  └──────┬──────┘  │ │
│  │          │                 │                  │         │ │
│  │          └─────────────────┼──────────────────┘         │ │
│  │                            │                            │ │
│  └────────────────────────────┼──────────────────────────────┘ │
│                               │ loads                        │
└───────────────────────────────┼──────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────┐
│                         obot-tools                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   openai/    │  │  anthropic/  │  │     ollama/      │  │
│  │  provider.go │  │  provider.go │  │   provider.go    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   entraid/   │  │  keycloak/   │                        │
│  │  provider.go │  │  provider.go │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              GPTScript Tools (*.gpt)                 │  │
│  │  gmail/, slack/, github/, jira/, notion/, etc.      │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Integration Methods

#### Method 1: Built-In Providers (Compiled)

obot-entraid imports providers at compile time:

```go
import (
    _ "github.com/obot-platform/obot-tools/providers/openai"
    _ "github.com/obot-platform/obot-tools/providers/anthropic"
    _ "github.com/obot-platform/obot-tools/auth/entraid"
)

// Providers auto-register via init() functions
```

#### Method 2: Dynamic Loading (Plugin Architecture)

Load providers at runtime from binaries:

```go
import "github.com/obot-platform/obot-tools/pkg/loader"

// Load provider from binary
provider, err := loader.LoadProvider("/path/to/provider-binary")

// Register with obot-entraid
registry.Register(provider)
```

#### Method 3: GPTScript Tools

obot-tools provides GPTScript (.gpt) tools that obot-entraid can execute:

```yaml
# Example: obot-tools/gmail/send-email.gpt
name: send-email
description: Send an email via Gmail
tools: gmail-api

#!system.gpt

---
name: gmail-api
type: auth
with:
  provider: google
  scopes: gmail.send
```

obot-entraid executes these via GPTScript runtime:

```go
import "github.com/gptscript-ai/gptscript/pkg/runner"

// Execute tool
result, err := runner.Run(ctx, "obot-tools/gmail/send-email.gpt", input)
```

### Configuration with mcp-catalog

obot-entraid can discover providers via mcp-catalog YAML configs:

```yaml
# mcp-catalog/configs/openai-provider.yaml
apiVersion: mcp.obot.ai/v1
kind: Provider
metadata:
  name: openai
spec:
  type: model
  binary: ./obot-tools/providers/openai/openai
  env:
    - name: OPENAI_API_KEY
      valueFrom:
        secretKeyRef:
          name: openai-secret
          key: api-key
```

obot-entraid loads these configs:

```go
import "github.com/obot-platform/mcp-catalog/pkg/loader"

// Load all provider configs
providers, err := loader.LoadFromDirectory("./mcp-catalog/configs")

// Register each provider
for _, p := range providers {
    registry.Register(p)
}
```

### Model Provider Example

**obot-tools side:**
```go
// obot-tools/providers/openai/provider.go
package main

import "github.com/obot-platform/obot-tools/pkg/provider"

type OpenAIProvider struct{}

func (p *OpenAIProvider) Complete(ctx context.Context, req *provider.CompletionRequest) (*provider.CompletionResponse, error) {
    // Call OpenAI API
    // ...
}

func main() {
    provider.Register(&OpenAIProvider{})
    provider.Serve()
}
```

**obot-entraid side:**
```go
// Use model provider
resp, err := modelRegistry.Complete(ctx, &provider.CompletionRequest{
    Provider: "openai",
    Model:    "gpt-4",
    Messages: []Message{{Role: "user", Content: "Hello"}},
})
```

### Auth Provider Example

**obot-tools side:**
```go
// obot-tools/auth/entraid/provider.go
package main

type EntraIDProvider struct{}

func (p *EntraIDProvider) Authenticate(ctx context.Context, req *auth.AuthRequest) (*auth.AuthResponse, error) {
    // Microsoft Entra ID OAuth flow
    // ...
}

func main() {
    auth.Register(&EntraIDProvider{})
    auth.Serve()
}
```

**obot-entraid side:**
```go
// Use auth provider
user, err := authRegistry.Authenticate(ctx, &auth.AuthRequest{
    Provider: "entraid",
    Code:     authCode,
})
```

### Integration Benefits

| Feature | Benefit |
| --------- | --------- |
| **Extensibility** | Add new models/auth without modifying obot-entraid |
| **Isolation** | Provider crashes don't crash platform |
| **Versioning** | Different provider versions can coexist |
| **Community Tools** | Leverage 100+ GPTScript tools |

### Key Files

**obot-entraid:**
| File | Purpose |
| ------ | --------- |
| `pkg/providers/registry.go` | Provider registration and discovery |
| `pkg/providers/loader.go` | Dynamic provider loading |

**obot-tools:**
| Directory | Purpose |
| ----------- | --------- |
| `providers/` | Model provider implementations |
| `auth/` | Auth provider implementations |
| `tools/` | GPTScript tool definitions |

### Reference

- **obot-tools Documentation:** See `obot-tools/README.md` and `obot-tools/CLAUDE.md`
- **Provider API:** [API Reference - obot-tools](../reference/api-reference.md#4-obot-tools---tools--providers)

---

## 3. mcp-oauth-proxy + obot-entraid Integration

### Overview

mcp-oauth-proxy acts as an OAuth 2.1 gateway in front of MCP servers (like obot-entraid, obot-tools, or third-party servers), adding authentication without modifying the MCP server code.

### Architecture

```
┌──────────┐        ┌───────────────────┐        ┌──────────────┐
│  Client  │        │ mcp-oauth-proxy   │        │ obot-entraid │
│ (VSCode/ │        │  (OAuth Gateway)  │        │ (MCP Server) │
│   CLI)   │        │                   │        │              │
└────┬─────┘        └─────────┬─────────┘        └──────┬───────┘
     │                        │                         │
     │ 1. GET /mcp/tools      │                         │
     ├───────────────────────>│                         │
     │                        │                         │
     │ 2. 401 + Login URL     │                         │
     │<───────────────────────┤                         │
     │                        │                         │
     │ 3. OAuth Flow          │                         │
     │   (Google/GitHub/MS)   │                         │
     │<──────────────────────>│                         │
     │                        │                         │
     │ 4. GET /mcp/tools      │                         │
     │    + Authorization:    │                         │
     │      Bearer <token>    │                         │
     ├───────────────────────>│                         │
     │                        │                         │
     │                        │ 5. Validate Token       │
     │                        │    + Inject Headers:    │
     │                        │    X-Forwarded-User     │
     │                        │    X-Forwarded-Email    │
     │                        │    X-Forwarded-Token    │
     │                        ├────────────────────────>│
     │                        │                         │
     │                        │ 6. MCP Response         │
     │                        │<────────────────────────┤
     │                        │                         │
     │ 7. Proxied Response    │                         │
     │<───────────────────────┤                         │
     └────────────────────────┴─────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                     OAuth 2.1 PKCE Flow                        │
│                                                                │
│  Client                    Proxy                    Provider   │
│    │                         │                         │       │
│    │ 1. code_challenge       │                         │       │
│    ├────────────────────────>│                         │       │
│    │                         │                         │       │
│    │                         │ 2. Redirect to Provider │       │
│    │                         │    + code_challenge     │       │
│    │<────────────────────────┼────────────────────────>│       │
│    │                         │                         │       │
│    │ 3. User authenticates   │                         │       │
│    │<────────────────────────────────────────────────>│       │
│    │                         │                         │       │
│    │ 4. Auth code            │                         │       │
│    ├────────────────────────>│                         │       │
│    │                         │                         │       │
│    │                         │ 5. Exchange code        │       │
│    │                         │    + code_verifier      │       │
│    │                         ├────────────────────────>│       │
│    │                         │                         │       │
│    │                         │ 6. Access token         │       │
│    │                         │<────────────────────────┤       │
│    │                         │                         │       │
│    │ 7. Access token         │                         │       │
│    │<────────────────────────┤                         │       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Integration Setup

#### Step 1: Deploy mcp-oauth-proxy

```bash
cd mcp-oauth-proxy

# Configure database
export DATABASE_URL=postgres://user:pass@localhost:5432/oauthdb

# Or use SQLite for development
export DATABASE_URL=sqlite://oauth.db

# Configure OAuth providers
cat > config.yaml <<EOF
providers:
  - name: google
    client_id: ${GOOGLE_CLIENT_ID}
    client_secret: ${GOOGLE_CLIENT_SECRET}
    auth_url: https://accounts.google.com/o/oauth2/v2/auth
    token_url: https://oauth2.googleapis.com/token
    scopes:
      - openid
      - email
      - profile
EOF

# Start proxy
make run
# Listens on http://localhost:8080
```

#### Step 2: Configure obot-entraid Behind Proxy

```bash
cd obot-entraid

# Configure to run behind OAuth proxy
export BEHIND_OAUTH_PROXY=true
export TRUST_FORWARDED_HEADERS=true

# Start obot-entraid
make run
# Listens on http://localhost:3000 (internal)
```

#### Step 3: Proxy Configuration

Configure mcp-oauth-proxy to forward requests to obot-entraid:

```yaml
# mcp-oauth-proxy config.yaml (continued)
upstreams:
  - name: obot-entraid
    url: http://localhost:3000
    paths:
      - /mcp/*
      - /api/*
    require_auth: true
    inject_headers:
      - X-Forwarded-User
      - X-Forwarded-Email
      - X-Forwarded-Token
```

#### Step 4: Client Connection

Clients connect to mcp-oauth-proxy instead of directly to obot-entraid:

```bash
# Before (direct, no auth):
curl http://localhost:3000/mcp/tools

# After (via proxy, with OAuth):
# 1. Get OAuth token
TOKEN=$(curl -X POST http://localhost:8080/oauth2/token \
  -d "grant_type=authorization_code" \
  -d "code=${AUTH_CODE}" \
  -d "client_id=${CLIENT_ID}" \
  -d "code_verifier=${CODE_VERIFIER}")

# 2. Use token to call MCP API
curl http://localhost:8080/mcp/tools \
  -H "Authorization: Bearer ${TOKEN}"
```

### Header Injection

mcp-oauth-proxy injects user context into upstream requests:

| Header | Content | Example |
| -------- | --------- | --------- |
| `X-Forwarded-User` | User ID | `12345678` |
| `X-Forwarded-Email` | Email address | `user@example.com` |
| `X-Forwarded-Token` | OAuth access token | `ya29.a0AfH6SMB...` |
| `X-Forwarded-Name` | Display name | `John Doe` |
| `X-Forwarded-Picture` | Avatar URL | `https://...` |

obot-entraid reads these headers to identify the user:

```go
// obot-entraid user extraction
func getUserFromRequest(r *http.Request) (*User, error) {
    return &User{
        ID:      r.Header.Get("X-Forwarded-User"),
        Email:   r.Header.Get("X-Forwarded-Email"),
        Name:    r.Header.Get("X-Forwarded-Name"),
        Picture: r.Header.Get("X-Forwarded-Picture"),
    }, nil
}
```

### Multi-Server Scenario

mcp-oauth-proxy can front multiple MCP servers:

```yaml
# config.yaml
upstreams:
  - name: obot-entraid
    url: http://localhost:3000
    paths: ["/platform/*"]
    require_auth: true

  - name: obot-tools-gmail
    url: http://localhost:4000
    paths: ["/tools/gmail/*"]
    require_auth: true
    scopes: ["gmail.readonly", "gmail.send"]

  - name: third-party-mcp
    url: http://localhost:5000
    paths: ["/external/*"]
    require_auth: false  # Public access
```

Clients access all servers through one OAuth gateway:

```bash
# Platform API (authenticated)
curl http://localhost:8080/platform/agents \
  -H "Authorization: Bearer ${TOKEN}"

# Gmail tool (authenticated, requires gmail scopes)
curl http://localhost:8080/tools/gmail/send \
  -H "Authorization: Bearer ${TOKEN}"

# External MCP (public, no auth)
curl http://localhost:8080/external/status
```

### Integration Benefits

| Feature | Benefit |
| --------- | --------- |
| **Zero Code Changes** | Add auth to any MCP server without modification |
| **OAuth 2.1 PKCE** | Modern, secure authentication flow |
| **Multi-Provider** | Google, GitHub, Microsoft, custom OIDC |
| **Token Management** | Automatic refresh, revocation |
| **Audit Logging** | Track all authenticated requests |

### Security Considerations

| Aspect | Implementation |
| -------- | ---------------- |
| **Transport** | TLS required in production |
| **Token Storage** | Encrypted at rest in database |
| **Code Challenge** | PKCE required, plain code_challenge_method rejected |
| **Header Trust** | obot-entraid MUST validate `TRUST_FORWARDED_HEADERS=true` |
| **CORS** | Configure allowed origins carefully |

### Key Files

**mcp-oauth-proxy:**
| File | Purpose |
| ------ | --------- |
| `pkg/proxy/proxy.go` | Main proxy logic and request forwarding |
| `pkg/oauth/flow.go` | OAuth 2.1 authorization code + PKCE flow |
| `pkg/providers/*.go` | Provider-specific implementations |

**obot-entraid:**
| File | Purpose |
| ------ | --------- |
| `pkg/middleware/auth.go` | Header extraction and user context |

### Reference

- **OAuth Flow:** [Architecture Reference - OAuth 2.1 Flow](../reference/architecture.md#oauth-21-flow-mcp-oauth-proxy)
- **mcp-oauth-proxy API:** [API Reference - mcp-oauth-proxy](../reference/api-reference.md#2-mcp-oauth-proxy---oauth-21-proxy)

---

## 4. Additional Integration Patterns

### obot-entraid + kinm

**Use Case:** Use kinm as an alternative to direct Kubernetes API for storing obot-entraid resources.

```go
// Instead of talking to K8s API, use kinm
import "github.com/obot-platform/kinm/pkg/client"

kinmClient := client.New("http://localhost:8080")

// CRUD operations work the same
agent := &obotv1.Agent{...}
err := kinmClient.Create(ctx, agent)
```

**Why:** Simpler deployment (PostgreSQL only, no K8s cluster), still get K8s-like API semantics.

---

### obot-tools as Standalone MCP Servers

**Use Case:** Run individual obot-tools components as standalone MCP servers.

```bash
# Gmail MCP server (from obot-tools)
cd obot-tools/gmail
export GOOGLE_CLIENT_ID=...
export GOOGLE_CLIENT_SECRET=...
./gmail-server --port 4000

# Slack MCP server
cd obot-tools/slack
export SLACK_TOKEN=...
./slack-server --port 4001
```

Then connect via mcp-oauth-proxy or directly from clients.

---

### namegenerator Everywhere

**Use Case:** All projects use namegenerator for generating unique resource names.

```go
import "github.com/obot-platform/namegenerator"

// Generate unique agent name
name := namegenerator.Generate()
// Example: "happy-otter-7d9f"

// Use in any project
agent := &obotv1.Agent{
    ObjectMeta: metav1.ObjectMeta{
        Name: name,
    },
}
```

**Why:** Consistent, human-readable, collision-resistant naming across all projects.

---

### mcp-catalog for Configuration Management

**Use Case:** Centralize all MCP server configurations in mcp-catalog, consumed by obot-entraid.

```yaml
# mcp-catalog/configs/agents/openai-agent.yaml
apiVersion: obot.ai/v1
kind: Agent
metadata:
  name: openai-assistant
spec:
  model:
    provider: openai
    name: gpt-4
  tools:
    - name: gmail
      config: ./configs/tools/gmail.yaml
```

obot-entraid loads these configs at startup or dynamically.

---

## 📦 Deployment Examples

### Example 1: Development Laptop (All Components)

**Scenario:** Developer running all projects locally for development.

```bash
# Terminal 1: Start PostgreSQL
docker run -d --name postgres -p 5432:5432 \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_USER=dev \
  -e POSTGRES_DB=obot \
  postgres:16

# Terminal 2: Start mcp-oauth-proxy
cd mcp-oauth-proxy
export DATABASE_URL=postgres://dev:dev@localhost:5432/oauthproxy
make run

# Terminal 3: Start obot-entraid (behind proxy)
cd obot-entraid
export DATABASE_URL=postgres://dev:dev@localhost:5432/obot
export BEHIND_OAUTH_PROXY=true
make dev

# Terminal 4: Build obot-tools providers
cd obot-tools
make build

# Connect via VSCode MCP extension
# URL: http://localhost:8080/mcp
# OAuth will prompt for authentication
```

---

### Example 2: Docker Compose (Production-Like)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: obot
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: obot
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mcp-oauth-proxy:
    build: ./mcp-oauth-proxy
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://obot:${DB_PASSWORD}@postgres:5432/oauthproxy
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
    depends_on:
      - postgres

  obot-entraid:
    build: ./obot-entraid
    environment:
      DATABASE_URL: postgres://obot:${DB_PASSWORD}@postgres:5432/obot
      BEHIND_OAUTH_PROXY: "true"
      TRUST_FORWARDED_HEADERS: "true"
    depends_on:
      - postgres
      - mcp-oauth-proxy

  kinm:
    build: ./kinm
    ports:
      - "9090:8080"
    environment:
      DATABASE_URL: postgres://obot:${DB_PASSWORD}@postgres:5432/kinm
    depends_on:
      - postgres

volumes:
  postgres_data:
```

```bash
# Deploy
docker-compose up -d

# Access
# - OAuth Proxy: http://localhost:8080
# - kinm API: http://localhost:9090
```

---

### Example 3: Kubernetes Production Deployment

```yaml
# k8s-deployment.yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: obot

---
apiVersion: v1
kind: Secret
metadata:
  name: obot-secrets
  namespace: obot
type: Opaque
stringData:
  db-password: <base64-encoded>
  google-client-id: <base64-encoded>
  google-client-secret: <base64-encoded>

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: obot
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: obot-secrets
              key: db-password
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: postgres-pvc

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-oauth-proxy
  namespace: obot
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mcp-oauth-proxy
  template:
    metadata:
      labels:
        app: mcp-oauth-proxy
    spec:
      containers:
      - name: proxy
        image: ghcr.io/obot-platform/mcp-oauth-proxy:latest
        env:
        - name: DATABASE_URL
          value: postgres://obot:$(DB_PASSWORD)@postgres:5432/oauthproxy
        - name: GOOGLE_CLIENT_ID
          valueFrom:
            secretKeyRef:
              name: obot-secrets
              key: google-client-id
        ports:
        - containerPort: 8080

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: obot-entraid
  namespace: obot
spec:
  replicas: 3
  selector:
    matchLabels:
      app: obot-entraid
  template:
    metadata:
      labels:
        app: obot-entraid
    spec:
      containers:
      - name: obot
        image: ghcr.io/obot-platform/obot-entraid:latest
        env:
        - name: DATABASE_URL
          value: postgres://obot:$(DB_PASSWORD)@postgres:5432/obot
        - name: BEHIND_OAUTH_PROXY
          value: "true"
        ports:
        - containerPort: 3000

---
apiVersion: v1
kind: Service
metadata:
  name: mcp-oauth-proxy
  namespace: obot
spec:
  type: LoadBalancer
  selector:
    app: mcp-oauth-proxy
  ports:
  - port: 443
    targetPort: 8080
```

```bash
# Deploy
kubectl apply -f k8s-deployment.yaml

# Get external IP
kubectl get svc -n obot mcp-oauth-proxy

# Access via external IP
```

---

### Example 4: Multi-Tenant Deployment

**Scenario:** Multiple isolated obot-entraid instances, shared OAuth proxy.

```
┌────────────────────────────────────────────────────────────┐
│                   mcp-oauth-proxy (Shared)                 │
│                    OAuth Gateway Layer                     │
└──────────────────────┬─────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼───────┐ ┌────▼─────────┐ ┌─▼─────────────┐
│ obot-entraid  │ │obot-entraid  │ │ obot-entraid  │
│   (Tenant A)  │ │  (Tenant B)  │ │  (Tenant C)   │
│  DB: tenant_a │ │ DB: tenant_b │ │ DB: tenant_c  │
└───────────────┘ └──────────────┘ └───────────────┘
```

**Configuration:**

```yaml
# mcp-oauth-proxy tenant routing
upstreams:
  - name: tenant-a
    url: http://obot-entraid-a:3000
    paths: ["/t/tenant-a/*"]
    require_auth: true

  - name: tenant-b
    url: http://obot-entraid-b:3000
    paths: ["/t/tenant-b/*"]
    require_auth: true

  - name: tenant-c
    url: http://obot-entraid-c:3000
    paths: ["/t/tenant-c/*"]
    require_auth: true
```

---

## 🏛️ Architecture Patterns

### Pattern 1: Controller Framework Pattern (nah)

**When to Use:**
- Building Kubernetes-style controllers
- Need reconciliation loops
- Want declarative resource management

**Key Characteristics:**
- Event-driven architecture
- Desired state via Apply pattern
- Automatic retries and error handling
- Leader election for HA

**Example Projects:** obot-entraid (uses nah for Agent/Workflow controllers)

---

### Pattern 2: Provider Plugin Pattern (obot-tools)

**When to Use:**
- Extensible architecture needed
- Third-party integrations
- Isolate provider failures

**Key Characteristics:**
- Dynamic loading at runtime
- Interface-based contracts
- Process isolation (optional)
- Version management

**Example Projects:** obot-entraid (loads model/auth providers from obot-tools)

---

### Pattern 3: OAuth Gateway Pattern (mcp-oauth-proxy)

**When to Use:**
- Adding auth to existing services
- Multi-service authentication
- Centralized token management

**Key Characteristics:**
- Reverse proxy architecture
- Header injection
- Token refresh/revocation
- Provider abstraction

**Example Projects:** mcp-oauth-proxy fronting obot-entraid, obot-tools

---

### Pattern 4: Configuration-as-Code (mcp-catalog)

**When to Use:**
- GitOps workflows
- Version-controlled configs
- Centralized configuration management

**Key Characteristics:**
- YAML-based definitions
- Schema validation
- Git workflow integration
- Dynamic reloading

**Example Projects:** mcp-catalog providing configs for obot-entraid

---

### Pattern 5: Library-First Design (nah, namegenerator)

**When to Use:**
- Reusable components across projects
- Zero-dependency utilities
- Framework development

**Key Characteristics:**
- No executables, library only
- Minimal dependencies
- Strong interface contracts
- Comprehensive tests

**Example Projects:** nah (controller framework), namegenerator (utility library)

---

## 🚀 Getting Started by Use Case

### Use Case 1: "I want to run a local MCP platform"

**Quickest Path:**
```bash
# 1. Start database
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:16

# 2. Start obot-entraid
cd obot-entraid
export DATABASE_URL=postgres://postgres:dev@localhost:5432/obot
make dev

# 3. Access UI
open http://localhost:3000
```

**Components:** obot-entraid only
**Time:** 5 minutes

---

### Use Case 2: "I want to add OAuth to my MCP servers"

**Quickest Path:**
```bash
# 1. Start OAuth proxy
cd mcp-oauth-proxy
export DATABASE_URL=sqlite://oauth.db
export GOOGLE_CLIENT_ID=<your-id>
export GOOGLE_CLIENT_SECRET=<your-secret>
make run

# 2. Point your MCP servers to run behind proxy
# Configure proxy upstreams in config.yaml

# 3. Clients connect via proxy
curl http://localhost:8080/mcp/tools \
  -H "Authorization: Bearer <token>"
```

**Components:** mcp-oauth-proxy + your MCP server
**Time:** 10 minutes

---

### Use Case 3: "I want to build a Kubernetes controller"

**Quickest Path:**
```bash
# 1. Create controller using nah
cd my-controller
go get github.com/obot-platform/nah

# 2. Write controller (see nah README for example)
# 3. Test locally
go run . --kubeconfig ~/.kube/config
```

**Components:** nah library + your controller
**Time:** 30 minutes

---

### Use Case 4: "I want to deploy everything in production"

**Quickest Path:**
```bash
# Use Kubernetes deployment example
kubectl apply -f k8s-deployment.yaml
```

**Components:** All 7 projects
**Time:** 1 hour (including DNS, TLS setup)

---

## 📚 Reference

### Documentation

- **[Architecture Reference](../reference/architecture.md)** - Detailed architecture diagrams for all projects
- **[API Reference](../reference/api-reference.md)** - API endpoints and interfaces for all projects
- **[Project Index](../reference/project-index.md)** - Individual project documentation links

### Project READMEs

| Project | README |
| --------- | -------- |
| obot-entraid | `obot-entraid/README.md` |
| nah | `nah/README.md` |
| kinm | `kinm/README.md` |
| mcp-oauth-proxy | `mcp-oauth-proxy/README.md` |
| obot-tools | `obot-tools/README.md` |
| mcp-catalog | `mcp-catalog/README.md` |
| namegenerator | `namegenerator/README.md` |

### Additional Resources

- **[Workspace README](../../../README.md)** - Quick start and workspace overview
- **[AGENTS.md](../../../AGENTS.md)** - Universal AI coding agent instructions
- **[CLAUDE.md](../../../CLAUDE.md)** - Claude Code-specific guidance

---

## 🤝 Contributing

When adding new integration patterns:

1. **Document the integration** - Add a new section to this guide
2. **Provide examples** - Include working code examples
3. **Show diagrams** - Use ASCII and/or Mermaid diagrams
4. **Update references** - Link to relevant API/architecture docs

---

## 📝 Changelog

| Version | Date | Changes |
| --------- | ---------- | --------- |
| 1.0.0 | 2026-01-20 | Initial release covering all 7 projects |

---

**Need Help?**
- Open an issue in the relevant project repository
- Check project-specific CLAUDE.md files for detailed guidance
- Review TROUBLESHOOTING.md for common integration issues
