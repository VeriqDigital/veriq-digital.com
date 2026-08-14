import {
  auditDataResponse,
  isValidCronAuthorization,
} from "@/lib/website-audit/api-security";
import { purgeExpiredWebsiteAudits } from "@/lib/website-audit/retention";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isValidCronAuthorization(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    return auditDataResponse(await purgeExpiredWebsiteAudits());
  } catch (error) {
    console.error("Website audit retention purge failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return new Response("Retention purge failed", {
      status: 503,
      headers: { "Retry-After": "3600" },
    });
  }
}
