const HoneypotField = () => (
  <div
    aria-hidden="true"
    className="absolute left-[-10000px] top-auto size-px overflow-hidden"
  >
    <label>
      Leave this field empty
      <input
        autoComplete="off"
        name="websiteAddress"
        tabIndex={-1}
        type="text"
      />
    </label>
  </div>
);

export default HoneypotField;
