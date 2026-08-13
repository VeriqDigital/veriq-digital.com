"use client";

import { useState } from "react";
import styles from "./website-audit.module.css";

export default function ShareReportLink() {
  const [message, setMessage] = useState(
    "Anyone with this link can view the report.",
  );

  const copyReportLink = async () => {
    const reportUrl = `${window.location.origin}${window.location.pathname}`;

    try {
      await navigator.clipboard.writeText(reportUrl);
      setMessage("Report link copied.");
    } catch {
      setMessage("Copy the report link from your browser’s address bar.");
    }
  };

  return (
    <div className={styles.shareReport}>
      <button type="button" onClick={copyReportLink}>
        Copy report link
        <span aria-hidden="true">↗</span>
      </button>
      <p role="status" aria-live="polite" aria-atomic="true">
        {message}
      </p>
    </div>
  );
}
