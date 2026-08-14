import { normalizeAuditResult } from "@/lib/website-audit/result-schema";

export const demoAuditResult = normalizeAuditResult({
  id: "demo_01JVERIQAUDITPREVIEW",
  status: "demo",
  auditedUrl: "https://northstarheating.example/",
  createdAt: "2026-08-12T12:00:00.000Z",
  overallScore: 66,
  evidenceCoverage: 100,
  overallSummary:
    "The foundation is workable, but a few high-impact issues are getting in the way of visibility, speed, and customer action.",
  categoryScores: [
    {
      id: "seo",
      available: true,
      score: 72,
      evidenceLevel: "full",
      evidenceCoverage: 100,
      summary: "A solid base with a few important discovery gaps.",
      checksRun: 8,
      checksUnavailable: 0,
    },
    {
      id: "performance",
      available: true,
      score: 54,
      evidenceLevel: "full",
      evidenceCoverage: 100,
      summary: "Mobile visitors wait too long for the main content.",
      checksRun: 5,
      checksUnavailable: 0,
    },
    {
      id: "mobile-experience",
      available: true,
      score: 67,
      evidenceLevel: "full",
      evidenceCoverage: 100,
      summary: "Usable overall, with friction around key actions.",
      checksRun: 3,
      checksUnavailable: 0,
    },
    {
      id: "accessibility",
      available: true,
      score: 82,
      evidenceLevel: "full",
      evidenceCoverage: 100,
      summary: "Most essentials are in place; a few controls need attention.",
      checksRun: 5,
      checksUnavailable: 0,
    },
    {
      id: "conversion-ux",
      available: true,
      score: 48,
      evidenceLevel: "full",
      evidenceCoverage: 100,
      summary: "The next step is easy to miss on high-intent pages.",
      checksRun: 3,
      checksUnavailable: 0,
    },
    {
      id: "technical-health",
      available: true,
      score: 76,
      evidenceLevel: "full",
      evidenceCoverage: 100,
      summary: "Generally healthy, with one serious indexing risk.",
      checksRun: 7,
      checksUnavailable: 0,
    },
  ],
  summary: {
    criticalIssues: 1,
    improvements: 5,
    opportunities: 3,
    passedChecks: 19,
  },
  findings: [
    {
      id: "demo-indexing-block",
      category: "technical-health",
      severity: "critical",
      title: "A key service page is blocked from search results",
      explanation:
        "The page includes a directive that tells search engines not to index it.",
      whyItMatters:
        "Customers cannot find a service page in search if it is intentionally excluded from the index.",
      recommendation:
        "Confirm whether the block is intentional. If it is not, remove the noindex directive and request indexing after the page is published.",
      observedValue: '<meta name="robots" content="noindex">',
      recommendedValue: "index, follow",
    },
    {
      id: "demo-mobile-load",
      category: "performance",
      severity: "high",
      title: "Your main content loads slowly on mobile",
      explanation:
        "The largest visible content takes several seconds to appear on a typical mobile connection.",
      whyItMatters:
        "A slow first impression makes it harder for visitors to understand the offer and continue to a call or quote request.",
      recommendation:
        "Resize the homepage image, serve a modern format, and load nonessential scripts after the primary content.",
      supportingMetric: {
        label: "Largest Contentful Paint",
        value: "4.2 seconds",
        context: "A common target is 2.5 seconds or faster.",
      },
    },
    {
      id: "demo-primary-action",
      category: "conversion-ux",
      severity: "high",
      title: "The primary next step is difficult to find",
      explanation:
        "Service pages introduce several equal-looking links without identifying the action a ready customer should take.",
      whyItMatters:
        "Visitors who are ready to act may hesitate or leave when the route to contact, booking, or a quote is unclear.",
      recommendation:
        "Choose one primary action for each high-intent page and repeat it after the information customers need to decide.",
      observedValue: "Four equal calls to action",
      recommendedValue: "One primary action with supporting links",
    },
    {
      id: "demo-page-title",
      category: "seo",
      severity: "medium",
      title: "The homepage title does not describe the main service",
      explanation:
        "The current title identifies the company but gives searchers little context about what it offers.",
      whyItMatters:
        "A descriptive title helps search engines understand the page and helps people decide whether the result matches their need.",
      recommendation:
        "Write a concise title that combines the primary service, relevant market, and business name without repeating keywords.",
      observedValue: "Home | Northstar",
      recommendedValue: "Heating & Cooling Services in Cedar Falls | Northstar",
    },
    {
      id: "demo-tap-targets",
      category: "mobile-experience",
      severity: "medium",
      title: "Some mobile controls are difficult to tap",
      explanation:
        "Two header actions sit too close together at smaller screen widths.",
      whyItMatters:
        "Crowded controls increase accidental taps and make the navigation harder to use for people with limited dexterity.",
      recommendation:
        "Increase the touch area and spacing around the header controls, then verify them at 320px and with enlarged text.",
      supportingMetric: {
        label: "Smallest measured target",
        value: "28 × 28 px",
        context: "The interface should provide a comfortably tappable area.",
      },
    },
    {
      id: "demo-form-labels",
      category: "accessibility",
      severity: "passed",
      title: "Contact fields have useful accessible labels",
      explanation:
        "Each visible field is programmatically connected to a clear label.",
      whyItMatters:
        "Clear labels help everyone complete the form and give assistive technology the context it needs.",
      recommendation:
        "Keep the labels in place and include them when new fields are added.",
    },
  ],
  notices: [
    "Sample data only. No real website was analyzed for this preview.",
    "Automated accessibility checks do not certify WCAG or legal compliance.",
  ],
  methodologyVersion: "v2",
});
