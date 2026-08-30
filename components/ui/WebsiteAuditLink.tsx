"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import type { ReactNode } from "react";

export type WebsiteAuditPlacement =
  | "homepage_hero"
  | "homepage_quality"
  | "homepage_seo"
  | "homepage_audit"
  | "pricing_included"
  | "services_hero"
  | "services_seo"
  | "services_closing"
  | "footer_resources";

type WebsiteAuditLinkProps = {
  children: ReactNode;
  placement: WebsiteAuditPlacement;
  className?: string;
};

export default function WebsiteAuditLink({
  children,
  placement,
  className,
}: WebsiteAuditLinkProps) {
  return (
    <Link
      href="/website-audit"
      className={className}
      onClick={() => track("website_audit_opened", { placement })}
    >
      {children}
    </Link>
  );
}
