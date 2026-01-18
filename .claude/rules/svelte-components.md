---
globs: ["**/ui/**/*.svelte", "**/ui/**/*.ts"]
description: SvelteKit component conventions - Svelte 5 runes, component structure
---

# SvelteKit Conventions (obot-entraid)

## Component Structure

```svelte
<script lang="ts">
  // 1. Imports
  import { Component } from '$lib/components';

  // 2. Props (Svelte 5 runes)
  let { prop1, prop2 = 'default' } = $props<{
    prop1: string;
    prop2?: string;
  }>();

  // 3. State
  let state = $state(initialValue);

  // 4. Derived
  let derived = $derived(computation);

  // 5. Effects
  $effect(() => { ... });
</script>

<!-- Template -->
<div class="...">
  ...
</div>

<style>
  /* Scoped styles (prefer Tailwind) */
</style>
```

## File Organization

- `+page.svelte` - Route pages
- `+layout.svelte` - Layout wrappers
- `$lib/components/` - Reusable components
- `$lib/stores/` - Shared state

## Styling

- Use Tailwind CSS classes
- Avoid inline styles
- Use CSS variables for theming

## Svelte 5 Runes Reference

| Rune | Purpose |
| ------ | --------- |
| `$state()` | Reactive state declaration |
| `$derived()` | Computed values |
| `$effect()` | Side effects |
| `$props()` | Component props |
| `$bindable()` | Two-way binding props |

## Anti-Patterns

- Don't use `let:` syntax (deprecated in Svelte 5)
- Don't use `$$props` or `$$restProps` without typing
- Don't mutate props directly

## Testing

```typescript
import { render, screen } from '@testing-library/svelte';
import Component from './Component.svelte';

test('renders correctly', () => {
  render(Component, { props: { prop1: 'value' } });
  expect(screen.getByText('value')).toBeInTheDocument();
});
```
