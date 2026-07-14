"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { ModalType } from "./LeadModal";

const useLeadModal = () => {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [submittedModal, setSubmittedModal] = useState<ModalType | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!activeModal) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal]);

  const openModal = (modal: ModalType) => {
    setSubmittedModal(null);
    setSubmitError("");
    setActiveModal(modal);
  };

  const closeModal = () => {
    setSubmitError("");
    setActiveModal(null);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (!activeModal) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      type: activeModal,
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      topic: String(formData.get("topic") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    setIsSubmitting(true);

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch(() => null);
    const data = response
      ? ((await response.json().catch(() => null)) as { message?: string } | null)
      : null;

    setIsSubmitting(false);

    if (!response) {
      setSubmitError("Could not connect. Please try again.");
      return;
    }

    if (!response.ok) {
      setSubmitError(data?.message ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmittedModal(activeModal);
  };

  return {
    activeModal,
    closeModal,
    hasSubmitted: activeModal !== null && submittedModal === activeModal,
    handleFormSubmit,
    isSubmitting,
    openModal,
    submitError,
  };
};

export default useLeadModal;
