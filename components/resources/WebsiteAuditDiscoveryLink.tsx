import type { ReactNode } from "react";
import Link from "next/link";
import { isWebsiteAuditDiscoverable } from "@/lib/website-audit/runtime-config";

export default function WebsiteAuditDiscoveryLink({
  children,
  discoverable = isWebsiteAuditDiscoverable(),
}: Readonly<{ children?: ReactNode; discoverable?: boolean }>) {
  return discoverable ? <Link href="/website-audit">{children}</Link> : children;
}
