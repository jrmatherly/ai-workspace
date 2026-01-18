# Architecture Reference

**AI/MCP Multi-Repo Workspace** - Visual Architecture Diagrams
**Last Updated:** 2026-01-17

> **Formats:** This document contains both ASCII diagrams (universal) and Mermaid diagrams (interactive in GitHub/VS Code).

---

## Table of Contents

1. [Workspace Overview](#workspace-overview)
2. [Project Relationships](#project-relationships)
3. [Data Flows](#data-flows)
   - [OAuth 2.1 Flow](#oauth-21-flow-mcp-oauth-proxy)
   - [MCP Platform](#mcp-platform-obot-entraid)
4. [Component Architectures](#component-architectures)
   - [nah Controller Framework](#kubernetes-controller-pattern-nah)
   - [obot-tools](#obot-tools-architecture)
   - [kinm API Server](#kinm-api-server)
5. [Database Architecture](#database-architecture)
6. [Deployment Architecture](#deployment-architecture)
7. [Development Workflow](#development-workflow)
8. [Technology Stack](#technology-stack)
9. [Security Architecture](#security-architecture)
10. [Viewing Diagrams](#viewing-diagrams)

---

## Workspace Overview

### ASCII Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                AI/MCP Multi-Repo Development Workspace              │
│                         /Users/jason/dev/AI                         │
└─────────────────────────────────────────────────────────────────────┘
                                   │
        ┌──────────────────────────┼───────────────────────────┐
        │                          │                           │
   ┌────▼────┐                 ┌───▼───┐                  ┌────▼────┐
   │  MCP    │                 │  K8s  │                  │  MCP    │
   │Platform │                 │ Tools │                  │Catalog  │
   └─────────┘                 └───────┘                  └─────────┘
        │                           │                         │
┌───────┼───────┐          ┌────────┼────────┐                │
│               │          │        │        │                │
▼               ▼          ▼        ▼        ▼                ▼
obot-entraid    obot-tools nah      kinm     mcp-oauth-proxy  mcp-catalog
(Platform)      (Tools)    (Lib)    (API)    (Proxy)          (Config)

                           Utilities
                              │
                              ▼
                        namegenerator
                          (Library)
```

### Mermaid Diagram

```mermaid
graph TB
    subgraph "AI/MCP Multi-Repo Workspace"
        Root["/Users/jason/dev/AI"]

        subgraph "MCP Platform"
            OE[obot-entraid<br/>Full Platform]
            OT[obot-tools<br/>Tools & Providers]
            MC[mcp-catalog<br/>YAML Configs]
            OP[mcp-oauth-proxy<br/>OAuth Gateway]
        end

        subgraph "K8s Infrastructure"
            NAH[nah<br/>Controller Framework]
            KINM[kinm<br/>API Server]
        end

        subgraph "Utilities"
            NG[namegenerator<br/>Random Name Generator]
        end
    end

    Root --> OE
    Root --> OT
    Root --> MC
    Root --> OP
    Root --> NAH
    Root --> KINM
    Root --> NG

    OE -.uses.-> OT
    OE -.uses.-> OP
    OE -.uses.-> MC

    style OE fill:#e1f5ff
    style OT fill:#fff4e1
    style NAH fill:#f0e1ff
    style KINM fill:#e1ffe1
    style OP fill:#ffe1f0
    style MC fill:#ffe1e1
    style NG fill:#f5f5e1
```

---

## Project Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                        Project Dependencies                     │
└─────────────────────────────────────────────────────────────────┘

obot-entraid ────uses───> obot-tools
      │                        │
      │                        ├─> Model Providers
      │                        ├─> Auth Providers
      │                        └─> Core Tools
      │
      └────uses───> mcp-oauth-proxy
                         │
                         └─> OAuth 2.1 Proxy

nah (framework)
      │
      ├─> Used by: Custom Controllers
      └─> Integrates: controller-runtime, client-go

kinm (API server)
      │
      └─> Standalone API Server

mcp-catalog (configs)
      │
      └─> Used by: obot-entraid, MCP clients

namegenerator (library)
      │
      └─> Standalone utility library for name generation
```

---

## Data Flows

### OAuth 2.1 Flow (mcp-oauth-proxy)

#### ASCII Diagram

```
┌──────────┐          ┌─────────────────┐         ┌────────────┐
│  Client  │          │ mcp-oauth-proxy │         │ MCP Server │
│ (VSCode) │          │  (OAuth 2.1)    │         │  (Gmail)   │
└─────┬────┘          └────────┬────────┘         └──────┬─────┘
      │                        │                         │
      │ 1. Request Access      │                         │
      ├───────────────────────>│                         │
      │                        │                         │
      │ 2. Redirect to OAuth   │                         │
      │<───────────────────────┤                         │
      │                        │                         │
      │ 3. Authenticate        │                         │
      ├────────> Google <──────┤                         │
      │                        │                         │
      │ 4. Auth Code           │                         │
      ├───────────────────────>│                         │
      │                        │                         │
      │ 5. Access Token        │                         │
      │<───────────────────────┤                         │
      │                        │                         │
      │ 6. MCP Request + Token │                         │
      ├───────────────────────>│                         │
      │                        │                         │
      │                        │ 7. Validate + Inject    │
      │                        │    Headers:             │
      │                        │    X-Forwarded-User     │
      │                        │    X-Forwarded-Email    │
      │                        │    X-Forwarded-Token    │
      │                        ├────────────────────────>│
      │                        │                         │
      │                        │ 8. MCP Response         │
      │                        │<────────────────────────┤
      │                        │                         │
      │ 9. Proxy Response      │                         │
      │<───────────────────────┤                         │
      └────────────────────────┴─────────────────────────┘
```

#### Mermaid Sequence Diagram

```mermaid
sequenceDiagram
    participant C as Client<br/>(VSCode/CLI)
    participant P as mcp-oauth-proxy<br/>(OAuth 2.1)
    participant O as OAuth Provider<br/>(Google/Microsoft)
    participant M as MCP Server<br/>(Gmail/Slack)
    participant DB as Database<br/>(PostgreSQL)

    Note over C,M: 1. Authorization Request
    C->>P: GET /oauth/authorize<br/>+ client_id + redirect_uri + code_challenge
    P->>DB: Store AuthRequest<br/>(PKCE verifier)
    P->>C: 302 Redirect to Provider

    Note over C,O: 2. User Authentication
    C->>O: User authenticates
    O->>C: 302 Redirect + auth_code

    Note over C,DB: 3. Token Exchange
    C->>P: GET /oauth/callback<br/>+ code
    P->>DB: Validate AuthRequest<br/>(verify PKCE)
    P->>O: POST /token<br/>(exchange code)
    O->>P: Access Token + Refresh Token
    P->>DB: Store Grant<br/>(encrypted tokens)
    P->>DB: Generate TokenData<br/>(JWT + refresh)
    P->>C: 200 OK<br/>(access_token + refresh_token)

    Note over C,M: 4. API Request
    C->>P: MCP Request<br/>+ Bearer token
    P->>P: Validate JWT
    P->>DB: Get Grant<br/>(decrypt provider token)
    P->>M: Proxied Request<br/>+ X-Forwarded-User<br/>+ X-Forwarded-Email<br/>+ X-Forwarded-Token
    M->>P: Response
    P->>C: Response
```

---

### MCP Platform (obot-entraid)

#### ASCII Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    obot-entraid Platform                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼────────────────────┐
        │                     │                    │
   ┌────▼────┐          ┌─────▼─────┐         ┌────▼─────┐
   │Frontend │          │  Backend  │         │Auth Prvdr│
   │SvelteKit│          │    Go     │         │Entra/KC  │
   └────┬────┘          └─────┬─────┘         └─────┬────┘
        │                     │                     │
        │              ┌──────┼─────┐               │
        │              │      │     │               │
        │         ┌────▼─┐ ┌──▼──┐ ┌▼────┐          │
        │         │ MCP  │ │ MCP │ │ MCP │          │
        │         │ Host │ │ Reg │ │ Gate│          │
        │         └──┬───┘ └─────┘ └──┬──┘          │
        │            │                │             │
        └────────────┼────────────────┼─────────────┘
                     │                │
              ┌──────▼────────┐       │
              │ MCP Servers   │       │
              ├───────────────┤       │
              │ Node.js       │       │
              │ Python        │       │
              │ Containers    │       │
              └───────────────┘       │
                                      │
                            ┌─────────▼─────────┐
                            │   PostgreSQL      │
                            │   (State & Data)  │
                            └───────────────────┘
```

#### Mermaid Diagram

```mermaid
graph TB
    subgraph "Frontend"
        UI[SvelteKit UI<br/>Port 5173 dev / 8080 prod]
        Routes[File-based Routes<br/>src/routes/]
        Components[Components<br/>src/lib/components/]
    end

    subgraph "Backend (Go)"
        API[REST API<br/>:8080]
        MCP_Host[MCP Host<br/>Server Management]
        MCP_Registry[MCP Registry<br/>Catalog]
        MCP_Gateway[MCP Gateway<br/>Access Control]
        Auth[Auth Layer<br/>Entra/Keycloak]
    end

    subgraph "MCP Servers"
        SingleUser[Single-User<br/>npx/uvx/container]
        MultiUser[Multi-User<br/>Shared Instance]
        Remote[Remote<br/>External]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL<br/>CRD Storage)]
        Creds[Credential Store<br/>AES-256]
    end

    UI --> API
    API --> MCP_Host
    API --> MCP_Registry
    API --> MCP_Gateway
    API --> Auth

    MCP_Host --> SingleUser
    MCP_Host --> MultiUser
    MCP_Registry --> Remote

    API --> PG
    Auth --> Creds

    style UI fill:#e1f5ff
    style API fill:#fff4e1
    style MCP_Host fill:#f0e1ff
    style PG fill:#e1ffe1
```

---

## Component Architectures

### Kubernetes Controller Pattern (nah)

#### ASCII Diagram

```
┌────────────────────────────────────────────────────────────┐
│                     nah Controller                         │
└────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
      ┌─────▼─────┐    ┌────▼────┐    ┌─────▼─────┐
      │  Router   │    │ Backend │    │  Apply    │
      │  (Events) │    │  (K8s)  │    │  (State)  │
      └─────┬─────┘    └────┬────┘    └─────┬─────┘
            │               │               │
      ┌─────▼───────────────▼───────────────▼────┐
      │         Kubernetes API Server            │
      └──────────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
     ┌────▼───┐   ┌───▼────┐  ┌─────▼────┐
     │  Pods  │   │Services│  │ConfigMaps│
     └────────┘   └────────┘  └──────────┘

Flow:
1. Watch: Backend watches K8s resources
2. Trigger: Changes trigger Router
3. Handle: Router calls registered handlers
4. Apply: Handler uses Apply for declarative updates
5. Reconcile: Apply creates/updates/deletes resources
```

#### Mermaid Diagram

```mermaid
graph TB
    subgraph "nah Controller Framework"
        Router[Router<br/>Event Orchestrator]
        Backend[Backend<br/>K8s Abstraction]
        Apply[Apply<br/>Declarative Management]

        Router --> |Routes Events| Handler[Handler<br/>Business Logic]
        Handler --> |Read State| Backend
        Handler --> |Compute Desired| Desired[Desired State]
        Desired --> |Apply Changes| Apply
        Apply --> |Create/Update/Delete| Backend
    end

    subgraph "Kubernetes"
        API[API Server]
        Informer[Informers<br/>Watchers]
        Resources[Resources<br/>Pods, Services, etc.]
    end

    Backend <--> |Watch/CRUD| API
    API --> Informer
    Informer --> |Events| Router
    API <--> Resources

    style Router fill:#e1f5ff
    style Backend fill:#fff4e1
    style Apply fill:#f0e1ff
    style Handler fill:#e1ffe1
```

---

### obot-tools Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      obot-tools                            │
│                   Tool Registry (index.yaml)               │
└────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌─────▼─────┐         ┌────▼────┐
   │  Core   │          │   Model   │         │  Auth   │
   │  Tools  │          │ Providers │         │Providers│
   └─────────┘          └───────────┘         └─────────┘
        │                     │                     │
    ┌───┼───┐          ┌──────┼──────┐        ┌────┼────┐
    │   │   │          │      │      │        │    │    │
    ▼   ▼   ▼          ▼      ▼      ▼        ▼    ▼    ▼
  Memory  Task      OpenAI Anthro Ollama   GitHub Google
  Know.   Files                Groq         OAuth  OAuth
  base              DeepSeek   xAI
                    Voyage
```

```mermaid
graph LR
    subgraph "Tool Registry"
        Index[index.yaml<br/>Central Registry]
    end

    subgraph "Model Providers (HTTP :8000)"
        OpenAI[OpenAI Provider<br/>GPT-4, GPT-3.5]
        Anthropic[Anthropic Provider<br/>Claude 3.5]
        Ollama[Ollama Provider<br/>Local Models]
        Groq[Groq Provider<br/>Fast Inference]
    end

    subgraph "Auth Providers"
        GitHub[GitHub OAuth2]
        Google[Google OAuth2]
    end

    subgraph "Core Tools"
        Memory[Memory Tool<br/>Long-term Storage]
        Knowledge[Knowledge Tool<br/>RAG System]
    end

    Index --> OpenAI
    Index --> Anthropic
    Index --> Ollama
    Index --> GitHub
    Index --> Memory
    Index --> Knowledge

    style Index fill:#e1f5ff
    style OpenAI fill:#fff4e1
    style Memory fill:#f0e1ff
```

---

### kinm API Server

```
┌────────────────────────────────────────────┐
│          kinm API Server                   │
└────────────────────────────────────────────┘
                 │
      ┌──────────┼───────────┐
      │          │           │
 ┌────▼────┐ ┌───▼───┐ ┌─────▼─────┐
 │   API   │ │Storage│ │  Watch    │
 │  (REST) │ │ Layer │ │  Engine   │
 └────┬────┘ └───┬───┘ └─────┬─────┘
      │          │           │
      └──────────┼───────────┘
                 │
      ┌──────────▼──────────┐
      │    PostgreSQL       │
      │  (All State in DB)  │
      └─────────────────────┘

Features:
- Kubernetes-like REST API
- CRUD operations (Create, Read, Update, Delete)
- Watch support for real-time updates
- PostgreSQL for all state (no in-memory cache)
- Namespace support
- Label selectors

Endpoints:
- GET /api/v1/{resource_type}
- POST /api/v1/{resource_type}
- PUT /api/v1/{resource_type}/{name}
- PATCH /api/v1/{resource_type}/{name}
- DELETE /api/v1/{resource_type}/{name}
- GET /api/v1/{resource_type}?watch=true
```

---

## Database Architecture

```mermaid
graph TB
    subgraph "mcp-oauth-proxy Database"
        Clients[client_infos<br/>OAuth Clients]
        Grants[grants<br/>User Grants<br/>Encrypted Tokens]
        Tokens[token_datas<br/>JWT + Refresh<br/>SHA-256 Hash]
        AuthCodes[authorization_codes<br/>Temp Codes]
        AuthReqs[stored_auth_requests<br/>PKCE State]
    end

    subgraph "obot-entraid Database"
        MCPServers[mcp_servers<br/>Server Configs]
        Projects[projects<br/>User Projects]
        Threads[threads<br/>Chat Threads]
        Users[users<br/>User Accounts]
    end

    subgraph "obot-tools Database"
        Credentials[credentials<br/>AES-256 Encrypted]
        KnowledgeIdx[knowledge_index<br/>Document Metadata]
        Vectors[pgvector<br/>Embeddings]
    end

    Grants --> |FK| Clients
    Tokens --> |FK| Grants
    AuthCodes --> |FK| Clients

    Threads --> |FK| Projects
    Threads --> |FK| Users

    KnowledgeIdx --> Vectors

    style Grants fill:#ffe1f0
    style Tokens fill:#fff4e1
    style Credentials fill:#e1ffe1
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Namespace: obot"
            OE_Pod[obot-entraid<br/>Deployment]
            UI_Svc[UI Service<br/>:80]
            API_Svc[API Service<br/>:8080]
        end

        subgraph "Namespace: mcp"
            MCP_Pod1[MCP Server 1<br/>Gmail]
            MCP_Pod2[MCP Server 2<br/>Slack]
            Proxy_Pod[OAuth Proxy<br/>:8080]
        end

        subgraph "Namespace: tools"
            Tools_Pod[obot-tools<br/>StatefulSet]
        end
    end

    subgraph "External Services"
        PG[(PostgreSQL<br/>RDS/Cloud SQL)]
        Redis[(Redis<br/>Cache)]
    end

    subgraph "External Auth"
        Entra[Entra ID]
        Keycloak[Keycloak]
    end

    OE_Pod --> API_Svc
    OE_Pod --> UI_Svc
    OE_Pod --> PG
    OE_Pod --> Redis
    OE_Pod --> Entra
    OE_Pod --> Keycloak

    Proxy_Pod --> MCP_Pod1
    Proxy_Pod --> MCP_Pod2

    Tools_Pod --> PG

    style OE_Pod fill:#e1f5ff
    style PG fill:#e1ffe1
    style Proxy_Pod fill:#ffe1f0
```

---

## Development Workflow

```mermaid
graph TD
    Start([Start Development]) --> Choose{Choose<br/>Project}

    Choose --> |obot-entraid| OE[cd obot-entraid]
    Choose --> |nah| NAH[cd nah]
    Choose --> |kinm| KINM[cd kinm]
    Choose --> |others| Other[cd project]

    OE --> ReadDocs[Read CLAUDE.md<br/>& README.md]
    NAH --> ReadDocs
    KINM --> ReadDocs
    Other --> ReadDocs

    ReadDocs --> Setup[Setup<br/>go mod download<br/>go generate]

    Setup --> Branch[Create Branch<br/>git checkout -b feature/name]

    Branch --> Code[Write Code<br/>Add Tests<br/>Update Docs]

    Code --> Validate{Run Validation}

    Validate --> Gen[go generate]
    Gen --> Tidy[go mod tidy]
    Tidy --> Format[go fmt ./...]
    Format --> Lint[make validate]
    Lint --> Test[make test]
    Test --> CI[make validate-ci]

    CI --> |Pass| Commit[git commit -m<br/>"type: message"]
    CI --> |Fail| Code

    Commit --> Push[git push origin<br/>feature/name]

    Push --> PR[Create Pull Request]

    PR --> Review{Code Review}

    Review --> |Changes Requested| Code
    Review --> |Approved| Merge[Merge to Main]

    Merge --> End([Done])

    style Code fill:#e1f5ff
    style Validate fill:#fff4e1
    style CI fill:#f0e1ff
    style Merge fill:#e1ffe1
```

---

## Technology Stack

```
┌────────────────────────────────────────────────────────────┐
│                  Technology Layers                         │
└────────────────────────────────────────────────────────────┘

Frontend Layer
├── SvelteKit 5 (obot-entraid UI)
├── TypeScript
└── Tailwind CSS 4

Backend Layer
├── Go 1.23-1.25 (Primary)
├── Python 3.13+ (ML/AI tools)
└── TypeScript/Node.js 18+ (Image tools)

Framework Layer
├── controller-runtime 0.19 (K8s)
├── client-go 0.31 (K8s)
├── FastAPI (Python services)
└── GPTScript (Tool runtime)

Database Layer
├── PostgreSQL (Production)
└── SQLite (Development)

AI/ML Layer
├── OpenAI (GPT-4, embeddings)
├── Anthropic (Claude 3.5)
├── Ollama (Local models)
├── Groq, xAI, DeepSeek
└── Voyage (Embeddings)

Auth Layer
├── OAuth 2.0/2.1
├── PKCE
├── OIDC
└── AES-256 Encryption

Observability Layer
├── OpenTelemetry 1.35
├── logrus 1.9.3
└── Distributed tracing

Build & Deploy Layer
├── Make
├── Docker
├── Kubernetes
└── Helm
```

---

## Security Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  Security Layers                           │
└────────────────────────────────────────────────────────────┘

Application Layer
├── OAuth 2.1 (mcp-oauth-proxy)
│   ├── PKCE for public clients
│   ├── Authorization code flow
│   └── Token refresh
│
├── Custom Auth Providers (obot-entraid)
│   ├── Entra ID (Microsoft)
│   ├── Keycloak (OIDC)
│   └── Profile picture support
│
└── Auth Providers (obot-tools)
    ├── GitHub OAuth2
    └── Google OAuth2

Data Layer
├── Encryption at Rest
│   ├── AES-256 for credentials
│   ├── Database-level encryption
│   └── Key management via env vars
│
└── Encryption in Transit
    ├── TLS for all HTTP traffic
    └── Secure WebSocket connections

Access Control
├── Token-based authentication
├── Session management
│   ├── Encrypted cookies
│   ├── Short-lived access tokens
│   └── Long-lived refresh tokens
│
└── Header injection
    ├── X-Forwarded-User
    ├── X-Forwarded-Email
    └── X-Forwarded-Access-Token

Secrets Management
├── Environment variables
├── Kubernetes Secrets
├── No hardcoded credentials
└── Secure token generation
```

---

## Additional Diagrams

### CI/CD Pipeline

```mermaid
graph LR
    subgraph "Developer Workflow"
        Dev[Developer] --> Commit[git commit]
        Commit --> Push[git push]
    end

    subgraph "GitHub Actions"
        Push --> Checkout[Checkout Code]
        Checkout --> Setup[Setup Go 1.23+]
        Setup --> Download[Download Deps]
        Download --> ValidateCI[make validate-ci<br/>Check Generated Code]
        ValidateCI --> Validate[make validate<br/>Linting]
        Validate --> Test[make test<br/>Run Tests]
        Test --> Build[make build<br/>Build Binaries]
    end

    subgraph "Deployment"
        Build --> |Success| Docker[Build Docker Image]
        Docker --> Push2[Push to Registry]
        Push2 --> K8s[Deploy to K8s]
    end

    Build --> |Failure| Notify[Notify Developer]
    Notify -.-> Dev

    style ValidateCI fill:#ffe1f0
    style Test fill:#e1f5ff
    style Build fill:#fff4e1
    style K8s fill:#e1ffe1
```

### Knowledge Base RAG Pipeline (obot-tools)

```mermaid
graph LR
    subgraph "Ingestion Pipeline"
        Doc[Documents<br/>PDF, Office, Text] --> Loader[Document Loaders<br/>MuPDF, OCR, Parsers]
        Loader --> Splitter[Text Splitter<br/>Chunking + Overlap]
        Splitter --> Transform[Transformers<br/>Metadata, Keywords]
        Transform --> Embed[Embeddings<br/>OpenAI/Voyage]
        Embed --> Store[(Vector Store<br/>pgvector/sqlite-vec)]
    end

    subgraph "Retrieval Pipeline"
        Query[User Query] --> Modifier[Query Modifiers<br/>Spell Check, LLM Enhance]
        Modifier --> Retriever[Retrievers<br/>Vector + BM25 + Hybrid]
        Retriever --> Store
        Store --> Results[Retrieved Chunks]
        Results --> Processor[Post-Processors<br/>Rerank, Filter, Dedupe]
        Processor --> Final[Final Results<br/>Top-K Relevant Chunks]
    end

    style Doc fill:#e1f5ff
    style Embed fill:#fff4e1
    style Store fill:#f0e1ff
    style Final fill:#e1ffe1
```

---

## Viewing Diagrams

### In GitHub

Simply view this file on GitHub - Mermaid is natively supported.

### In VS Code

Install the "Markdown Preview Mermaid Support" extension:

```bash
code --install-extension bierner.markdown-mermaid
```

### Online Mermaid Editor

Copy and paste diagrams to: https://mermaid.live/

### Export as Images

Use Mermaid CLI:

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i ARCHITECTURE.md -o diagrams.pdf
```

---

*Consolidated from ARCHITECTURE_DIAGRAM.md and MERMAID_DIAGRAMS.md. Contains both ASCII diagrams (universal) and Mermaid diagrams (interactive).*
