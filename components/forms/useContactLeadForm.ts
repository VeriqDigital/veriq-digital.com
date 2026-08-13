"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { submitLead } from "@/lib/submit-lead";

const useContactLeadForm = () => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      type: "contact" as const,
      websiteAddress: String(formData.get("websiteAddress") ?? ""),
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      topic: String(formData.get("topic") ?? ""),
      projectType:
        String(formData.get("projectType") ?? "").trim() || undefined,
      message: String(formData.get("message") ?? ""),
    };

    setIsSubmitting(true);
    const result = await submitLead(payload);
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    form.reset();
    setHasSubmitted(true);
  };

  return {
    hasSubmitted,
    handleSubmit,
    isSubmitting,
    resetSubmission: () => setHasSubmitted(false),
    submitError,
  };
};

export default useContactLeadForm;
