import React from "react";
import useQueryParams from "../../../../hooks/useQueryParams";
import { Link } from "react-router-dom";
import useGetAllUsersByRole from "../../../../hooks/admin/useGetAllUserByRole";
import { formatDateStr } from "../../../../lib/helper";

const applicants = [
  {
    id: 1,
    name: "Hamzat Adeleke",
    date: "12 - 02 - 25",
    profile: "https://randomuser.me/api/portraits/women/10.jpg",
  },
  {
    id: 2,
    name: "Tobi Azeez",
    date: "12 - 02 - 25",
    profile: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    id: 3,
    name: "Daudu Joseph",
    date: "12 - 02 - 25",
    profile: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    id: 4,
    name: "Samantha Ivy",
    date: "12 - 02 - 25",
    profile: "https://randomuser.me/api/portraits/women/13.jpg",
  },
  {
    id: 5,
    name: "Tobi Azeez",
    date: "12 - 02 - 25",
    profile: "https://randomuser.me/api/portraits/men/11.jpg",
  },
];

const NewApplicants = () => {
  const { data: getAllMarketRepData, isPending } = useGetAllUsersByRole({
    newly_onboarded: true,
    role: "market-representative",
  });

  // Show only the first 5 applicants from getAllMarketRepData if available, otherwise fallback to static applicants
  const applicantsToShow = Array.isArray(getAllMarketRepData?.data)
    ? getAllMarketRepData.data.slice(0, 5)
    : applicants.slice(0, 5);

  console.log(applicantsToShow, "all");

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4">New Applicants</h2>
      <div>
        {applicantsToShow?.map((applicant) => (
          <div
            key={applicant.id}
            className="flex items-center justify-between py-4 border-b border-[#CCCCCC] last:border-none"
          >
            <div className="flex items-center gap-3">
              {applicant?.profile?.profile_picture ? (
                <img
                  src={applicant?.profile?.profile_picture}
                  alt={applicant.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white">
                    {applicant?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                </>
              )}
              <div>
                <p className="font-medium text-gray-900">{applicant?.name}</p>
                <p className="text-sm text-gray-500">
                  {applicant?.created_at
                    ? formatDateStr(
                        applicant?.created_at?.split(".").shift(),
                        "DD - MM - YY"
                      )
                    : ""}
                </p>
              </div>
            </div>
            <Link
              to={`/admin/sales-rep/view-sales/${applicant.id}`}
              // state={{ info: applicant }}
              className="border border-[#A14DF6] text-[#A14DF6] px-4 py-2 rounded-lg text-sm hover:bg-purple-100"
            >
              VIEW
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewApplicants;
