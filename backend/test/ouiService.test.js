import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lookupVendor } from '../src/services/ouiService.js';

test('lookupVendor resolves a known OUI prefix regardless of MAC formatting', () => {
  assert.equal(lookupVendor('00:00:0C:11:22:33'), 'Cisco Systems, Inc');
  assert.equal(lookupVendor('00-00-0C-11-22-33'), 'Cisco Systems, Inc');
  assert.equal(lookupVendor('00000c112233'), 'Cisco Systems, Inc');
});

test('lookupVendor returns null for an unregistered prefix', () => {
  assert.equal(lookupVendor('FF:FF:FF:FF:FF:FF'), null);
});

test('lookupVendor returns null for missing input', () => {
  assert.equal(lookupVendor(null), null);
  assert.equal(lookupVendor(undefined), null);
});
