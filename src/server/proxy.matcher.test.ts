import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { config } from '../../proxy';
import { AUTH_PAGE_MATCHER, isAuthPagePath } from '~/common/app.routes.auth';

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

test('the proxy matcher is AUTH_PAGE_MATCHER and covers every page under pages/ except /signin, plus the /dev rewrites', () => {
  assert.deepEqual(config.matcher, AUTH_PAGE_MATCHER);
  const routes = pageRoutes(join(process.cwd(), 'pages')).filter(r => r !== '/signin');
  assert.ok(routes.length > 5, `found ${routes.length} pages`);
  for (const route of routes)
    assert.ok(isAuthPagePath(route), `${route} is not in the proxy matcher`);
  assert.ok(isAuthPagePath('/dev/inspect/storage'), '/dev rewrites are not matched');
  assert.ok(!isAuthPagePath('/signin'), '/signin must not be matched');
});
