import { UserIcon, CubeIcon, ScissorsIcon, TruckIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const services = [
    {
        icon: <UserIcon className="mt-4 h-12 w-12 text-[#EE79AC]" />,
        title: "For Customers",
        description: "Welcome to Carybin Limited, a platform that simplifies tailoring processes; from buying materials to finding a tailor.",
        link: "/sign-in-as-customer",
    },
    {
        icon: <CubeIcon className="mt-4 h-12 w-12 text-[#EE79AC]" />,
        title: "For Fabric Vendor",
        description: "Welcome to Carybin Limited, a platform that simplifies tailoring processes; from buying materials to finding a tailor.",
        link: "/sign-in-as-fabric-vendor",
    },
    {
        icon: <ScissorsIcon className="mt-4 h-12 w-12 text-[#EE79AC]" />,
        title: "For Fashion Designers",
        description: "Welcome to Carybin Limited, a platform that simplifies tailoring processes; from buying materials to finding a tailor.",
        link: "/sign-in-as-tailor-designer",
    },
    {
        icon: <TruckIcon className="mt-4 h-12 w-12 text-[#EE79AC]" />,
        title: "Logistics Agent",
        description: "Welcome to Carybin Limited, a platform that simplifies tailoring processes; from buying materials to finding a tailor.",
        link: "/logistics",
    }
];


export default function TailoringServicess() {
    return (
        <section className="section bg-[#FFF2FF] text-center">
            <div className="Resizer">
                <div className="max-w-2xl mx-auto">
                    <button className="border border-[#E172B9] text-[#484545] px-4 py-2 rounded-full text-sm w-full md:w-auto mb-4">
                        About Us
                    </button>
                    <h2 className="text-2xl font-medium mx-auto max-w-lg leading-relaxed">A more convenient approach to getting tailoring services</h2>
                    <p className="text-[#4B4A4A] text-base mt-4 mx-auto max-w-lg leading-loose mb-6">Welcome to Carybin Limited, a platform that simplifies tailoring processes; from buying materials to finding a tailor.</p>
                </div>

                <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white p-5 rounded-lg text-center transition">
                            <div className="flex justify-center">{service.icon}</div>
                            <h3 className="text-lg font-semibold text-black mt-4 leading-loose">{service.title}</h3>
                            <p className="text-base text-[#4B4A4A] leading-loose mt-3 text-left">{service.description}</p>
                            <Link
                                to={service.link}
                                className="mt-8 mb-6 inline-block text-left text-purple-500 font-medium hover:underline"
                            >
                                Get Started &gt;
                            </Link>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
