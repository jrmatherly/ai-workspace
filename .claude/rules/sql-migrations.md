---
globs: ["**/migrations/*.sql", "**/schema/*.sql"]
description: Database migration conventions - naming, structure, PostgreSQL patterns
---

# SQL Migration Conventions

## Naming

Format: `YYYYMMDDHHMMSS_description.sql`
Example: `20260115143000_add_user_tokens_table.sql`

## Structure

```sql
-- Up migration
CREATE TABLE IF NOT EXISTS table_name (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column);

-- Down migration (in separate file or comment block)
-- DROP TABLE IF EXISTS table_name;
```

## Best Practices

1. Always use `IF NOT EXISTS` / `IF EXISTS`
2. Add indexes for foreign keys and frequently queried columns
3. Use `TIMESTAMP WITH TIME ZONE` for timestamps
4. Include both up and down migrations
5. Test migrations on a copy of production data

## PostgreSQL Specifics

- Use `BIGSERIAL` for auto-increment IDs
- Use `JSONB` for JSON data (not `JSON`)
- Use `TEXT` instead of `VARCHAR` (no length limit in PG)

## Common Patterns

### Adding a Column

```sql
ALTER TABLE table_name
ADD COLUMN IF NOT EXISTS new_column TEXT NOT NULL DEFAULT '';
```

### Adding Foreign Key

```sql
ALTER TABLE child_table
ADD CONSTRAINT fk_child_parent
FOREIGN KEY (parent_id) REFERENCES parent_table(id)
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_child_parent_id ON child_table(parent_id);
```

### Creating Enum Type

```sql
DO $$ BEGIN
    CREATE TYPE status_enum AS ENUM ('pending', 'active', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
```

## Token/Credential Storage (mcp-oauth-proxy)

```sql
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    access_token_encrypted BYTEA NOT NULL,
    refresh_token_encrypted BYTEA,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user ON oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires ON oauth_tokens(expires_at);
```

## Validation

Before applying:

1. Run on test database first
2. Check for breaking changes
3. Verify rollback works
4. Test with realistic data volume
