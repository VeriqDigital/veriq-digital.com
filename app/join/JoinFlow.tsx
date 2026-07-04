"use client";

import { useState } from "react";
import CheckoutBar from "./CheckoutBar";
import JoinPlans from "./JoinPlans";
import { membershipPlans } from "./membershipPlans";
import FlowBar from "./FlowBar";
import Profile, { type ContactInfo } from "./Profile";
import Review from "./Review";
import Payment from "./Payment";

const initialContactInfo: ContactInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  birthDate: "",
  gender: "",
  consentName: "",
};

const JoinFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState(membershipPlans[0].id);
  const [contactInfo, setContactInfo] = useState(initialContactInfo);

  const selectedPlan =
    membershipPlans.find((plan) => plan.id === selectedPlanId) ?? null;
  const memberName = `${contactInfo.firstName} ${contactInfo.lastName}`.trim();

  const handleNext = () => {
    setCurrentStep((step) => Math.min(step + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <JoinPlans
            plans={membershipPlans}
            selectedPlanId={selectedPlanId}
            onSelectPlan={setSelectedPlanId}
          />
        );
      case 1:
        return (
          <Profile
            contactInfo={contactInfo}
            onBack={handleBack}
            onContactInfoChange={setContactInfo}
          />
        );
      case 2:
        return (
          <Review
            contactInfo={contactInfo}
            selectedPlan={selectedPlan}
            onBack={handleBack}
          />
        );
      case 3:
        return <Payment onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <>
      <FlowBar currentStep={currentStep} />
      {renderCurrentStep()}
      <CheckoutBar
        memberName={memberName}
        selectedPlan={selectedPlan}
        onNext={handleNext}
      />
    </>
  );
};

export default JoinFlow;
