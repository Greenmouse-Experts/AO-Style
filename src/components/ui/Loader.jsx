export default function Loader() {
  return (
    <div className="flex justify-center items-center py-10">
      <div
        className="loader w-12 h-12 rounded-full border-4 border-t-purple-500 border-b-purple-200 border-l-transparent border-r-transparent animate-spin"
      ></div>
      <p className="ml-4 text-purple-500">Loading...</p>
    </div>
  );
}
