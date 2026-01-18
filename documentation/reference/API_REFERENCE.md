# API Reference - AI/MCP Multi-Repo Workspace

**Version:** 1.0.0
**Last Updated:** 2026-01-17
**Scope:** Cross-project API reference and integration guide

**Navigation:**
• [Quick Reference](#-quick-reference)
• [Project APIs](#️-project-apis)
• [Integration Patterns](#-integration-patterns)
• [Examples](#-examples)

---

## 📋 Quick Reference

### API Endpoints by Project

| Project | Type | Base Path | Port | Auth |
| --------- | ------ | ----------- | ------ | ------ |
| obot-entraid | HTTP/REST | `/` | 8080 | OAuth2 |
| mcp-oauth-proxy | HTTP/OAuth | `/oauth2/*`, `/mcp/*` | 8080 | OAuth 2.1 |
| kinm | HTTP/K8s-like | `/api/v1/*` | 8080 | Token |
| obot-tools | MCP/HTTP | Varies by tool | Varies | Provider-specific |

### Key Interfaces (Go)

| Project | Interface | Purpose |
| --------- | ----------- | --------- |
| nah | `Backend` | Kubernetes operations |
| nah | `Apply` | Declarative state management |
| nah | `Handler` | Event handling |
| kinm | `Storage` | Database operations |
| mcp-oauth-proxy | `Provider` | OAuth provider integration |

---

## 🏗️ Project APIs

## 1. nah - Kubernetes Controller Framework

### Core Interfaces

#### Backend Interface

```go
// Backend provides unified Kubernetes operations
type Backend interface {
    Get(ctx context.Context, key client.ObjectKey, obj client.Object) error
    List(ctx context.Context, list client.ObjectList, opts ...client.ListOption) error
    Create(ctx context.Context, obj client.Object, opts ...client.CreateOption) error
    Update(ctx context.Context, obj client.Object, opts ...client.UpdateOption) error
    Delete(ctx context.Context, obj client.Object, opts ...client.DeleteOption) error
    Patch(ctx context.Context, obj client.Object, patch client.Patch, opts ...client.PatchOption) error
    
    // Cached operations
    GetCached(ctx context.Context, key client.ObjectKey, obj client.Object) error
    ListCached(ctx context.Context, list client.ObjectList, opts ...client.ListOption) error
}
```

**Location:** `nah/pkg/backend/backend.go`

**Usage:**

```go
backend := resp.Backend()

// Get resource
var pod corev1.Pod
err := backend.Get(ctx, client.ObjectKey{
    Namespace: "default",
    Name:      "my-pod",
}, &pod)

// List resources
var pods corev1.PodList
err := backend.List(ctx, &pods, 
    client.InNamespace("default"),
    client.MatchingLabels{"app": "myapp"})
```

#### Apply Interface

```go
// Apply provides declarative resource management
type Apply interface {
    Apply(owner runtime.Object, objects []runtime.Object) error
    Ensure(owner runtime.Object, objects []runtime.Object) error
    WithOwner(owner runtime.Object) Apply
    WithSetID(id string) Apply
}
```

**Location:** `nah/pkg/apply/apply.go`

**Usage:**

```go
import "github.com/obot-platform/nah/pkg/apply"

a := apply.New(resp.Backend(), "my-controller")

// Define desired state
desired := []runtime.Object{
    &corev1.ConfigMap{
        ObjectMeta: metav1.ObjectMeta{
            Name:      "my-config",
            Namespace: obj.Namespace,
        },
        Data: map[string]string{"key": "value"},
    },
}

// Apply desired state (creates/updates/deletes to match)
err := a.Apply(obj, desired)
```

#### Handler Interface

```go
// Handler processes Kubernetes resources
type Handler interface {
    Handle(req Request, resp Response) error
}

// HandlerFunc adapter
type HandlerFunc func(Request, Response) error

// Request contains the object being processed
type Request struct {
    Object client.Object
    Key    client.ObjectKey
}

// Response provides backend and output
type Response interface {
    Backend() Backend
    Objects(objs ...client.Object) error
}
```

**Location:** `nah/pkg/router/handler.go`

**Usage:**

```go
router.Type(&corev1.ConfigMap{}).
    Namespace("default").
    HandlerFunc(func(req router.Request, resp router.Response) error {
        cm := req.Object.(*corev1.ConfigMap)
        
        // Process resource
        fmt.Printf("Processing: %s/%s\n", cm.Namespace, cm.Name)
        
        // Apply changes
        return apply.New(resp.Backend(), "my-controller").
            Apply(cm, desiredObjects)
    })
```

### Router API

#### Creating a Router

```go
import "github.com/obot-platform/nah"

// Default router with leader election
router, err := nah.DefaultRouter("my-controller", scheme)

// Custom router
opts := &nah.Options{
    Scheme:      scheme,
    Namespace:   "default",
    HealthzPort: 9090,
    ElectionConfig: nil, // Disable leader election
    GVKThreadiness: map[schema.GroupVersionKind]int{
        corev1.SchemeGroupVersion.WithKind("ConfigMap"): 10,
    },
}
router, err := nah.NewRouter("my-controller", opts)
```

**Location:** `nah/router.go`

#### Route Configuration

```go
// Basic route
router.Type(&corev1.Pod{}).
    HandlerFunc(handlePod)

// Namespace filter
router.Type(&corev1.ConfigMap{}).
    Namespace("kube-system").
    HandlerFunc(handleConfigMap)

// Label selector
router.Type(&corev1.Pod{}).
    Selector(labels.Set{"app": "myapp"}).
    HandlerFunc(handlePod)

// Middleware
router.Type(&corev1.Pod{}).
    Middleware(router.ErrorPrefix("pod-handler")).
    HandlerFunc(handlePod)

// Field selector
router.Type(&corev1.Pod{}).
    FieldSelector(fields.OneTermEqualSelector("spec.nodeName", "node-1")).
    HandlerFunc(handlePod)
```

### Leader Election API

```go
import "github.com/obot-platform/nah/pkg/leader"

// Lease-based (default)
config := leader.NewDefaultElectionConfig("", "my-controller", restConfig)

// File-based
config := &leader.ElectionConfig{
    LockType: leader.LockTypeFile,
    LockName: "/tmp/my-controller.lock",
}

// Custom parameters
config := &leader.ElectionConfig{
    LockType:      leader.LockTypeLease,
    LockName:      "my-controller",
    LockNamespace: "kube-system",
    LeaseDuration: 15 * time.Second,
    RenewDeadline: 10 * time.Second,
    RetryPeriod:   2 * time.Second,
}
```

**Location:** `nah/pkg/leader/leader.go`

---

## 2. mcp-oauth-proxy - OAuth 2.1 Proxy

### HTTP Endpoints

#### OAuth 2.1 Flow

**Start OAuth Flow**

```http
GET /oauth2/start
```

**Response:**

- Redirects to OAuth provider authorization URL
- Sets state cookie for CSRF protection

---

**OAuth Callback**

```http
GET /oauth2/callback?code={auth_code}&state={state}
```

**Parameters:**

- `code` - Authorization code from provider
- `state` - CSRF protection state

**Response:**

- Exchanges code for access token
- Issues proxy access token
- Redirects to success page or returns JSON

---

**Sign Out**

```http
GET /oauth2/sign_out
```

**Response:**

- Clears session cookies
- Redirects to logout page

---

#### MCP Proxy Endpoints

**Get Session State**

```http
POST /obot-get-state
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "user_id": "12345",
  "email": "user@example.com",
  "name": "John Doe",
  "expires_at": "2026-01-15T10:00:00Z"
}
```

---

**Get User Info**

```http
GET /obot-get-user-info
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "id": "12345",
  "email": "user@example.com",
  "name": "John Doe",
  "email_verified": true
}
```

---

**Get Profile Picture URL**

```http
GET /obot-get-icon-url
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "icon_url": "https://example.com/avatar.jpg"
}
```

---

**Proxy MCP Request**

```http
POST /mcp/{server_path}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "method": "tools/list",
  "params": {}
}
```

**Headers Injected to Upstream:**

- `X-Forwarded-User: 12345`
- `X-Forwarded-Email: user@example.com`
- `X-Forwarded-Name: John Doe`
- `X-Forwarded-Access-Token: ya29.a0ARrd...`

**Response:**
Proxied from MCP server

---

### Configuration

**Environment Variables:**

```bash
# Required
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_AUTHORIZE_URL=https://accounts.google.com
SCOPES_SUPPORTED=openid,email,profile
MCP_SERVER_URL=http://localhost:9000/mcp/service
ENCRYPTION_KEY=base64-encoded-32-byte-key

# Optional
DATABASE_DSN=postgres://user:pass@localhost/db  # Default: SQLite
SERVER_PORT=8080
LOG_LEVEL=info
```

---

## 3. kinm - K8s-like API Server

### REST API

**Base Path:** `/api/v1`

#### Resource Operations

**List Resources**

```http
GET /api/v1/{resource_type}
GET /api/v1/namespaces/{namespace}/{resource_type}
```

**Query Parameters:**

- `labelSelector` - Label selector (e.g., `app=myapp,tier=frontend`)
- `fieldSelector` - Field selector
- `limit` - Max results
- `continue` - Continuation token
- `watch` - Enable watch mode (true/false)

**Response:**

```json
{
  "kind": "PodList",
  "apiVersion": "v1",
  "metadata": {
    "resourceVersion": "12345"
  },
  "items": [...]
}
```

---

**Get Resource**

```http
GET /api/v1/namespaces/{namespace}/{resource_type}/{name}
```

**Response:**

```json
{
  "kind": "Pod",
  "apiVersion": "v1",
  "metadata": {
    "name": "my-pod",
    "namespace": "default",
    "resourceVersion": "12345"
  },
  "spec": {...},
  "status": {...}
}
```

---

**Create Resource**

```http
POST /api/v1/namespaces/{namespace}/{resource_type}
Content-Type: application/json

{
  "kind": "Pod",
  "apiVersion": "v1",
  "metadata": {
    "name": "my-pod"
  },
  "spec": {...}
}
```

**Response:** Created resource (201 Created)

---

**Update Resource**

```http
PUT /api/v1/namespaces/{namespace}/{resource_type}/{name}
Content-Type: application/json

{
  "kind": "Pod",
  "apiVersion": "v1",
  "metadata": {
    "name": "my-pod",
    "resourceVersion": "12345"
  },
  "spec": {...}
}
```

**Response:** Updated resource

---

**Patch Resource**

```http
PATCH /api/v1/namespaces/{namespace}/{resource_type}/{name}
Content-Type: application/strategic-merge-patch+json

{
  "metadata": {
    "labels": {
      "new-label": "value"
    }
  }
}
```

**Patch Types:**

- `application/json-patch+json` - JSON Patch (RFC 6902)
- `application/merge-patch+json` - JSON Merge Patch (RFC 7386)
- `application/strategic-merge-patch+json` - Strategic Merge Patch (K8s)

---

**Delete Resource**

```http
DELETE /api/v1/namespaces/{namespace}/{resource_type}/{name}
```

**Response:** 204 No Content or deleted resource

---

**Watch Resources**

```http
GET /api/v1/namespaces/{namespace}/{resource_type}?watch=true
```

**Response:** Stream of watch events

```json
{"type":"ADDED","object":{...}}
{"type":"MODIFIED","object":{...}}
{"type":"DELETED","object":{...}}
```

---

## 4. obot-tools - Tools & Providers

### Model Provider API

All model providers follow OpenAI-compatible API:

**Base Pattern:** Each provider runs as HTTP server

**Chat Completions**

```http
POST /v1/chat/completions
Content-Type: application/json
Authorization: Bearer {api_key}

{
  "model": "gpt-4",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 150
}
```

**Response:**

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you?"
    },
    "finish_reason": "stop"
  }]
}
```

---

**Embeddings**

```http
POST /v1/embeddings
Content-Type: application/json
Authorization: Bearer {api_key}

{
  "model": "text-embedding-ada-002",
  "input": ["Hello world", "Another text"]
}
```

**Response:**

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [0.1, 0.2, ...],
      "index": 0
    }
  ],
  "model": "text-embedding-ada-002"
}
```

---

### Auth Provider API

All auth providers implement these endpoints:

**Get Daemon Address**

```http
GET /{$}
```

**Response:**

```json
{
  "address": "http://localhost:8080"
}
```

---

**Start OAuth**

```http
GET /oauth2/start?redirect_uri={uri}
```

**Response:** Redirect to OAuth provider

---

**OAuth Callback**

```http
GET /oauth2/callback?code={code}&state={state}
```

**Response:** Redirect or JSON with tokens

---

**Get Session State**

```http
POST /obot-get-state
Content-Type: application/json

{
  "session_id": "abc123"
}
```

**Response:**

```json
{
  "user_id": "github|12345",
  "email": "user@example.com",
  "name": "John Doe"
}
```

---

**Get User Info**

```http
GET /obot-get-user-info
Cookie: session=abc123
```

**Response:**

```json
{
  "id": "github|12345",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://avatars.githubusercontent.com/..."
}
```

---

### Tool Registry API

**Registry File:** `obot-tools/index.yaml`

**Structure:**

```yaml
tools:
  - name: memory
    description: Long-term memory for agents
    modelName: memory from github.com/obot-platform/tools/memory
    localPath: ./memory
    
modelProviders:
  - name: openai-model-provider
    description: OpenAI GPT models and embeddings
    modelName: openai-model-provider from github.com/obot-platform/tools/openai-model-provider
    localPath: ./openai-model-provider

authProviders:
  - name: github-auth-provider
    description: GitHub OAuth2 authentication
    modelName: github-auth-provider from github.com/obot-platform/tools/github-auth-provider
    localPath: ./github-auth-provider
```

---

## 🔗 Integration Patterns

### Pattern 1: nah Controller with Apply

```go
import (
    "github.com/obot-platform/nah"
    "github.com/obot-platform/nah/pkg/apply"
    "github.com/obot-platform/nah/pkg/router"
)

func main() {
    r, _ := nah.DefaultRouter("my-controller", scheme)
    
    r.Type(&MyResource{}).HandlerFunc(func(req router.Request, resp router.Response) error {
        obj := req.Object.(*MyResource)
        
        // Define desired state
        desired := []runtime.Object{
            &corev1.ConfigMap{
                ObjectMeta: metav1.ObjectMeta{
                    Name:      obj.Name + "-config",
                    Namespace: obj.Namespace,
                },
                Data: map[string]string{
                    "key": "value",
                },
            },
        }
        
        // Apply (creates/updates/deletes to match)
        return apply.New(resp.Backend(), "my-controller").Apply(obj, desired)
    })
    
    r.Start(context.Background())
}
```

---

### Pattern 2: MCP Server with OAuth Proxy

```bash
# 1. Start MCP server
cd obot-tools/gmail
python -m obot_gmail_mcp.server
# Runs on http://localhost:9000/mcp/gmail

# 2. Start OAuth proxy
cd mcp-oauth-proxy
export OAUTH_CLIENT_ID="google-client-id"
export OAUTH_CLIENT_SECRET="google-secret"
export OAUTH_AUTHORIZE_URL="https://accounts.google.com"
export SCOPES_SUPPORTED="openid,email,profile,https://www.googleapis.com/auth/gmail.readonly"
export MCP_SERVER_URL="http://localhost:9000/mcp/gmail"
export ENCRYPTION_KEY="$(openssl rand -base64 32)"
go run .
# Proxy runs on http://localhost:8080

# 3. Client connects to proxy
# Proxy handles OAuth, injects headers, forwards to MCP server
```

**Flow:**

```
Client → OAuth Proxy → OAuth Provider (Google)
         ↓
Client ← Access Token
         ↓
Client → MCP Request + Token → Proxy → MCP Server
                                 ↓
                          (+ X-Forwarded-User)
                          (+ X-Forwarded-Email)
                          (+ X-Forwarded-Access-Token)
```

---

### Pattern 3: Obot Platform Integration

```yaml
# obot-entraid deployment with custom auth
apiVersion: v1
kind: ConfigMap
metadata:
  name: obot-config
data:
  tools-index.yaml: |
    tools:
      - name: entra-auth-provider
        modelName: entra-auth-provider from github.com/jrmatherly/obot-entraid/tools/entra-auth-provider
        
    authProviders:
      - name: entra-auth-provider
        description: Microsoft Entra ID authentication
```

---

### Pattern 4: Multi-Provider Model Access

```python
# Using multiple model providers through obot-tools

import requests

# OpenAI
response = requests.post(
    "http://openai-provider:8000/v1/chat/completions",
    headers={"Authorization": f"Bearer {api_key}"},
    json={"model": "gpt-4", "messages": messages}
)

# Anthropic
response = requests.post(
    "http://anthropic-provider:8001/v1/chat/completions",
    headers={"Authorization": f"Bearer {api_key}"},
    json={"model": "claude-3-5-sonnet", "messages": messages}
)

# Ollama (local)
response = requests.post(
    "http://ollama-provider:8002/v1/chat/completions",
    json={"model": "llama2", "messages": messages}
)
```

---

## 📝 Examples

### Example 1: Simple Controller

```go
package main

import (
    "context"
    "fmt"
    
    "github.com/obot-platform/nah"
    "github.com/obot-platform/nah/pkg/router"
    corev1 "k8s.io/api/core/v1"
    "k8s.io/apimachinery/pkg/runtime"
    utilruntime "k8s.io/apimachinery/pkg/util/runtime"
    clientgoscheme "k8s.io/client-go/kubernetes/scheme"
)

func main() {
    scheme := runtime.NewScheme()
    utilruntime.Must(clientgoscheme.AddToScheme(scheme))
    
    r, err := nah.DefaultRouter("configmap-watcher", scheme)
    if err != nil {
        panic(err)
    }
    
    r.Type(&corev1.ConfigMap{}).
        Namespace("default").
        HandlerFunc(func(req router.Request, resp router.Response) error {
            cm := req.Object.(*corev1.ConfigMap)
            fmt.Printf("ConfigMap %s/%s: %v\n", cm.Namespace, cm.Name, cm.Data)
            return nil
        })
    
    if err := r.Start(context.Background()); err != nil {
        panic(err)
    }
}
```

---

### Example 2: OAuth Proxy Setup

```bash
#!/bin/bash
# setup-oauth-proxy.sh

# Generate encryption key
export ENCRYPTION_KEY=$(openssl rand -base64 32)

# Configure for Google OAuth
export OAUTH_CLIENT_ID="123456-abcdef.apps.googleusercontent.com"
export OAUTH_CLIENT_SECRET="GOCSPX-xyz123"
export OAUTH_AUTHORIZE_URL="https://accounts.google.com"
export SCOPES_SUPPORTED="openid,email,profile,https://www.googleapis.com/auth/gmail.readonly"
export MCP_SERVER_URL="http://localhost:9000/mcp/gmail"

# Run proxy
./mcp-oauth-proxy
```

---

### Example 3: Model Provider Client

```python
# openai_client.py
import os
import requests

class ModelClient:
    def __init__(self, provider_url: str, api_key: str):
        self.base_url = provider_url
        self.api_key = api_key
    
    def chat(self, model: str, messages: list, **kwargs):
        response = requests.post(
            f"{self.base_url}/v1/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={
                "model": model,
                "messages": messages,
                **kwargs
            }
        )
        return response.json()
    
    def embed(self, model: str, texts: list):
        response = requests.post(
            f"{self.base_url}/v1/embeddings",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={
                "model": model,
                "input": texts
            }
        )
        return response.json()

# Usage
client = ModelClient(
    "http://localhost:8000",
    os.getenv("OPENAI_API_KEY")
)

result = client.chat(
    "gpt-4",
    [{"role": "user", "content": "Hello!"}]
)
print(result["choices"][0]["message"]["content"])
```

---

## 🔒 Authentication & Security

### OAuth 2.1 Flow (mcp-oauth-proxy)

```
1. Client initiates: GET /oauth2/start
   ↓
2. Redirect to provider: https://accounts.google.com/o/oauth2/v2/auth
   ↓
3. User authenticates and grants permission
   ↓
4. Provider redirects: GET /oauth2/callback?code=AUTH_CODE
   ↓
5. Exchange code for token
   ↓
6. Issue proxy access token to client
   ↓
7. Client makes requests with proxy token
   ↓
8. Proxy validates, injects headers, forwards to MCP server
```

### Header Injection

**mcp-oauth-proxy injects these headers:**

```http
X-Forwarded-User: 123456789012345678
X-Forwarded-Email: user@example.com
X-Forwarded-Name: John Doe
X-Forwarded-Access-Token: ya29.a0ARrdaM...
```

**MCP server uses headers:**

```python
@app.post("/mcp/gmail")
def handle_request(request: Request):
    user_id = request.headers.get("X-Forwarded-User")
    email = request.headers.get("X-Forwarded-Email")
    access_token = request.headers.get("X-Forwarded-Access-Token")
    
    # Use access_token for Gmail API calls
    gmail_service = build_gmail_service(access_token)
    # ...
```

---

## 📚 Reference Documentation

### Project-Specific References

- **nah:** See [nah/PROJECT_INDEX.md](../../nah/PROJECT_INDEX.md) for detailed package reference
- **kinm:** See [kinm/docs/API.md](../../kinm/docs/API.md) for API specifications
- **mcp-oauth-proxy:** See [mcp-oauth-proxy/docs/API_REFERENCE.md](../../mcp-oauth-proxy/docs/API_REFERENCE.md)
- **obot-tools:** See [obot-tools/docs/API_REFERENCE.md](../../obot-tools/docs/API_REFERENCE.md)

### External References

- **Kubernetes API:** https://kubernetes.io/docs/reference/kubernetes-api/
- **OAuth 2.1:** https://oauth.net/2.1/
- **OpenAPI Specification:** https://swagger.io/specification/
- **MCP Specification:** https://modelcontextprotocol.io/

---

*This API reference consolidates key APIs across all projects for quick lookup and integration guidance.*
