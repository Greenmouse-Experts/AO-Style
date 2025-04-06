import React from "react";
import Breadcrumb from "./components/Breadcrumb";

const Privacy = () => {
   
    const ethicalConduct = [
        {
            description: "Employees, partners, and stakeholders must adhere to all applicable laws, regulations, and ethical standards."
        },
        {
            description: "Conflicts of interest, bribery, and corruption are strictly prohibited."
        }
    ];

    const qualityAssurance = [
        {
            description: "Products such as Dastyles and other offerings must meet rigorous quality benchmarks."
        },
        {
            description: "Continuous feedback loops ensure we address defects and improve performance."
        }
    ];

    const customerRelations = [
        {
            description: "Deliver products/services on time, with clear communication and after-sales support."
        },
        {
            description: "Protect customer data and privacy in compliance with GDPR and other relevant regulations."
        }
    ];

    const employeeWelfare = [
        {
            description: "Provide a safe, inclusive, and discrimination-free workplace."
        },
        {
            description: "Encourage professional development through training and growth opportunities."
        }
    ];

    const environmentalResponsibility = [
        {
            description: "Reduce waste, conserve resources, and adopt eco-friendly practices."
        },
        {
            description: "Align with global sustainability goals, such as carbon neutrality targets."
        }
    ];

    const healthSafety = [
        {
            description: "Maintain a hazard-free workplace and comply with occupational safety standards."
        },
        {
            description: "Employees are empowered to report safety concerns without retaliation."
        }
    ];

    const stakeholderCommitment = [
        {
            description: "Customers: Build trust through reliability, transparency, and value."
        },
        {
            description: "Employees: Foster a culture of respect, fairness, and work-life balance."
        },
        {
            description: "Shareholders: Achieve sustainable growth and long-term profitability."
        },
        {
            description: "Community: Support social initiatives and contribute positively to local development."
        }
    ];

    const complianceGovernance = [
        {
            description: "Regular audits ensure adherence to internal policies and external regulations."
        },
        {
            description: "A zero-tolerance approach governs violations of anti-corruption, antitrust, or workplace misconduct."
        }
    ];

    const continuousImprovement = [
        {
            description: "Encourage feedback from employees, customers, and partners to refine processes."
        },
        {
            description: "Stay ahead of industry trends through R&D and technology adoption."
        }
    ];

    const conclusion = {
        text: "Carybin Ltd is dedicated to upholding this policy statement in all aspects of our operations. By aligning with our core values and guidelines, we strive to be a trusted leader in our industry, delivering excellence through products like Dastyles while positively impacting society and the environment.",
        approvedBy: "Approved By:",
        title: "[Name & Title of CEO/Board Chair]",
        company: "Carybin Ltd"
    };

    return (
        <>
            <Breadcrumb
                title="Policy Statements"
                subtitle="Our Policy Statements"
                backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1738008968/image_2_mvgdxh.jpg"
            />
            <div className="w-full flex flex-col">
                <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full bg-white">
                    <div className="">
                        {/* Policy Guidelines Section */}
                        <div className="text-center mt-14 mb-8">
                            <h2 className="text-lg font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                POLICY GUIDELINES
                            </h2>
                        </div>
                        <div className="bg-white rounded-lg py-6">
                            <h3 className="text-lg font-semibold text-black mb-4">
                                1. Ethical Conduct
                            </h3>
                            {ethicalConduct.map((item, index) => (
                                <p key={index} className="text-black mb-2">- {item.description}</p>
                            ))}
                        </div>

                        {/* Quality Assurance Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-lg font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                QUALITY ASSURANCE
                            </h2>
                        </div>
                        <div className="bg-white rounded-lg py-6">
                            {qualityAssurance.map((item, index) => (
                                <p key={index} className="text-black mb-2">- {item.description}</p>
                            ))}
                        </div>

                        {/* Customer Relations Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-lg font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                CUSTOMER RELATIONS
                            </h2>
                        </div>
                        <div className="bg-white rounded-lg py-6">
                            {customerRelations.map((item, index) => (
                                <p key={index} className="text-black mb-2">- {item.description}</p>
                            ))}
                        </div>

                        {/* Employee Welfare Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-lg font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                EMPLOYEE WELFARE
                            </h2>
                        </div>
                        <div className="bg-white rounded-lg py-6">
                            {employeeWelfare.map((item, index) => (
                                <p key={index} className="text-black mb-2">- {item.description}</p>
                            ))}
                        </div>

                        {/* Environmental Responsibility Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-lg font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                ENVIRONMENTAL RESPONSIBILITY
                            </h2>
                        </div>
                        <div className="bg-white rounded-lg py-6">
                            {environmentalResponsibility.map((item, index) => (
                                <p key={index} className="text-black mb-2">- {item.description}</p>
                            ))}
                        </div>

                        {/* Health & Safety Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-lg font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                HEALTH & SAFETY
                            </h2>
                        </div>
                        <div className="bg-white rounded-lg py-6">
                            {healthSafety.map((item, index) => (
                                <p key={index} className="text-black mb-2">- {item.description}</p>
                            ))}
                        </div>

                        {/* Commitment To Stakeholders Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-lg font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                COMMITMENT TO STAKEHOLDERS
                            </h2>
                        </div>
                        <div className="bg-white rounded-lg py-6">
                            {stakeholderCommitment.map((item, index) => (
                                <p key={index} className="text-black mb-2">- {item.description}</p>
                            ))}
                        </div>

                        {/* Compliance & Governance Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-lg font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                COMPLIANCE & GOVERNANCE
                            </h2>
                        </div>
                        <div className="bg-white rounded-lg py-6">
                            {complianceGovernance.map((item, index) => (
                                <p key={index} className="text-black mb-2">- {item.description}</p>
                            ))}
                        </div>

                        {/* Continuous Improvement Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-lg font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                CONTINUOUS IMPROVEMENT
                            </h2>
                        </div>
                        <div className="bg-white rounded-lg py-6">
                            {continuousImprovement.map((item, index) => (
                                <p key={index} className="text-black mb-2">- {item.description}</p>
                            ))}
                        </div>

                        {/* Conclusion Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-lg font-semibold text-black bg-[#FFEAFF] py-4 mb-4">
                                CONCLUSION
                            </h2>
                        </div>
                        <div className="bg-white rounded-lg py-6">
                            <p className="text-black mb-6">{conclusion.text}</p>
                            <p className="text-black font-semibold mb-1">{conclusion.approvedBy}</p>
                            <p className="text-black mb-1">{conclusion.title}</p>
                            <p className="text-black mb-6">{conclusion.company}</p>
                            <p className="text-black mb-2">This policy is subject to periodic review and updates to reflect evolving standards and business needs.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Privacy;