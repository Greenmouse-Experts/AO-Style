export default function CustomBackbtn() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div data-theme="nord">
      <button className="btn btn-soft btn-sm" onClick={handleBack}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>
    </div>
  );
}
