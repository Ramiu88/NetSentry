import { spawn } from 'node:child_process';
import { XMLParser } from 'fast-xml-parser';
import { env } from '../config/env.js';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['host', 'address', 'port', 'hostname'].includes(name),
});

/**
 * Runs nmap with the given args (always as an argv array, never a shell
 * string) and returns its stdout. Rejects on non-zero exit or timeout.
 */
function runNmap(args, { timeoutMs = 60000 } = {}) {
  return new Promise((resolve, reject) => {
    // `-n` on sudo fails fast instead of hanging if a password would be
    // needed, rather than silently blocking a scheduled scan forever.
    const [cmd, cmdArgs] = env.nmapUseSudo ? ['sudo', ['-n', 'nmap', ...args]] : ['nmap', args];
    const proc = spawn(cmd, cmdArgs);
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, timeoutMs);

    proc.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    proc.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to start nmap: ${err.message}`));
    });
    proc.on('close', (code) => {
      clearTimeout(timer);
      if (timedOut) {
        reject(new Error(`nmap timed out after ${timeoutMs}ms (args: ${args.join(' ')})`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`nmap exited with code ${code}: ${stderr.slice(0, 500)}`));
        return;
      }
      resolve(stdout);
    });
  });
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Parses nmap's `-oX -` XML output into a flat list of hosts that are up,
 * with IP, MAC, vendor (as reported by nmap itself), hostname, and any open
 * ports discovered in this run.
 */
export function parseNmapXml(xml) {
  const doc = parser.parse(xml);
  const hosts = asArray(doc?.nmaprun?.host);

  return hosts
    .filter((h) => h?.status?.['@_state'] === 'up')
    .map((h) => {
      const addresses = asArray(h.address);
      const ipv4 = addresses.find((a) => a['@_addrtype'] === 'ipv4');
      const mac = addresses.find((a) => a['@_addrtype'] === 'mac');
      const hostnames = asArray(h.hostnames?.hostname);
      const ports = asArray(h.ports?.port).filter((p) => p?.state?.['@_state'] === 'open');

      return {
        ip: ipv4?.['@_addr'] || null,
        mac: mac?.['@_addr'] ? mac['@_addr'].toUpperCase() : null,
        nmapVendor: mac?.['@_vendor'] || null,
        hostname: hostnames[0]?.['@_name'] || null,
        openPorts: ports.map((p) => ({
          port: Number(p['@_portid']),
          proto: p['@_protocol'],
          service: p.service?.['@_name'] || null,
          product: p.service?.['@_product'] || null,
        })),
      };
    })
    .filter((h) => h.ip);
}

/**
 * Phase 1 (F1 - discovery): fast ARP/ping-based host discovery, no port scan.
 */
export async function discoverHosts(cidr) {
  const xml = await runNmap(['-sn', '--host-timeout', '15s', cidr, '-oX', '-'], {
    timeoutMs: 120000,
  });
  return parseNmapXml(xml);
}

/**
 * Phase 2 (F2 - identification): service/version detection on a bounded set
 * of common ports, batched into a single nmap invocation across all
 * discovered hosts rather than one process per host.
 */
export async function enrichHosts(ips) {
  if (ips.length === 0) return [];
  const xml = await runNmap(
    ['-sV', '--top-ports', '100', '--host-timeout', '30s', '-oX', '-', ...ips],
    { timeoutMs: 5 * 60 * 1000 }
  );
  return parseNmapXml(xml);
}
