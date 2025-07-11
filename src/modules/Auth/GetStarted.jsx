import { Link } from "react-router-dom";

export default function GetStarted() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center Resizer">
            <div className="md:mt-2 mt-10 mb-5">
                <Link to="/">
                    <img
                        src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
                        alt="OA Styles"
                        className="h-20 w-auto"
                    />
                </Link>
            </div>
            <div className="text-center md:mb-10 mb-8">
                <h1 className="md:text-3xl text-2xl font-normal text-black mb-4">Choose A User Type :</h1>
                <p className="text-black mt-2">Select a user type to start enjoying the perks of the platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:mt-8 mt-1">
                {[
                    {
                        title: "Customer",
                        description: "For clients who want to patronize tailoring services",
                        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741609872/AoStyle/image_k5w7sy.png",
                        link: "/sign-in-as-customer",
                        btnText: "Join As A Customer",
                    },
                    {
                        title: "Fabric Vendor",
                        description: "For people looking to sell clothing fabrics of all kinds on the platform",
                        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741609873/AoStyle/image1_iv6dde.png",
                        link: "/sign-in-as-fabric-vendor",
                        btnText: "Join As A Fabric Vendor",
                    },
                    {
                        title: "Tailor/Fashion Designer",
                        description: "For tailors looking to sell their services to customers on the platform",
                        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741609873/AoStyle/image2_hnlipu.png",
                        link: "/sign-in-as-tailor-designer",
                        btnText: "Join As A Tailor/Designer",
                    },
                    {
                        title: "Logistics Agent",
                        description: "For logistics agents looking to deliver goods on the platform",
                        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741609876/AoStyle/image3_jvbthg.png",
                        link: "/sign-in-as-logistics",
                        btnText: "Join As Logistic Agent",
                    },
                ].map((user, index) => (
                    <div key={index} className="shadow-xs border border-[#CCCCCC] rounded-lg p-4">
                        <img
                            src={user.image}
                            alt={user.title}
                            className="w-full h-auto -mt-2 md:mt-1 sm:-mt-14 object-cover rounded-md"
                        />
                        <h2 className="text-lg font-medium mt-5">{user.title}</h2>
                        <p className="text-black text-sm mt-3 leading-loose">{user.description}</p>
                        <Link to={user.link} className="mt-5 inline-block bg-gradient text-white py-3 px-6 rounded-md hover:opacity-80 transition">
                            {user.btnText}
                        </Link>
                    </div>
                ))}
            </div>

            <footer className="mt-14 text-black text-sm">
            ©  {new Date().getFullYear()} CARYBIN . All rights reserved.
            </footer>
        </div>
    );
}
