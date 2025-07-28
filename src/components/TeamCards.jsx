import React, { useState } from "react";

const TeamCard = ({ name, role, image, shortText, fullText }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-gray-50 p-6 flex flex-col items-center max-w-md">
      <div className="w-50 h-50 rounded-full mx-auto mb-4 border-4 border-purple-200 bg-white flex items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-top"
        />
      </div>
      <h4 className="text-lg font-semibold">{name}</h4>
      <p className="text-sm text-purple-600 font-medium mb-3">{role}</p>
      <p className="text-sm text-gray-700 text-center mt-2">
        {expanded ? (
          <>
            {fullText}
            <br />
            <button
              className="text-purple-600 underline mt-2 cursor-pointer"
              onClick={() => setExpanded(false)}
            >
              Read less
            </button>
          </>
        ) : (
          <>
            {shortText}
            {fullText && (
              <>
                <br />
                <button
                  className="text-purple-600 underline mt-2 cursor-pointer"
                  onClick={() => setExpanded(true)}
                >
                  Read more
                </button>
              </>
            )}
          </>
        )}
      </p>
    </div>
  );
};

export default TeamCard;
