---
globs: ["**/*_test.go"]
description: Go test file conventions - table-driven tests, subtests, race detection
---

# Go Test Conventions

## Required Patterns

1. **Table-Driven Tests**: Always use table-driven tests for multiple cases

   ```go
   tests := []struct {
       name    string
       input   Type
       want    Type
       wantErr bool
   }{...}
   ```

2. **Subtests**: Use `t.Run()` for each test case

   ```go
   for _, tt := range tests {
       t.Run(tt.name, func(t *testing.T) {...})
   }
   ```

3. **Test Naming**: `TestFunctionName_Scenario`

4. **Race Detection**: Consider `go test -race` for concurrent code

## Anti-Patterns

- Never use `t.Fatal()` in goroutines (use `t.Error()`)
- Never skip error checks in test setup
- Never hardcode test data paths (use `testdata/` directory)

## Project-Specific Patterns

### nah/kinm Controllers

- Use envtest for controller tests
- Mock external dependencies
- Test reconciliation idempotency

### mcp-oauth-proxy

- Test token encryption/decryption
- Test PKCE flow completeness
- Test JWT validation edge cases

## Test Helpers

```go
// Helper for comparing errors
func assertError(t *testing.T, got, want error) {
    t.Helper()
    if (got != nil) != (want != nil) {
        t.Errorf("got error %v, want %v", got, want)
    }
}
```
