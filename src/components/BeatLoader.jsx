import { BeatLoader } from "react-spinners";

export default function LoaderComponent({ size = 20 }) {
  return (
    <div className="flex w-full justify-center">
      <div
        style={{
          display: "inline-block",
          background:
            "linear-gradient(92.49deg, #9E4BFA -14.1%, #EE79AC 111.07%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          padding: 4,
          borderRadius: "50%",
        }}
      >
        <BeatLoader
          color="#9E4BFA"
          loading={true}
          size={size}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    </div>
  );
}
