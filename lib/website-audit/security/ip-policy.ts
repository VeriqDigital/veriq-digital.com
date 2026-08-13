import { BlockList, isIP } from "node:net";

const forbiddenIpv4Ranges = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const;

const forbiddenIpv6Ranges = [
  // Special-purpose assignments inside the global-unicast 2000::/3 block.
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["3fff::", 20],
] as const;

const forbiddenIpv4 = new BlockList();
const globallyRoutableIpv6 = new BlockList();
const forbiddenIpv6 = new BlockList();

for (const [network, prefix] of forbiddenIpv4Ranges) {
  forbiddenIpv4.addSubnet(network, prefix, "ipv4");
}

// Azure exposes platform services through this otherwise-public-looking IP.
forbiddenIpv4.addAddress("168.63.129.16", "ipv4");

globallyRoutableIpv6.addSubnet("2000::", 3, "ipv6");

for (const [network, prefix] of forbiddenIpv6Ranges) {
  forbiddenIpv6.addSubnet(network, prefix, "ipv6");
}

const stripIpv6Brackets = (address: string) =>
  address.startsWith("[") && address.endsWith("]")
    ? address.slice(1, -1)
    : address;

/**
 * Returns true only for an address that is suitable for public-site auditing.
 *
 * The IPv6 policy intentionally uses a positive global-unicast allow range.
 * That excludes loopback, mapped IPv4, NAT64, link-local, unique-local,
 * multicast, and currently reserved space without relying on an exhaustive
 * deny list that can become incomplete as special-use ranges evolve.
 */
export function isPublicIp(address: string): boolean {
  const normalizedAddress = stripIpv6Brackets(address.trim());
  const family = isIP(normalizedAddress);

  if (family === 4) {
    return !forbiddenIpv4.check(normalizedAddress, "ipv4");
  }

  if (family === 6) {
    return (
      globallyRoutableIpv6.check(normalizedAddress, "ipv6") &&
      !forbiddenIpv6.check(normalizedAddress, "ipv6")
    );
  }

  return false;
}

