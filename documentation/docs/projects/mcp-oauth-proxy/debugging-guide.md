# MCP OAuth Proxy Debugging Guide

**OAuth 2.1 Proxy for MCP Servers** - Debugging techniques and tools
**Last Updated:** 2026-01-20

---

## 🔍 Table of Contents

- [Debug Logging](#-debug-logging)
- [Testing OAuth Endpoints with curl](#-testing-oauth-endpoints-with-curl)
- [Database State Inspection](#-database-state-inspection)
- [MCP Server Connectivity Testing](#-mcp-server-connectivity-testing)
- [Network Traffic Analysis](#-network-traffic-analysis)
- [Log Analysis](#-log-analysis)
- [Provider Configuration Testing](#-provider-configuration-testing)
- [Advanced Debugging Techniques](#-advanced-debugging-techniques)

---

## 📝 Debug Logging

Enabling debug logging is the first step in diagnosing issues with mcp-oauth-proxy. Debug mode provides detailed information about OAuth flows, token validation, database operations, and proxy behavior.

### Enabling Debug Mode

**Basic Debug Logging:**

```bash
# Method 1: Environment variable (recommended)
export DEBUG=*
./mcp-oauth-proxy

# Method 2: Specific namespaces
export DEBUG=oauth:*,proxy:*,mcp:*
./mcp-oauth-proxy

# Method 3: Command-line flag
./mcp-oauth-proxy --debug

# Method 4: Config file
cat > config.yaml << 'EOF'
logging:
  level: debug
  format: json
  output: stdout
EOF
```

---

### Trace Mode (Maximum Verbosity)

**Enable trace logging for deep debugging:**

```bash
# Trace everything (very verbose!)
export LOG_LEVEL=trace
export DEBUG=*
./mcp-oauth-proxy --verbose

# Trace specific components
export DEBUG=oauth:trace,token:trace,pkce:trace
./mcp-oauth-proxy

# Save trace output to file
./mcp-oauth-proxy --debug --verbose 2>&1 | tee debug.log
```

**What trace mode shows:**

- Request/response headers
- Token generation and validation steps
- PKCE code_verifier/code_challenge computation
- Database query execution
- Session state transitions
- Full OAuth flow state machine

---

### Debug Logging by Component

**OAuth Flow:**

```bash
export DEBUG=oauth:authorize,oauth:callback,oauth:token
./mcp-oauth-proxy
```

**PKCE Flow:**

```bash
export DEBUG=pkce:*
./mcp-oauth-proxy
```

**Database Operations:**

```bash
export DEBUG=db:query,db:transaction
./mcp-oauth-proxy
```

**MCP Proxy:**

```bash
export DEBUG=proxy:request,proxy:response,proxy:headers
./mcp-oauth-proxy
```

**Token Management:**

```bash
export DEBUG=token:validate,token:refresh,token:expire
./mcp-oauth-proxy
```

---

### Structured Logging (JSON Format)

**Enable JSON logging for parsing:**

```bash
# Config file
cat > config.yaml << 'EOF'
logging:
  level: debug
  format: json
  fields:
    service: mcp-oauth-proxy
    environment: development
EOF

./mcp-oauth-proxy
```

**Parse logs with jq:**

```bash
# Filter errors only
tail -f logs/proxy.log | jq 'select(.level == "error")'

# Filter by component
tail -f logs/proxy.log | jq 'select(.component == "oauth")'

# Extract specific fields
tail -f logs/proxy.log | jq '{timestamp: .timestamp, level: .level, message: .message}'

# Count errors by type
cat logs/proxy.log | jq -r '.error_type' | sort | uniq -c
```

---

## 🌐 Testing OAuth Endpoints with curl

### Testing Authorization Endpoint

**Initiate OAuth flow:**

```bash
# Get authorization URL
curl -v http://localhost:8080/auth/login?provider=google

# Expected response:
# HTTP/1.1 302 Found
# Location: https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&state=...

# Follow redirect manually
curl -L -v http://localhost:8080/auth/login?provider=google
```

---

### Testing Callback Endpoint

**Simulate OAuth callback:**

```bash
# First, extract state from authorization URL
AUTH_URL=$(curl -s http://localhost:8080/auth/login?provider=google | grep -o 'Location: [^"]*' | cut -d' ' -f2)
STATE=$(echo $AUTH_URL | grep -o 'state=[^&]*' | cut -d= -f2)

echo "State: $STATE"

# Simulate provider callback (will fail without valid code)
curl -v "http://localhost:8080/auth/callback?code=test_code&state=$STATE"

# Expected: Error about invalid code (proves callback endpoint works)
```

---

### Testing Token Endpoint

**Exchange authorization code for token:**

```bash
# This simulates what happens after OAuth callback
curl -X POST http://localhost:8080/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "redirect_uri=http://localhost:8080/auth/callback" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "code_verifier=CODE_VERIFIER_FROM_PKCE" \
  -v
```

---

### Testing Token Refresh

**Refresh an access token:**

```bash
# Using refresh token
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID" \
  -v

# Or using Authorization header
curl -X POST http://localhost:8080/auth/refresh \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -v
```

---

### Testing Proxied MCP Requests

**Test authenticated request to MCP server:**

```bash
# Get a valid token first (after OAuth flow)
TOKEN="your_access_token_here"

# Make proxied request
curl -X POST http://localhost:8080/mcp/endpoint \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "test"}' \
  -v

# Check headers forwarded to MCP server
curl -X GET http://localhost:8080/mcp/health \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Custom-Header: test-value" \
  -v 2>&1 | grep ">"
```

---

### Testing Health Endpoints

**Verify proxy health:**

```bash
# Basic health check
curl -v http://localhost:8080/health

# Detailed health (JSON)
curl -s http://localhost:8080/health | jq .

# Expected response:
# {
#   "status": "healthy",
#   "database": "connected",
#   "mcp_server": "reachable",
#   "uptime": 12345,
#   "version": "1.0.0"
# }

# Check readiness
curl -v http://localhost:8080/ready

# Component-specific health
curl -s http://localhost:8080/health/database | jq .
curl -s http://localhost:8080/health/mcp-server | jq .
```

---

### curl Tips for OAuth Debugging

**Useful curl options:**

```bash
# Follow redirects
curl -L http://localhost:8080/auth/login?provider=google

# Show response headers
curl -i http://localhost:8080/health

# Verbose output (shows request/response)
curl -v http://localhost:8080/health

# Save cookies
curl -c cookies.txt http://localhost:8080/auth/login?provider=google

# Use saved cookies
curl -b cookies.txt http://localhost:8080/mcp/endpoint

# Timing information
curl -w "@curl-format.txt" http://localhost:8080/auth/token

# Create curl-format.txt:
cat > curl-format.txt << 'EOF'
\nTime breakdown:
  DNS lookup:        %{time_namelookup}s
  TCP connect:       %{time_connect}s
  TLS handshake:     %{time_appconnect}s
  Server response:   %{time_starttransfer}s
  Total time:        %{time_total}s
  HTTP status:       %{http_code}
EOF

# Test with custom headers
curl -H "X-Debug: true" \
     -H "X-Request-ID: 12345" \
     http://localhost:8080/health
```

---

## 💾 Database State Inspection

### SQLite Database Inspection

**Examine sessions:**

```bash
# View active sessions
sqlite3 oauth.db "
SELECT
  id,
  state,
  provider,
  created_at,
  expires_at,
  datetime(created_at, 'unixepoch') as created,
  datetime(expires_at, 'unixepoch') as expires
FROM sessions
WHERE expires_at > strftime('%s', 'now')
ORDER BY created_at DESC
LIMIT 10;"

# Check session state and PKCE data
sqlite3 oauth.db "
SELECT
  id,
  state,
  code_verifier,
  code_challenge,
  length(code_verifier) as verifier_length
FROM sessions
WHERE created_at > datetime('now', '-1 hour');"

# Count sessions by provider
sqlite3 oauth.db "
SELECT
  provider,
  COUNT(*) as count,
  COUNT(CASE WHEN expires_at > strftime('%s', 'now') THEN 1 END) as active
FROM sessions
GROUP BY provider;"
```

**Examine tokens:**

```bash
# View active tokens
sqlite3 oauth.db "
SELECT
  user_id,
  provider,
  token_type,
  datetime(expires_at, 'unixepoch') as expires,
  CASE
    WHEN expires_at > strftime('%s', 'now') THEN 'valid'
    ELSE 'expired'
  END as status,
  length(access_token) as token_length
FROM tokens
ORDER BY expires_at DESC
LIMIT 10;"

# Check for refresh tokens
sqlite3 oauth.db "
SELECT
  user_id,
  provider,
  CASE
    WHEN refresh_token IS NOT NULL THEN 'yes'
    ELSE 'no'
  END as has_refresh_token,
  datetime(created_at, 'unixepoch') as created
FROM tokens
ORDER BY created_at DESC
LIMIT 10;"

# Find expired tokens
sqlite3 oauth.db "
SELECT
  user_id,
  provider,
  datetime(expires_at, 'unixepoch') as expired_at,
  CAST((strftime('%s', 'now') - expires_at) / 60 AS INTEGER) as minutes_ago
FROM tokens
WHERE expires_at < strftime('%s', 'now')
ORDER BY expires_at DESC
LIMIT 10;"
```

**Database statistics:**

```bash
# Table sizes
sqlite3 oauth.db "
SELECT
  name as table_name,
  SUM(pgsize) as size_bytes
FROM dbstat
GROUP BY name
ORDER BY size_bytes DESC;"

# Schema information
sqlite3 oauth.db ".schema sessions"
sqlite3 oauth.db ".schema tokens"

# Indexes
sqlite3 oauth.db ".indexes"

# Database integrity check
sqlite3 oauth.db "PRAGMA integrity_check;"
```

---

### PostgreSQL Database Inspection

**Examine sessions:**

```bash
# Connect to database
psql -U oauth_user -d oauth_db

# View active sessions
SELECT
  id,
  state,
  provider,
  created_at,
  expires_at,
  expires_at - NOW() as time_remaining
FROM sessions
WHERE expires_at > NOW()
ORDER BY created_at DESC
LIMIT 10;

# Session statistics
SELECT
  provider,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE expires_at > NOW()) as active,
  AVG(EXTRACT(EPOCH FROM (expires_at - created_at))) as avg_lifetime_seconds
FROM sessions
GROUP BY provider;

# Recent PKCE flows
SELECT
  id,
  state,
  code_challenge_method,
  LENGTH(code_verifier) as verifier_length,
  created_at
FROM sessions
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

**Examine tokens:**

```bash
# Active tokens
SELECT
  user_id,
  provider,
  token_type,
  expires_at,
  expires_at - NOW() as time_remaining,
  CASE
    WHEN refresh_token IS NOT NULL THEN true
    ELSE false
  END as has_refresh
FROM tokens
WHERE expires_at > NOW()
ORDER BY expires_at ASC;

# Token refresh history
SELECT
  user_id,
  provider,
  created_at,
  updated_at,
  updated_at - created_at as time_since_created
FROM tokens
WHERE updated_at > created_at
ORDER BY updated_at DESC
LIMIT 10;

# Expired tokens to clean up
SELECT
  user_id,
  provider,
  expires_at,
  EXTRACT(EPOCH FROM (NOW() - expires_at)) / 3600 as hours_expired
FROM tokens
WHERE expires_at < NOW()
ORDER BY expires_at DESC;
```

**Database performance:**

```bash
# Slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%sessions%' OR query LIKE '%tokens%'
ORDER BY mean_exec_time DESC
LIMIT 10;

# Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

### Database Debugging Commands

**Clean up old data:**

```bash
# SQLite - remove old sessions
sqlite3 oauth.db "DELETE FROM sessions WHERE expires_at < strftime('%s', 'now');"

# SQLite - remove expired tokens
sqlite3 oauth.db "DELETE FROM tokens WHERE expires_at < strftime('%s', 'now');"

# PostgreSQL - clean old sessions
psql -U oauth_user -d oauth_db -c "DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL '1 day';"

# PostgreSQL - clean expired tokens
psql -U oauth_user -d oauth_db -c "DELETE FROM tokens WHERE expires_at < NOW();"
```

**Reset database for testing:**

```bash
# SQLite - truncate all tables
sqlite3 oauth.db "DELETE FROM sessions; DELETE FROM tokens;"
sqlite3 oauth.db "VACUUM;"

# PostgreSQL - truncate all tables
psql -U oauth_user -d oauth_db -c "TRUNCATE sessions, tokens CASCADE;"

# Verify reset
sqlite3 oauth.db "SELECT COUNT(*) FROM sessions; SELECT COUNT(*) FROM tokens;"
```

---

## 🔌 MCP Server Connectivity Testing

### Test MCP Server Directly

**Basic connectivity:**

```bash
# Health check
curl -v http://localhost:3000/health

# Expected response:
# HTTP/1.1 200 OK
# {"status": "healthy"}

# Test with timeout
curl --max-time 5 http://localhost:3000/health || echo "Timeout!"

# Test MCP endpoint
curl -X POST http://localhost:3000/api/endpoint \
  -H "Authorization: Bearer TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -v
```

---

### Test from Proxy Container

**If proxy is containerized:**

```bash
# Get proxy container ID
docker ps | grep mcp-oauth-proxy

# Test from inside proxy container
docker exec -it <proxy-container-id> sh

# Inside container:
curl http://mcp-server:3000/health
curl http://localhost:3000/health  # If using host network

# Test DNS resolution
nslookup mcp-server
ping -c 3 mcp-server

# Test port connectivity
nc -zv mcp-server 3000
telnet mcp-server 3000
```

---

### Network Connectivity

**Check network configuration:**

```bash
# Docker network inspection
docker network ls
docker network inspect <network-name>

# Find containers on network
docker network inspect <network-name> | jq '.[0].Containers'

# Check if proxy and MCP server are on same network
docker inspect <proxy-container> | jq '.[0].NetworkSettings.Networks'
docker inspect <mcp-container> | jq '.[0].NetworkSettings.Networks'

# Test cross-container connectivity
docker exec <proxy-container> ping -c 3 <mcp-container-ip>
```

---

### Latency Testing

**Measure MCP server response time:**

```bash
# Simple timing
time curl http://localhost:3000/health

# Detailed timing with curl
curl -o /dev/null -s -w "
DNS lookup:      %{time_namelookup}s
TCP connect:     %{time_connect}s
TLS handshake:   %{time_appconnect}s
Server response: %{time_starttransfer}s
Total time:      %{time_total}s
HTTP status:     %{http_code}\n" \
http://localhost:3000/health

# Continuous monitoring
watch -n 1 'curl -o /dev/null -s -w "Time: %{time_total}s\n" http://localhost:3000/health'

# Load testing (requires hey or ab)
hey -n 100 -c 10 http://localhost:3000/health
ab -n 100 -c 10 http://localhost:3000/health
```

---

### MCP Server Logs

**Monitor MCP server logs:**

```bash
# Docker logs
docker logs -f mcp-server

# Filter for errors
docker logs mcp-server 2>&1 | grep -i error

# Last 100 lines
docker logs --tail 100 mcp-server

# Logs since timestamp
docker logs --since 2026-01-20T10:00:00 mcp-server

# File-based logs
tail -f /var/log/mcp-server.log
tail -f /var/log/mcp-server.log | grep -E "error|warn|fail"
```

---

## 🔬 Network Traffic Analysis

### Using mitmproxy

**Intercept HTTP/HTTPS traffic:**

```bash
# Install mitmproxy
brew install mitmproxy  # macOS
apt-get install mitmproxy  # Linux

# Start mitmproxy
mitmproxy -p 8888

# Configure proxy to use mitmproxy
export HTTP_PROXY=http://localhost:8888
export HTTPS_PROXY=http://localhost:8888

# Start proxy with mitmproxy
./mcp-oauth-proxy

# In mitmproxy interface:
# - Press 'f' to filter (e.g., ~d google.com for Google OAuth)
# - Press 'enter' on request to see details
# - Press 'tab' to switch between request/response
# - Press 'q' to quit
```

**Save traffic for analysis:**

```bash
# Record to file
mitmdump -w oauth-flow.mitm

# Replay recorded traffic
mitmdump -r oauth-flow.mitm

# Export to HAR format
mitmdump -r oauth-flow.mitm -w oauth-flow.har

# Filter and export
mitmdump -r oauth-flow.mitm -w filtered.mitm '~d google.com'
```

---

### Using Charles Proxy

**Setup Charles for OAuth debugging:**

```bash
# 1. Download Charles: https://www.charlesproxy.com/

# 2. Configure proxy to use Charles (typically port 8888)
export HTTP_PROXY=http://localhost:8888
export HTTPS_PROXY=http://localhost:8888

# 3. Enable SSL proxying for OAuth domains
# Charles > Proxy > SSL Proxying Settings
# Add:
#   - *.google.com
#   - *.microsoft.com
#   - *.github.com
#   - localhost

# 4. Install Charles root certificate
# Charles > Help > SSL Proxying > Install Charles Root Certificate

# 5. Start proxy
./mcp-oauth-proxy
```

**Charles filtering:**

- Structure view: Group by domain
- Sequence view: Chronological requests
- Filter: Focus on specific domains
- Recording: Export as HAR or JSON

---

### Using tcpdump

**Capture network traffic at packet level:**

```bash
# Capture traffic on port 8080 (proxy)
sudo tcpdump -i any port 8080 -w proxy-traffic.pcap

# Capture traffic to MCP server (port 3000)
sudo tcpdump -i any port 3000 -w mcp-traffic.pcap

# Capture HTTP traffic (text)
sudo tcpdump -i any port 8080 -A

# Capture with filters
sudo tcpdump -i any 'port 8080 or port 3000' -w traffic.pcap

# Analyze captured file
tcpdump -r proxy-traffic.pcap
tcpdump -r proxy-traffic.pcap -A  # Show content
tcpdump -r proxy-traffic.pcap 'port 8080 and host localhost'
```

**Open in Wireshark:**

```bash
# Install Wireshark
brew install --cask wireshark  # macOS

# Open captured file
wireshark proxy-traffic.pcap

# Wireshark filters:
# - http.request.uri contains "oauth"
# - http.response.code == 302
# - tcp.port == 8080
```

---

### Browser Developer Tools

**Debug OAuth flow in browser:**

```bash
# Chrome/Edge DevTools
# 1. Open DevTools (F12)
# 2. Network tab
# 3. Preserve log (checkbox)
# 4. Disable cache
# 5. Initiate OAuth flow

# Useful filters in Network tab:
# - Type: XHR/Fetch
# - Domain: localhost
# - Status: 302 (redirects)

# Examine request:
# - Headers: Authorization, Cookie
# - Payload: POST data
# - Preview: Response body
# - Timing: Request duration

# Console debugging
# Paste in console:
console.log(document.cookie);
console.log(localStorage);
console.log(sessionStorage);
```

**Export HAR file:**

```bash
# Chrome DevTools
# 1. Network tab > Right-click > Save all as HAR with content
# 2. Save to oauth-flow.har

# Analyze HAR file
cat oauth-flow.har | jq '.log.entries[] | {url: .request.url, status: .response.status}'

# Extract cookies
cat oauth-flow.har | jq '.log.entries[].request.cookies'

# Extract redirects
cat oauth-flow.har | jq '.log.entries[] | select(.response.status == 302)'
```

---

## 📊 Log Analysis

### Structured Log Analysis

**Parse JSON logs:**

```bash
# Extract errors with context
cat logs/proxy.log | jq 'select(.level == "error") | {timestamp, component, message, error}'

# Group errors by type
cat logs/proxy.log | jq -r 'select(.level == "error") | .error_type' | sort | uniq -c | sort -rn

# Timeline of events
cat logs/proxy.log | jq -r '{timestamp, level, component, message} | @csv'

# Filter by time range
cat logs/proxy.log | jq 'select(.timestamp >= "2026-01-20T10:00:00Z" and .timestamp <= "2026-01-20T11:00:00Z")'

# Find slow requests
cat logs/proxy.log | jq 'select(.duration_ms > 1000) | {timestamp, endpoint, duration_ms}'
```

---

### Pattern Matching

**Find common issues:**

```bash
# OAuth errors
grep -E "oauth|authorization|token" logs/proxy.log | grep -i error

# Database errors
grep -E "database|postgres|sqlite" logs/proxy.log | grep -i error

# MCP server errors
grep -E "mcp|proxy|upstream" logs/proxy.log | grep -i error

# PKCE errors
grep -E "pkce|code_verifier|code_challenge" logs/proxy.log

# Rate limiting
grep -i "rate.*limit" logs/proxy.log

# 4xx/5xx errors
grep -E "HTTP/[0-9.]+ [45][0-9]{2}" logs/proxy.log
```

---

### Log Correlation

**Trace request flow:**

```bash
# Search by request ID
REQUEST_ID="abc123"
grep $REQUEST_ID logs/proxy.log

# Extract full request lifecycle
cat logs/proxy.log | jq "select(.request_id == \"$REQUEST_ID\") | {timestamp, component, message}"

# Find related session
SESSION_ID="xyz789"
cat logs/proxy.log | jq "select(.session_id == \"$SESSION_ID\")"

# Trace user activity
USER_ID="user@example.com"
cat logs/proxy.log | jq "select(.user_id == \"$USER_ID\") | {timestamp, action, endpoint}"
```

---

### Performance Analysis

**Identify bottlenecks:**

```bash
# Slowest endpoints
cat logs/proxy.log | jq 'select(.duration_ms) | {endpoint: .endpoint, duration: .duration_ms}' | \
  jq -s 'group_by(.endpoint) | map({endpoint: .[0].endpoint, avg_duration: (map(.duration) | add / length)}) | sort_by(.avg_duration) | reverse'

# Database query performance
cat logs/proxy.log | jq 'select(.component == "database" and .query_duration_ms) | {query: .query, duration: .query_duration_ms}' | \
  jq -s 'sort_by(.duration) | reverse | .[0:10]'

# Request rate over time
cat logs/proxy.log | jq -r '.timestamp' | cut -d'T' -f2 | cut -d':' -f1 | sort | uniq -c

# Error rate calculation
TOTAL=$(wc -l < logs/proxy.log)
ERRORS=$(grep -c '"level":"error"' logs/proxy.log)
echo "Error rate: $((ERRORS * 100 / TOTAL))%"
```

---

## 🧪 Provider Configuration Testing

### Test Google OAuth in Isolation

**Verify Google configuration:**

```bash
# 1. Check Google Cloud Console settings
# https://console.cloud.google.com/apis/credentials

# 2. Test OAuth endpoints directly
curl https://accounts.google.com/.well-known/openid-configuration | jq .

# 3. Validate client ID format
# Should match: 123456789-abcdef.apps.googleusercontent.com

# 4. Test authorization URL
cat > test-google-auth.sh << 'EOF'
#!/bin/bash
CLIENT_ID="your-client-id"
REDIRECT_URI="http://localhost:8080/auth/callback"
STATE=$(openssl rand -hex 16)

AUTH_URL="https://accounts.google.com/o/oauth2/v2/auth?\
client_id=$CLIENT_ID&\
redirect_uri=$REDIRECT_URI&\
response_type=code&\
scope=openid%20email%20profile&\
state=$STATE"

echo "Open this URL in browser:"
echo "$AUTH_URL"
echo ""
echo "State: $STATE"
EOF

chmod +x test-google-auth.sh
./test-google-auth.sh
```

---

### Test Microsoft/Azure AD in Isolation

**Verify Azure AD configuration:**

```bash
# 1. Check Azure Portal settings
# https://portal.azure.com > App Registrations

# 2. Test OpenID configuration
TENANT_ID="your-tenant-id"
curl https://login.microsoftonline.com/$TENANT_ID/v2.0/.well-known/openid-configuration | jq .

# 3. Validate application ID
# Should be a GUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# 4. Test authorization URL
cat > test-microsoft-auth.sh << 'EOF'
#!/bin/bash
CLIENT_ID="your-client-id"
TENANT_ID="your-tenant-id"  # or "common" for multi-tenant
REDIRECT_URI="http://localhost:8080/auth/callback"
STATE=$(openssl rand -hex 16)

AUTH_URL="https://login.microsoftonline.com/$TENANT_ID/oauth2/v2.0/authorize?\
client_id=$CLIENT_ID&\
redirect_uri=$REDIRECT_URI&\
response_type=code&\
scope=openid%20profile%20email&\
state=$STATE"

echo "Open this URL in browser:"
echo "$AUTH_URL"
echo ""
echo "State: $STATE"
EOF

chmod +x test-microsoft-auth.sh
./test-microsoft-auth.sh
```

---

### Test GitHub OAuth in Isolation

**Verify GitHub configuration:**

```bash
# 1. Check GitHub OAuth App settings
# https://github.com/settings/developers

# 2. Test authorization URL
cat > test-github-auth.sh << 'EOF'
#!/bin/bash
CLIENT_ID="your-client-id"
REDIRECT_URI="http://localhost:8080/auth/callback"
STATE=$(openssl rand -hex 16)

AUTH_URL="https://github.com/login/oauth/authorize?\
client_id=$CLIENT_ID&\
redirect_uri=$REDIRECT_URI&\
scope=user:email&\
state=$STATE"

echo "Open this URL in browser:"
echo "$AUTH_URL"
echo ""
echo "State: $STATE"
EOF

chmod +x test-github-auth.sh
./test-github-auth.sh

# 3. Verify token endpoint
curl -X POST https://github.com/login/oauth/access_token \
  -H "Accept: application/json" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=AUTHORIZATION_CODE" \
  -v
```

---

### Provider Configuration Validation

**Automated validation script:**

```bash
cat > validate-provider-config.sh << 'EOF'
#!/bin/bash

# Validate Google configuration
echo "=== Google OAuth Configuration ==="
if [ -n "$GOOGLE_CLIENT_ID" ]; then
  echo "✓ Client ID set"
  if [[ $GOOGLE_CLIENT_ID =~ \.apps\.googleusercontent\.com$ ]]; then
    echo "✓ Client ID format valid"
  else
    echo "✗ Client ID format invalid"
  fi
else
  echo "✗ Client ID not set"
fi

if [ -n "$GOOGLE_CLIENT_SECRET" ]; then
  echo "✓ Client secret set"
else
  echo "✗ Client secret not set"
fi

# Test Google discovery endpoint
if curl -sf https://accounts.google.com/.well-known/openid-configuration > /dev/null; then
  echo "✓ Google OpenID discovery reachable"
else
  echo "✗ Google OpenID discovery unreachable"
fi

echo ""
echo "=== Microsoft/Azure AD Configuration ==="
if [ -n "$MICROSOFT_CLIENT_ID" ]; then
  echo "✓ Client ID set"
  if [[ $MICROSOFT_CLIENT_ID =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]]; then
    echo "✓ Client ID format valid (GUID)"
  else
    echo "✗ Client ID format invalid (not a GUID)"
  fi
else
  echo "✗ Client ID not set"
fi

if [ -n "$MICROSOFT_TENANT_ID" ]; then
  echo "✓ Tenant ID set: $MICROSOFT_TENANT_ID"
else
  echo "✗ Tenant ID not set"
fi

echo ""
echo "=== GitHub Configuration ==="
if [ -n "$GITHUB_CLIENT_ID" ]; then
  echo "✓ Client ID set"
else
  echo "✗ Client ID not set"
fi

if [ -n "$GITHUB_CLIENT_SECRET" ]; then
  echo "✓ Client secret set"
else
  echo "✗ Client secret not set"
fi

EOF

chmod +x validate-provider-config.sh
./validate-provider-config.sh
```

---

## 🔧 Advanced Debugging Techniques

### Request/Response Logging

**Log all HTTP traffic:**

```bash
# Enable proxy request logging
export DEBUG=proxy:*
export LOG_REQUESTS=true
export LOG_RESPONSES=true

./mcp-oauth-proxy 2>&1 | tee detailed-debug.log

# Parse logged requests
cat detailed-debug.log | grep -A 20 "Request:"

# Parse logged responses
cat detailed-debug.log | grep -A 20 "Response:"
```

---

### State Machine Debugging

**OAuth flow state tracking:**

```bash
# Enable state machine logging
export DEBUG=oauth:state,session:state

./mcp-oauth-proxy

# States to watch for:
# 1. INIT → user starts OAuth flow
# 2. AUTHORIZE → redirect to provider
# 3. CALLBACK → provider redirects back
# 4. TOKEN_EXCHANGE → exchange code for token
# 5. ACTIVE → user authenticated
# 6. REFRESH → token refresh
# 7. EXPIRED → session expired
```

---

### Memory and Performance Profiling

**Monitor resource usage:**

```bash
# CPU and memory usage
top -p $(pgrep mcp-oauth-proxy)

# Or with htop
htop -p $(pgrep mcp-oauth-proxy)

# Docker container stats
docker stats <proxy-container>

# Memory profiling (if built with profiling)
curl http://localhost:8080/debug/pprof/heap > heap.prof
go tool pprof heap.prof

# CPU profiling
curl http://localhost:8080/debug/pprof/profile?seconds=30 > cpu.prof
go tool pprof cpu.prof
```

---

### Environment Variable Debugging

**List all environment variables:**

```bash
# Show all variables used by proxy
env | grep -E "OAUTH|MCP|DB|LOG|DEBUG"

# Save environment for comparison
env | sort > env-current.txt

# Compare environments
diff env-expected.txt env-current.txt

# Test with minimal environment
env -i \
  DATABASE_URL="postgresql://..." \
  MCP_SERVER_URL="http://localhost:3000" \
  ./mcp-oauth-proxy
```

---

### Configuration File Debugging

**Validate and debug configuration:**

```bash
# Validate YAML syntax
yamllint config.yaml

# Parse config with yq
cat config.yaml | yq .

# Check specific values
cat config.yaml | yq .providers.google.client_id

# Compare configs
diff config.yaml.example config.yaml

# Merge configs (for testing)
yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' config.base.yaml config.override.yaml
```

---

### Automated Testing Scripts

**End-to-end OAuth flow test:**

```bash
cat > test-oauth-flow.sh << 'EOF'
#!/bin/bash
set -e

echo "=== OAuth Flow Test ==="

# 1. Test proxy health
echo "1. Testing proxy health..."
curl -sf http://localhost:8080/health || exit 1
echo "✓ Proxy is healthy"

# 2. Get authorization URL
echo "2. Getting authorization URL..."
AUTH_RESPONSE=$(curl -sL http://localhost:8080/auth/login?provider=google)
echo "✓ Authorization endpoint responds"

# 3. Test callback endpoint
echo "3. Testing callback endpoint..."
curl -sf "http://localhost:8080/auth/callback?error=access_denied" > /dev/null || true
echo "✓ Callback endpoint accessible"

# 4. Test database connection
echo "4. Testing database..."
curl -sf http://localhost:8080/health/database || exit 1
echo "✓ Database connected"

# 5. Test MCP server
echo "5. Testing MCP server connection..."
curl -sf http://localhost:8080/health/mcp-server || exit 1
echo "✓ MCP server reachable"

echo ""
echo "=== All Tests Passed ==="
EOF

chmod +x test-oauth-flow.sh
./test-oauth-flow.sh
```

---

## 📚 Additional Resources

- **OAuth 2.1 Debugging:** https://www.oauth.com/oauth2-servers/debugging/
- **PKCE Tools:** https://tonyxu-io.github.io/pkce-generator/
- **JWT Debugger:** https://jwt.io/
- **mitmproxy Documentation:** https://docs.mitmproxy.org/
- **Wireshark User Guide:** https://www.wireshark.org/docs/wsug_html_chunked/

---

## 🆘 Getting Help

When debugging fails, collect this information:

1. **Full logs** with `DEBUG=* ./mcp-oauth-proxy`
2. **Configuration** (redact secrets!)
3. **Database state** (sessions and tokens tables)
4. **Network trace** (HAR file or tcpdump)
5. **Environment** (OS, versions, Docker info)
6. **Steps to reproduce** the issue

Create a GitHub issue with this information for support.

---

**Last Updated:** 2026-01-20
**Version:** 1.0.0
