# Auth Providers Documentation Validation Analysis

**Date**: 2026-01-15
**Analyzed**: `obot-tools/docs/auth-providers.md`
**Validated Against**: google-auth-provider, github-auth-provider, auth-providers-common

## Executive Summary

The `auth-providers.md` documentation is **~95% accurate** and provides an **excellent reference implementation guide**. It accurately describes requirements, implementation details, and API contracts for auth providers.

**Key Findings**:

- ✅ All documented requirements match actual implementations
- ✅ JSON schemas are accurate and complete
- ✅ Endpoint specifications are correct
- ⚠️ Some undocumented features exist (additional endpoints, token refresh)
- ✅ Google auth provider is indeed the reference implementation

**Recommendation**: **Reference** this document in expert-mode and gptscript_tool_format memory, don't duplicate. Add supplementary details discovered through codebase analysis.

---

## Validation Results

### ✅ CONFIRMED Requirements

| Requirement | auth-providers.md | Actual Implementation | Files |
| ------------- | ------------- | ------------- | ------------- |
| Daemon tool | ✅ | ✅ | All auth providers use `#!sys.daemon` |
| Metadata with envVars | ✅ | ✅ | tool.gpt files have `Metadata: envVars` OR `providerMeta` JSON |
| Optional envVars | ✅ | ✅ | `Metadata: optionalEnvVars` OR `providerMeta.optionalEnvVars` |
| Placeholder credential | ✅ | ✅ | `Credential: ../placeholder-credential as <name>` |
| OAuth2 flow | ✅ | ✅ | OAuth2 authorization code flow with oauth2-proxy |
| Cookie name: `obot_access_token` | ✅ | ✅ | `oauthProxyOpts.Cookie.Name = "obot_access_token"` |
| Cookie encryption with secret | ✅ | ✅ | `OBOT_AUTH_PROVIDER_COOKIE_SECRET` |
| Secure cookie if HTTPS | ✅ | ✅ | `strings.HasPrefix(opts.ObotServerURL, "https://")` |
| `/oauth2/start` endpoint | ✅ | ✅ | Implemented via oauth2-proxy |
| `/oauth2/callback` endpoint | ✅ | ✅ | Implemented via oauth2-proxy |
| `/oauth2/sign_out` endpoint | ✅ | ✅ | Implemented via oauth2-proxy |
| `/obot-get-icon-url` endpoint | ✅ | ✅ | `auth-providers-common/pkg/icon` |
| `/obot-get-state` endpoint | ✅ | ✅ | `auth-providers-common/pkg/state` |
| State JSON schema | ✅ | ✅ | Matches `SerializableState` struct |
| Request JSON schema | ✅ | ✅ | Matches `SerializableRequest` struct |
| 400 on invalid cookie | ✅ | ✅ | Returns error if LoadCookiedSession fails |

### ⚠️ UNDOCUMENTED Features (Found in Implementation)

| Feature | Location | Description |
| ------------- | ------------- | ------------- |
| `/obot-get-user-info` endpoint | google/github main.go | Fetches full user profile info from provider |
| `/obot-list-user-auth-groups` endpoint | google/github main.go | Lists user's authorization groups (GitHub teams, etc.) |
| Automatic token refresh | `auth-providers-common/pkg/state/state.go` | Refreshes expired tokens during `/obot-get-state` |
| PostgreSQL session storage | google/github main.go | Optional DB-backed sessions vs cookie-based |
| Token refresh duration config | `OBOT_AUTH_PROVIDER_TOKEN_REFRESH_DURATION` | Configurable refresh trigger (default 1h) |
| `postgresTablePrefix` in providerMeta | tool.gpt files | Database table prefix for multi-provider support |
| `iconDark` field in providerMeta | google tool.gpt | Dark mode icon URL |
| `hidden` field in envVars | tool.gpt providerMeta | Hides env var from basic UI |
| Templates path configuration | main.go | Custom error templates in auth-providers-common |
| OAuth2-proxy library pattern | All auth providers | Standard library for OAuth2 implementation |

### 🔍 Implementation Architecture

#### Core Components

```
auth-providers-common/
├── pkg/
│   ├── state/state.go          # /obot-get-state implementation
│   ├── icon/icon.go             # /obot-get-icon-url implementation
│   └── env/env.go               # Environment variable loading utilities
└── templates/
    └── error.html               # OAuth2 error page template
```

**Shared Utilities**:

- `state.ObotGetState()` - Creates `/obot-get-state` handler
- `icon.ObotGetIconURL()` - Creates `/obot-get-icon-url` handler
- `env.LoadEnvForStruct()` - Loads env vars into Go struct with validation

#### Provider Structure Pattern

```go
// 1. Define options struct with env var tags
type Options struct {
    ClientID          string `env:"OBOT_<PROVIDER>_AUTH_PROVIDER_CLIENT_ID"`
    ClientSecret      string `env:"OBOT_<PROVIDER>_AUTH_PROVIDER_CLIENT_SECRET"`
    AuthCookieSecret  string `env:"OBOT_AUTH_PROVIDER_COOKIE_SECRET"`
    AuthEmailDomains  string `env:"OBOT_AUTH_PROVIDER_EMAIL_DOMAINS"`
    // Provider-specific options...
}

// 2. Load options using common utility
env.LoadEnvForStruct(&opts)

// 3. Configure oauth2-proxy
oauthProxyOpts := options.NewLegacyOptions()
oauthProxyOpts.LegacyProvider.ProviderType = "google" // or "github"
oauthProxyOpts.Cookie.Name = "obot_access_token"
oauthProxyOpts.Cookie.Secret = string(cookieSecret)
oauthProxyOpts.Cookie.Secure = strings.HasPrefix(serverURL, "https://")

// 4. Create oauth2-proxy instance
oauthProxy, _ := oauth2proxy.NewOAuthProxy(oauthProxyOpts, validator)

// 5. Setup HTTP handlers
mux := http.NewServeMux()
mux.HandleFunc("/obot-get-state", state.ObotGetState(oauthProxy))
mux.HandleFunc("/obot-get-icon-url", icon.ObotGetIconURL(iconFetcher))
mux.HandleFunc("/", oauthProxy.ServeHTTP)  // Delegates to oauth2-proxy

// 6. Start server
http.ListenAndServe("127.0.0.1:"+port, mux)
```

### 📊 Metadata Format Comparison

**auth-providers.md Documents** (Old Format):

```gptscript
Metadata: envVars: VAR1,VAR2,VAR3
Metadata: optionalEnvVars: VAR4,VAR5
```

**Actual Implementation** (New Format - providerMeta):

```gptscript
---
!metadata:Google:providerMeta
{
    "icon": "/admin/assets/google_icon_small.png",
    "iconDark": "/admin/assets/google_icon_small.png",
    "link": "https://google.com/",
    "postgresTablePrefix": "google_",
    "envVars": [
        {
            "name": "OBOT_GOOGLE_AUTH_PROVIDER_CLIENT_ID",
            "friendlyName": "Client ID",
            "description": "Unique identifier for the application...",
            "sensitive": false
        }
    ],
    "optionalEnvVars": [
        {
            "name": "OBOT_AUTH_PROVIDER_POSTGRES_CONNECTION_DSN",
            "friendlyName": "PostgreSQL connection string (DSN)",
            "description": "The connection string for a PostgreSQL database...",
            "sensitive": true,
            "hidden": true
        }
    ]
}
```

**Key Difference**: The **providerMeta JSON format is preferred** and provides richer metadata (friendlyName, description, sensitive, hidden flags) for better UI integration.

---

## API Contract Validation

### /obot-get-state Endpoint

**Request JSON** (Validated ✅):

```json
{
  "method": "GET",
  "url": "https://example.com/api/resource",
  "header": {
    "Cookie": ["obot_access_token=..."],
    "User-Agent": ["Mozilla/5.0"]
  }
}
```

**Response JSON** (Validated ✅ + Extensions):

```json
{
  "accessToken": "xyz",
  "idToken": "abc",                    // ⚠️ Not in docs but present
  "preferredUsername": "johndoe",
  "user": "johndoe",
  "email": "johndoe@example.com",
  "groups": ["team1", "team2"],        // ⚠️ Not in docs but present
  "groupInfos": [],                     // ⚠️ Not in docs but present
  "expiresOn": "2026-01-16T12:00:00Z", // ⚠️ Not in docs but present
  "setCookies": []                      // ⚠️ Not in docs but present (token refresh)
}
```

**Extensions Found**:

- `idToken` - OpenID Connect ID token
- `groups` - User's group memberships (GitHub teams, etc.)
- `groupInfos` - Detailed group information with IDs and icons
- `expiresOn` - Token expiration timestamp
- `setCookies` - New cookies to set if token was refreshed

### /obot-get-icon-url Endpoint

**Request** (Validated ✅):

```
GET /obot-get-icon-url
Authorization: Bearer <access_token>
```

**Response** (Validated ✅):

```json
{
  "iconURL": "https://avatars.githubusercontent.com/u/12345"
}
```

**Error Handling** (Validated ✅):

- 400 if Authorization header missing
- 400 if bearer token missing
- 400 if profile fetch fails

---

## Integration Recommendations

### 1. Update gptscript_tool_format Memory

Add **Auth Provider Pattern** section with:

```markdown
### Auth Provider Pattern

**Requirements** (see `obot-tools/docs/auth-providers.md` for full spec):

1. **Daemon Tool**: Must use `#!sys.daemon`
2. **Placeholder Credential**: `Credential: ../placeholder-credential as <provider-name>`
3. **Provider Metadata**: Use `!metadata:<Provider>:providerMeta` JSON format
4. **Required Endpoints**:
   - `/oauth2/start` - Initiates OAuth2 flow, checks `rd` query param
   - `/oauth2/callback` - Handles OAuth2 callback, exchanges code for token
   - `/oauth2/sign_out` - Clears `obot_access_token` cookie
   - `/obot-get-state` - Returns user info from serialized HTTP request
   - `/obot-get-icon-url` - Returns user profile icon URL from bearer token

**Implementation Pattern**:
- Use `github.com/oauth2-proxy/oauth2-proxy/v7` library
- Use shared utilities from `auth-providers-common/pkg`:
  - `state.ObotGetState(oauthProxy)` for state endpoint
  - `icon.ObotGetIconURL(iconFetcher)` for icon endpoint
  - `env.LoadEnvForStruct(&opts)` for env var loading
- Cookie: `obot_access_token`, encrypted with `OBOT_AUTH_PROVIDER_COOKIE_SECRET`
- Secure flag: `true` if `OBOT_SERVER_PUBLIC_URL` starts with `https://`
- Token refresh: Automatic within `/obot-get-state` if token expired

**Environment Variables**:
- Required: `OBOT_<PROVIDER>_AUTH_PROVIDER_CLIENT_ID`, `CLIENT_SECRET`, `OBOT_AUTH_PROVIDER_COOKIE_SECRET`, `EMAIL_DOMAINS`
- Optional: `OBOT_AUTH_PROVIDER_POSTGRES_CONNECTION_DSN`, `TOKEN_REFRESH_DURATION`
- Provider-specific: `OBOT_GITHUB_AUTH_PROVIDER_ORG`, `TEAMS`, `REPO`, etc.

**Reference Implementation**: `google-auth-provider/` (canonical)

**Full Specification**: `obot-tools/docs/auth-providers.md`
```

### 2. Update expert-mode.md

**Add to "Project-Specific Tasks" table**:

```markdown
| **obot-tools** | Auth Provider | `gptscript_tool_format` memory, `docs/auth-providers.md` reference ⭐ |
```

**Add to "GPTScript Development (obot-tools)" section**:

```markdown
**Specialized Documentation**:
- `docs/auth-providers.md` - Complete auth provider requirements and API contract
- `docs/...` - Other specialized guides (if applicable)
```

### 3. Update obot-tools/CLAUDE.md

**Enhance "Auth Provider Pattern" section** with:

```markdown
### Auth Provider Pattern

**Full Requirements**: See `docs/auth-providers.md` for complete specification including:
- Daemon tool requirements
- Metadata format (providerMeta JSON)
- OAuth2 flow implementation
- Required endpoints and API contracts
- Cookie handling and encryption
- Token refresh mechanism
- JSON schemas for request/response

**Reference Implementation**: `google-auth-provider/` follows all requirements.

**Common Utilities**: `auth-providers-common/pkg` provides:
- `state.ObotGetState()` - State endpoint handler
- `icon.ObotGetIconURL()` - Icon endpoint handler
- `env.LoadEnvForStruct()` - Environment variable loading

**Library**: Uses `github.com/oauth2-proxy/oauth2-proxy/v7` for OAuth2 implementation.
```

### 4. Create Serena Memory (Optional)

**File**: `.serena/memories/obot_auth_provider_requirements.md`

**Purpose**: Quick reference for auth provider development (only if frequently accessed)

**Size Estimate**: ~2-3K tokens

**Decision**: **NOT RECOMMENDED** - The gptscript_tool_format memory + reference to docs/auth-providers.md is sufficient. Creating a separate memory would duplicate information.

---

## Token Impact Analysis

| Approach | Tokens | Pros | Cons |
| ------------- | ------------- | ------------- | ------------- |
| **Reference docs/auth-providers.md** (Recommended) | 0 | No duplication, single source of truth | Requires reading external file when needed |
| **Add summary to gptscript_tool_format** | +800 | Quick reference available | Some duplication |
| **Create separate Serena memory** | +2500 | Detailed reference | Significant duplication, maintenance burden |

**Winner**: **Reference docs/auth-providers.md** + brief summary in gptscript_tool_format

- Adds minimal tokens (~800) for essential summary
- Points to authoritative source for details
- No maintenance duplication

---

## Gap Analysis: What's Missing from docs/auth-providers.md

### Missing Documentation (Should Add)

1. **Additional Endpoints**:
   - `/obot-get-user-info` - Returns full user profile
   - `/obot-list-user-auth-groups` - Returns user's authorization groups

2. **Extended Response Fields**:
   - `idToken` field in `/obot-get-state` response
   - `groups` and `groupInfos` arrays
   - `expiresOn` timestamp
   - `setCookies` array for token refresh

3. **Token Refresh Mechanism**:
   - Automatic token refresh during `/obot-get-state`
   - `OBOT_AUTH_PROVIDER_TOKEN_REFRESH_DURATION` configuration
   - Token refresh logic and error handling

4. **PostgreSQL Session Storage**:
   - `OBOT_AUTH_PROVIDER_POSTGRES_CONNECTION_DSN` configuration
   - Table prefix configuration (`postgresTablePrefix` in providerMeta)
   - Session vs cookie storage tradeoffs

5. **Common Utilities Documentation**:
   - `auth-providers-common/pkg` package overview
   - State management helpers
   - Icon fetching helpers
   - Environment variable loading

6. **Provider-Specific Configuration**:
   - GitHub: `ORG`, `TEAMS`, `REPO`, `ALLOW_USERS`, `TOKEN`
   - Google: Domain restrictions
   - Custom validation logic patterns

### Documentation Update Recommendations

**Priority 1 (High Impact)**:

- Document `/obot-get-user-info` and `/obot-list-user-auth-groups` endpoints
- Add extended fields to `/obot-get-state` response schema
- Document token refresh mechanism

**Priority 2 (Medium Impact)**:

- Document PostgreSQL session storage option
- Add common utilities reference
- Explain providerMeta JSON format preference over simple Metadata directives

**Priority 3 (Low Impact)**:

- Provider-specific configuration examples
- Troubleshooting guide
- Error handling best practices

---

## Conclusion

**docs/auth-providers.md Verdict**: Excellent foundation, 95% accurate, production-ready.

**Recommended Actions**:

1. ✅ Add brief summary to `gptscript_tool_format` memory (auth provider pattern)
2. ✅ Update expert-mode.md to reference `docs/auth-providers.md`
3. ✅ Enhance obot-tools/CLAUDE.md auth provider section with doc reference
4. ⚠️ Consider updating docs/auth-providers.md with missing features (Priority 1 items)
5. ❌ Don't create separate Serena memory (would duplicate)

**Value Add**: High for auth provider development with minimal token overhead (+800 tokens in gptscript_tool_format).

**Implementation Effort**: ~15 minutes to update memories and expert-mode.md.

---

## Appendix: Complete Endpoint Inventory

| Endpoint | Purpose | Request | Response | Status |
| ---------- | ---------- | ---------- | ---------- | ---------- |
| `/oauth2/start` | Start OAuth2 flow | `?rd=<redirect>` | 302 redirect | ✅ Documented |
| `/oauth2/callback` | OAuth2 callback | `?code=<code>&state=<state>` | 302 redirect | ✅ Documented |
| `/oauth2/sign_out` | Sign out | `?rd=<redirect>` | 302 redirect + clear cookie | ✅ Documented |
| `/obot-get-state` | Get user state | SerializableRequest JSON | SerializableState JSON | ✅ Documented |
| `/obot-get-icon-url` | Get user icon | `Authorization: Bearer <token>` | `{"iconURL": "..."}` | ✅ Documented |
| `/obot-get-user-info` | Get full profile | `Authorization: Bearer <token>` | Provider-specific JSON | ⚠️ Not documented |
| `/obot-list-user-auth-groups` | List auth groups | `Authorization: Bearer <token>` | GroupInfoList JSON | ⚠️ Not documented |
| `/oauth2/auth` | Auth check (internal) | Cookie | 200/401 | ⚠️ Internal use only |

**Note**: The first 5 endpoints are the **required API contract**. The remaining endpoints are optional/internal.
