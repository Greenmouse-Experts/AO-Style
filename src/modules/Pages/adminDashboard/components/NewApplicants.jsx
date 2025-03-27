import React from "react";

const applicants = [
    { id: 1, name: "Hamzat Adeleke", date: "12 - 02 - 25", profile: "https://randomuser.me/api/portraits/women/10.jpg" },
    { id: 2, name: "Tobi Azeez", date: "12 - 02 - 25", profile: "https://randomuser.me/api/portraits/men/11.jpg" },
    { id: 3, name: "Daudu Joseph", date: "12 - 02 - 25", profile: "https://randomuser.me/api/portraits/men/12.jpg" },
    { id: 4, name: "Samantha Ivy", date: "12 - 02 - 25", profile: "https://randomuser.me/api/portraits/women/13.jpg" },
    { id: 5, name: "Tobi Azeez", date: "12 - 02 - 25", profile: "https://randomuser.me/api/portraits/men/11.jpg" },
];

const NewApplicants = () => {
    return (
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">New Applicants</h2>
            <div>
                {applicants.map((applicant) => (
                    <div key={applicant.id} className="flex items-center justify-between py-4 border-b border-[#CCCCCC] last:border-none">
                        <div className="flex items-center gap-3">
                            <img src={applicant.profile} alt={applicant.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p className="font-medium text-gray-900">{applicant.name}</p>
                                <p className="text-sm text-gray-500">{applicant.date}</p>
                            </div>
                        </div>
                        <button className="border border-[#A14DF6] text-[#A14DF6] px-4 py-2 rounded-lg text-sm hover:bg-purple-100">
                            VIEW
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewApplicants;
