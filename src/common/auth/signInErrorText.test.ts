import { test } from 'node:test';
import assert from 'node:assert/strict';

import { signInErrorText } from './signInErrorText';

test('known sign-in error codes get their own text, unknown ones the retry fallback, none gets null', () => {
  assert.equal(signInErrorText(null), null);
  assert.equal(signInErrorText(undefined), null);
  assert.match(signInErrorText('email_not_allowed')!, /not allowed/);
  assert.match(signInErrorText('not_allowed')!, /no longer allowed/);
  for (const code of ['unable_to_link_account', 'email_does_not_match', 'account_already_linked_to_different_user'])
    assert.match(signInErrorText(code)!, /link/i, code);
  assert.doesNotMatch(signInErrorText('unable_to_link_account')!, /try again/i, 'a refused link is not a retry');
  assert.match(signInErrorText('something_else')!, /try again/i);
});
