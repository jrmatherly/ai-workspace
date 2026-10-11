import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { config } from '../../proxy';

/** Every page route under pages/, Next-style ('/link/chat/[chatLinkId]'), minus the framework files. */
function pageRoutes(dir: string, prefix = ''): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return pageRoutes(path, `${prefix}/${name}`);
    const m = /^(.+)\.tsx$/.exec(name);
    if (!m || m[1].startsWith('_')) return [];
    return [m[1] === 'index' ? prefix || '/' : `${prefix}/${m[1]}`];
  });
}

function matches(matcher: string, route: string): boolean {
  const star = matcher.match(/^(.*)\/:path\*$/);
  return star ? route === star[1] || route.startsWith(`${star[1]}/`) : route === matcher;
}

test('the proxy matcher covers every page under pages/ except /signin, plus the /dev rewrites', () => {
  const routes = pageRoutes(join(process.cwd(), 'pages')).filter(r => r !== '/signin');
  assert.ok(routes.length > 5, `found ${routes.length} pages`);
  for (const route of routes)
    assert.ok(config.matcher.some(m => matches(m, route)), `${route} is not in the proxy matcher`);
  assert.ok(config.matcher.some(m => matches(m, '/dev/inspect/storage')), '/dev rewrites are not matched');
  assert.ok(!config.matcher.some(m => matches(m, '/signin')), '/signin must not be matched');
});
