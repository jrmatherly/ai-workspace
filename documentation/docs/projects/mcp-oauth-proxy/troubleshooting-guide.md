# MCP OAuth Proxy Troubleshooting Guide

**OAuth 2.1 Proxy for MCP Servers** - Common issues and solutions
**Last Updated:** 2026-01-20

---

## 🔍 Table of Contents

- [OAuth Redirect Issues](#-oauth-redirect-issues)
- [Token Validation Errors](#-token-validation-errors)
- [Database Connection Issues](#-database-connection-issues)
- [MCP Server Connectivity](#-mcp-server-connectivity)
- [Provider-Specific Issues](#-provider-specific-issues)
- [PKCE Flow Debugging](#-pkce-flow-debugging)
- [Header Forwarding Issues](#-header-forwarding-issues)
- [General Troubleshooting](#-general-troubleshooting)

---

## 🔄 OAuth Redirect Issues

### Issue: "OAuth redirect URI mismatch"

**Symptoms:**

```
Error: redirect_uri_mismatch
The redirect URI in the request does not match the one registered
```

**Solutions:**

```bash
# 1. Check your provider configuration
# For Google Cloud Console:
# Authorized redirect URIs must exactly match:
# http://localhost:8080/auth/callback  (for local dev)
# https://yourdomain.com/auth/callback  (for production)

# 2. Verify proxy configuration
cat config.yaml | grep callback_url
# Should match: http://localhost:8080/auth/callback

# 3. Common mistakes to avoid:
# ❌ http://localhost:8080/callback        (missing /auth/)
# ❌ http://localhost:8080/auth/callback/  (trailing slash)
# ❌ https://localhost:8080/auth/callback  (http vs https)
# ✅ http://localhost:8080/auth/callback   (correct)
```

**Root Cause:** OAuth providers require exact URI matching including protocol, host, port, and path.

---

### Issue: "Invalid state parameter"

**Symptoms:**

```
Error: invalid_state
State parameter mismatch or missing
```

**Solutions:**

```bash
# 1. Check session storage
# The proxy stores state in the database
sqlite3 oauth.db "SELECT * FROM sessions WHERE created_at > datetime('now', '-5 minutes');"

# For PostgreSQL:
psql -U oauth_user -d oauth_db -c "SELECT id, state, created_at FROM sessions ORDER BY created_at DESC LIMIT 10;"

# 2. Verify session timeout settings
cat config.yaml | grep session_timeout
# Should be at least 300 seconds (5 minutes)

# 3. Clear old sessions
# SQLite:
sqlite3 oauth.db "DELETE FROM sessions WHERE created_at < datetime('now', '-1 hour');"

# PostgreSQL:
psql -U oauth_user -d oauth_db -c "DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '1 hour';"
```

**Common Patterns:**

- **Browser redirects too slow:** Increase `session_timeout` in config
- **Multiple auth attempts:** Clear browser cookies and try again
- **Clock skew:** Sync system time with NTP

---

### Issue: OAuth flow gets stuck at authorization page

**Symptoms:**

- Browser redirects to provider (Google/Microsoft/GitHub)
- User authorizes the app
- Browser never redirects back to the proxy

**Solutions:**

```bash
# 1. Check proxy logs for callback reception
tail -f logs/proxy.log | grep callback

# 2. Verify callback endpoint is accessible
curl -v http://localhost:8080/auth/callback?code=test&state=test
# Should return: "Invalid state" (proves endpoint is working)

# 3. Check if provider is calling the callback
# Enable debug logging:
export DEBUG=oauth:*
./mcp-oauth-proxy --debug

# 4. Verify firewall/network settings
# If running in Docker:
docker ps  # Check port mapping
docker logs <container-id>

# If using reverse proxy (nginx/caddy):
# Ensure callback route is properly forwarded
```

---

## 🔐 Token Validation Errors

### Issue: "Token expired" errors

**Symptoms:**

```
Error: token_expired
Access token has expired and refresh failed
```

**Solutions:**

```bash
# 1. Check token expiration in database
# SQLite:
sqlite3 oauth.db "SELECT user_id, expires_at, created_at FROM tokens ORDER BY created_at DESC LIMIT 5;"

# PostgreSQL:
psql -U oauth_user -d oauth_db -c "SELECT user_id, expires_at, created_at FROM tokens ORDER BY created_at DESC LIMIT 5;"

# 2. Verify refresh token is present
sqlite3 oauth.db "SELECT user_id, refresh_token FROM tokens WHERE refresh_token IS NOT NULL;"

# 3. Test token refresh manually
curl -X POST http://localhost:8080/auth/refresh \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -v

# 4. Check provider refresh token settings
# Some providers (like GitHub) don't issue refresh tokens by default
# Ensure your OAuth app has offline_access scope
```

**Root Cause:** Access tokens are short-lived (typically 1 hour). The proxy should auto-refresh using the refresh token.

---

### Issue: "Invalid token signature"

**Symptoms:**

```
Error: invalid_signature
Token signature verification failed
```

**Solutions:**

```bash
# 1. Verify JWKS endpoint is accessible
curl https://accounts.google.com/.well-known/openid-configuration | jq .jwks_uri
curl https://www.googleapis.com/oauth2/v3/certs

# For Microsoft:
curl https://login.microsoftonline.com/common/.well-known/openid-configuration | jq .jwks_uri

# 2. Check system time (critical for JWT validation)
date
# If time is wrong, sync with NTP:
sudo systemctl restart systemd-timesyncd  # Linux
sudo sntp -sS time.apple.com              # macOS

# 3. Verify issuer configuration
cat config.yaml | grep issuer
# Must match the 'iss' claim in the token

# 4. Debug token claims
# Decode JWT at jwt.io or:
echo "YOUR_TOKEN" | cut -d. -f2 | base64 -d | jq .
```

---

### Issue: "Malformed token" errors

**Symptoms:**

```
Error: malformed_token
Token does not match expected format
```

**Solutions:**

```bash
# 1. Check token format
# JWT tokens have 3 parts separated by dots:
# header.payload.signature

# Validate structure:
TOKEN="your.token.here"
echo $TOKEN | awk -F. '{print NF-1}'
# Should output: 2 (meaning 3 parts)

# 2. Verify token is not truncated
# Common in environment variables or logs
echo ${#TOKEN}  # Check length (should be 200-2000 chars)

# 3. Check for whitespace or newlines
echo "$TOKEN" | od -c | head
# Should not show \n or \r

# 4. Verify token type in Authorization header
# Must be: Authorization: Bearer TOKEN
# Not: Authorization: TOKEN
```

---

## 💾 Database Connection Issues

### Issue: "Database connection failed"

**Symptoms:**

```
Error: ECONNREFUSED 127.0.0.1:5432
Could not connect to PostgreSQL database
```

**Solutions:**

```bash
# 1. Verify PostgreSQL is running
pg_isready -h localhost -p 5432
# Expected: "localhost:5432 - accepting connections"

# Or check service:
systemctl status postgresql  # Linux
brew services list           # macOS

# 2. Start PostgreSQL if needed
systemctl start postgresql   # Linux
brew services start postgresql  # macOS

# 3. Verify connection string in config
cat config.yaml | grep database_url
# Format: postgresql://user:password@localhost:5432/dbname

# 4. Test connection manually
psql postgresql://oauth_user:oauth_pass@localhost:5432/oauth_db -c "SELECT 1;"

# 5. Check PostgreSQL logs
# Linux: /var/log/postgresql/postgresql-15-main.log
# macOS: /usr/local/var/log/postgres.log
tail -f /var/log/postgresql/postgresql-*.log
```

---

### Issue: SQLite "database locked" errors

**Symptoms:**

```
Error: SQLITE_BUSY: database is locked
```

**Solutions:**

```bash
# 1. Check for concurrent access
lsof oauth.db
# Shows all processes accessing the database

# 2. Close other connections
# Stop all proxy instances:
pkill -f mcp-oauth-proxy

# 3. Check for abandoned lock
# Remove if proxy crashed:
rm -f oauth.db-shm oauth.db-wal

# 4. Enable WAL mode for better concurrency
sqlite3 oauth.db "PRAGMA journal_mode=WAL;"
sqlite3 oauth.db "PRAGMA busy_timeout=5000;"

# 5. Verify file permissions
ls -la oauth.db
# Should be writable by proxy process user
chmod 644 oauth.db
```

---

### Issue: "Table does not exist" errors

**Symptoms:**

```
Error: relation "tokens" does not exist
Error: no such table: sessions
```

**Solutions:**

```bash
# 1. Run database migrations
./mcp-oauth-proxy migrate up

# Or if using migration tool:
migrate -path ./migrations -database "postgresql://user:pass@localhost:5432/oauth_db" up

# 2. Verify tables exist
# PostgreSQL:
psql -U oauth_user -d oauth_db -c "\dt"

# SQLite:
sqlite3 oauth.db ".tables"

# Expected tables:
# - sessions
# - tokens
# - users (if applicable)
# - schema_migrations

# 3. Reset database if needed (CAUTION: deletes all data)
./mcp-oauth-proxy migrate down
./mcp-oauth-proxy migrate up

# 4. Check migration status
./mcp-oauth-proxy migrate version
```

---

## 🔌 MCP Server Connectivity

### Issue: "MCP server unreachable"

**Symptoms:**

```
Error: connect ECONNREFUSED 127.0.0.1:3000
Failed to proxy request to MCP server
```

**Solutions:**

```bash
# 1. Verify MCP server is running
curl http://localhost:3000/health
# Or whatever port your MCP server uses

# 2. Check MCP server logs
docker logs mcp-server  # If containerized
tail -f /var/log/mcp-server.log

# 3. Verify proxy configuration
cat config.yaml | grep mcp_server_url
# Should match: http://localhost:3000

# 4. Test connectivity from proxy container
# If proxy is in Docker:
docker exec -it <proxy-container> curl http://mcp-server:3000/health

# 5. Check network mode
docker network ls
docker network inspect <network-name>
# Ensure both containers are on same network
```

---

### Issue: "MCP server timeout"

**Symptoms:**

```
Error: timeout of 30000ms exceeded
MCP server did not respond in time
```

**Solutions:**

```bash
# 1. Increase timeout in config
cat config.yaml | grep timeout
# Increase values:
# connect_timeout: 10000  # 10 seconds
# request_timeout: 60000  # 60 seconds

# 2. Check MCP server performance
curl -w "@curl-format.txt" http://localhost:3000/endpoint

# Create curl-format.txt:
cat > curl-format.txt << 'EOF'
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
EOF

# 3. Monitor MCP server resources
docker stats mcp-server
# Check CPU and memory usage

# 4. Enable request logging
export DEBUG=proxy:*
./mcp-oauth-proxy --debug
```

---

### Issue: "Invalid MCP protocol response"

**Symptoms:**

```
Error: invalid_protocol
MCP server response does not match expected format
```

**Solutions:**

```bash
# 1. Verify MCP server version compatibility
curl http://localhost:3000/version

# 2. Check response format
curl -v http://localhost:3000/endpoint
# Look for Content-Type header

# 3. Verify proxy is not modifying responses
# Check proxy config for transforms:
cat config.yaml | grep -A 5 response_transform

# 4. Test MCP endpoint directly (bypass proxy)
curl http://localhost:3000/endpoint \
  -H "Authorization: Bearer TOKEN" \
  -v
```

---

## 🏢 Provider-Specific Issues

### Google OAuth Issues

**Issue: "Access not configured" error**

**Symptoms:**

```
Error 403: access_not_configured
The API is not enabled for your project
```

**Solutions:**

```bash
# 1. Enable required APIs in Google Cloud Console:
# - Google+ API (for userinfo)
# - Cloud Resource Manager API (if accessing GCP resources)

# Visit: https://console.cloud.google.com/apis/library

# 2. Verify OAuth consent screen is configured
# https://console.cloud.google.com/apis/credentials/consent

# 3. Check OAuth scopes in config
cat config.yaml | grep -A 5 google
# Common scopes:
# - openid
# - email
# - profile
# - https://www.googleapis.com/auth/userinfo.profile

# 4. Verify client ID and secret
# Must match values from Google Cloud Console
```

---

### Microsoft/Azure AD Issues

**Issue: "AADSTS50011: Reply URL mismatch"**

**Symptoms:**

```
AADSTS50011: The reply URL specified in the request does not match
```

**Solutions:**

```bash
# 1. Check Azure AD App Registration
# Azure Portal > App Registrations > Your App > Authentication
# Redirect URIs must include:
# http://localhost:8080/auth/callback (for local dev)
# https://yourdomain.com/auth/callback (for production)

# 2. Verify tenant configuration
cat config.yaml | grep tenant_id
# Use specific tenant ID for single-tenant apps
# Use "common" for multi-tenant apps

# 3. Check application ID URI
# Azure Portal > App Registrations > Your App > Expose an API
# Should match 'audience' in config

# 4. Verify API permissions
# Azure Portal > App Registrations > Your App > API permissions
# Required: User.Read (delegated)
```

**Issue: "AADSTS65001: User consent required"**

**Solutions:**

```bash
# 1. Add prompt parameter to authorization URL
cat config.yaml | grep prompt
# Set to: consent (force consent every time)
# Or: select_account (allow account selection)

# 2. Grant admin consent (if tenant admin)
# Azure Portal > App Registrations > Your App > API permissions
# Click "Grant admin consent for <tenant>"

# 3. Verify scopes are not admin-restricted
# Check if scopes require admin consent
```

---

### GitHub OAuth Issues

**Issue: "Redirect URI not allowed"**

**Symptoms:**

```
The redirect_uri MUST match the registered callback URL
```

**Solutions:**

```bash
# 1. Check GitHub OAuth App settings
# GitHub > Settings > Developer settings > OAuth Apps > Your App
# Callback URL must exactly match

# 2. Verify authorization callback URL
cat config.yaml | grep callback_url
# Must match GitHub OAuth App configuration

# 3. Update GitHub OAuth App if needed
# Note: GitHub does not support multiple callback URLs
# You need separate OAuth Apps for dev/staging/production
```

**Issue: "No refresh tokens from GitHub"**

**Symptoms:**

```
Error: refresh_token missing
GitHub did not provide a refresh token
```

**Root Cause:** GitHub does not issue refresh tokens for standard OAuth apps by default.

**Solutions:**

```bash
# 1. GitHub's access tokens do not expire
# No refresh needed - tokens are long-lived

# 2. If using GitHub Apps (not OAuth Apps):
# Request the 'refresh_token' grant type
# See: https://docs.github.com/en/apps/creating-github-apps

# 3. Update proxy config to handle no refresh token
cat config.yaml | grep refresh_strategy
# Set to: none (for GitHub)
# Or: reauthorize (prompt user to re-auth when token expires)
```

---

## 🔒 PKCE Flow Debugging

### Issue: "PKCE code_verifier validation failed"

**Symptoms:**

```
Error: invalid_grant
code_verifier does not match code_challenge
```

**Solutions:**

```bash
# 1. Verify PKCE is enabled
cat config.yaml | grep pkce_enabled
# Should be: true

# 2. Check code_verifier generation
# Must be 43-128 characters, base64url encoded
# Regex: ^[A-Za-z0-9_-]{43,128}$

# 3. Verify code_challenge method
cat config.yaml | grep code_challenge_method
# Should be: S256 (SHA-256)
# Fallback: plain (not recommended)

# 4. Debug PKCE flow
export DEBUG=oauth:pkce
./mcp-oauth-proxy --debug

# Look for:
# - code_verifier generation
# - code_challenge creation (SHA-256 hash)
# - Storage of verifier in session
# - Retrieval during token exchange

# 5. Test PKCE manually
# Generate code_verifier:
CODE_VERIFIER=$(openssl rand -base64 32 | tr -d '=' | tr '+/' '-_')
echo $CODE_VERIFIER

# Generate code_challenge:
echo -n $CODE_VERIFIER | openssl dgst -sha256 -binary | base64 | tr -d '=' | tr '+/' '-_'
```

---

### Issue: "PKCE required but not provided"

**Symptoms:**

```
Error: invalid_request
PKCE is required for this client
```

**Solutions:**

```bash
# 1. Enable PKCE in proxy config
cat config.yaml

# Add or update:
providers:
  google:
    pkce_enabled: true
    code_challenge_method: S256

# 2. Verify provider requires PKCE
# Some providers (like Google) require PKCE for:
# - Public clients (mobile/SPA)
# - Clients without client_secret

# 3. Check client type configuration
cat config.yaml | grep client_type
# If "public", PKCE is mandatory

# 4. Restart proxy after config change
pkill -f mcp-oauth-proxy
./mcp-oauth-proxy
```

---

### Issue: "Code challenge method not supported"

**Symptoms:**

```
Error: invalid_request
code_challenge_method 'plain' is not supported
```

**Solutions:**

```bash
# 1. Use S256 method (recommended)
cat config.yaml | grep code_challenge_method
# Change from: plain
# To: S256

# 2. Verify provider supports S256
# All major providers (Google, Microsoft, GitHub) support S256

# 3. Update configuration
cat > config.yaml << 'EOF'
providers:
  google:
    pkce_enabled: true
    code_challenge_method: S256  # SHA-256 hashing
EOF

# 4. Restart proxy
pkill -f mcp-oauth-proxy && ./mcp-oauth-proxy
```

---

## 📨 Header Forwarding Issues

### Issue: "Authorization header not forwarded to MCP server"

**Symptoms:**

```
MCP server returns 401 Unauthorized
But OAuth flow completed successfully
```

**Solutions:**

```bash
# 1. Verify header forwarding config
cat config.yaml | grep -A 10 header_forwarding
# Should include:
# forward_headers:
#   - Authorization
#   - X-User-Email
#   - X-User-Id

# 2. Test header forwarding
curl -v http://localhost:8080/mcp/endpoint \
  -H "Authorization: Bearer TOKEN" 2>&1 | grep ">"
# Should show: > Authorization: Bearer TOKEN

# 3. Check proxy logs
tail -f logs/proxy.log | grep -i authorization
# Verify header is being forwarded

# 4. Test MCP server directly
curl http://localhost:3000/endpoint \
  -H "Authorization: Bearer TOKEN" \
  -v
# Compare response with proxied request
```

---

### Issue: "Custom headers stripped"

**Symptoms:**

```
MCP server does not receive X-Custom-Header
But header is sent to proxy
```

**Solutions:**

```bash
# 1. Check header allowlist
cat config.yaml | grep -A 20 header_forwarding
# Add custom headers:
# forward_headers:
#   - Authorization
#   - X-User-*        # Wildcard for X-User-Email, X-User-Id, etc.
#   - X-Custom-Header

# 2. Verify header is not in blocklist
cat config.yaml | grep -A 10 blocked_headers
# Remove if present:
# blocked_headers:
#   - X-Custom-Header  # Remove this line

# 3. Test with debug logging
export DEBUG=proxy:headers
./mcp-oauth-proxy --debug

# 4. Check for header name case sensitivity
# HTTP headers are case-insensitive, but some configs aren't
# Try: X-Custom-Header, x-custom-header, X-CUSTOM-HEADER
```

---

### Issue: "CORS errors in browser"

**Symptoms:**

```
Access to fetch at 'http://localhost:8080' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Solutions:**

```bash
# 1. Enable CORS in proxy config
cat config.yaml | grep -A 10 cors
# Add:
# cors:
#   enabled: true
#   origins:
#     - http://localhost:3000
#     - https://yourdomain.com
#   allow_credentials: true
#   allowed_headers:
#     - Authorization
#     - Content-Type

# 2. Verify preflight requests are handled
curl -X OPTIONS http://localhost:8080/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should return:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: GET, POST, OPTIONS
# Access-Control-Allow-Headers: Authorization, Content-Type

# 3. Check browser console for specific CORS error
# Look for:
# - Missing Access-Control-Allow-Origin header
# - Credentials mode issues (use credentials: 'include')
# - Preflight failure (OPTIONS request)
```

---

## 🛠️ General Troubleshooting

### Enable Debug Logging

```bash
# Method 1: Environment variable
export DEBUG=*
./mcp-oauth-proxy

# Method 2: Command-line flag
./mcp-oauth-proxy --debug --verbose

# Method 3: Config file
cat config.yaml | grep log_level
# Set to: debug

# View logs in real-time
tail -f logs/proxy.log

# Filter for errors only
tail -f logs/proxy.log | grep -i error
```

---

### Health Check Endpoints

```bash
# Check proxy health
curl http://localhost:8080/health

# Expected response:
# {"status": "healthy", "database": "connected", "uptime": 12345}

# Check readiness (includes database and MCP server)
curl http://localhost:8080/ready

# Check specific component
curl http://localhost:8080/health/database
curl http://localhost:8080/health/mcp-server
```

---

### Configuration Validation

```bash
# Validate config syntax
./mcp-oauth-proxy validate-config config.yaml

# Check for common issues
./mcp-oauth-proxy check-config config.yaml

# Expected output:
# ✓ Syntax valid
# ✓ Required fields present
# ✓ Provider credentials configured
# ✓ Database connection valid
# ⚠ Warning: session_timeout is low (< 300s)
```

---

### Clear All State (Fresh Start)

```bash
# ⚠️ WARNING: This deletes all sessions and tokens

# 1. Stop proxy
pkill -f mcp-oauth-proxy

# 2. Clear database
# SQLite:
rm oauth.db oauth.db-shm oauth.db-wal

# PostgreSQL:
dropdb oauth_db
createdb oauth_db

# 3. Run migrations
./mcp-oauth-proxy migrate up

# 4. Clear logs
rm -rf logs/*.log

# 5. Start fresh
./mcp-oauth-proxy
```

---

### Common Environment Issues

**Issue: "Permission denied" when starting proxy**

```bash
# Check file permissions
ls -la mcp-oauth-proxy
chmod +x mcp-oauth-proxy

# Check port binding (ports < 1024 require root)
# Don't use port 80 or 443 without sudo
# Use 8080 or higher instead
```

**Issue: "Config file not found"**

```bash
# Specify config path explicitly
./mcp-oauth-proxy --config ./config.yaml

# Or use environment variable
export CONFIG_PATH=./config.yaml
./mcp-oauth-proxy

# Check current directory
pwd
ls -la config.yaml
```

---

## 📚 Additional Resources

- **OAuth 2.1 Specification:** https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-07
- **PKCE (RFC 7636):** https://datatracker.ietf.org/doc/html/rfc7636
- **Google OAuth Guide:** https://developers.google.com/identity/protocols/oauth2
- **Microsoft Identity Platform:** https://docs.microsoft.com/en-us/azure/active-directory/develop/
- **GitHub OAuth Apps:** https://docs.github.com/en/developers/apps/building-oauth-apps

---

## 🆘 Getting Help

If you encounter an issue not covered in this guide:

1. **Enable debug logging** and capture the full error output
2. **Check the logs** for stack traces and error details
3. **Verify configuration** against the examples in this guide
4. **Test components individually** (database, MCP server, OAuth provider)
5. **Create an issue** on GitHub with:
   - Error message and stack trace
   - Configuration (redact credentials!)
   - Steps to reproduce
   - Environment details (OS, version, database type)

---

**Last Updated:** 2026-01-20
**Version:** 1.0.0
