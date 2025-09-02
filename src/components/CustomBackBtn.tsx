export default function CustomBackbtn() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div
      data-theme="nord"
      className="flex items-center justify-start bg-transparent py-2 px-2"
    >
      <button
        className="group flex items-center gap-2 rounded-lg bg-purple-200 cursor-pointer hover:bg-purple-300 active:bg-purple-400 transition-colors shadow-sm px-4 py-2 text-purple-900 font-medium text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
        onClick={handleBack}
        aria-label="Go back"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-purple-900 transition-transform duration-300 group-hover:-translate-x-1"
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
        <span>Back</span>
      </button>
    </div>
  );
}
