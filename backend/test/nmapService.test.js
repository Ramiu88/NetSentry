import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseNmapXml } from '../src/services/nmapService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(path.join(__dirname, 'fixtures/nmap-scan.xml'), 'utf8');

test('parseNmapXml ignores hosts that are down', () => {
  const hosts = parseNmapXml(fixture);
  assert.equal(hosts.length, 2);
});

test('parseNmapXml extracts ip/mac/vendor/hostname', () => {
  const [phone] = parseNmapXml(fixture);
  assert.equal(phone.ip, '192.168.1.10');
  assert.equal(phone.mac, 'AA:BB:CC:11:22:33');
  assert.equal(phone.nmapVendor, 'Apple, Inc.');
  assert.equal(phone.hostname, 'marwanes-iphone.local');
});

test('parseNmapXml only includes open ports', () => {
  const [, laptop] = parseNmapXml(fixture);
  assert.equal(laptop.openPorts.length, 1);
  assert.deepEqual(laptop.openPorts[0], {
    port: 22,
    proto: 'tcp',
    service: 'ssh',
    product: 'OpenSSH',
  });
});

test('parseNmapXml handles a host with no hostname element', () => {
  const [, laptop] = parseNmapXml(fixture);
  assert.equal(laptop.hostname, null);
});
