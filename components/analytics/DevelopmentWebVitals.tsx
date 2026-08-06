"use client";

import { lazy, Suspense } from "react";

const WebVitals = lazy(() => import("./WebVitals"));

/** Keep the attribution implementation out of production's initial JS. */
const DevelopmentWebVitals = () => {
  return (
    <Suspense fallback={null}>
      <WebVitals />
    </Suspense>
  );
};

export default DevelopmentWebVitals;
