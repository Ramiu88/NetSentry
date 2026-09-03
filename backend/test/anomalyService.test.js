import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectAnomalies } from '../src/services/anomalyService.js';

function fakeClient() {
  const calls = [];
  return {
    calls,
    query: async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [{ id: 1, device_id: params[0], scan_id: params[1], type: params[2] }] };
    },
  };
}

test('detectAnomalies creates one unknown_device alert per new device', async () => {
  const client = fakeClient();
  await detectAnomalies({ scanId: 42, newDeviceIds: [1, 2, 3] }, client);

  assert.equal(client.calls.length, 3);
  for (const call of client.calls) {
    assert.match(call.sql, /INSERT INTO alerts/);
    assert.equal(call.params[1], 42); // scan_id
    assert.equal(call.params[2], 'unknown_device');
  }
});

test('detectAnomalies does nothing when there are no new devices', async () => {
  const client = fakeClient();
  await detectAnomalies({ scanId: 42, newDeviceIds: [] }, client);
  assert.equal(client.calls.length, 0);
});
