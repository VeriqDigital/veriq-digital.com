type ProfileProps = {
  onBack: () => void;
};

const Review = ({ onBack }: ProfileProps) => {
  return (
    <div>
      <button type="button" onClick={onBack}>
        Back
      </button>
    </div>
  );
};

export default Review;
