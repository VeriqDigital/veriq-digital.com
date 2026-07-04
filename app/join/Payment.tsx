type ProfileProps = {
  onBack: () => void;
};

const Payment = ({ onBack }: ProfileProps) => {
  return (
    <div>
      <button type="button" onClick={onBack}>
        Back
      </button>
    </div>
  );
};

export default Payment;
