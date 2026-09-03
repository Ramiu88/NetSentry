import ouiIndex from 'oui-data' with { type: 'json' };

/**
 * Looks up the vendor for a MAC address using the bundled IEEE OUI database
 * (oui-data). Fully offline — no external network telemetry about the local
 * network ever leaves the machine.
 */
export function lookupVendor(macAddress) {
  if (!macAddress) return null;
  const prefix = macAddress.replace(/[:-]/g, '').toUpperCase().slice(0, 6);
  const entry = ouiIndex[prefix];
  if (!entry) return null;
  // Entries are the raw IEEE registry record; the vendor name is the first line.
  return entry.split('\n')[0].trim();
}
