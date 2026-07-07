"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { ModalType } from "./LeadModal";

const useLeadModal = () => {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [submittedModal, setSubmittedModal] = useState<ModalType | null>(null);

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
    setActiveModal(modal);
  };

  const closeModal = () => setActiveModal(null);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedModal(activeModal);
  };

  return {
    activeModal,
    closeModal,
    hasSubmitted: activeModal !== null && submittedModal === activeModal,
    handleFormSubmit,
    openModal,
  };
};

export default useLeadModal;
