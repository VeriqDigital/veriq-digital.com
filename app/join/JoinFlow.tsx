"use client";

import { useState } from "react";
import CheckoutBar from "./CheckoutBar";
import JoinPlans from "./JoinPlans";
import { membershipPlans } from "./membershipPlans";
import FlowBar from "./FlowBar";
import Profile from "./Profile";
import Review from "./Review";
import Payment from "./Payment";

const JoinFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState(membershipPlans[0].id);
  const [profileName, setProfileName] = useState({
    firstName: "",
    lastName: "",
  });

  const selectedPlan =
    membershipPlans.find((plan) => plan.id === selectedPlanId) ?? null;

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
            name={profileName}
            onBack={handleBack}
            onNameChange={setProfileName}
          />
        );
      case 2:
        return <Review onBack={handleBack} />;
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
        memberName={`${profileName.firstName} ${profileName.lastName}`.trim()}
        selectedPlan={selectedPlan}
        onNext={handleNext}
      />
    </>
  );
};

export default JoinFlow;
